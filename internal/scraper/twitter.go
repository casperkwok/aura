package scraper

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/casperkwok/aura/internal/model"
)

// plume 服务返回的推文结构（见 ~/Developer/Projects/hobby/plume）
type plumeTweet struct {
	ID         string    `json:"id"`
	URL        string    `json:"url"`
	Author     string    `json:"author"`
	AuthorName string    `json:"authorName"`
	Text       string    `json:"text"`
	Lang       string    `json:"lang"`
	CreatedAt  time.Time `json:"createdAt"`
}

type plumeResponse struct {
	User   string       `json:"user"`
	Count  int          `json:"count"`
	Tweets []plumeTweet `json:"tweets"`
	Error  string       `json:"error"`
}

// fetchTwitter 从本地 plume 服务拉取某个 X 用户的推文。
// source.URL 存放的是该用户的 screenName。
func (s *ScraperService) fetchTwitter(source model.Source) error {
	if s.plumeURL == "" {
		return fmt.Errorf("[%s] PLUME_URL 未配置", source.Name)
	}

	endpoint := fmt.Sprintf("%s/tweets?user=%s&limit=%d",
		strings.TrimRight(s.plumeURL, "/"),
		url.QueryEscape(source.URL),
		s.maxItems)

	client := http.Client{Timeout: 30 * time.Second}
	resp, err := client.Get(endpoint)
	if err != nil {
		return fmt.Errorf("[%s] plume 请求失败: %w", source.Name, err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("[%s] 读取响应失败: %w", source.Name, err)
	}
	if resp.StatusCode != 200 {
		return fmt.Errorf("[%s] plume 返回 %d: %s", source.Name, resp.StatusCode, string(body[:min(len(body), 200)]))
	}

	var result plumeResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return fmt.Errorf("[%s] 解析失败: %w", source.Name, err)
	}
	if result.Error != "" {
		return fmt.Errorf("[%s] plume error: %s", source.Name, result.Error)
	}

	newCount := 0
	for _, tw := range result.Tweets {
		var exists int64
		s.db.Model(&model.Entry{}).Where("link = ?", tw.URL).Count(&exists)
		if exists > 0 {
			continue
		}

		// 用首行做标题，全文做正文
		title := firstLine(tw.Text)
		if title == "" {
			title = tw.Text
		}
		title = fmt.Sprintf("@%s: %s", tw.Author, title)

		titleCn, summaryCn := s.analyzer.Analyze(title, tw.Text)

		entry := model.Entry{
			Source:      source.Name,
			Dimension:   source.Dimension,
			Title:       title,
			TitleCn:     titleCn,
			Description: tw.Text,
			SummaryCn:   summaryCn,
			Link:        tw.URL,
			PublishedAt: tw.CreatedAt,
		}

		if err := s.db.Create(&entry).Error; err != nil {
			log.Printf("⚠️ [%s] 保存失败: %v", source.Name, err)
		} else {
			newCount++
			log.Printf("✅ [%s] %s", source.Name, titleCn)
		}

		if newCount >= s.maxItems {
			break
		}
	}

	if newCount > 0 {
		log.Printf("🐦 [%s] %d 条新推文（共拉取 %d 条）", source.Name, newCount, result.Count)
	}
	return nil
}

// plume /accounts 返回的被追踪账号
type plumeAccount struct {
	Username  string `json:"username"`
	Note      string `json:"note"`
	Dimension string `json:"dimension"`
}

// SyncTwitterSources 从 plume 的 /accounts 拉取被追踪账号列表，
// 把每个账号 upsert 成一条 Type=twitter 的 Source，使得追踪列表只需在 plume 维护一处。
func (s *ScraperService) SyncTwitterSources() error {
	if s.plumeURL == "" {
		return fmt.Errorf("PLUME_URL 未配置，跳过 X 源同步")
	}

	endpoint := strings.TrimRight(s.plumeURL, "/") + "/accounts"
	client := http.Client{Timeout: 15 * time.Second}
	resp, err := client.Get(endpoint)
	if err != nil {
		return fmt.Errorf("plume /accounts 请求失败: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("读取 /accounts 响应失败: %w", err)
	}
	if resp.StatusCode != 200 {
		return fmt.Errorf("plume /accounts 返回 %d: %s", resp.StatusCode, string(body[:min(len(body), 200)]))
	}

	var accounts []plumeAccount
	if err := json.Unmarshal(body, &accounts); err != nil {
		return fmt.Errorf("解析 /accounts 失败: %w", err)
	}

	synced := 0
	for _, acc := range accounts {
		if acc.Username == "" {
			continue
		}
		dimension := acc.Dimension
		if dimension == "" {
			dimension = "Opinion"
		}
		name := "X @" + acc.Username

		var existing model.Source
		if err := s.db.Where("name = ?", name).First(&existing).Error; err == nil {
			updates := map[string]interface{}{}
			if existing.URL != acc.Username {
				updates["url"] = acc.Username
			}
			if existing.Type != "twitter" {
				updates["type"] = "twitter"
			}
			if existing.Dimension == "" {
				updates["dimension"] = dimension
			}
			if len(updates) > 0 {
				s.db.Model(&existing).Updates(updates)
			}
		} else {
			s.db.Create(&model.Source{
				Name:      name,
				Type:      "twitter",
				URL:       acc.Username,
				Dimension: dimension,
				IsActive:  true,
			})
			synced++
		}
	}

	log.Printf("🔄 X 源同步完成：plume 追踪 %d 个账号，新增 %d 个", len(accounts), synced)
	return nil
}

func firstLine(s string) string {
	if i := strings.IndexByte(s, '\n'); i >= 0 {
		return strings.TrimSpace(s[:i])
	}
	return strings.TrimSpace(s)
}

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

func firstLine(s string) string {
	if i := strings.IndexByte(s, '\n'); i >= 0 {
		return strings.TrimSpace(s[:i])
	}
	return strings.TrimSpace(s)
}

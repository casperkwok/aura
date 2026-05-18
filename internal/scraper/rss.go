package scraper

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/casperkwok/aura/internal/model"
	"github.com/mmcdole/gofeed"
)

type Analyzer interface {
	Analyze(title, desc string) (string, string)
}

func (s *ScraperService) FetchAndSave(source model.Source) error {
	if source.Type == "theirstack" {
		return s.fetchTheirStack(source)
	}

	fp := gofeed.NewParser()
	fp.UserAgent = "Mozilla/5.0 (compatible; Aura/1.0; +https://aura.casperkwok.com)"
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	feed, err := fp.ParseURLWithContext(source.URL, ctx)
	if err != nil {
		log.Printf("❌ [%s] 采集失败: %v", source.Name, err)
		return fmt.Errorf("[%s] 采集失败: %w", source.Name, err)
	}

	// 第一遍：快速筛选出待处理的新条目
	type workItem struct {
		title, desc, link string
		publishedAt       time.Time
	}
	var items []workItem
	for _, item := range feed.Items {
		if len(items) >= s.maxItems {
			break
		}
		var exists int64
		s.db.Model(&model.Entry{}).Where("link = ?", item.Link).Count(&exists)
		if exists > 0 {
			continue
		}
		pubTime := time.Now()
		if item.PublishedParsed != nil {
			pubTime = *item.PublishedParsed
		}
		items = append(items, workItem{
			title:       item.Title,
			desc:        item.Description,
			link:        item.Link,
			publishedAt: pubTime,
		})
	}

	if len(items) == 0 {
		return nil
	}

	// 第二遍：并发调用 AI 分析 + 顺序写库
	const concurrency = 3
	sem := make(chan struct{}, concurrency)
	var mu sync.Mutex
	var wg sync.WaitGroup

	for i := range items {
		wg.Add(1)
		go func(w workItem) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			log.Printf("🧠 [%s] 正在分析: %s", source.Name, w.title)
			titleCn, summaryCn := s.analyzer.Analyze(w.title, w.desc)

			entry := model.Entry{
				Source:      source.Name,
				Dimension:   source.Dimension,
				Title:       w.title,
				TitleCn:     titleCn,
				Description: w.desc,
				SummaryCn:   summaryCn,
				Link:        w.link,
				PublishedAt: w.publishedAt,
			}

			mu.Lock()
			if err := s.db.Create(&entry).Error; err != nil {
				log.Printf("⚠️ [%s] 保存失败: %v", source.Name, err)
			} else {
				log.Printf("✅ [%s] 已同步: %s", source.Name, titleCn)
			}
			mu.Unlock()
		}(items[i])
	}
	wg.Wait()
	return nil
}
package storage

import (
	"github.com/casperkwok/aura/internal/model"
	"gorm.io/gorm"
)

func SeedSources(db *gorm.DB) {
	defaults := []model.Source{
		// Tech: 技术突破、论文、开源项目
		{Name: "OpenAI", URL: "https://openai.com/news/rss.xml", Dimension: "Tech", IsActive: true},
		{Name: "Hugging Face", URL: "https://huggingface.co/blog/feed.xml", Dimension: "Tech", IsActive: true},
		{Name: "ArXiv AI", URL: "https://rss.arxiv.org/rss/cs.AI", Dimension: "Tech", IsActive: true},
		// Product: 企业产品发布、功能更新、商业模式变化
		{Name: "Google AI", URL: "https://blog.google/technology/ai/rss/", Dimension: "Product", IsActive: true},
		{Name: "VentureBeat AI", URL: "https://venturebeat.com/category/ai/feed/", Dimension: "Product", IsActive: true},
		{Name: "MarkTechPost", URL: "https://www.marktechpost.com/feed/", Dimension: "Product", IsActive: true},
		// Capital: 投资事件、融资新闻、市场估值
		{Name: "Crunchbase News", URL: "https://news.crunchbase.com/feed/", Dimension: "Capital", IsActive: true},
		// CB Insights RSS 被 CloudFront 封锁，暂时禁用
		{Name: "CB Insights", URL: "https://www.cbinsights.com/research/feed/", Dimension: "Capital", IsActive: false},
		// Talent: 招聘趋势、人才流动、技能需求
		{Name: "Pragmatic Engineer", URL: "https://blog.pragmaticengineer.com/feed/", Dimension: "Talent", IsActive: true},
		// Opinion: 行业评论、专家观点、采访分析
		{Name: "The Gradient", URL: "https://thegradient.pub/rss/", Dimension: "Opinion", IsActive: true},
		{Name: "One Useful Thing", URL: "https://www.oneusefulthing.org/feed", Dimension: "Opinion", IsActive: true},
	}
	for _, s := range defaults {
		var existing model.Source
		if err := db.Where("name = ?", s.Name).First(&existing).Error; err == nil {
			updates := map[string]interface{}{}
			if existing.Dimension == "" {
				updates["dimension"] = s.Dimension
			}
			if existing.IsActive != s.IsActive {
				updates["is_active"] = s.IsActive
			}
			if existing.URL != s.URL {
				updates["url"] = s.URL
			}
			if len(updates) > 0 {
				db.Model(&existing).Updates(updates)
			}
		} else {
			db.Create(&s)
		}
	}
}
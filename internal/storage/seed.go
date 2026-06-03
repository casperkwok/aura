package storage

import (
	"github.com/casperkwok/aura/internal/model"
	"gorm.io/gorm"
)

func SeedSources(db *gorm.DB) {
	defaults := []model.Source{
		// ═══════════════════════════════════════════
		// Tech: 技术突破、论文、开源项目
		// ═══════════════════════════════════════════
		{Name: "Google DeepMind", URL: "https://deepmind.google/blog/rss.xml", Dimension: "Tech", IsActive: true},
		{Name: "Microsoft Research", URL: "https://www.microsoft.com/en-us/research/feed/", Dimension: "Tech", IsActive: true},
		{Name: "Hugging Face", URL: "https://huggingface.co/blog/feed.xml", Dimension: "Tech", IsActive: true},
		{Name: "LlamaIndex Blog", URL: "https://medium.com/feed/llamaindex-blog", Dimension: "Tech", IsActive: true},
		{Name: "arXiv cs.AI", URL: "https://rss.arxiv.org/rss/cs.AI", Dimension: "Tech", IsActive: true},
		{Name: "arXiv cs.LG", URL: "https://rss.arxiv.org/rss/cs.LG", Dimension: "Tech", IsActive: true},
		{Name: "arXiv cs.CL", URL: "https://rss.arxiv.org/rss/cs.CL", Dimension: "Tech", IsActive: true},
		{Name: "arXiv cs.CV", URL: "https://rss.arxiv.org/rss/cs.CV", Dimension: "Tech", IsActive: true},
		{Name: "Nature Machine Intelligence", URL: "https://www.nature.com/natmachintell.rss", Dimension: "Tech", IsActive: true},
		{Name: "Lilian Weng", URL: "https://lilianweng.github.io/index.xml", Dimension: "Tech", IsActive: true},
		{Name: "Andrej Karpathy", URL: "https://karpathy.github.io/feed.xml", Dimension: "Tech", IsActive: true},
		{Name: "Sebastian Ruder", URL: "https://www.ruder.io/rss/", Dimension: "Tech", IsActive: true},
		{Name: "BAIR Blog", URL: "https://bair.berkeley.edu/blog/feed.xml", Dimension: "Tech", IsActive: true},
		{Name: "Agile Lab Engineering", URL: "https://agilelab.substack.com/feed", Dimension: "Tech", IsActive: true},

		// ═══════════════════════════════════════════
		// Product: 企业产品发布、功能更新、商业模式变化
		// ═══════════════════════════════════════════
		{Name: "OpenAI", URL: "https://openai.com/news/rss.xml", Dimension: "Product", IsActive: true},
		{Name: "Google AI Blog", URL: "https://blog.google/technology/ai/rss/", Dimension: "Product", IsActive: true},
		{Name: "Meta Newsroom", URL: "https://about.fb.com/feed/", Dimension: "Product", IsActive: true},
		{Name: "MIT Tech Review AI", URL: "https://www.technologyreview.com/feed/", Dimension: "Product", IsActive: true},
		{Name: "TechCrunch AI", URL: "https://techcrunch.com/category/artificial-intelligence/feed/", Dimension: "Product", IsActive: true},
		{Name: "VentureBeat AI", URL: "https://venturebeat.com/category/ai/feed/", Dimension: "Product", IsActive: true},
		{Name: "Wired", URL: "https://www.wired.com/feed/rss", Dimension: "Product", IsActive: true},
		{Name: "MarkTechPost", URL: "https://www.marktechpost.com/feed/", Dimension: "Product", IsActive: true},
		{Name: "Full-Stack AI Engineer", URL: "https://fullstackaiengineer.substack.com/feed", Dimension: "Product", IsActive: true},
		{Name: "Agentplex", URL: "https://agentplex.substack.com/feed", Dimension: "Product", IsActive: true},

		// ═══════════════════════════════════════════
		// Capital: 投资事件、融资新闻、市场估值
		// ═══════════════════════════════════════════
		{Name: "a16z", URL: "https://future.a16z.com/feed/", Dimension: "Capital", IsActive: true},
		{Name: "Sequoia Capital", URL: "https://www.sequoiacap.com/feed/", Dimension: "Capital", IsActive: true},
		{Name: "Y Combinator", URL: "https://www.ycombinator.com/blog/rss/", Dimension: "Capital", IsActive: true},
		{Name: "Crunchbase News", URL: "https://news.crunchbase.com/feed/", Dimension: "Capital", IsActive: true},
		{Name: "Elad Gil", URL: "https://blog.eladgil.com/feed", Dimension: "Capital", IsActive: true},
		{Name: "Tomasz Tunguz", URL: "https://tomtunguz.com/index.xml", Dimension: "Capital", IsActive: true},
		{Name: "Not Boring", URL: "https://www.notboring.co/feed", Dimension: "Capital", IsActive: true},
		{Name: "The Generalist", URL: "https://www.generalist.com/feed/", Dimension: "Capital", IsActive: true},

		// ═══════════════════════════════════════════
		// Talent: 招聘趋势、人才流动、技能需求
		// ═══════════════════════════════════════════
		{Name: "Pragmatic Engineer", URL: "https://blog.pragmaticengineer.com/feed/", Dimension: "Talent", IsActive: true},

		// ═══════════════════════════════════════════
		// Opinion: 行业评论、专家观点、采访分析
		// ═══════════════════════════════════════════
		{Name: "Simon Willison", URL: "https://simonwillison.net/atom/everything/", Dimension: "Opinion", IsActive: true},
		{Name: "Simon Willison Newsletter", URL: "https://simonw.substack.com/feed", Dimension: "Opinion", IsActive: true},
		{Name: "Latent Space", URL: "https://www.latent.space/feed", Dimension: "Opinion", IsActive: true},
		{Name: "Import AI", URL: "https://jack-clark.net/feed/", Dimension: "Opinion", IsActive: true},
		{Name: "Interconnects", URL: "https://www.interconnects.ai/feed", Dimension: "Opinion", IsActive: true},
		{Name: "Hamel Husain", URL: "https://hamelhusain.substack.com/feed", Dimension: "Opinion", IsActive: true},
		{Name: "DAIR.AI", URL: "https://nlp.elvissaravia.com/feed", Dimension: "Opinion", IsActive: true},
		{Name: "Enterprise AI Governance", URL: "https://oliverpatel.substack.com/feed", Dimension: "Opinion", IsActive: true},
		{Name: "Stratechery", URL: "https://stratechery.com/feed/", Dimension: "Opinion", IsActive: true},
		{Name: "SemiAnalysis", URL: "https://www.semianalysis.com/feed", Dimension: "Opinion", IsActive: true},
		{Name: "Benedict Evans", URL: "https://www.ben-evans.com/benedictevans?format=rss", Dimension: "Opinion", IsActive: true},
		{Name: "The Gradient", URL: "https://thegradient.pub/rss/", Dimension: "Opinion", IsActive: true},
		{Name: "One Useful Thing", URL: "https://www.oneusefulthing.org/feed", Dimension: "Opinion", IsActive: true},

		// Twitter/X 源不在此处维护，由 ScraperService.SyncTwitterSources()
		// 从 plume 的 /accounts 自动同步（追踪列表只在 plume/accounts.json 维护一处）。
	}
	// 已失效的源（404/403/500 或返回 HTML 而非 feed，部分被 CloudFront 封锁），从库中清除
	obsolete := []string{
		"Anthropic", "Mistral", "Cohere", "Stability AI", "LangChain Blog",
		"Weights & Biases", "Weaviate Blog", "Arize AI Blog", "Braintrust Blog",
		"Helicone Blog", "Papers With Code", "Philipp Schmid", "Eugene Yan",
		"Jason Liu", "Paul Graham", "The Batch", "Ben's Bites",
		"First Round Review", "NFX Blog", "CB Insights",
	}
	db.Where("name IN ?", obsolete).Delete(&model.Source{})

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

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

		// ═══════════════════════════════════════════
		// 以下源暂无 RSS 或已被封锁，暂时禁用
		// ═══════════════════════════════════════════
		{Name: "Anthropic", URL: "https://www.anthropic.com/rss.xml", Dimension: "Product", IsActive: false},
		{Name: "Mistral", URL: "https://mistral.ai/news/rss", Dimension: "Product", IsActive: false},
		{Name: "Cohere", URL: "https://cohere.com/blog/rss", Dimension: "Product", IsActive: false},
		{Name: "Stability AI", URL: "https://stability.ai/blog/rss.xml", Dimension: "Tech", IsActive: false},
		{Name: "LangChain Blog", URL: "https://blog.langchain.com/rss/", Dimension: "Tech", IsActive: false},
		{Name: "Weights & Biases", URL: "https://wandb.ai/fully-connected/rss.xml", Dimension: "Tech", IsActive: false},
		{Name: "Weaviate Blog", URL: "https://weaviate.io/blog/feed.xml", Dimension: "Tech", IsActive: false},
		{Name: "Arize AI Blog", URL: "https://arize.com/blog/feed/", Dimension: "Tech", IsActive: false},
		{Name: "Braintrust Blog", URL: "https://www.braintrustdata.com/blog/rss", Dimension: "Tech", IsActive: false},
		{Name: "Helicone Blog", URL: "https://www.helicone.ai/blog/rss", Dimension: "Tech", IsActive: false},
		{Name: "Papers With Code", URL: "https://paperswithcode.com/latest.rss", Dimension: "Tech", IsActive: false},
		{Name: "Philipp Schmid", URL: "https://www.philschmid.de/feed.xml", Dimension: "Tech", IsActive: false},
		{Name: "Eugene Yan", URL: "https://eugeneyan.com/feed.xml", Dimension: "Opinion", IsActive: false},
		{Name: "Jason Liu", URL: "https://jxnl.co/feed.xml", Dimension: "Opinion", IsActive: false},
		{Name: "Paul Graham", URL: "http://www.paulgraham.com/rss.html", Dimension: "Opinion", IsActive: false},
		{Name: "The Batch", URL: "https://www.deeplearning.ai/the-batch/rss", Dimension: "Opinion", IsActive: false},
		{Name: "Ben's Bites", URL: "https://bensbites.beehiiv.com/feed", Dimension: "Opinion", IsActive: false},
		{Name: "First Round Review", URL: "https://review.firstround.com/feed.xml", Dimension: "Capital", IsActive: false},
		{Name: "NFX Blog", URL: "https://www.nfx.com/feed", Dimension: "Capital", IsActive: false},
		{Name: "CB Insights", URL: "https://www.cbinsights.com/research/feed/", Dimension: "Capital", IsActive: false},

		// ═══════════════════════════════════════════
		// Twitter/X: 经 plume 服务抓取（Type=twitter，URL 存 screenName）
		// ═══════════════════════════════════════════
		{Name: "X @OpenAI", Type: "twitter", URL: "OpenAI", Dimension: "Product", IsActive: true},
		{Name: "X @claudeai", Type: "twitter", URL: "claudeai", Dimension: "Product", IsActive: true},
		{Name: "X @AnthropicAI", Type: "twitter", URL: "AnthropicAI", Dimension: "Product", IsActive: true},
		{Name: "X @karpathy", Type: "twitter", URL: "karpathy", Dimension: "Opinion", IsActive: true},
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

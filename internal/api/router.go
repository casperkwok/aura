package api

import (
	"github.com/casperkwok/aura/internal/insight"
	"github.com/casperkwok/aura/internal/scraper"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRouter(db *gorm.DB, scraperSvc *scraper.ScraperService, insightSvc *insight.InsightService) *gin.Engine {
	r := gin.Default()

	h := &handler{db: db, scraperSvc: scraperSvc, insightSvc: insightSvc}

	apiGroup := r.Group("/api")
	{
		apiGroup.GET("/entries", h.listEntries)
		apiGroup.GET("/sources", h.listSources)
		apiGroup.POST("/sources", h.createSource)
		apiGroup.PUT("/sources/:id", h.updateSource)
		apiGroup.DELETE("/sources/:id", h.deleteSource)
		apiGroup.POST("/scrape", h.triggerScrape)
		apiGroup.GET("/insights", h.listInsights)
		apiGroup.GET("/insights/:id", h.getInsight)
		apiGroup.DELETE("/insights/:id", h.deleteInsight)
		apiGroup.POST("/insights/generate", h.triggerInsightGeneration)
	}

	return r
}

type handler struct {
	db         *gorm.DB
	scraperSvc *scraper.ScraperService
	insightSvc *insight.InsightService
}
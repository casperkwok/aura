package api

import (
	"net/http"
	"strconv"

	"github.com/casperkwok/aura/internal/model"
	"github.com/gin-gonic/gin"
)

func (h *handler) listSources(c *gin.Context) {
	var sources []model.Source
	h.db.Find(&sources)
	c.JSON(http.StatusOK, gin.H{"data": sources})
}

func (h *handler) createSource(c *gin.Context) {
	var input struct {
		Name      string `json:"name" binding:"required"`
		URL       string `json:"url" binding:"required"`
		Type      string `json:"type"`
		Dimension string `json:"dimension"`
		IsActive  bool   `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	sourceType := input.Type
	if sourceType == "" {
		sourceType = "rss"
	}
	source := model.Source{
		Name:      input.Name,
		URL:       input.URL,
		Type:      sourceType,
		Dimension: input.Dimension,
		IsActive:  input.IsActive,
	}
	if err := h.db.Create(&source).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "source name already exists"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": source})
}

func (h *handler) updateSource(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var source model.Source
	if err := h.db.First(&source, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "source not found"})
		return
	}

	var input struct {
		URL       string `json:"url"`
		Type      string `json:"type"`
		Dimension string `json:"dimension"`
		IsActive  *bool  `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]any{}
	if input.URL != "" {
		updates["url"] = input.URL
	}
	if input.Type != "" {
		updates["type"] = input.Type
	}
	if input.Dimension != "" {
		updates["dimension"] = input.Dimension
	}
	if input.IsActive != nil {
		updates["is_active"] = *input.IsActive
	}

	h.db.Model(&source).Updates(updates)
	h.db.First(&source, id)
	c.JSON(http.StatusOK, gin.H{"data": source})
}

func (h *handler) deleteSource(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	result := h.db.Delete(&model.Source{}, id)
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "source not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

func (h *handler) triggerScrape(c *gin.Context) {
	var input struct {
		SourceID *uint `json:"source_id"`
	}
	c.ShouldBindJSON(&input)

	go func() {
		if input.SourceID != nil {
			_ = h.scraperSvc.ScrapeOne(*input.SourceID)
		} else {
			h.scraperSvc.ScrapeAllActive()
		}
	}()

	c.JSON(http.StatusAccepted, gin.H{"message": "scrape triggered"})
}
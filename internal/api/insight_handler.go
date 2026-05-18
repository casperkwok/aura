package api

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/casperkwok/aura/internal/model"
	"github.com/gin-gonic/gin"
)

func (h *handler) listInsights(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}

	var total int64
	h.db.Model(&model.Insight{}).Where("status = ?", "completed").Count(&total)

	var insights []model.Insight
	h.db.Preload("Trends").Where("status = ?", "completed").
		Order("week_label desc").
		Offset((page - 1) * limit).Limit(limit).Find(&insights)

	c.JSON(http.StatusOK, gin.H{
		"data":  insights,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func (h *handler) getInsight(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var insight model.Insight
	if err := h.db.Preload("Trends").First(&insight, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "insight not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": insight})
}

func (h *handler) deleteInsight(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	result := h.db.Unscoped().Select("Trends").Delete(&model.Insight{}, id)
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "insight not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

func (h *handler) triggerInsightGeneration(c *gin.Context) {
	force := c.Query("force") == "true"
	backfill := c.Query("backfill") == "true"
	go func() {
		if backfill {
			log.Println("🔧 API 触发洞察回填...")
			if err := h.insightSvc.GenerateMissingWeeks(); err != nil {
				log.Printf("洞察回填失败: %v", err)
			}
			return
		}
		if force {
			year, week := time.Now().ISOWeek()
			weekLabel := fmt.Sprintf("%d-W%02d", year, week)
			h.db.Unscoped().Where("week_label = ?", weekLabel).Select("Trends").Delete(&model.Insight{})
		}
		if err := h.insightSvc.GenerateCurrentWeek(); err != nil {
			log.Printf("洞察生成失败: %v", err)
		}
	}()
	c.JSON(http.StatusAccepted, gin.H{"message": "insight generation triggered"})
}
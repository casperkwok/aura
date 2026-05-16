package api

import (
	"net/http"
	"strconv"

	"github.com/casperkwok/aura/internal/model"
	"github.com/gin-gonic/gin"
)

func (h *handler) listEntries(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	query := h.db.Model(&model.Entry{})
	if source := c.Query("source"); source != "" {
		query = query.Where("source = ?", source)
	}

	var total int64
	query.Count(&total)

	var entries []model.Entry
	query.Order("published_at desc").
		Offset((page - 1) * limit).
		Limit(limit).
		Find(&entries)

	c.JSON(http.StatusOK, gin.H{
		"data":  entries,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}
package model

import (
	"time"

	"gorm.io/gorm"
)

type Entry struct {
	gorm.Model
	Source      string    `gorm:"index"`
	Dimension   string    `gorm:"index;size:20"`
	Title       string    `gorm:"uniqueIndex:idx_link_title"`
	TitleCn     string    `gorm:"column:title_cn"`
	Description string    `gorm:"column:description"`
	SummaryCn   string    `gorm:"column:summary_cn"`
	Link        string    `gorm:"uniqueIndex:idx_link_title"`
	PublishedAt time.Time `gorm:"index"`
}

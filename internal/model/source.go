package model

import (
	"time"

	"gorm.io/gorm"
)

type Source struct {
	gorm.Model
	Name          string     `gorm:"uniqueIndex;not null;size:100"`
	Type          string     `gorm:"size:20;default:rss"` // rss / theirstack
	URL           string     `gorm:"not null;size:1000"`
	IsActive      bool       `gorm:"default:true"`
	Dimension     string     `gorm:"index;size:20"` // Tech/Product/Capital/Talent/Opinion
	LastScrapedAt *time.Time `gorm:"index"`
	ErrorCount    int        `gorm:"default:0"`
	LastError     string     `gorm:"size:500"`
}
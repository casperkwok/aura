package model

import "gorm.io/gorm"

type Insight struct {
	gorm.Model
	WeekLabel string  `gorm:"uniqueIndex;size:20;not null"`
	ParentID  *uint   `gorm:"index"`
	SummaryCn string  `gorm:"column:summary_cn;type:text"`
	Status    string  `gorm:"size:20;default:processing"` // processing / completed / failed
	Trends    []Trend `gorm:"foreignKey:InsightID"`
}

type Trend struct {
	gorm.Model
	InsightID     uint   `gorm:"index;not null"`
	Name          string `gorm:"size:200;not null"`
	Status        string `gorm:"size:20;not null"` // emerging/accelerating/stable/decelerating/fading
	PrevStatus    string `gorm:"size:20"`
	Confidence    string `gorm:"size:10"` // low/medium/high
	Dimensions    string `gorm:"size:100"` // comma-separated: Tech,Product,Capital
	EvidenceIDs   string `gorm:"size:500"` // comma-separated Entry IDs
	SummaryCn     string `gorm:"column:summary_cn;size:500"`
	ParentTrendID *uint  `gorm:"index"`
}
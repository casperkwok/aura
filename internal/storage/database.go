package storage

import (
	"fmt"

	"github.com/casperkwok/aura/internal/model"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func InitDB(dbPath string) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(dbPath+"?_loc=Asia%2FShanghai"), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	if err := db.Exec("PRAGMA journal_mode=WAL;").Error; err != nil {
		return nil, err
	}

	if err := db.Exec("PRAGMA synchronous=NORMAL;").Error; err != nil {
		return nil, err
	}

	err = db.AutoMigrate(&model.Entry{}, &model.Source{}, &model.Insight{}, &model.Trend{})
	if err != nil {
		return nil, err
	}

	if err := migrateCategoryToDimension(db); err != nil {
		return nil, fmt.Errorf("migration failed: %w", err)
	}

	return db, nil
}

// One-time migration: Category → Dimension on sources + add Dimension on entries
func migrateCategoryToDimension(db *gorm.DB) error {
	// Check if category column still exists on sources
	var cols []struct{ Name string }
	db.Raw("PRAGMA table_info(sources)").Scan(&cols)
	hasCategory := false
	for _, c := range cols {
		if c.Name == "category" {
			hasCategory = true
		}
	}

	if hasCategory {
		db.Exec("UPDATE sources SET dimension = CASE category WHEN 'Industry' THEN 'Tech' WHEN 'Research' THEN 'Tech' WHEN 'OpenSource' THEN 'Tech' ELSE 'Tech' END WHERE dimension IS NULL OR dimension = ''")
		db.Exec("DROP INDEX IF EXISTS idx_sources_category")
		db.Exec("ALTER TABLE sources DROP COLUMN category")
	}

	// Backfill entry dimension from source
	db.Exec("UPDATE entries SET dimension = COALESCE((SELECT s.dimension FROM sources s WHERE s.name = entries.source AND s.deleted_at IS NULL), 'Tech') WHERE dimension IS NULL OR dimension = ''")

	return nil
}
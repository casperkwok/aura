package scraper

import (
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/casperkwok/aura/internal/model"
	"gorm.io/gorm"
)

type ScraperService struct {
	db            *gorm.DB
	analyzer      Analyzer
	maxItems      int
	theirStackKey string
}

func NewService(db *gorm.DB, analyzer Analyzer, maxItems int, theirStackKey string) *ScraperService {
	return &ScraperService{db: db, analyzer: analyzer, maxItems: maxItems, theirStackKey: theirStackKey}
}

func (s *ScraperService) ScrapeAllActive() {
	var sources []model.Source
	s.db.Where("is_active = ?", true).Find(&sources)

	log.Printf("🚀 开始抓取 %d 个活跃源...", len(sources))

	var wg sync.WaitGroup
	for _, src := range sources {
		wg.Add(1)
		go func(source model.Source) {
			defer wg.Done()
			err := s.FetchAndSave(source)
			s.updateSourceStatus(source, err)
		}(src)
	}
	wg.Wait()
}

func (s *ScraperService) ScrapeOne(sourceID uint) error {
	var source model.Source
	if err := s.db.First(&source, sourceID).Error; err != nil {
		return err
	}
	if !source.IsActive {
		return fmt.Errorf("source %s is not active", source.Name)
	}
	err := s.FetchAndSave(source)
	s.updateSourceStatus(source, err)
	return err
}

func (s *ScraperService) updateSourceStatus(source model.Source, err error) {
	now := time.Now()
	if err != nil {
		s.db.Model(&source).Updates(map[string]interface{}{
			"error_count": source.ErrorCount + 1,
			"last_error":  err.Error(),
		})
	} else {
		s.db.Model(&source).Updates(map[string]interface{}{
			"error_count":     0,
			"last_error":      "",
			"last_scraped_at": now,
		})
	}
}
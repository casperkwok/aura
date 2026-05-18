package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/casperkwok/aura/internal/api"
	"github.com/casperkwok/aura/internal/config"
	"github.com/casperkwok/aura/internal/insight"
	"github.com/casperkwok/aura/internal/scraper"
	"github.com/casperkwok/aura/internal/storage"
	"github.com/casperkwok/aura/internal/translator"
	"github.com/robfig/cron/v3"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	db, err := storage.InitDB(cfg.DBPath)
	if err != nil {
		log.Fatal("database init failed: ", err)
	}
	storage.SeedSources(db)

	analyzer := translator.NewAIAnalyzer(cfg.DeepSeekAPIKey, cfg.DeepSeekBaseURL, cfg.DeepSeekModel)
	scraperSvc := scraper.NewService(db, analyzer, cfg.MaxItemsPerSource, cfg.TheirStackAPIKey)
	insightSvc := insight.NewService(db, insight.NewAIGenerator(cfg.DeepSeekAPIKey, cfg.DeepSeekBaseURL, cfg.DeepSeekModel))

	log.Printf("⏰ 抓取计划: %s", cfg.ScrapInterval)
	log.Printf("⏰ 洞察计划: %s", cfg.InsightInterval)

	c := cron.New()
	c.AddFunc(cfg.ScrapInterval, func() {
		log.Printf("⏰ 定时抓取触发")
		scraperSvc.ScrapeAllActive()
	})
	c.AddFunc(cfg.InsightInterval, func() {
		log.Printf("⏰ 定时洞察生成触发")
		if err := insightSvc.GenerateCurrentWeek(); err != nil {
			log.Printf("weekly insight generation failed: %v", err)
		}
	})
	c.Start()
	log.Println("✅ 定时任务已启动")

	r := api.SetupRouter(db, scraperSvc, insightSvc)

	go func() {
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		<-quit
		log.Println("shutting down...")
		c.Stop()
	}()

	log.Printf("Aura server starting on %s", cfg.ServerPort)
	if err := r.Run(cfg.ServerPort); err != nil {
		log.Fatal("server failed: ", err)
	}
}
package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	DeepSeekAPIKey    string
	DeepSeekBaseURL   string
	DeepSeekModel     string
	TheirStackAPIKey  string
	DBPath            string
	MaxItemsPerSource int
	ScrapInterval     string
	InsightInterval   string
	ServerPort        string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	apiKey := os.Getenv("DEEPSEEK_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("DEEPSEEK_API_KEY is required")
	}

	return &Config{
		DeepSeekAPIKey:    apiKey,
		DeepSeekBaseURL:   envOrDefault("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
		DeepSeekModel:     envOrDefault("DEEPSEEK_MODEL", "deepseek-v4-flash"),
		TheirStackAPIKey:  os.Getenv("THEIRSTACK_API_KEY"),
		DBPath:            envOrDefault("DB_PATH", "data/aura.db"),
		MaxItemsPerSource: envOrDefaultInt("MAX_ITEMS_PER_SOURCE", 10),
		ScrapInterval:     envOrDefault("SCRAP_INTERVAL", "0 */2 * * *"),
		InsightInterval:   envOrDefault("INSIGHT_INTERVAL", "0 9 * * 1"),
		ServerPort:        envOrDefault("SERVER_PORT", ":8080"),
	}, nil
}

func envOrDefault(key, defaultVal string) string {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	return val
}

func envOrDefaultInt(key string, defaultVal int) int {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	n, err := strconv.Atoi(val)
	if err != nil || n <= 0 {
		return defaultVal
	}
	return n
}
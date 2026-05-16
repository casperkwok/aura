package translator

import (
	"context"
	"fmt"
	"strings"

	"github.com/sashabaranov/go-openai"
)

type AIAnalyzer struct {
	client *openai.Client
	model  string
}

func NewAIAnalyzer(apiKey, baseURL, modelName string) *AIAnalyzer {
	config := openai.DefaultConfig(apiKey)
	if baseURL != "" {
		config.BaseURL = baseURL
	}
	return &AIAnalyzer{
		client: openai.NewClientWithConfig(config),
		model:  modelName,
	}
}

func (a *AIAnalyzer) Analyze(title, desc string) (string, string) {
	// 针对 V4 Flash 优化的 Prompt
	prompt := `你是一个 AI 领域专家。请执行以下任务：
1. 将标题翻译为准确、地道的中文。
2. 将摘要提炼为 50 字以内的中文精华。
严格按格式输出：中文标题|||中文摘要`

	resp, err := a.client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: a.model, // 这里传入 "deepseek-v4-flash"
			Messages: []openai.ChatCompletionMessage{
				{Role: "system", Content: prompt},
				{Role: "user", Content: fmt.Sprintf("Title: %s\nDesc: %s", title, desc)},
			},
			Temperature: 0.1, // 降低随机性
		},
	)

	if err != nil {
		return "", ""
	}

	res := resp.Choices[0].Message.Content
	parts := strings.Split(res, "|||")
	if len(parts) == 2 {
		return strings.TrimSpace(parts[0]), strings.TrimSpace(parts[1])
	}
	return "", ""
}

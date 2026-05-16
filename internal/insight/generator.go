package insight

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/casperkwok/aura/internal/model"
	"github.com/sashabaranov/go-openai"
)

type InsightResult struct {
	SummaryCn string       `json:"summary_cn"`
	Trends    []TrendResult `json:"trends"`
}

type TrendResult struct {
	Name        string   `json:"name"`
	Status      string   `json:"status"`
	PrevStatus  string   `json:"prev_status"`
	Confidence  string   `json:"confidence"`
	Dimensions  []string `json:"dimensions"`
	EvidenceIDs []uint   `json:"evidence_ids"`
	SummaryCn   string   `json:"summary_cn"`
}

type Generator interface {
	Generate(ctx context.Context, entries []model.Entry, prevInsight *model.Insight) (*InsightResult, error)
}

type AIGenerator struct {
	client *openai.Client
	model  string
}

func NewAIGenerator(apiKey, baseURL, modelName string) *AIGenerator {
	config := openai.DefaultConfig(apiKey)
	if baseURL != "" {
		config.BaseURL = baseURL
	}
	return &AIGenerator{
		client: openai.NewClientWithConfig(config),
		model:  modelName,
	}
}

const systemPrompt = `你是 AI 领域趋势洞察引擎。你的任务是从多维度信号中识别趋势，尤其关注不同维度之间的印证、时差和矛盾。

## 维度定义
- Tech: 技术突破、论文、开源项目
- Product: 企业产品发布、功能更新、商业模式
- Capital: 投资事件、融资、市场估值
- Talent: 招聘岗位、人才流动、技能需求
- Opinion: 行业评论、专家观点、采访

## 核心要求
1. 必须产生 4-6 个趋势，其中至少 2 个必须主要来自非 Tech 维度（Product/Capital/Talent/Opinion）
2. 区分"多维印证的趋势"（多个维度指向同一方向，置信度高）和"单一维度的早期信号"（只有一个维度有信号但值得关注，置信度低）
3. 关注维度间的时差：Talent 开始招聘但 Product 还没动静 = 早期信号；Tech 论文多但 Capital 没跟进 = 可能还在学术阶段
4. 具体命名：趋势名称中尽量包含具体的公司、产品或技术名称

## 趋势生命周期
- emerging: 新出现的趋势信号
- accelerating: 信号频率和强度在增加，多个维度开始印证
- stable: 持续存在但未明显变化
- decelerating: 信号频率降低
- fading: 信号几乎消失

## 置信度
- low: 仅单一维度有信号，或信号总量不足5条
- medium: 2-3个维度有信号
- high: 4+维度有信号，或同一维度内多条高质量信号互相印证

严格按 JSON 输出：
{
  "summary_cn": "200字综述，先总结多维印证的趋势，再点出值得关注的早期单一维度信号",
  "trends": [
    {
      "name": "趋势名称（含具体公司/产品名）",
      "status": "emerging|accelerating|stable|decelerating|fading",
      "prev_status": "上周状态或空字符串",
      "confidence": "low|medium|high",
      "dimensions": ["Tech","Product"],
      "evidence_ids": [12,34],
      "summary_cn": "50字以内的趋势摘要"
    }
  ]
}`

func (g *AIGenerator) Generate(ctx context.Context, entries []model.Entry, prevInsight *model.Insight) (*InsightResult, error) {
	userMsg := buildPrompt(entries, prevInsight)

	resp, err := g.client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
		Model: g.model,
		Messages: []openai.ChatCompletionMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userMsg},
		},
		Temperature: 0.3,
	})
	if err != nil {
		return nil, fmt.Errorf("AI call failed: %w", err)
	}

	content := resp.Choices[0].Message.Content
	content = stripCodeFences(content)

	var result InsightResult
	if err := json.Unmarshal([]byte(content), &result); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %w\nraw: %s", err, content)
	}

	return &result, nil
}

func buildPrompt(entries []model.Entry, prevInsight *model.Insight) string {
	var sb strings.Builder

	if prevInsight != nil {
		sb.WriteString("## 上周洞察\n")
		sb.WriteString(prevInsight.SummaryCn + "\n\n上周趋势：\n")
		for _, t := range prevInsight.Trends {
			fmt.Fprintf(&sb, "- %s（状态：%s，置信度：%s，维度：%s）\n", t.Name, t.Status, t.Confidence, t.Dimensions)
		}
		sb.WriteString("\n")
	}

	// Group entries by dimension for clearer signal distribution
	dimGroups := map[string][]model.Entry{
		"Tech":     {},
		"Product":  {},
		"Capital":  {},
		"Talent":   {},
		"Opinion":  {},
	}
	for _, e := range entries {
		dimGroups[e.Dimension] = append(dimGroups[e.Dimension], e)
	}

	sb.WriteString("## 本周信号（按维度分组）\n\n")
	for _, dim := range []string{"Tech", "Product", "Capital", "Talent", "Opinion"} {
		items := dimGroups[dim]
		if len(items) == 0 {
			continue
		}
		fmt.Fprintf(&sb, "### %s（%d条）\n", dim, len(items))
		for _, e := range items {
			fmt.Fprintf(&sb, "ID:%d | %s | %s\n", e.ID, e.TitleCn, e.SummaryCn)
		}
		sb.WriteString("\n")
	}

	return sb.String()
}

func stripCodeFences(s string) string {
	s = strings.TrimSpace(s)
	if strings.HasPrefix(s, "```json") {
		s = strings.TrimPrefix(s, "```json")
		s = strings.TrimSuffix(s, "```")
		s = strings.TrimSpace(s)
	} else if strings.HasPrefix(s, "```") {
		s = strings.TrimPrefix(s, "```")
		s = strings.TrimSuffix(s, "```")
		s = strings.TrimSpace(s)
	}
	return s
}
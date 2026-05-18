package insight

import (
	"context"
	"fmt"
	"log"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/casperkwok/aura/internal/model"
	"gorm.io/gorm"
)

type InsightService struct {
	db        *gorm.DB
	generator Generator
}

func NewService(db *gorm.DB, generator Generator) *InsightService {
	return &InsightService{db: db, generator: generator}
}

func (s *InsightService) GenerateCurrentWeek() error {
	return s.GenerateWeek(time.Now())
}

func (s *InsightService) GenerateWeek(t time.Time) error {
	weekLabel := formatWeekLabel(t)

	var existing model.Insight
	if err := s.db.Where("week_label = ?", weekLabel).First(&existing).Error; err == nil {
		return fmt.Errorf("insight for week %s already exists (status: %s)", weekLabel, existing.Status)
	}

	var parentInsight *model.Insight
	var pi model.Insight
	if err := s.db.Where("status = ?", "completed").Order("week_label desc").First(&pi).Error; err == nil {
		s.db.Preload("Trends").First(&pi, pi.ID)
		parentInsight = &pi
	}

	start, end := weekBoundaries(t)
	var entries []model.Entry
	s.db.Where("published_at BETWEEN ? AND ?", start, end).Order("published_at desc").Find(&entries)

	if len(entries) == 0 {
		return fmt.Errorf("no entries found for week %s", weekLabel)
	}

	var parentID *uint
	if parentInsight != nil {
		parentID = &parentInsight.ID
	}
	newInsight := model.Insight{
		WeekLabel: weekLabel,
		ParentID:  parentID,
		Status:    "processing",
	}
	s.db.Create(&newInsight)

	result, err := s.generator.Generate(context.Background(), entries, parentInsight)
	if err != nil {
		s.db.Model(&newInsight).Updates(map[string]any{"status": "failed", "summary_cn": err.Error()})
		return err
	}

	newInsight.SummaryCn = result.SummaryCn
	newInsight.Status = "completed"
	s.db.Save(&newInsight)

	for _, tr := range result.Trends {
		var parentTrendID *uint
		if parentInsight != nil {
			parentTrendID = matchTrendToParent(tr.Name, parentInsight.Trends)
		}

		trend := model.Trend{
			InsightID:     newInsight.ID,
			Name:          tr.Name,
			Status:        tr.Status,
			PrevStatus:    tr.PrevStatus,
			Confidence:    tr.Confidence,
			Dimensions:    strings.Join(tr.Dimensions, ","),
			EvidenceIDs:   formatEvidenceIDs(tr.EvidenceIDs),
			SummaryCn:     tr.SummaryCn,
			ParentTrendID: parentTrendID,
		}
		s.db.Create(&trend)
	}

	log.Printf("✅ 洞察已生成: %s (%d 个趋势)", weekLabel, len(result.Trends))
	return nil
}

// GenerateMissingWeeks finds all weeks that have entries but no insight, and generates them.
func (s *InsightService) GenerateMissingWeeks() error {
	// Collect all entry published dates and compute ISO week labels in Go
	var entries []model.Entry
	s.db.Select("published_at").Find(&entries)
	if len(entries) == 0 {
		log.Println("📭 没有条目，跳过洞察回填")
		return nil
	}

	weekSet := map[string]time.Time{}
	for _, e := range entries {
		label := formatWeekLabel(e.PublishedAt)
		if _, ok := weekSet[label]; !ok {
			weekSet[label] = e.PublishedAt
		}
	}

	// Find which weeks already have insights
	existing := map[string]bool{}
	var completed []model.Insight
	s.db.Where("status = ?", "completed").Find(&completed)
	for _, ins := range completed {
		existing[ins.WeekLabel] = true
	}

	// Build sorted list of missing weeks
	type weekEntry struct {
		label string
		t     time.Time
	}
	var missing []weekEntry
	for label, t := range weekSet {
		if !existing[label] && label != "" {
			missing = append(missing, weekEntry{label, t})
		}
	}
	sort.Slice(missing, func(i, j int) bool { return missing[i].label < missing[j].label })

	if len(missing) == 0 {
		log.Println("✅ 所有周的洞察已是最新")
		return nil
	}

	log.Printf("📊 发现 %d 个缺失洞察的周，开始回填...", len(missing))
	for i, we := range missing {
		log.Printf("📝 [%d/%d] 生成洞察: %s", i+1, len(missing), we.label)
		if err := s.GenerateWeek(we.t); err != nil {
			log.Printf("⚠️ 生成 %s 失败: %v", we.label, err)
			continue
		}
	}
	log.Println("✅ 洞察回填完成")
	return nil
}

func formatWeekLabel(t time.Time) string {
	year, week := t.ISOWeek()
	return fmt.Sprintf("%d-W%02d", year, week)
}

func weekBoundaries(t time.Time) (start, end time.Time) {
	weekday := int(t.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	start = t.AddDate(0, 0, -(weekday - 1)).Truncate(24 * time.Hour)
	end = start.AddDate(0, 0, 7).Add(-time.Second)
	return start, end
}

func formatEvidenceIDs(ids []uint) string {
	strs := make([]string, len(ids))
	for i, id := range ids {
		strs[i] = strconv.FormatUint(uint64(id), 10)
	}
	return strings.Join(strs, ",")
}

func matchTrendToParent(name string, parentTrends []model.Trend) *uint {
	nameWords := strings.Fields(strings.ToLower(name))
	for _, pt := range parentTrends {
		ptWords := strings.Fields(strings.ToLower(pt.Name))
		matches := 0
		for _, nw := range nameWords {
			for _, pw := range ptWords {
				if nw == pw || strings.Contains(pw, nw) || strings.Contains(nw, pw) {
					matches++
					break
				}
			}
		}
		overlap := float64(matches) / float64(len(nameWords)+len(ptWords))
		if overlap > 0.4 {
			return &pt.ID
		}
	}
	return nil
}

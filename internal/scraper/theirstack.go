package scraper

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/casperkwok/aura/internal/model"
)

const theirStackBase = "https://api.theirstack.com/v1/jobs/search"

type theirStackJob struct {
	ID          int    `json:"id"`
	JobTitle    string `json:"job_title"`
	Description string `json:"description"`
	URL         string `json:"url"`
	Company     string `json:"company"`
	DatePosted  string `json:"date_posted"`
	Location    string `json:"location"`
	Remote      bool   `json:"remote"`
	Salary      string `json:"salary_string"`
	Seniority   string `json:"seniority"`
	CountryCode string `json:"country_code"`
}

type theirStackResponse struct {
	Data     []theirStackJob `json:"data"`
	Metadata struct {
		TotalResults int `json:"total_results"`
	} `json:"metadata"`
}

func (s *ScraperService) fetchTheirStack(source model.Source) error {
	queryBody := source.URL // source.URL stores the JSON query for TheirStack sources

	req, err := http.NewRequest("POST", theirStackBase, strings.NewReader(queryBody))
	if err != nil {
		return fmt.Errorf("[%s] request error: %w", source.Name, err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.theirStackKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("[%s] fetch failed: %w", source.Name, err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("[%s] read error: %w", source.Name, err)
	}

	if resp.StatusCode != 200 {
		return fmt.Errorf("[%s] API returned %d: %s", source.Name, resp.StatusCode, string(body[:min(len(body), 200)]))
	}

	var result theirStackResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return fmt.Errorf("[%s] parse error: %w", source.Name, err)
	}

	newCount := 0
	for _, job := range result.Data {
		var exists int64
		s.db.Model(&model.Entry{}).Where("link = ?", job.URL).Count(&exists)
		if exists > 0 {
			continue
		}

		pubTime := time.Now()
		if job.DatePosted != "" {
			if t, err := time.Parse("2006-01-02", job.DatePosted); err == nil {
				pubTime = t
			}
		}

		title := fmt.Sprintf("[%s] %s", job.Company, job.JobTitle)
		desc := job.Description
		if desc == "" {
			desc = fmt.Sprintf("Company: %s\nLocation: %s\nRemote: %v\nSalary: %s\nSeniority: %s",
				job.Company, job.Location, job.Remote, job.Salary, job.Seniority)
		}

		titleCn, summaryCn := s.analyzer.Analyze(title, desc)

		entry := model.Entry{
			Source:      source.Name,
			Dimension:   source.Dimension,
			Title:       title,
			TitleCn:     titleCn,
			Description: desc,
			SummaryCn:   summaryCn,
			Link:        job.URL,
			PublishedAt: pubTime,
		}

		if err := s.db.Create(&entry).Error; err != nil {
			fmt.Printf("⚠️ [%s] save failed: %v\n", source.Name, err)
		} else {
			newCount++
			fmt.Printf("✅ [%s] %s\n", source.Name, titleCn)
		}

		if newCount >= s.maxItems {
			break
		}
	}

	if newCount > 0 {
		fmt.Printf("📊 [%s] %d new AI jobs (of %d total matches)\n", source.Name, newCount, result.Metadata.TotalResults)
	}
	return nil
}
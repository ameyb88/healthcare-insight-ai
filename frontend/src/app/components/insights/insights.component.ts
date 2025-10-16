import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Feedback, Insights } from '../../services/api.service';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="insights-header fade-in">
        <h1>💡 Executive Insights</h1>
        <p class="text-muted">
          AI-generated strategic insights from patient feedback trends
        </p>
      </div>

      <div class="insights-actions fade-in" style="animation-delay: 0.2s">
        <button
          class="btn btn-primary"
          (click)="generateInsights()"
          [disabled]="loading"
        >
          <span *ngIf="!loading">🚀 Generate Insights</span>
          <span *ngIf="loading" class="loading"></span>
          <span *ngIf="loading">Analyzing all feedback...</span>
        </button>
      </div>

      <div *ngIf="loading" class="loading-container fade-in">
        <div class="ai-thinking">
          <div class="thinking-animation">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          <h3>AI is analyzing {{ feedbackCount }} feedback entries...</h3>
          <p class="text-muted">
            Identifying trends, priorities, and actionable recommendations
          </p>
        </div>
      </div>

      <div *ngIf="insights && !loading" class="insights-grid fade-in">
        <!-- Risk Summary -->
        <div class="insight-card glass-card risk-summary">
          <div class="card-icon">⚠️</div>
          <h2>Risk Summary</h2>
          <p class="summary-text">{{ insights.riskSummary }}</p>
        </div>

        <!-- Trends -->
        <div class="insight-card glass-card">
          <div class="card-header">
            <div class="card-icon">📊</div>
            <h2>Key Trends</h2>
          </div>
          <div class="trends-list">
            <div
              *ngFor="let trend of insights.trends; let i = index"
              class="trend-item"
            >
              <div class="trend-number">{{ i + 1 }}</div>
              <p>{{ trend }}</p>
            </div>
          </div>
        </div>

        <!-- Top Priorities -->
        <div class="insight-card glass-card priorities-card">
          <div class="card-header">
            <div class="card-icon">🎯</div>
            <h2>Top 3 Priorities</h2>
          </div>
          <div class="priorities-list">
            <div
              *ngFor="let priority of insights.priorities; let i = index"
              class="priority-item"
            >
              <div class="priority-header">
                <span class="priority-rank">#{{ i + 1 }}</span>
                <h3>{{ priority.issue }}</h3>
              </div>
              <div class="priority-details">
                <div class="detail-row">
                  <span class="detail-label">Impact:</span>
                  <span class="detail-value">{{ priority.impact }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Action:</span>
                  <span class="detail-value">{{ priority.action }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Positive Highlights -->
        <div class="insight-card glass-card highlights-card">
          <div class="card-header">
            <div class="card-icon">✨</div>
            <h2>Positive Highlights</h2>
          </div>
          <div class="highlights-list">
            <div
              *ngFor="let highlight of insights.highlights"
              class="highlight-item"
            >
              <span class="highlight-icon">✅</span>
              <p>{{ highlight }}</p>
            </div>
          </div>
        </div>

        <!-- Action Plan -->
        <div class="insight-card glass-card action-plan-card">
          <div class="card-header">
            <div class="card-icon">🚀</div>
            <h2>Strategic Action Plan</h2>
          </div>
          <div class="action-plan-list">
            <div
              *ngFor="let action of insights.actionPlan; let i = index"
              class="action-plan-item"
            >
              <div class="action-timeline">
                <div class="timeline-dot"></div>
                <div
                  class="timeline-line"
                  *ngIf="i < insights.actionPlan.length - 1"
                ></div>
              </div>
              <div class="action-content">
                <h4>Step {{ i + 1 }}</h4>
                <p>{{ action }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Export Section -->
        <div class="export-section">
          <button class="btn btn-primary" (click)="exportInsights()">
            📥 Export Executive Report
          </button>
          <button class="btn btn-secondary" (click)="generateInsights()">
            🔄 Regenerate Insights
          </button>
        </div>
      </div>

      <div *ngIf="error" class="error-card glass-card fade-in">
        <h3>❌ Error Generating Insights</h3>
        <p>{{ error }}</p>
        <button class="btn btn-secondary" (click)="generateInsights()">
          Try Again
        </button>
      </div>

      <div *ngIf="!insights && !loading && !error" class="empty-state fade-in">
        <div class="empty-icon">💡</div>
        <h3>No Insights Generated Yet</h3>
        <p>
          Click the button above to generate AI-powered insights from all
          feedback data
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .insights-header {
        text-align: center;
        margin-bottom: 32px;
      }

      .insights-header h1 {
        font-size: 48px;
        margin-bottom: 8px;
      }

      .insights-actions {
        text-align: center;
        margin-bottom: 48px;
      }

      .loading-container {
        text-align: center;
        padding: 80px 0;
      }

      .ai-thinking {
        max-width: 500px;
        margin: 0 auto;
      }

      .thinking-animation {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin-bottom: 24px;
      }

      .dot {
        width: 16px;
        height: 16px;
        background: var(--primary);
        border-radius: 50%;
        animation: bounce 1.4s ease-in-out infinite;
      }

      .dot:nth-child(2) {
        animation-delay: 0.2s;
      }

      .dot:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes bounce {
        0%,
        80%,
        100% {
          transform: translateY(0);
        }
        40% {
          transform: translateY(-20px);
        }
      }

      .insights-grid {
        display: grid;
        gap: 24px;
      }

      .insight-card {
        padding: 32px !important;
      }

      .card-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;
      }

      .card-header .card-icon {
        margin: 0;
      }

      .card-header h2 {
        margin: 0;
      }

      .risk-summary {
        background: linear-gradient(
          135deg,
          rgba(239, 68, 68, 0.1),
          rgba(220, 38, 38, 0.1)
        );
        border-left: 4px solid var(--danger);
      }

      .summary-text {
        font-size: 18px;
        line-height: 1.8;
        color: var(--text-primary);
        margin: 0;
      }

      .trends-list {
        display: grid;
        gap: 16px;
      }

      .trend-item {
        display: flex;
        gap: 16px;
        padding: 16px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 8px;
        transition: all 0.3s ease;
      }

      .trend-item:hover {
        background: rgba(255, 255, 255, 0.06);
        transform: translateX(4px);
      }

      .trend-number {
        min-width: 32px;
        height: 32px;
        background: var(--primary);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
      }

      .trend-item p {
        margin: 0;
        color: var(--text-secondary);
        line-height: 1.6;
      }

      .priorities-card {
        background: linear-gradient(
          135deg,
          rgba(99, 102, 241, 0.1),
          rgba(139, 92, 246, 0.1)
        );
      }

      .priorities-list {
        display: grid;
        gap: 24px;
      }

      .priority-item {
        padding: 20px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        border-left: 4px solid var(--primary);
      }

      .priority-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }

      .priority-rank {
        background: var(--primary);
        color: white;
        padding: 4px 12px;
        border-radius: 6px;
        font-weight: 700;
        font-size: 14px;
      }

      .priority-header h3 {
        margin: 0;
        font-size: 18px;
        color: var(--text-primary);
      }

      .priority-details {
        display: grid;
        gap: 12px;
      }

      .detail-row {
        display: flex;
        gap: 8px;
      }

      .detail-label {
        font-weight: 600;
        color: var(--text-muted);
        min-width: 80px;
      }

      .detail-value {
        color: var(--text-secondary);
        line-height: 1.6;
      }

      .highlights-card {
        background: linear-gradient(
          135deg,
          rgba(16, 185, 129, 0.1),
          rgba(5, 150, 105, 0.1)
        );
      }

      .highlights-list {
        display: grid;
        gap: 12px;
      }

      .highlight-item {
        display: flex;
        gap: 12px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 8px;
      }

      .highlight-icon {
        font-size: 20px;
      }

      .highlight-item p {
        margin: 0;
        color: var(--text-secondary);
        line-height: 1.6;
      }

      .action-plan-card {
        background: linear-gradient(
          135deg,
          rgba(6, 182, 212, 0.1),
          rgba(8, 145, 178, 0.1)
        );
      }

      .action-plan-list {
        display: grid;
        gap: 0;
      }

      .action-plan-item {
        display: flex;
        gap: 20px;
      }

      .action-timeline {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .timeline-dot {
        width: 16px;
        height: 16px;
        background: var(--primary);
        border-radius: 50%;
        border: 3px solid var(--bg-card);
        z-index: 1;
      }

      .timeline-line {
        width: 2px;
        flex: 1;
        background: var(--glass-border);
        margin: 4px 0;
      }

      .action-content {
        flex: 1;
        padding-bottom: 24px;
      }

      .action-content h4 {
        font-size: 14px;
        color: var(--primary);
        margin: 0 0 8px 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .action-content p {
        margin: 0;
        color: var(--text-secondary);
        line-height: 1.6;
      }

      .export-section {
        display: flex;
        gap: 12px;
        justify-content: center;
        margin-top: 32px;
      }

      .error-card {
        padding: 32px !important;
        text-align: center;
        border: 2px solid var(--danger);
      }

      .empty-state {
        text-align: center;
        padding: 80px 0;
      }

      .empty-icon {
        font-size: 80px;
        margin-bottom: 24px;
        opacity: 0.5;
      }

      .empty-state h3 {
        margin-bottom: 12px;
      }

      .empty-state p {
        color: var(--text-muted);
      }

      @media (max-width: 768px) {
        .export-section {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class InsightsComponent implements OnInit {
  insights: Insights | null = null;
  loading = false;
  error = '';
  feedbackCount = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    // Auto-load feedback count
    this.apiService.getFeedback().subscribe({
      next: (response) => {
        this.feedbackCount = response.data.length;
      },
    });
  }

  generateInsights() {
    this.loading = true;
    this.error = '';
    this.insights = null;

    // First get all feedback
    this.apiService.getFeedback().subscribe({
      next: (feedbackResponse) => {
        // Then generate insights
        this.apiService.generateInsights(feedbackResponse.data).subscribe({
          next: (insightsResponse) => {
            this.insights = insightsResponse.data.insights;
            this.loading = false;
          },
          error: (error) => {
            this.error =
              error.error?.error ||
              'Failed to generate insights. Please check if the backend server is running and OpenAI API key is configured.';
            this.loading = false;
            console.error('Insights error:', error);
          },
        });
      },
      error: (error) => {
        this.error = 'Failed to load feedback data';
        this.loading = false;
      },
    });
  }

  exportInsights() {
    if (!this.insights) return;

    const report = `
HEALTHCARE INSIGHT AI - EXECUTIVE INSIGHTS REPORT
Generated: ${new Date().toLocaleString()}
Feedback Analyzed: ${this.feedbackCount} entries

================================================================================
RISK SUMMARY
================================================================================
${this.insights.riskSummary}

================================================================================
KEY TRENDS
================================================================================
${this.insights.trends.map((trend, i) => `${i + 1}. ${trend}`).join('\n')}

================================================================================
TOP 3 PRIORITIES
================================================================================
${this.insights.priorities
  .map(
    (p, i) => `
Priority #${i + 1}: ${p.issue}
Impact: ${p.impact}
Recommended Action: ${p.action}
`
  )
  .join('\n')}

================================================================================
POSITIVE HIGHLIGHTS
================================================================================
${this.insights.highlights.map((h, i) => `✓ ${h}`).join('\n')}

================================================================================
STRATEGIC ACTION PLAN
================================================================================
${this.insights.actionPlan
  .map((action, i) => `Step ${i + 1}: ${action}`)
  .join('\n')}

================================================================================
Report generated by Healthcare Insight AI
Built by Amey Bhalerao for EB1A Application
Demonstrating AI Integration & Strategic Analysis Capabilities
================================================================================
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `executive-insights-${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

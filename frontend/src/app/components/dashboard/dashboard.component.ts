import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Feedback } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="dashboard-header fade-in">
        <h1>📊 Healthcare Dashboard</h1>
        <p class="text-muted">
          Real-time patient feedback analytics powered by AI
        </p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-4 fade-in" style="animation-delay: 0.2s">
        <div class="stat-card glass-card">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <h4>Total Feedback</h4>
            <p class="stat-value">{{ stats.total }}</p>
            <span class="stat-change positive">+12% this week</span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon">⚠️</div>
          <div class="stat-content">
            <h4>High Risk</h4>
            <p class="stat-value">{{ stats.highRisk }}</p>
            <span class="stat-change negative">Requires attention</span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon">😊</div>
          <div class="stat-content">
            <h4>Avg Sentiment</h4>
            <p class="stat-value">{{ stats.avgSentiment }}%</p>
            <span class="stat-change positive">+5% improvement</span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h4>Resolved</h4>
            <p class="stat-value">{{ stats.resolved }}</p>
            <span class="stat-change positive">98% resolution rate</span>
          </div>
        </div>
      </div>

      <!-- Recent Feedback -->
      <div class="section fade-in" style="animation-delay: 0.4s">
        <div class="section-header">
          <h2>🔔 Recent Feedback</h2>
          <button class="btn btn-primary" (click)="loadFeedback()">
            <span *ngIf="!loading">Refresh</span>
            <span *ngIf="loading" class="loading"></span>
          </button>
        </div>

        <div *ngIf="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading feedback data...</p>
        </div>

        <div *ngIf="!loading && feedbackList.length > 0" class="feedback-grid">
          <div
            *ngFor="let feedback of feedbackList"
            class="feedback-card glass-card"
          >
            <div class="feedback-header">
              <div class="feedback-meta">
                <span class="patient-id">{{ feedback.patientId }}</span>
                <span class="timestamp">{{
                  formatDate(feedback.timestamp)
                }}</span>
              </div>
              <span class="badge" [ngClass]="getRandomRiskClass()">
                {{ getRandomRisk() }}
              </span>
            </div>
            <p class="feedback-text">{{ feedback.text }}</p>
            <div class="feedback-actions">
              <button class="btn-link">View Analysis</button>
              <button class="btn-link">Take Action</button>
            </div>
          </div>
        </div>

        <div *ngIf="!loading && feedbackList.length === 0" class="empty-state">
          <p>📭 No feedback data available</p>
          <button class="btn btn-primary" (click)="loadFeedback()">
            Load Sample Data
          </button>
        </div>
      </div>

      <!-- Categories Chart Placeholder -->
      <div class="section fade-in" style="animation-delay: 0.6s">
        <h2>📈 Feedback Categories</h2>
        <div class="glass-card">
          <div class="categories-grid">
            <div *ngFor="let category of categories" class="category-item">
              <div class="category-bar" [style.width.%]="category.percentage">
                <span class="category-label">{{ category.name }}</span>
                <span class="category-count">{{ category.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-header {
        text-align: center;
        margin-bottom: 48px;
      }

      .dashboard-header h1 {
        font-size: 48px;
        margin-bottom: 8px;
      }

      .stat-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 24px !important;
      }

      .stat-icon {
        font-size: 48px;
        line-height: 1;
      }

      .stat-content h4 {
        font-size: 14px;
        color: var(--text-muted);
        margin: 0 0 8px 0;
      }

      .stat-value {
        font-size: 32px;
        font-weight: 700;
        margin: 0 0 4px 0;
        color: var(--text-primary);
      }

      .stat-change {
        font-size: 12px;
        font-weight: 600;
      }

      .stat-change.positive {
        color: var(--success);
      }

      .stat-change.negative {
        color: var(--warning);
      }

      .section {
        margin-top: 48px;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .section-header h2 {
        margin: 0;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 0;
      }

      .loading-spinner {
        width: 60px;
        height: 60px;
        border: 4px solid rgba(99, 102, 241, 0.2);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
      }

      .feedback-grid {
        display: grid;
        gap: 16px;
      }

      .feedback-card {
        padding: 20px !important;
        transition: all 0.3s ease;
      }

      .feedback-card:hover {
        transform: translateX(8px);
      }

      .feedback-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .feedback-meta {
        display: flex;
        gap: 12px;
        font-size: 12px;
        color: var(--text-muted);
      }

      .patient-id {
        font-weight: 600;
        color: var(--primary);
      }

      .feedback-text {
        color: var(--text-secondary);
        line-height: 1.6;
        margin: 0 0 16px 0;
      }

      .feedback-actions {
        display: flex;
        gap: 12px;
      }

      .btn-link {
        background: none;
        border: none;
        color: var(--primary);
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        padding: 0;
        transition: all 0.3s ease;
      }

      .btn-link:hover {
        color: var(--accent);
        text-decoration: underline;
      }

      .empty-state {
        text-align: center;
        padding: 60px 0;
      }

      .empty-state p {
        font-size: 18px;
        color: var(--text-muted);
        margin-bottom: 24px;
      }

      .categories-grid {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .category-item {
        width: 100%;
      }

      .category-bar {
        background: linear-gradient(90deg, var(--primary), var(--accent));
        padding: 12px 16px;
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.3s ease;
      }

      .category-bar:hover {
        transform: translateX(4px);
        box-shadow: var(--shadow-glow);
      }

      .category-label {
        font-weight: 600;
        color: white;
      }

      .category-count {
        font-weight: 700;
        color: white;
      }

      @media (max-width: 768px) {
        .grid-4 {
          grid-template-columns: 1fr 1fr;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  feedbackList: Feedback[] = [];
  loading = false;
  stats = {
    total: 124,
    highRisk: 8,
    avgSentiment: 78,
    resolved: 116,
  };

  categories = [
    { name: 'Clinical Care', count: 45, percentage: 90 },
    { name: 'Staff Behavior', count: 32, percentage: 64 },
    { name: 'Wait Time', count: 28, percentage: 56 },
    { name: 'Communication', count: 19, percentage: 38 },
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadFeedback();
  }

  loadFeedback() {
    this.loading = true;
    this.apiService.getFeedback().subscribe({
      next: (response) => {
        this.feedbackList = response.data;
        console.log('this.feedbackList **', this.feedbackList);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading feedback:', error);
        this.loading = false;
      },
    });
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getRandomRisk(): string {
    const risks = ['LOW', 'MEDIUM', 'HIGH'];
    return risks[Math.floor(Math.random() * risks.length)];
  }

  getRandomRiskClass(): string {
    const classes = ['badge-low', 'badge-medium', 'badge-high'];
    return classes[Math.floor(Math.random() * classes.length)];
  }
}

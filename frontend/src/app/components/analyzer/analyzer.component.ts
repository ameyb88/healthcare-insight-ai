import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ApiService, Analysis } from '../../services/api.service';

@Component({
  selector: 'app-analyzer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './analyzer.component.html',
  styleUrls: ['./analyzer.component.scss'],
})
export class AnalyzerComponent {
  feedbackCtrl = new FormControl<string>('', { nonNullable: true });
  analyzing = false;
  analysis: Analysis | null = null;
  error = '';

  sampleFeedback = `The nursing staff was incredibly compassionate during my mother's stay...`;

  constructor(private apiService: ApiService) {}

  loadSample() {
    this.feedbackCtrl.setValue(this.sampleFeedback);
  }

  analyzeFeedback() {
    const text = this.feedbackCtrl.value.trim();
    if (!text) return;
    this.analyzing = true;
    this.error = '';
    this.analysis = null;

    this.apiService.analyzeFeedback(text).subscribe({
      next: (response) => {
        this.analysis = response.data.analysis;
        this.analyzing = false;
      },
      error: (error) => {
        this.error =
          error?.error?.error ||
          'Failed to analyze feedback. Please ensure the backend is running and the OpenAI key is set.';
        this.analyzing = false;
        console.error('Analysis error:', error);
      },
    });
  }

  getRiskClass(riskLevel: string): string {
    const level = riskLevel?.toLowerCase();
    if (level === 'critical') return 'badge-critical';
    if (level === 'high') return 'badge-high';
    if (level === 'medium') return 'badge-medium';
    return 'badge-low';
  }

  getRiskPercentage(riskLevel: string): string {
    const level = riskLevel?.toLowerCase();
    if (level === 'critical') return '100%';
    if (level === 'high') return '75%';
    if (level === 'medium') return '50%';
    return '25%';
  }

  getSentimentLabel(score: number): string {
    if (score >= 80) return 'Very Positive - Patient highly satisfied';
    if (score >= 60) return 'Positive - Generally satisfied with care';
    if (score >= 40) return 'Mixed - Some concerns present';
    if (score >= 20) return 'Negative - Significant issues identified';
    return 'Very Negative - Immediate attention required';
  }

  exportReport() {
    if (!this.analysis) return;
    const report = `
HEALTHCARE INSIGHT AI - ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}

ORIGINAL FEEDBACK:
${this.feedbackCtrl.value}

RISK ASSESSMENT: ${this.analysis.riskLevel}
SENTIMENT SCORE: ${this.analysis.sentimentScore}/100
CATEGORY: ${this.analysis.category}

SUMMARY:
${this.analysis.summary}

KEY ISSUES:
${this.analysis.keyIssues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

RECOMMENDED ACTIONS:
${this.analysis.recommendedActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}
`.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-analysis-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  reset() {
    this.feedbackCtrl.setValue('');
    this.analysis = null;
    this.error = '';
  }
}

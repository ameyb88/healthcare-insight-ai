import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Feedback {
  id: number;
  text: string;
  timestamp: Date;
  patientId: string;
}

export interface Analysis {
  riskLevel: string;
  sentimentScore: number;
  keyIssues: string[];
  recommendedActions: string[];
  category: string;
  summary: string;
  urgency: string;
}

export interface Insights {
  trends: string[];
  priorities: Array<{
    issue: string;
    impact: string;
    action: string;
  }>;
  highlights: string[];
  riskSummary: string;
  actionPlan: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  /** Demo data */
  getFeedback(): Observable<{ data: Feedback[] }> {
    return this.http.get<{ data: Feedback[] }>(`${this.baseUrl}/mock-feedback`);
  }

  /** Single analysis */
  analyzeFeedback(
    text: string,
    context?: { facility?: string; department?: string }
  ): Observable<{ data: { analysis: Analysis } }> {
    return this.http.post<{ data: { analysis: Analysis } }>(
      `${this.baseUrl}/analyze`,
      { text, context }
    );
  }

  /** Batch analysis for Insights page */
  batchAnalyze(items: Feedback[]): Observable<{
    data: { summary: any; analyses: (Analysis & { id?: string | number })[] };
  }> {
    // backend expects { items: [{ id?, text }] }
    const payload = { items: items.map((i) => ({ id: i.id, text: i.text })) };
    return this.http.post<{
      data: { summary: any; analyses: (Analysis & { id?: string | number })[] };
    }>(`${this.baseUrl}/batch-analyze`, payload);
  }

  generateInsights(feedbackList: Feedback[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/analysis/insights`, {
      feedbackList,
    });
  }

  getSummary(): Observable<any> {
    return this.http.get(`${this.baseUrl}/analysis/summary`);
  }
}

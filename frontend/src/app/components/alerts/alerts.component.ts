import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="glass-card" style="margin-bottom:16px;">
        <h2>⚡ Agent Alerts</h2>
        <button
          class="btn btn-primary"
          (click)="runNow()"
          [disabled]="loading()"
        >
          Run Agent Now
        </button>
        <span *ngIf="loading()" class="loading" style="margin-left:8px;"></span>
      </div>

      <div class="glass-card">
        <h3>Recent Alerts</h3>
        <div *ngIf="alerts().length === 0" class="text-muted">
          No alerts yet.
        </div>
        <ul *ngIf="alerts().length" style="list-style:none;padding:0;margin:0;">
          <li
            *ngFor="let a of alerts()"
            class="issue-item"
            style="margin-bottom:8px;"
          >
            <div
              style="display:flex;justify-content:space-between;align-items:center;"
            >
              <div>
                <strong>{{ a.ruleName }}</strong>
                <div class="text-muted" style="font-size:12px;">
                  {{ a.reason }}
                </div>
              </div>
              <div class="text-muted" style="font-size:12px;">
                {{ a.at | date : 'short' }}
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `,
})
export class AlertsComponent implements OnInit {
  alerts = signal<any[]>([]);
  loading = signal(false);

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.api.getAgentStatus().subscribe({
      next: ({ data }) => this.alerts.set(data.alerts || []),
      error: () => this.alerts.set([]),
    });
  }
  runNow() {
    this.loading.set(true);
    this.api.runAgentNow().subscribe({
      next: () => {
        this.loading.set(false);
        this.refresh();
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="container">
          <div class="header-content">
            <div class="logo">
              <div class="logo-icon">🏥</div>
              <div class="logo-text">
                <h1>Healthcare Insight AI</h1>
                <p class="tagline">Powered by Advanced AI Analytics</p>
              </div>
            </div>
            <nav class="nav-links">
              <a routerLink="/" routerLinkActive="active" class="nav-link"
                >Dashboard</a
              >

              <a
                routerLink="/analyzer"
                routerLinkActive="active"
                class="nav-link"
                >Analyzer</a
              >
              <a
                routerLink="/insights"
                routerLinkActive="active"
                class="nav-link"
                >Insights</a
              >
            </nav>
          </div>
        </div>
      </header>

      <main class="app-main">
        <router-outlet></router-outlet>
      </main>

      <footer class="app-footer">
        <div class="container">
          <p>
            Built by Amey Bhalerao | AI-Powered Healthcare Analytics Platform
          </p>
          <p class="text-muted">
            Demonstrating production-grade AI integration for EB1A application
          </p>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .app-header {
        background: rgba(15, 23, 42, 0.8);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding: 20px 0;
        position: sticky;
        top: 0;
        z-index: 100;
      }

      .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .logo {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .logo-icon {
        font-size: 48px;
        animation: float 3s ease-in-out infinite;
      }

      @keyframes float {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      .logo-text h1 {
        font-size: 28px;
        margin: 0;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .tagline {
        font-size: 12px;
        color: var(--text-muted);
        margin: 0;
      }

      .nav-links {
        display: flex;
        gap: 8px;
      }

      .nav-link {
        padding: 10px 20px;
        border-radius: 8px;
        color: var(--text-secondary);
        text-decoration: none;
        font-weight: 500;
        transition: all 0.3s ease;
      }

      .nav-link:hover {
        background: rgba(99, 102, 241, 0.1);
        color: var(--primary);
      }

      .nav-link.active {
        background: linear-gradient(135deg, var(--primary), var(--accent));
        color: white;
      }

      .app-main {
        flex: 1;
        padding: 40px 0;
      }

      .app-footer {
        background: rgba(15, 23, 42, 0.8);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding: 32px 0;
        text-align: center;
      }

      .app-footer p {
        margin: 4px 0;
      }

      @media (max-width: 768px) {
        .header-content {
          flex-direction: column;
          gap: 16px;
        }

        .nav-links {
          width: 100%;
          justify-content: center;
        }

        .logo-text h1 {
          font-size: 20px;
        }
      }
    `,
  ],
})
export class AppComponent {
  title = 'Healthcare Insight AI';
}

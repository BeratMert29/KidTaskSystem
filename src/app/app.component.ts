import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <nav class="navbar classic-navbar" *ngIf="showNavbar()">
        <div class="navbar-brand">
          <span class="logo-icon"><i class="fas fa-rocket"></i></span>
          <h1>TaskMaster</h1>
        </div>
        <div class="navbar-links">
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          
          <!-- Student role links -->
          <a *ngIf="isStudent()" routerLink="/tasks" routerLinkActive="active">My Tasks</a>
          <a *ngIf="isStudent()" routerLink="/approved-wishes" routerLinkActive="active">Approved Wishes</a>
          
          <!-- Teacher/Parent role links -->
          <a *ngIf="isTeacherOrParent()" routerLink="/create-task" routerLinkActive="active">Create Tasks</a>
          <a *ngIf="isTeacherOrParent()" routerLink="/review-tasks" routerLinkActive="active">Review Tasks</a>
          
          <!-- Common links -->
          <a routerLink="/shop" routerLinkActive="active">Shop</a>
          <a routerLink="/about" routerLinkActive="active">About Us</a>
          
          <!-- Auth links -->
          <a *ngIf="!isLoggedIn()" routerLink="/login" routerLinkActive="active">Login</a>
          <a *ngIf="!isLoggedIn()" routerLink="/register" routerLinkActive="active">Register</a>
          <a *ngIf="isLoggedIn()" (click)="logout()" class="logout-link">Logout</a>
        </div>
      </nav>
      
      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .classic-navbar {
      width: 100%;
      left: 0;
      top: 0;
      position: relative;
      z-index: 100;
      border-radius: 0;
      margin: 0;
      padding: 1rem 2rem;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
      flex-wrap: wrap;
      min-height: 64px;
      max-width: 100vw;
      /* Entrance animation */
      opacity: 0;
      transform: translateY(-24px) scale(0.98);
      animation: navbarFadeIn 0.7s cubic-bezier(0.23, 1, 0.32, 1) 0.1s forwards;
    }
    @keyframes navbarFadeIn {
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.7rem;
    }
    
    .logo-icon {
      font-size: 1.5rem;
      color: #6366F1;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.2rem;
      transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
      will-change: transform;
      cursor: pointer;
    }
    
    .logo-icon:hover {
      transform: scale(1.12) rotate(-8deg);
    }
    
    .navbar-brand h1 {
      margin: 0;
      color: #1F2937;
      font-size: 1.35rem;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    
    .navbar-links {
      display: flex;
      gap: 1.1rem;
      flex-wrap: wrap;
    }
    
    .navbar-links a {
      color: #4B5563;
      text-decoration: none;
      font-weight: 600;
      padding: 0.45rem 1.2rem;
      border-radius: 8px;
      background: transparent;
      transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1);
      position: relative;
      cursor: pointer;
      font-size: 0.95rem;
      border: none;
      margin-bottom: 2px;
      overflow: hidden;
    }
    
    .navbar-links a::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 2px;
      background: #6366F1;
      transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
      transform: translateX(-50%);
    }
    
    .navbar-links a:hover,
    .navbar-links a.active {
      color: #6366F1;
      background: rgba(99, 102, 241, 0.1);
      transform: translateY(-1px);
    }
    
    .navbar-links a:hover::after,
    .navbar-links a.active::after {
      width: 80%;
    }
    
    .navbar-links a:active {
      transform: translateY(0);
    }
    
    .logout-link {
      background: rgba(239, 68, 68, 0.1) !important;
      color: #EF4444 !important;
      border: 2px solid #EF4444 !important;
      font-weight: 600;
      transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1);
      will-change: transform, background;
      padding: 0.45rem 1.2rem;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .logout-link:hover {
      background: #EF4444 !important;
      color: white !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
    }
    
    .logout-link:active {
      transform: translateY(0);
      box-shadow: none;
    }
    
    .content {
      flex: 1;
      padding: 2rem;
    }
    
    @media (max-width: 900px) {
      .classic-navbar {
        flex-direction: column;
        align-items: stretch;
        gap: 1.2rem;
        padding: 1.2rem 1rem;
      }
      
      .navbar-links {
        justify-content: center;
        gap: 0.7rem;
      }
    }
    
    @media (max-width: 600px) {
      .classic-navbar {
        padding: 0.7rem 0.2rem;
        min-height: 48px;
      }
      
      .navbar-brand h1 {
        font-size: 1rem;
      }
      
      .logo-icon {
        font-size: 1.1rem;
      }
      
      .navbar-links a {
        font-size: 0.92rem;
        padding: 0.32rem 0.7rem;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'TaskMaster';
  currentUrl: string = '';
  
  constructor(private authService: AuthService, private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
      }
    });
  }
  
  ngOnInit() {
    // Set currentUrl after initial navigation
    this.currentUrl = this.router.url;
  }
  
  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }
  
  isStudent(): boolean {
    const user = this.authService.getCurrentUser();
    return this.isLoggedIn() && user?.role === 'student';
  }
  
  isTeacherOrParent(): boolean {
    const user = this.authService.getCurrentUser();
    return this.isLoggedIn() && (user?.role === 'teacher' || user?.role === 'parent');
  }
  
  logout(): void {
    this.authService.logout();
  }
  
  showNavbar(): boolean {
    const url = this.currentUrl;
    return !(url === '/login' || url.startsWith('/login?') || url === '/register' || url.startsWith('/register?'));
  }
}

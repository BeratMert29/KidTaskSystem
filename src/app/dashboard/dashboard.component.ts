import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { TaskService } from '../services/task.service';
import { WishlistService } from '../services/wishlist.service';
import { StudentService } from '../services/student.service';
import { Task } from '../models/task.model';
import { UserRole } from '../models/user-role.model';

@Component({
selector: 'app-dashboard',
standalone: true,
imports: [CommonModule, RouterModule],
template: `
  <div class="dashboard">
    <header class="modern-header">
      <div class="header-left">
        <div class="avatar-large">{{(user?.username || '?').charAt(0).toUpperCase()}}</div>
        <div class="welcome-block">
          <h1>Welcome, <span class="username">{{user?.username || 'Guest'}}</span>!</h1>
          <span class="role-badge">{{user?.role | titlecase}}</span>
        </div>
      </div>
      <div class="header-center">
        <span class="app-logo"><i class="fas fa-rocket"></i> TaskMaster</span>
      </div>
      <div class="header-right">
        <div class="points-header-display" *ngIf="user?.role === 'student'">
          <span class="points-icon">⭐</span>
          <span class="points-label">Points</span>
          <span class="points-value">{{ studentPoints }}</span>
        </div>
        <button (click)="logout()" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </header>

    <div class="dashboard-content">
      <!-- Student-specific content -->
      <div *ngIf="user?.role === 'student'" class="role-content">
        <div class="dashboard-header">
          <h2>Student Dashboard</h2>
          <p class="dashboard-date">{{today | date:'EEEE, MMMM d, y'}}</p>
        </div>
        
        <div class="stats-container">
          <div class="stat-card">
            <div class="stat-icon task-icon">
              <i class="fas fa-tasks"></i>
            </div>
            <div class="stat-info">
              <h4>Tasks</h4>
              <p class="stat-value">{{pendingTasks}}</p>
              <p class="stat-desc">{{dueTodayCount}} due today</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon complete-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-info">
              <h4>Completed</h4>
              <p class="stat-value">{{completedTasks}}</p>
              <p class="stat-desc">{{tasks.length}} total</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon wish-icon">
              <i class="fas fa-star"></i>
            </div>
            <div class="stat-info">
              <h4>Wishes</h4>
              <p class="stat-value">{{pendingWishes}}</p>
              <p class="stat-desc">waiting for approval</p>
            </div>
          </div>
        </div>
        
        <div class="card-grid">
          <div class="dashboard-card task-card" (click)="navigateTo('/tasks')">
            <div class="card-icon">
              <i class="fas fa-clipboard-check"></i>
            </div>
            <div class="card-content">
              <h3>My Tasks</h3>
              <p>View and complete your assigned tasks</p>
              <span class="card-badge task-badge">{{pendingTasks}} pending</span>
            </div>
          </div>
          
          <div class="dashboard-card wish-card" (click)="navigateTo('/wish-list')" style="cursor: pointer;">
            <div class="card-icon">
              <i class="fas fa-star"></i>
            </div>
            <div class="card-content">
              <h3>My Wishes</h3>
              <p>Manage your wish list and rewards</p>
              <span class="card-badge wish-badge">{{wishCount}} wishes</span>
            </div>
          </div>

          <div class="dashboard-card shop-card" (click)="navigateTo('/shop')">
            <div class="card-icon">
              <i class="fas fa-store"></i>
            </div>
            <div class="card-content">
              <h3>Shop</h3>
              <p>Redeem your points for rewards</p>
              <span class="card-badge shop-badge">{{studentPoints}} points</span>
            </div>
          </div>

          <div class="dashboard-card approved-wishes-card" (click)="navigateTo('/approved-wishes')">
            <div class="card-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="card-content">
              <h3>Approved Wishes</h3>
              <p>View your approved wish list items</p>
              <span class="card-badge approved-badge">{{approvedWishesCount}} items</span>
            </div>
          </div>
        </div>
        
        <div class="upcoming-container">
          <div class="upcoming-header">
            <h3>Upcoming Deadlines</h3>
            <a href="#" class="view-all" (click)="$event.preventDefault(); navigateTo('/tasks')">View all</a>
          </div>
          <div class="upcoming-list">
            <div *ngIf="upcomingTasks.length === 0" class="no-tasks">
              <p>No upcoming tasks due</p>
            </div>
            <div *ngFor="let task of upcomingTasks" class="upcoming-item" (click)="navigateTo('/tasks')">
              <div class="upcoming-date">
                <span class="day">{{task.deadline | date:'d'}}</span>
                <span class="month">{{task.deadline | date:'MMM'}}</span>
              </div>
              <div class="upcoming-details">
                <h4>{{task.title || 'Untitled Task'}}</h4>
                <p>{{(task.description || 'No description') | slice:0:30}}{{(task.description || '').length > 30 ? '...' : ''}}</p>
              </div>
              <span class="upcoming-badge" [class.urgent]="isUrgent(task.deadline)">
                {{getDaysMessage(task.deadline)}}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Parent-specific content -->
      <div *ngIf="user?.role === 'parent'" class="role-content">
        <h2>Parent Dashboard</h2>
        <div class="card-grid">
          <div class="dashboard-card" (click)="navigateTo('/review-tasks')">
            <div class="card-icon">
              <i class="fas fa-check-double"></i>
            </div>
            <div class="card-content">
              <h3>Review Tasks</h3>
              <p>Review and rate completed tasks</p>
            </div>
          </div>
          <div class="dashboard-card" (click)="navigateTo('/create-task')">
            <div class="card-icon">
              <i class="fas fa-plus-circle"></i>
            </div>
            <div class="card-content">
              <h3>Create Tasks</h3>
              <p>Create new tasks for your children</p>
            </div>
          </div>
          <div class="dashboard-card wish-card" (click)="navigateTo('/wish-list')">
            <div class="card-icon">
              <i class="fas fa-star"></i>
            </div>
            <div class="card-content">
              <h3>Student Wishlist</h3>
              <p>Review and approve student wishes</p>
              <span class="card-badge wish-badge">{{pendingWishes}} pending</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Teacher-specific content -->
      <div *ngIf="user?.role === 'teacher'" class="role-content">
        <h2>Teacher Dashboard</h2>
        <div class="card-grid">
          <div class="dashboard-card" (click)="navigateTo('/review-tasks')">
            <div class="card-icon">
              <i class="fas fa-check-double"></i>
            </div>
            <div class="card-content">
              <h3>Review Tasks</h3>
              <p>Review and rate completed tasks</p>
            </div>
          </div>
          <div class="dashboard-card" (click)="navigateTo('/create-task')">
            <div class="card-icon">
              <i class="fas fa-plus-circle"></i>
            </div>
            <div class="card-content">
              <h3>Create Tasks</h3>
              <p>Create new tasks for your students</p>
            </div>
          </div>
          <div class="dashboard-card wish-card" (click)="navigateTo('/wish-list')">
            <div class="card-icon">
              <i class="fas fa-star"></i>
            </div>
            <div class="card-content">
              <h3>Student Wishlist</h3>
              <p>Review and approve student wishes</p>
              <span class="card-badge wish-badge">{{pendingWishes}} pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
`,
styles: [`
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
  
  :host {
    --primary-color: #6366F1;
    --primary-light: #818CF8;
    --primary-dark: #4F46E5;
    --accent-color: #F472B6;
    --success-color: #10B981;
    --warning-color: #F59E0B;
    --danger-color: #EF4444;
    --gray-100: #F3F4F6;
    --gray-200: #E5E7EB;
    --gray-300: #D1D5DB;
    --gray-700: #374151;
    --gray-800: #1F2937;
    --card-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --transition: all 0.3s ease;
  }
  
  .dashboard {
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .modern-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 2.5rem;
    background: linear-gradient(120deg, rgba(255,255,255,0.7) 60%, #e0e7ff 100%);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
    border-radius: 22px;
    margin-bottom: 2.5rem;
    position: relative;
    backdrop-filter: blur(8px);
    border: 1.5px solid rgba(99,102,241,0.10);
    gap: 2rem;
    flex-wrap: wrap;
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    min-width: 0;
  }
  .avatar-large {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #6366F1, #4F46E5);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(99,102,241,0.10);
    flex-shrink: 0;
  }
  .welcome-block h1 {
    margin: 0 0 0.2rem 0;
    font-size: 1.35rem;
    font-weight: 600;
    color: #222;
    letter-spacing: 0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .welcome-block .username {
    color: #6366F1;
    font-weight: 700;
  }
  .role-badge {
    padding: 4px 12px;
    background: linear-gradient(135deg, #6366F1, #4F46E5);
    color: white;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(99,102,241,0.08);
    margin-top: 0.1rem;
    display: inline-block;
  }
  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 120px;
  }
  .app-logo {
    font-size: 1.25rem;
    font-weight: 700;
    color: #6366F1;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    opacity: 0.92;
    text-shadow: 0 1px 2px rgba(99,102,241,0.08);
  }
  .header-right {
    display: flex;
    align-items: center;
    gap: 1.2rem;
  }
  .points-header-display {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
    color: #222;
    padding: 0.32rem 1.1rem 0.32rem 0.9rem;
    border-radius: 16px;
    font-weight: 700;
    font-size: 1.05rem;
    box-shadow: 0 2px 10px 0 rgba(56, 249, 215, 0.13), 0 1.5px 4px 0 rgba(67, 233, 123, 0.10);
    border: 1.5px solid #38f9d7;
    transition: box-shadow 0.2s;
    position: relative;
  }
  .points-header-display:hover {
    box-shadow: 0 4px 18px 0 rgba(56, 249, 215, 0.18), 0 2.5px 8px 0 rgba(67, 233, 123, 0.16);
  }
  .points-header-display .points-icon {
    font-size: 1.2rem;
    margin-right: 0.2rem;
    color: #FFD700;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.08));
  }
  .points-header-display .points-label {
    font-size: 0.85rem;
    text-transform: uppercase;
    opacity: 0.85;
    margin-right: 0.18rem;
    letter-spacing: 0.5px;
    color: #222;
  }
  .points-header-display .points-value {
    font-size: 1.18rem;
    font-weight: 800;
    margin-left: 0.1rem;
    color: #222;
    text-shadow: 0 1px 2px rgba(56, 249, 215, 0.08);
  }
  .logout-btn {
    padding: 8px 16px;
    background-color: #EF4444;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: box-shadow 0.2s, background 0.2s, transform 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    font-size: 1rem;
    box-shadow: 0 2px 8px rgba(239,68,68,0.08);
  }
  .logout-btn:hover {
    background-color: #DC2626;
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 4px 16px rgba(239,68,68,0.13);
  }
  @media (max-width: 900px) {
    .modern-header {
      flex-direction: column;
      align-items: stretch;
      gap: 1.2rem;
      padding: 1.2rem 1rem;
    }
    .header-center {
      margin: 0.5rem 0;
    }
  }
  @media (max-width: 600px) {
    .modern-header {
      padding: 0.7rem 0.2rem;
      border-radius: 12px;
    }
    .avatar-large {
      width: 40px;
      height: 40px;
      font-size: 1.2rem;
    }
    .welcome-block h1 {
      font-size: 1rem;
    }
    .app-logo {
      font-size: 1rem;
    }
    .points-header-display {
      font-size: 0.92rem;
      padding: 0.18rem 0.7rem 0.18rem 0.6rem;
    }
    .logout-btn {
      font-size: 0.92rem;
      padding: 6px 10px;
    }
  }

  .dashboard-content {
    background: white;
    padding: 28px;
    border-radius: 16px;
    box-shadow: var(--card-shadow);
  }
  
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  
  .dashboard-date {
    color: var(--gray-700);
    font-size: 0.9rem;
  }

  .role-content {
    margin-top: 20px;
  }

  h2 {
    color: var(--gray-800);
    margin-bottom: 0;
    font-size: 1.75rem;
    font-weight: 700;
  }
  
  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--gray-800);
    margin: 32px 0 16px 0;
    position: relative;
    padding-left: 12px;
  }
  
  .section-title:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 4px;
    background: linear-gradient(to bottom, var(--primary-color), var(--accent-color));
    border-radius: 4px;
  }
  
  .stats-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin: 24px 0;
  }
  
  .stat-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: var(--transition);
  }
  
  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
  }
  
  .task-icon {
    background: linear-gradient(135deg, #3B82F6, #1D4ED8);
  }
  
  .complete-icon {
    background: linear-gradient(135deg, #10B981, #059669);
  }
  
  .wish-icon {
    background: linear-gradient(135deg, #F59E0B, #D97706);
  }
  
  .grade-icon {
    background: linear-gradient(135deg, #F59E0B, #D97706);
  }
  
  .stat-info h4 {
    margin: 0;
    font-size: 0.875rem;
    color: var(--gray-700);
    font-weight: 500;
  }
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--gray-800);
    margin: 4px 0;
  }
  
  .stat-desc {
    font-size: 0.75rem;
    color: var(--gray-700);
    margin: 0;
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }

  .dashboard-card {
    padding: 24px;
    background: white;
    border-radius: 12px;
    border: 1px solid var(--gray-200);
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    transition: var(--transition);
    cursor: pointer;
    display: flex;
    position: relative;
    overflow: hidden;
  }

  .dashboard-card:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(to bottom, var(--primary-color), var(--accent-color));
    opacity: 0;
    transition: var(--transition);
  }

  .dashboard-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 20px rgba(0,0,0,0.1);
    border-color: var(--primary-light);
  }
  
  .dashboard-card:hover:before {
    opacity: 1;
  }
  
  .card-icon {
    font-size: 1.5rem;
    color: var(--primary-color);
    margin-right: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .card-content {
    flex: 1;
  }

  .dashboard-card h3 {
    color: var(--gray-800);
    margin: 0 0 8px 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .dashboard-card p {
    color: var(--gray-700);
    margin: 0 0 12px 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }
  
  .card-badge {
    display: inline-block;
    padding: 4px 10px;
    background-color: var(--gray-100);
    color: var(--gray-700);
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  .card-badge.upcoming {
    background-color: #EFF6FF;
    color: #2563EB;
  }
  
  .progress-bar {
    width: 100%;
    height: 6px;
    background-color: var(--gray-200);
    border-radius: 10px;
    overflow: hidden;
    margin-top: 12px;
  }
  
  .progress {
    height: 100%;
    background: linear-gradient(to right, var(--primary-color), var(--accent-color));
    border-radius: 10px;
  }
  
  .upcoming-container {
    margin-top: 32px;
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid var(--gray-200);
  }
  
  .upcoming-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--gray-200);
  }
  
  .upcoming-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--gray-800);
    position: relative;
    padding-left: 12px;
  }
  
  .upcoming-header h3:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 3px;
    background: linear-gradient(to bottom, var(--primary-color), var(--accent-color));
    border-radius: 4px;
  }
  
  .view-all {
    color: var(--primary-color);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: var(--transition);
  }
  
  .view-all:hover {
    color: var(--primary-dark);
    text-decoration: underline;
  }
  
  .upcoming-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .upcoming-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background-color: var(--gray-100);
    border-radius: 8px;
    transition: var(--transition);
    cursor: pointer;
  }
  
  .upcoming-item:hover {
    background-color: #EFF6FF;
    transform: translateX(4px);
  }
  
  .upcoming-date {
    width: 60px;
    height: 60px;
    background-color: white;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  
  .day {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--gray-800);
  }
  
  .month {
    font-size: 0.75rem;
    color: var(--gray-700);
    text-transform: uppercase;
  }
  
  .upcoming-details {
    flex: 1;
  }
  
  .upcoming-details h4 {
    margin: 0 0 4px 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--gray-800);
  }
  
  .upcoming-details p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--gray-700);
  }
  
  .upcoming-badge {
    padding: 4px 10px;
    background-color: var(--gray-200);
    color: var(--gray-700);
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  .upcoming-badge.urgent {
    background-color: #FEF2F2;
    color: var(--danger-color);
  }
  
  .no-tasks {
    text-align: center;
    padding: 20px;
    color: var(--gray-700);
    font-style: italic;
    background-color: var(--gray-100);
    border-radius: 8px;
    border: 1px dashed var(--gray-300);
  }
  
  .wish-card {
    background: linear-gradient(135deg, rgba(255, 250, 240, 0.8), rgba(255, 255, 255, 0.9));
    border-color: #F59E0B;
    position: relative;
    overflow: hidden;
  }
  
  .wish-card::after {
    content: '';
    position: absolute;
    top: -10px;
    right: -10px;
    width: 40px;
    height: 40px;
    background: radial-gradient(circle, #FFB700 0%, transparent 70%);
    border-radius: 50%;
    opacity: 0.6;
  }
  
  .wish-badge {
    background-color: #FEF3C7;
    color: #B45309;
  }
  
  .profile-card {
    background: linear-gradient(135deg, rgba(236, 253, 245, 0.8), rgba(255, 255, 255, 0.9));
    border-color: var(--success-color);
    position: relative;
    overflow: hidden;
  }
  
  .profile-card::after {
    content: '';
    position: absolute;
    bottom: -10px;
    right: -10px;
    width: 50px;
    height: 50px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%);
    border-radius: 50%;
  }

  .profile-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(to bottom, var(--success-color), var(--primary-light));
    opacity: 0;
    transition: var(--transition);
  }
  
  .profile-card:hover::before {
    opacity: 1;
  }
  
  .profile-card .card-icon {
    color: var(--success-color);
  }
  
  .profile-details {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .profile-badge {
    display: inline-block;
    padding: 4px 10px;
    background-color: #ECFDF5;
    color: #047857;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 150px;
  }
  
  .task-card {
    background: linear-gradient(135deg, rgba(239, 246, 255, 0.8), rgba(255, 255, 255, 0.9));
    border-color: #3B82F6;
    position: relative;
    overflow: hidden;
  }
  
  .task-card::after {
    content: '';
    position: absolute;
    top: -10px;
    right: -10px;
    width: 40px;
    height: 40px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
    border-radius: 50%;
    opacity: 0.6;
  }
  
  .task-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(to bottom, #3B82F6, #8B5CF6);
    opacity: 0;
    transition: var(--transition);
  }
  
  .task-card:hover::before {
    opacity: 1;
  }
  
  .task-card .card-icon {
    color: #3B82F6;
  }
  
  .task-badge {
    background-color: #EFF6FF;
    color: #1D4ED8;
  }

  .shop-card {
    background: linear-gradient(135deg, rgba(236, 253, 245, 0.8), rgba(255, 255, 255, 0.9));
    border-color: var(--success-color);
  }

  .shop-card::after {
    content: '';
    position: absolute;
    top: -10px;
    right: -10px;
    width: 40px;
    height: 40px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%);
    border-radius: 50%;
    opacity: 0.6;
  }

  .shop-badge {
    background-color: #ECFDF5;
    color: #047857;
  }

  .approved-wishes-card {
    background: linear-gradient(135deg, rgba(236, 253, 245, 0.8), rgba(255, 255, 255, 0.9));
    border-color: var(--success-color);
  }

  .approved-badge {
    background-color: #ECFDF5;
    color: #047857;
  }

  .approved-wishes-container {
    margin-top: 32px;
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid var(--gray-200);
  }

  .wish-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }

  .wish-card {
    background: linear-gradient(135deg, rgba(255, 250, 240, 0.8), rgba(255, 255, 255, 0.9));
    border-color: #F59E0B;
    position: relative;
    overflow: hidden;
  }

  .wish-image {
    width: 100%;
    height: 200px;
    overflow: hidden;
    border-radius: 8px 8px 0 0;
  }

  .wish-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .wish-content {
    padding: 20px;
  }

  .wish-content h3 {
    margin: 0 0 12px 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--gray-800);
  }

  .wish-content .description {
    margin: 0 0 12px 0;
    font-size: 0.875rem;
    color: var(--gray-700);
  }

  .wish-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .meta-item {
    display: flex;
    flex-direction: column;
  }

  .meta-item .label {
    font-size: 0.75rem;
    color: var(--gray-700);
    text-transform: uppercase;
  }

  .meta-item .value {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--gray-800);
  }
`]
})
export class DashboardComponent implements OnInit {
user: User | null = null;
today: Date = new Date();

// Task data
tasks: Task[] = [];
completedTasks: number = 0;
pendingTasks: number = 0;
dueTodayCount: number = 0;
upcomingTasks: Task[] = [];

// Wish data 
wishCount: number = 0;
wishPointsEarned: number = 250;
studentPoints: number = 0;
pendingWishes: number = 0;
approvedWishesCount: number = 0;
showApprovedWishes: boolean = false;
approvedWishes: any[] = [];

constructor(
  private authService: AuthService,
  private taskService: TaskService,
  private wishlistService: WishlistService,
  private studentService: StudentService,
  private router: Router
) {}

ngOnInit() {
  this.user = this.authService.getCurrentUser();
  if (!this.user) {
    this.router.navigate(['/login']);
  } else {
    this.loadTasks();
    if (this.user.role === 'parent') {
      this.loadPendingWishes();
    }
    if (this.user.role === 'student') {
      this.loadApprovedWishes();
      this.loadStudentPoints();
    }
  }
}

loadTasks() {
  if (!this.user) {
    console.error('No user found');
    return;
  }

  if (this.user.role === 'student') {
    // Try loading tasks by username first
    this.tryLoadTasksByUsername();
  }
}

tryLoadTasksByUsername() {
  if (!this.user?.username) {
    console.error('No username found');
    return;
  }

  this.taskService.getStudentTasks(this.user.username).subscribe({
    next: (tasks) => {
      console.log('Tasks loaded by username:', tasks);
      this.tasks = tasks;
      this.calculateTaskStats(tasks);
    },
    error: (error) => {
      console.error('Error loading tasks by username:', error);
      // Fallback to ID method if username fails
      if (this.user?.id) {
        this.taskService.getStudentTasksById(this.user.id).subscribe({
          next: (tasks) => {
            console.log('Tasks loaded by ID:', tasks);
            this.tasks = tasks;
            this.calculateTaskStats(tasks);
          },
          error: (error) => {
            console.error('Error loading tasks by ID:', error);
          }
        });
      }
    }
  });
}

calculateTaskStats(tasks: Task[]) {
  // Count completed tasks (including both 'completed' and 'approved' status)
  this.completedTasks = tasks.filter(task => 
    task.status === 'completed' || task.status === 'approved'
  ).length;

  // Count pending tasks
  this.pendingTasks = tasks.filter(task => 
    task.status === 'pending' || task.status === 'awaiting_approval'
  ).length;

  // Count tasks due today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  this.dueTodayCount = tasks.filter(task => {
    if (!task.deadline) return false;
    const deadline = new Date(task.deadline);
    deadline.setHours(0, 0, 0, 0);
    return deadline.getTime() === today.getTime() && 
            (task.status === 'pending' || task.status === 'awaiting_approval');
  }).length;

  // Get upcoming tasks
  this.upcomingTasks = this.getUpcomingTasks(tasks);
}

logout() {
  this.authService.logout();
}

navigateTo(path: string): void {
  console.log('Navigation clicked, path:', path);
  console.log('Current router state:', this.router.url);
  
  this.router.navigate([path]).then(
    success => {
      console.log('Navigation successful:', success);
    },
    error => {
      console.error('Navigation failed:', error);
    }
  );
}

isUrgent(dateStr: string | Date): boolean {
  if (!dateStr) return false;
  
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    // Check if date is valid
    if (isNaN(date.getTime())) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    
    return date <= tomorrow;
  } catch (error) {
    console.error('Error in isUrgent:', error);
    return false;
  }
}

getDaysMessage(dateStr: string | Date): string {
  if (!dateStr) return '';
  
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due Today';
    if (diffDays === 1) return 'Due Tomorrow';
    if (diffDays < 0) return 'Overdue';
    return `${diffDays} days left`;
  } catch (error) {
    console.error('Error in getDaysMessage:', error);
    return 'Date error';
  }
}

getUpcomingTasks(tasks: Task[]): Task[] {
  // Get upcoming non-completed tasks sorted by due date
  return tasks
    .filter(task => {
      // Only include non-completed tasks with deadlines
      return task.status !== 'completed' && task.deadline;
    })
    .map(task => {
      // Normalize task data
      return {
        ...task,
        title: task.title || 'Untitled Task',
        description: task.description || 'No description',
        // Ensure deadline is a proper date object
        deadline: task.deadline instanceof Date ? 
          task.deadline : 
          (typeof task.deadline === 'string' ? new Date(task.deadline) : new Date())
      };
    })
    .sort((a, b) => {
      // Sort by deadline (ascending)
      const dateA = a.deadline instanceof Date ? a.deadline.getTime() : new Date(a.deadline).getTime();
      const dateB = b.deadline instanceof Date ? b.deadline.getTime() : new Date(b.deadline).getTime();
      return dateA - dateB;
    })
    .slice(0, 3); // Get first 3 upcoming tasks
}

loadPendingWishes() {
  this.wishlistService.getPendingWishlistItems().subscribe({
    next: (items) => {
      console.log('Loaded pending wishlist items:', items);
      this.pendingWishes = items.length;
    },
    error: (error) => {
      console.error('Error loading pending wishlist items:', error);
    }
  });
}

toggleApprovedWishes() {
  this.showApprovedWishes = !this.showApprovedWishes;
  if (this.showApprovedWishes && this.approvedWishes.length === 0) {
    this.loadApprovedWishes();
  }
}

loadApprovedWishes() {
  if (!this.user?.id) return;
  
  this.wishlistService.getStudentWishlist(this.user.id).subscribe({
    next: (wishes: any[]) => {
      // Only count wishes that are approved AND in shoplist
      this.approvedWishes = wishes.filter(wish => wish.isApproved && wish.isInShoplist);
      this.approvedWishesCount = this.approvedWishes.length;
      // Update wish count to only include non-approved and non-purchased wishes
      this.wishCount = wishes.filter(wish => !wish.isApproved && !wish.isPurchased).length;
    },
    error: (error: any) => {
      console.error('Error loading approved wishes:', error);
    }
  });
}

loadStudentPoints(): void {
  if (this.user?.id) {
    console.log('Loading points for user:', this.user.id);
    this.studentService.getStudentPoints(this.user.id).subscribe({
      next: (points: number) => {
        console.log('Points loaded from database:', points);
        this.studentPoints = points;
      },
      error: (error: any) => {
        console.error('Error loading student points:', error);
        if (error.status) {
          console.error('HTTP Status:', error.status);
        }
        if (error.statusText) {
          console.error('Status Text:', error.statusText);
        }
        if (error.error) {
          console.error('Error details:', error.error);
        }
        this.studentPoints = 0;
      }
    });
  } else {
    console.error('Cannot load points: No user ID available');
    this.studentPoints = 0;
  }
}
} 
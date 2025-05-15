import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { User } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  tasks: Task[] = [];
  totalPoints: number = 0;
  pendingTasks: number = 0;

  constructor(
    private authService: AuthService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadTasks();
    }
  }

  loadTasks(): void {
    if (!this.currentUser) return;

    if (this.currentUser.username) {
      this.taskService.getStudentTasks(this.currentUser.username).subscribe({
        next: (tasks: Task[]) => {
          this.tasks = tasks;
          this.pendingTasks = tasks.filter(task => task.status === 'pending').length;
          this.calculateTotalPoints();
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
        }
      });
    }
  }

  calculateTotalPoints(): void {
    this.totalPoints = this.tasks
      .filter(task => task.status === 'completed' || task.status === 'approved')
      .reduce((total, task) => total + (task.reward || 0), 0);
  }

  isStudent(): boolean {
    return this.currentUser?.role === 'student';
  }

  isTeacherOrParent(): boolean {
    return this.currentUser?.role === 'teacher' || this.currentUser?.role === 'parent';
  }
} 
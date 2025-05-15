import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { AuthService } from '../../services/auth.service';
import { WishService } from '../../services/wish.service';
import { StudentService } from '../../services/student.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class StudentDashboardComponent implements OnInit {
  tasks: Task[] = [];
  currentUser: any;
  errorMessage: string = '';
  completedTaskCount: number = 0;
  totalPoints: number = 0;
  wishCount: number = 0;
  approvedWishCount: number = 0;
  private isBrowser: boolean;
  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private wishService: WishService,
    private studentService: StudentService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    // Subscribe to dashboard refresh events
    this.taskService.getStudentDashboardRefresh().pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadTasks();
      this.loadWishCount();
      this.loadStudentPoints();
    });

    // Subscribe to wish refresh events
    this.wishService.getWishRefresh().pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadWishCount();
      this.loadStudentPoints();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser && this.isBrowser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          this.currentUser = JSON.parse(storedUser);
          console.log('Retrieved user from localStorage:', this.currentUser);
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
        }
      }
    }
    
    if (this.currentUser) {
      this.loadTasks();
      this.loadWishCount();
      this.loadStudentPoints();
    }
  }

  loadStudentPoints(): void {
    if (this.currentUser?.id) {
      console.log('Loading points for user:', this.currentUser.id);
      this.studentService.getStudentPoints(this.currentUser.id).subscribe({
        next: (points: number) => {
          console.log('Points loaded from database:', points);
          this.totalPoints = points;
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
          this.totalPoints = 0;
        }
      });
    } else {
      console.error('Cannot load points: No user ID available');
      this.totalPoints = 0;
    }
  }

  loadWishCount(): void {
    if (this.currentUser?.id) {
      this.wishService.getStudentWishes(this.currentUser.id).subscribe({
        next: (wishes) => {
          // Count wishes that are in wishlist and not approved
          this.wishCount = wishes.filter(wish => 
            wish.isInWishlist && !wish.isApproved
          ).length;
          
          // Count approved wishes that are in shoplist and not purchased
          this.approvedWishCount = wishes.filter(wish => 
            wish.isApproved && wish.isInShoplist && !wish.isPurchased
          ).length;
        },
        error: (error) => {
          console.error('Error loading wish count:', error);
        }
      });
    }
  }

  private updateCompletedTaskCount(): void {
    this.completedTaskCount = this.tasks.filter(task => 
      task.status === 'completed' || task.status === 'approved'
    ).length;
  }

  loadTasks(): void {
    if (!this.currentUser) {
      console.error('No current user found');
      return;
    }

    console.log('Loading tasks for user:', this.currentUser);
    
    if (this.currentUser.role === 'student') {
      // Try both username and ID methods
      this.taskService.getStudentTasks(this.currentUser.username).subscribe({
        next: (tasks) => {
          console.log('Tasks loaded by username:', tasks);
          // Filter out completed and approved tasks and sort by creation date
          this.tasks = tasks
            .filter(task => 
              task.status !== 'completed' && 
              task.status !== 'approved' && 
              task.status !== 'rejected'
            )
            .sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA; // Sort in descending order (newest first)
            });
          this.updateCompletedTaskCount();
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
              this.errorMessage = 'Failed to load tasks. Please try again.';
        }
      });
    }
  }

  completeTask(taskId: number): void {
    if (!this.currentUser || !this.currentUser.id) {
      this.errorMessage = 'User not authenticated';
      return;
    }

    this.taskService.completeTask(taskId).subscribe({
      next: (updatedTask) => {
        console.log('Task completed:', updatedTask);
        this.loadTasks(); // Reload tasks to show updated status
      },
      error: (error) => {
        console.error('Error completing task:', error);
        this.errorMessage = 'Failed to complete task. Please try again.';
      }
    });
  }

  // Add a method to refresh tasks when a new task is created
  refreshTasks(): void {
    this.loadTasks();
  }
} 
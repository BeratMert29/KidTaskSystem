import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { AuthService, User } from '../../services/auth.service';
import { Task } from '../../models/task.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-student-tasks',
  templateUrl: './student-tasks.component.html',
  styleUrls: ['./student-tasks.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class StudentTasksComponent implements OnInit {
  tasks: Task[] = [];
  currentUser: User | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  completedTaskCount: number = 0;
  private isBrowser: boolean;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadTasks();
    } else if (this.isBrowser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          this.currentUser = JSON.parse(storedUser);
          this.loadTasks();
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
          this.errorMessage = 'Authentication error. Please login again.';
        }
      } else {
        this.errorMessage = 'You must be logged in to view your tasks.';
      }
    }
  }

  loadTasks(): void {
    if (!this.currentUser) {
      this.errorMessage = 'You must be logged in to view your tasks.';
      return;
    }

    // Try to load tasks by username first
    if (this.currentUser.username) {
      console.log('Loading tasks for student by username:', this.currentUser.username);
      this.taskService.getStudentTasks(this.currentUser.username).subscribe({
        next: (tasks: Task[]) => {
          console.log('Received tasks by username:', tasks);
          this.handleTasksLoaded(tasks);
        },
        error: (error: any) => {
          console.error('Error loading tasks by username:', error);
          this.tryLoadTasksById(); // Fallback to ID approach
        }
      });
    } else {
      this.tryLoadTasksById();
    }
  }

  private tryLoadTasksById(): void {
    if (this.currentUser && this.currentUser.id) {
      console.log('Falling back to loading tasks by ID:', this.currentUser.id);
      this.taskService.getStudentTasksById(this.currentUser.id).subscribe({
        next: (tasks: Task[]) => {
          console.log('Received tasks by ID:', tasks);
          this.handleTasksLoaded(tasks);
        },
        error: (error: any) => {
          console.error('Error loading tasks by ID:', error);
          this.errorMessage = 'Failed to load tasks. Please try again later.';
        }
      });
    } else {
      console.error('Cannot load tasks: Missing user ID', this.currentUser);
      this.errorMessage = 'User information is incomplete. Please login again.';
    }
  }

  private updateCompletedTaskCount(): void {
    this.completedTaskCount = this.tasks.filter(task => 
      task.status === 'completed' || task.status === 'approved'
    ).length;
  }

  private handleTasksLoaded(tasks: Task[]): void {
    // Normalize the tasks to ensure they have consistent data
    this.tasks = tasks.map(task => {
      // Get the status and normalize it to a valid value
      let normalizedStatus: 'pending' | 'awaiting_approval' | 'completed' | 'approved' | 'rejected' = 'pending';
      
      if (task.status) {
        const statusLower = task.status.toLowerCase();
        if (statusLower === 'pending' || statusLower === 'awaiting_approval' || 
            statusLower === 'completed' || statusLower === 'approved' || 
            statusLower === 'rejected') {
          normalizedStatus = statusLower as 'pending' | 'awaiting_approval' | 'completed' | 'approved' | 'rejected';
        }
      }
      
      return {
        ...task,
        // Use the normalized status
        status: normalizedStatus,
        // Ensure other fields have appropriate fallbacks
        title: task.title || 'Untitled Task',
        description: task.description || '',
        reward: task.reward || 0,
      };
    });

    this.updateCompletedTaskCount();

    if (tasks.length === 0) {
      this.successMessage = 'You have no assigned tasks.';
    }
    console.log('Normalized tasks:', this.tasks);
  }

  completeTask(task: Task): void {
    if (!task.id) {
      this.errorMessage = 'Cannot complete this task: Task ID is missing.';
      return;
    }
    
    if (confirm('Are you sure you want to mark this task as completed? It will be sent for approval.')) {
      // Optimistically update the task status locally
      const taskIndex = this.tasks.findIndex(t => t.id === task.id);
      if (taskIndex !== -1) {
        // Add status-changing class for animation
        const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
        if (taskElement) {
          taskElement.classList.add('status-changing');
          setTimeout(() => {
            taskElement.classList.remove('status-changing');
          }, 1000);
        }

        this.tasks[taskIndex] = {
          ...this.tasks[taskIndex],
          status: 'awaiting_approval'
        };
      }

      this.taskService.completeTask(task.id).subscribe({
        next: (updatedTask) => {
          this.successMessage = 'Task submitted for approval successfully!';
          // Update the task with the complete response data
          if (taskIndex !== -1) {
            this.tasks[taskIndex] = updatedTask;
            this.updateCompletedTaskCount();
          }
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Error submitting task for approval:', error);
          this.errorMessage = 'Failed to submit task for approval. Please try again.';
          // Revert the optimistic update if the request fails
          if (taskIndex !== -1) {
            this.tasks[taskIndex] = {
              ...this.tasks[taskIndex],
              status: 'pending'
            };
            this.updateCompletedTaskCount();
          }
        }
      });
    }
  }

  canCompleteTask(task: Task): boolean {
    const status = task.status ? task.status.toLowerCase() : '';
    // Only allow completing tasks that are in pending status
    return status === 'pending';
  }

  getStatusLabel(status: string): string {
    if (!status) return 'Pending';
    
    // Convert to lowercase, then capitalize first letter
    status = status.toLowerCase();
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  getStatusClass(status: string): string {
    return status ? status.toLowerCase() : 'pending';
  }

  getRatingStars(rating: number | undefined): number[] {
    if (!rating || typeof rating !== 'number' || rating <= 0) return [];
    const starCount = Math.min(Math.floor(rating), 5); // Ensure max 5 stars
    return Array(starCount).fill(0).map((_, i) => i);
  }

  getEmptyStars(rating: number | undefined): number[] {
    if (!rating || typeof rating !== 'number' || rating <= 0) return Array(5).fill(0).map((_, i) => i);
    const emptyCount = Math.max(0, 5 - Math.floor(rating)); // Ensure non-negative count
    return Array(emptyCount).fill(0).map((_, i) => i);
  }
} 
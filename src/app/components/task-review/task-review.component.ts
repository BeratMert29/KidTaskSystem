import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../models/task.model';
import { Observable } from 'rxjs';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-review',
  templateUrl: './task-review.component.html',
  styleUrls: ['./task-review.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StarRatingComponent, FormsModule]
})
export class TaskReviewComponent implements OnInit {
  tasks: Task[] = [];
  reviewForm: FormGroup;
  selectedTask: Task | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  currentUser: any;
  private isBrowser: boolean;
  selectedRating: number = 0;
  showModal: boolean = false;
  modalAction: 'approve' | 'reject' = 'approve';
  rejectionReason: string = '';

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.reviewForm = this.fb.group({
      rating: [0],
      feedback: ['']
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadTasks();
  }

  loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser && this.isBrowser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          this.currentUser = JSON.parse(storedUser);
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
        }
      }
    }
  }

  loadTasks(): void {
    if (!this.currentUser) {
      console.error('No current user found');
      return;
    }

    let tasksObservable: Observable<Task[]>;
    
    if (this.currentUser.role === 'parent') {
      tasksObservable = this.taskService.getTasksAwaitingParentApproval(this.currentUser.id);
    } else if (this.currentUser.role === 'teacher') {
      tasksObservable = this.taskService.getTasksAwaitingTeacherApproval(this.currentUser.username);
    } else {
      console.error('Invalid user role for task review');
      return;
    }

    tasksObservable.subscribe({
      next: (tasks: Task[]) => {
        this.tasks = tasks.filter(task => task.status === 'awaiting_approval');
        console.log('Filtered tasks for review:', this.tasks);
      },
      error: (error: any) => {
        console.error('Error loading tasks for review:', error);
        this.errorMessage = 'Failed to load tasks. Please try again.';
      }
    });
  }

  openReviewModal(task: Task, action: 'approve' | 'reject'): void {
    this.selectedTask = task;
    this.modalAction = action;
    this.selectedRating = task.rating || 0;
    this.rejectionReason = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedTask = null;
    this.selectedRating = 0;
    this.rejectionReason = '';
  }

  onRatingChange(rating: number): void {
    if (!this.selectedTask?.id) {
      this.errorMessage = 'No task selected';
      return;
    }

    this.selectedRating = rating;
    this.reviewForm.patchValue({ rating });

    // Save rating to database immediately
    this.taskService.rateTask(this.selectedTask.id, rating).subscribe({
      next: () => {
        // Update the task in the local array
        const taskIndex = this.tasks.findIndex(t => t.id === this.selectedTask?.id);
        if (taskIndex !== -1) {
          this.tasks[taskIndex] = { ...this.tasks[taskIndex], rating };
        }
        this.successMessage = 'Rating saved successfully!';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error saving rating:', error);
        this.errorMessage = 'Failed to save rating. Please try again.';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  submitReview(): void {
    if (!this.selectedTask?.id) {
      this.errorMessage = 'No task selected';
      return;
    }

    if (this.modalAction === 'reject' && !this.rejectionReason.trim()) {
      this.errorMessage = 'Please provide a reason for rejection';
      return;
    }

    const reviewData = {
      status: this.modalAction === 'approve' ? 'approved' : 'rejected',
      rating: this.modalAction === 'approve' ? this.selectedRating : undefined,
      feedback: this.modalAction === 'reject' ? this.rejectionReason : undefined
    };

    this.taskService.reviewTask(this.selectedTask.id, reviewData).subscribe({
      next: () => {
        this.successMessage = `Task ${this.modalAction}d successfully!`;
        this.closeModal();
        this.loadTasks();
      },
      error: (error) => {
        console.error(`Error ${this.modalAction}ing task:`, error);
        this.errorMessage = `Failed to ${this.modalAction} task. Please try again.`;
      }
    });
  }

  getStatusLabel(status: string): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getRatingStars(rating: number | undefined): number[] {
    if (!rating) return [];
    return Array(rating).fill(0).map((_, i) => i);
  }

  getEmptyStars(rating: number | undefined): number[] {
    if (!rating) return Array(5).fill(0).map((_, i) => i);
    return Array(5 - rating).fill(0).map((_, i) => i);
  }
} 
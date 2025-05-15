import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { WishlistService, WishlistItem } from '../../services/wishlist.service';
import { Task } from '../../models/task.model';
import { User } from '../../services/auth.service';

@Component({
  selector: 'app-parent-dashboard',
  templateUrl: './parent-dashboard.component.html',
  styleUrls: ['./parent-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ParentDashboardComponent implements OnInit {
  currentUser: User | null = null;
  tasks: Task[] = [];
  pendingTasks: number = 0;
  wishlistItems: WishlistItem[] = [];

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadTasks();
      this.loadWishlist();
    }
  }

  loadTasks(): void {
    if (!this.currentUser?.username) return;

    this.taskService.getParentTasks(this.currentUser.username).subscribe({
      next: (tasks: Task[]) => {
        this.tasks = tasks;
        this.pendingTasks = tasks.filter(task => task.status === 'pending').length;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
      }
    });
  }

  loadWishlist(): void {
    if (!this.currentUser?.id) return;

    this.wishlistService.getPendingWishlistItems().subscribe({
      next: (items) => {
        console.log('Loaded wishlist items:', items);
        this.wishlistItems = items;
      },
      error: (error) => {
        console.error('Error loading wishlist:', error);
      }
    });
  }

  approveWishlistItem(itemId: number): void {
    this.wishlistService.approveWishlistItem(itemId).subscribe({
      next: () => {
        console.log('Wishlist item approved:', itemId);
        this.loadWishlist();
      },
      error: (error) => {
        console.error('Error approving wishlist item:', error);
      }
    });
  }

  rejectWishlistItem(itemId: number): void {
    this.wishlistService.rejectWishlistItem(itemId).subscribe({
      next: () => {
        console.log('Wishlist item rejected:', itemId);
        this.loadWishlist();
      },
      error: (error) => {
        console.error('Error rejecting wishlist item:', error);
      }
    });
  }
} 
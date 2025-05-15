import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { WishService } from '../../services/wish.service';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-approved-wishes',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe],
  template: `
    <div class="approved-wishes-page">
      <header class="page-header">
        <h1>Approved Wishes</h1>
        <p class="subtitle">View your approved wish list items</p>
        <div class="student-points" *ngIf="studentPoints !== null">
          <span class="points-label">Your Points:</span>
          <span class="points-value">{{studentPoints}}</span>
        </div>
      </header>

      <div class="wish-grid">
        <div class="wish-card" *ngFor="let wish of approvedWishes">
          <div class="wish-image">
            <img [src]="wish.imageUrl" [alt]="wish.itemName">
          </div>
          <div class="wish-content">
            <h3>{{wish.itemName}}</h3>
            <p class="description">{{wish.description}}</p>
            <div class="wish-meta">
              <div class="meta-item">
                <span class="label">Points</span>
                <span class="value">{{wish.points}}</span>
              </div>
              <div class="meta-item">
                <span class="label">Level</span>
                <span class="value">{{wish.level}}</span>
              </div>
              <div class="meta-item">
                <span class="label">Price</span>
                <span class="value">{{wish.price | currency}}</span>
              </div>
            </div>
            <div class="wish-actions">
              <button 
                class="purchase-btn" 
                [disabled]="!studentPoints || studentPoints < wish.points"
                (click)="purchaseWish(wish)"
              >
                Purchase
              </button>
              <p class="error-message" *ngIf="studentPoints !== null && studentPoints < wish.points">
                Not enough points
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="no-wishes" *ngIf="approvedWishes.length === 0">
        <p>No approved wishes found</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary-color: #4F46E5;
      --primary-color-dark: #4338CA;
      --gray-100: #F3F4F6;
      --gray-200: #E5E7EB;
      --gray-300: #D1D5DB;
      --gray-400: #9CA3AF;
      --gray-700: #374151;
      --gray-800: #1F2937;
      --error-color: #EF4444;
    }

    .approved-wishes-page {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 32px;
      text-align: center;
    }

    .page-header h1 {
      font-size: 2rem;
      color: var(--gray-800);
      margin-bottom: 8px;
    }

    .subtitle {
      color: var(--gray-700);
      font-size: 1.1rem;
      margin-bottom: 16px;
    }

    .student-points {
      background: var(--primary-color);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      display: inline-block;
      margin-top: 16px;
    }

    .points-label {
      font-weight: 600;
      margin-right: 8px;
    }

    .points-value {
      font-size: 1.2rem;
      font-weight: 700;
    }

    .wish-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    .wish-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--gray-200);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .wish-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }

    .wish-image {
      width: 100%;
      height: 200px;
      overflow: hidden;
    }

    .wish-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    .wish-card:hover .wish-image img {
      transform: scale(1.05);
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

    .description {
      margin: 0 0 16px 0;
      font-size: 0.875rem;
      color: var(--gray-700);
      line-height: 1.5;
    }

    .wish-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid var(--gray-200);
      margin-bottom: 16px;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .meta-item .label {
      font-size: 0.75rem;
      color: var(--gray-700);
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .meta-item .value {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--gray-800);
    }

    .wish-actions {
      text-align: center;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--gray-200);
    }

    .purchase-btn {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 12px 32px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
      width: 100%;
      max-width: 200px;
      font-size: 1rem;
    }

    .purchase-btn:hover:not(:disabled) {
      background: var(--primary-color-dark);
    }

    .purchase-btn:disabled {
      background: var(--gray-400);
      cursor: not-allowed;
    }

    .error-message {
      color: var(--error-color);
      font-size: 0.875rem;
      margin-top: 8px;
    }

    .no-wishes {
      text-align: center;
      padding: 48px;
      background: var(--gray-100);
      border-radius: 12px;
      border: 1px dashed var(--gray-300);
    }

    .no-wishes p {
      color: var(--gray-700);
      font-size: 1.1rem;
      margin: 0;
    }
  `]
})
export class ApprovedWishesComponent implements OnInit {
  approvedWishes: any[] = [];
  studentPoints: number | null = null;
  currentUser: any;

  constructor(
    private authService: AuthService,
    private wishService: WishService,
    private studentService: StudentService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Current user:', this.currentUser);
    if (this.currentUser?.id) {
      this.loadApprovedWishes(this.currentUser.id);
      this.loadStudentPoints(this.currentUser.id);
    }
  }

  loadApprovedWishes(userId: number) {
    console.log('Loading approved wishes for user:', userId);
    this.wishService.getApprovedWishes(userId).subscribe({
      next: (wishes: any[]) => {
        console.log('Loaded approved wishes:', wishes);
        // Filter wishes to only show those that are properly approved
        this.approvedWishes = wishes.filter(wish => 
          wish.isApproved && 
          wish.approvedAt && 
          wish.isInShoplist
        );
        // Add debug logs for each wish's points
        this.approvedWishes.forEach(wish => {
          console.log(`Wish ${wish.wishId} points: ${wish.points}, Student points: ${this.studentPoints}`);
          console.log(`Button should be disabled: ${!this.studentPoints || this.studentPoints < wish.points}`);
        });
      },
      error: (error: any) => {
        console.error('Error loading approved wishes:', error);
      }
    });
  }

  loadStudentPoints(userId: number) {
    console.log('Loading student points for user:', userId);
    this.studentService.getStudentPoints(userId).subscribe({
      next: (points: number) => {
        console.log('Loaded student points:', points);
        this.studentPoints = points;
      },
      error: (error: any) => {
        console.error('Error loading student points:', error);
      }
    });
  }

  purchaseWish(wish: any): void {
    if (!this.currentUser || !this.currentUser.id) {
      console.error('No user logged in');
      return;
    }

    this.wishService.purchaseWish(wish.wishId, this.currentUser.id).subscribe({
      next: (updatedWish) => {
        console.log('Wish purchased successfully:', updatedWish);
        this.loadApprovedWishes(this.currentUser.id);
        this.loadStudentPoints(this.currentUser.id);
      },
      error: (error) => {
        console.error('Error purchasing wish:', error);
        // Display error message to user
        alert(error.message || 'Failed to purchase wish. Please try again.');
      }
    });
  }
} 
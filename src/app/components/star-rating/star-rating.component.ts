import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="star-rating">
      <span *ngFor="let star of stars; let i = index" 
            class="star" 
            [class.filled]="i < rating"
            [class.hover]="i < hoverRating"
            (click)="onStarClick(i + 1)"
            (mouseenter)="onStarHover(i + 1)"
            (mouseleave)="onStarHover(0)">
        ★
      </span>
    </div>
  `,
  styles: [`
    .star-rating {
      display: inline-flex;
      gap: 4px;
    }
    .star {
      font-size: 24px;
      color: #ddd;
      cursor: pointer;
      transition: color 0.2s;
    }
    .star.filled {
      color: #ffd700;
    }
    .star.hover {
      color: #ffd700;
      opacity: 0.7;
    }
  `]
})
export class StarRatingComponent {
  @Input() rating: number = 0;
  @Output() ratingChange = new EventEmitter<number>();
  
  stars = [1, 2, 3, 4, 5];
  hoverRating: number = 0;

  onStarClick(rating: number): void {
    this.rating = rating;
    this.ratingChange.emit(rating);
  }

  onStarHover(rating: number): void {
    this.hoverRating = rating;
  }
} 
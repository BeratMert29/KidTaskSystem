import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WishService, Wish } from '../../services/wish.service';

@Component({
  selector: 'app-wishes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wishes.component.html',
  styleUrls: ['./wishes.component.css']
})
export class WishesComponent implements OnInit {
  wishes: Wish[] = [];

  constructor(
    private wishService: WishService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.id) {
        this.loadWishes(currentUser.id);
      }
    }
  }

  loadWishes(studentId: number) {
    this.wishService.getStudentWishes(studentId).subscribe({
        next: (wishes) => {
          this.wishes = wishes;
        console.log('Loaded wishes:', wishes);
        },
        error: (error) => {
          console.error('Error loading wishes:', error);
        }
      });
  }

  removeFromWishlist(wishId: number) {
    this.wishService.removeFromWishlist(wishId).subscribe({
      next: () => {
        this.wishes = this.wishes.filter(wish => wish.wishId !== wishId);
      },
      error: (error) => {
        console.error('Error removing wish:', error);
      }
    });
  }
} 
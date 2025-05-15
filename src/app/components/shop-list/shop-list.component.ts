import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { WishService, Wish } from '../../services/wish.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-shop-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop-list.component.html',
  styleUrls: ['./shop-list.component.css']
})
export class ShopListComponent implements OnInit {
  shoplist: Wish[] = [];
  currentUserId = 0;

  constructor(
    private wishService: WishService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;
    
    this.currentUserId = currentUser.id;
    this.loadStudentShoplist();
  }

  loadStudentShoplist() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;
    
    this.wishService.getStudentShoplist(this.currentUserId).subscribe({
      next: (wishes) => {
        this.shoplist = wishes;
      },
      error: (error) => {
        console.error('Error loading shoplist:', error);
      }
    });
  }

  removeFromShoplist(wishId: number) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.wishService.removeFromShoplist(wishId).subscribe({
      next: () => {
        this.shoplist = this.shoplist.filter(wish => wish.wishId !== wishId);
      },
      error: (error) => {
        console.error('Error removing from shoplist:', error);
      }
    });
  }
} 
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from './product.model';
import { WishService, Wish } from '../../services/wish.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

interface ProductWithLevel extends Product {
  level: number;
  isApproved: boolean;
  isInWishlist: boolean;
  isInShoplist: boolean;
}

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class ShopComponent implements OnInit {
  products: ProductWithLevel[] = [
    {
      id: 1,
      name: 'Gaming Mouse',
      description: 'High-performance gaming mouse with RGB lighting',
      price: 49.99,
      points: 500,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=200&fit=crop',
      level: 4,
      isApproved: true,
      isInWishlist: false,
      isInShoplist: true
    },
    {
      id: 2,
      name: 'Wireless Headphones',
      description: 'Premium wireless headphones with noise cancellation',
      price: 99.99,
      points: 1000,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop',
      level: 4,
      isApproved: true,
      isInWishlist: false,
      isInShoplist: true
    },
    {
      id: 3,
      name: 'Smart Watch',
      description: 'Fitness tracker and smart watch with heart rate monitor',
      price: 149.99,
      points: 1500,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop',
      level: 4,
      isApproved: true,
      isInWishlist: false,
      isInShoplist: true
    },
    {
      id: 4,
      name: 'Gaming Keyboard',
      description: 'Mechanical gaming keyboard with RGB backlight',
      price: 79.99,
      points: 800,
      image: 'https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&w=300&h=200&fit=crop',
      level: 4,
      isApproved: true,
      isInWishlist: false,
      isInShoplist: true
    },
    {
      id: 5,
      name: 'Bluetooth Speaker',
      description: 'Portable Bluetooth speaker with 360° sound',
      price: 69.99,
      points: 700,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=200&fit=crop',
      level: 4,
      isApproved: true,
      isInWishlist: false,
      isInShoplist: true
    },
    {
      id: 6,
      name: 'Mountain Bike',
      description: 'High-performance mountain bike with 21 speeds',
      price: 299.99,
      points: 3000,
      image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=300&h=200&fit=crop',
      level: 4,
      isApproved: true,
      isInWishlist: false,
      isInShoplist: true
    }
  ];

  currentUserRole: string = '';
  currentUserLevel: number = 1;
  currentUserPoints: number = 0;
  wishlistItems: Wish[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private wishService: WishService,
    private authService: AuthService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadUserData();
    this.loadWishlist();
    }
  }

  loadUserData() {
    if (!this.isBrowser) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser) {
      this.currentUserRole = currentUser.role || '';
      this.currentUserLevel = currentUser.level || 1;
      this.currentUserPoints = currentUser.points || 0;
      console.log('Loaded user data:', {
        role: this.currentUserRole,
        level: this.currentUserLevel,
        points: this.currentUserPoints
      });
    }
  }

  calculateLevel(points: number): number {
    if (points <= 40) return 1;
    if (points <= 60) return 2;
    if (points <= 80) return 3;
    return 4;
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.classList.add('loading');
      // Set a fallback image
      imgElement.src = 'https://via.placeholder.com/300x200?text=Product+Image';
    }
  }

  toggleWishlist(product: ProductWithLevel): void {
    if (this.currentUserRole === 'student') {
      product.isInWishlist = !product.isInWishlist;
      // TODO: Save to backend
      console.log('Wishlist updated:', product);
    }
  }

  approveProduct(product: ProductWithLevel): void {
    if (this.currentUserRole === 'teacher' || this.currentUserRole === 'parent') {
      product.isApproved = true;
      product.isInShoplist = true;
      // TODO: Save to backend
      console.log('Product approved:', product);
    }
  }

  purchaseProduct(product: ProductWithLevel): void {
    if (this.currentUserRole === 'student') {
      if (product.isApproved && product.isInShoplist) {
        if (this.currentUserPoints >= product.points && this.currentUserLevel >= product.level) {
          // TODO: Implement purchase logic
          console.log('Purchasing product:', product);
        } else {
          console.log('Not enough points or level too low');
        }
      }
    }
  }

  canPurchase(product: ProductWithLevel): boolean {
    return this.currentUserRole === 'student' && 
           product.isApproved && 
           product.isInShoplist && 
           this.currentUserPoints >= product.points && 
           this.currentUserLevel >= product.level;
  }

  isApprover(): boolean {
    return this.currentUserRole === 'teacher' || this.currentUserRole === 'parent';
  }

  loadWishlist() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser && currentUser.id) {
      this.wishService.getStudentWishes(currentUser.id).subscribe({
        next: (wishes) => {
          this.wishlistItems = wishes;
        },
        error: (error) => {
          console.error('Error loading wishlist:', error);
          this.error = 'Failed to load wishlist';
        }
      });
    }
  }

  isInWishlist(itemId: number): boolean {
    return this.wishlistItems.some(wish => wish.wishId === itemId);
  }

  addToWishlist(product: ProductWithLevel) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser && currentUser.id) {
    const wish: Wish = {
        itemName: product.name,
        description: product.description,
        points: product.points,
        level: product.level,
        price: product.price,
        imageUrl: product.image,
      isInWishlist: true,
      isInShoplist: false,
        isApproved: false,
      isPurchased: false,
      studentModel: {
          id: currentUser.id,
          username: currentUser.username || ''
      }
    };

      this.wishService.addWish(currentUser.id, wish).subscribe({
        next: (response: Wish) => {
          this.loadWishlist();
          product.isInWishlist = true;
          // Update local storage with new points if they changed
          if (currentUser.points !== this.currentUserPoints) {
            currentUser.points = this.currentUserPoints;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
          }
      },
        error: (error: any) => {
        console.error('Error adding to wishlist:', error);
          this.error = 'Failed to add to wishlist';
      }
    });
    }
  }
} 
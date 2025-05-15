import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { WishlistService } from '../../services/wishlist.service';
import { UserService } from '../../services/user.service';
import { WishService, Wish } from '../../services/wish.service';
import { StudentService } from '../../services/student.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';

@Component({
  selector: 'app-wish-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wish-list.component.html',
  styleUrls: ['./wish-list.component.css'],
  providers: [UserService]
})
export class WishListComponent implements OnInit {
  wishes: Wish[] = [];
  isStudent: boolean = false;
  isParent: boolean = false;
  isTeacher: boolean = false;
  studentPoints: number | null = null;

  constructor(
    private authService: AuthService,
    private wishlistService: WishlistService,
    private userService: UserService,
    private wishService: WishService,
    private studentService: StudentService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.isStudent = currentUser.role === 'student';
        this.isParent = currentUser.role === 'parent';
        this.isTeacher = currentUser.role === 'teacher';
        
        if (this.isStudent) {
          this.loadStudentPoints(currentUser.id);
        }
        this.loadPendingWishes();
      }
    }
  }

  loadPendingWishes() {
    this.wishService.getPendingWishes().subscribe({
      next: (wishes: Wish[]) => {
        this.wishes = wishes.filter(wish => wish.isInWishlist);
      },
      error: (error: any) => {
        console.error('Error loading pending wishes:', error);
      }
    });
  }

  loadStudentPoints(userId: number) {
    this.studentService.getStudentPoints(userId).subscribe({
      next: (points: number) => {
        this.studentPoints = points;
      },
      error: (error: any) => {
        console.error('Error loading student points:', error);
      }
    });
  }

  purchaseWish(wishId: number) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) return;

    this.wishService.purchaseWish(wishId, currentUser.id).subscribe({
      next: (purchasedWish: Wish) => {
        // Update the wish in the list
        const index = this.wishes.findIndex(w => w.wishId === wishId);
        if (index !== -1) {
          this.wishes[index] = purchasedWish;
        }
        // Reload student points
        this.loadStudentPoints(currentUser.id);
      },
      error: (error: any) => {
        console.error('Error purchasing wish:', error);
      }
    });
  }

  removeFromWishlist(wishId: number) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.wishService.removeFromWishlist(wishId).subscribe({
      next: () => {
        this.wishes = this.wishes.filter(wish => wish.wishId !== wishId);
      },
      error: (error: any) => {
        console.error('Error removing wish:', error);
      }
    });
  }

  approveWish(wishId: number, role: string) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      console.error('No user logged in');
      return;
    }

    if (role === 'parent') {
      this.wishService.approveWish(wishId, currentUser.id).subscribe({
        next: (wish: Wish) => {
          // Update the wish in the list
          const index = this.wishes.findIndex(w => w.wishId === wishId);
          if (index !== -1) {
            this.wishes[index] = wish;
          }
          // Trigger wish refresh
          this.wishService.refreshWishes();
        },
        error: (error: any) => {
          console.error('Error approving wish:', error);
          if (error.status === 401 || error.status === 403) {
            // Handle authentication error
            this.authService.logout();
            window.location.href = '/login';
          } else {
            // Handle other errors
            alert('Failed to approve wish. Please try again.');
          }
        }
      });
    } else {
      // Teacher approval
      this.wishService.approveWish(wishId, currentUser.id).subscribe({
        next: (wish: Wish) => {
          // Update the wish in the list
          const index = this.wishes.findIndex(w => w.wishId === wishId);
          if (index !== -1) {
            this.wishes[index] = wish;
          }
          // Trigger wish refresh
          this.wishService.refreshWishes();
        },
        error: (error: any) => {
          console.error('Error approving wish:', error);
          if (error.status === 401 || error.status === 403) {
            // Handle authentication error
            this.authService.logout();
            window.location.href = '/login';
          } else {
            // Handle other errors
            alert('Failed to approve wish. Please try again.');
          }
        }
      });
    }
  }

  rejectWish(wishId: number) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      this.wishService.rejectWish(wishId, currentUser.id).subscribe({
        next: () => {
          this.loadPendingWishes();
        },
        error: (error: any) => {
          console.error('Error rejecting wish:', error);
        }
      });
    }
  }
} 
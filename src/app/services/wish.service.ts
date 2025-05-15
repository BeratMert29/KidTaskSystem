import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of, Subject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

export interface Wish {
  wishId?: number;
  itemName: string;
  description: string;
  price: number;
  points: number;
  level: number;
  isApproved: boolean;
  imageUrl: string;
  isInWishlist: boolean;
  isInShoplist: boolean;
  isPurchased: boolean;
  createdAt?: Date;
  approvedAt?: Date;
  studentId?: number;
  studentModel: {
    id: number;
    username: string;
  };
  approvedByParent?: {
    id: number;
    username: string;
  };
  approvedByTeacher?: {
    id: number;
    username: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WishService {
  private apiUrl = `${environment.apiUrl}/wishlist`;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };
  private wishRefreshSubject = new Subject<void>();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getWishRefresh() {
    return this.wishRefreshSubject.asObservable();
  }

  refreshWishes() {
    this.wishRefreshSubject.next();
  }

  private shouldMakeApiCall(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  addWish(studentId: number, wish: Omit<Wish, 'wishId'>): Observable<Wish> {
    if (!this.shouldMakeApiCall()) {
      return of({} as Wish);
    }
    const wishWithDefaults = {
      ...wish,
      isPurchased: false
    };
    return this.http.post<Wish>(`${this.apiUrl}/student/${studentId}`, wishWithDefaults, this.httpOptions).pipe(
      catchError(error => {
        console.error('Error adding wish:', error);
        return throwError(() => error);
      })
    );
  }

  getStudentWishes(studentId: number): Observable<Wish[]> {
    if (!this.shouldMakeApiCall()) {
      return of([]);
    }
    return this.http.get<Wish[]>(`${this.apiUrl}/student/${studentId}/wishlist`, this.httpOptions).pipe(
      catchError(error => {
        console.error('Error fetching wishes:', error);
        return throwError(() => error);
      })
    );
  }

  getStudentShoplist(studentId: number): Observable<Wish[]> {
    if (!this.shouldMakeApiCall()) {
      return of([]);
    }
    return this.http.get<Wish[]>(`${this.apiUrl}/student/${studentId}/shoplist`, this.httpOptions).pipe(
      catchError(error => {
        console.error('Error fetching shoplist:', error);
        return throwError(() => error);
      })
    );
  }

  getApprovedWishes(studentId: number): Observable<Wish[]> {
    if (!this.shouldMakeApiCall()) {
      return of([]);
    }
    return this.http.get<Wish[]>(`${this.apiUrl}/student/${studentId}/approved`, this.httpOptions).pipe(
      catchError(error => {
        console.error('Error fetching approved wishes:', error);
        return throwError(() => error);
      })
    );
  }

  getPurchasableWishes(studentId: number, points: number, level: number): Observable<Wish[]> {
    if (!this.shouldMakeApiCall()) {
      return of([]);
    }
    return this.http.get<Wish[]>(`${this.apiUrl}/student/${studentId}/purchasable`, {
      ...this.httpOptions,
      params: { points: points.toString(), level: level.toString() }
    }).pipe(
      catchError(error => {
        console.error('Error fetching purchasable wishes:', error);
        return throwError(() => error);
      })
    );
  }

  getPendingWishes(): Observable<Wish[]> {
    if (!this.shouldMakeApiCall()) {
      return of([]);
    }
    return this.http.get<Wish[]>(`${this.apiUrl}/pending`, this.httpOptions).pipe(
      catchError(error => {
        console.error('Error fetching pending wishes:', error);
        return throwError(() => error);
      })
    );
  }

  approveWish(wishId: number, parentId: number): Observable<Wish> {
    if (!this.shouldMakeApiCall()) {
      return of({} as Wish);
    }
    return this.http.post<Wish>(`${this.apiUrl}/${wishId}/approve`, null, {
      ...this.httpOptions,
      params: { parentId: parentId.toString() }
    }).pipe(
      catchError(error => {
        console.error('Error approving wish:', error);
        return throwError(() => error);
      })
    );
  }

  removeFromWishlist(wishId: number): Observable<void> {
    if (!this.shouldMakeApiCall()) {
      return of(void 0);
    }
    return this.http.delete<void>(`${this.apiUrl}/${wishId}/wishlist`, this.httpOptions).pipe(
      tap(() => this.refreshWishes()),
      catchError(error => {
        console.error('Error removing from wishlist:', error);
        return throwError(() => error);
      })
    );
  }

  removeFromShoplist(wishId: number): Observable<void> {
    if (!this.shouldMakeApiCall()) {
      return of(void 0);
    }
    return this.http.delete<void>(`${this.apiUrl}/${wishId}/shoplist`, this.httpOptions).pipe(
      catchError(error => {
        console.error('Error removing from shoplist:', error);
        return throwError(() => error);
      })
    );
  }

  getWish(wishId: number): Observable<Wish> {
    if (!this.shouldMakeApiCall()) {
      return of({} as Wish);
    }
    return this.http.get<Wish>(`${this.apiUrl}/${wishId}`, this.httpOptions).pipe(
      catchError(error => {
        console.error('Error fetching wish:', error);
        return throwError(() => error);
      })
    );
  }

  rejectWish(wishId: number, parentId: number): Observable<void> {
    if (!this.shouldMakeApiCall()) {
      return of(void 0);
    }
    const url = `${this.apiUrl}/${wishId}/parent-reject`;
    const options = {
      ...this.httpOptions,
      params: { parentId: parentId.toString() }
    };
    return this.http.post<void>(url, {}, options).pipe(
      catchError(error => {
        console.error('Error rejecting wish:', error);
        return throwError(() => error);
      })
    );
  }

  purchaseWish(wishId: number, studentId: number): Observable<Wish> {
    if (!this.shouldMakeApiCall()) {
      return of({} as Wish);
    }
    return this.http.post<Wish>(`${this.apiUrl}/${wishId}/purchase`, null, {
      ...this.httpOptions,
      params: { studentId: studentId.toString() }
    }).pipe(
      tap((purchasedWish) => {
        purchasedWish.isPurchased = true;
        this.refreshWishes();
      }),
      catchError(error => {
        console.error('Error purchasing wish:', error);
        if (error.error && error.error.message) {
          throw new Error(error.error.message);
        }
        throw new Error('Failed to purchase wish. Please try again.');
      })
    );
  }
} 
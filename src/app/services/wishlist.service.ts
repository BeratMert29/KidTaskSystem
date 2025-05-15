import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WishlistItem {
  wishId: number;
  itemName: string;
  description: string;
  price: number;
  points: number;
  level: number;
  isApproved: boolean;
  imageUrl: string;
  isInWishlist: boolean;
  isInShoplist: boolean;
  createdAt: Date;
  approvedAt?: Date;
  studentModel: any;
  approvedByParent?: any;
  approvedByTeacher?: any;
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private apiUrl = `${environment.apiUrl}/wishlist`;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  getPendingWishlistItems(): Observable<WishlistItem[]> {
    console.log('Fetching pending wishlist items...');
    return this.http.get<WishlistItem[]>(`${this.apiUrl}/pending`, this.httpOptions);
  }

  getStudentWishlist(studentId: number): Observable<WishlistItem[]> {
    return this.http.get<WishlistItem[]>(`${this.apiUrl}/student/${studentId}/wishlist`, this.httpOptions);
  }

  approveWishlistItem(wishId: number, parentId: number): Observable<WishlistItem> {
    return this.http.post<WishlistItem>(`${this.apiUrl}/${wishId}/approve?parentId=${parentId}`, {}, this.httpOptions);
  }

  rejectWishlistItem(wishId: number, parentId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${wishId}/parent-reject?parentId=${parentId}`, {}, this.httpOptions);
  }

  createWishlistItem(item: WishlistItem): Observable<WishlistItem> {
    return this.http.post<WishlistItem>(`${this.apiUrl}/student/${item.studentModel.id}`, item, this.httpOptions);
  }

  removeFromWishlist(wishId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${wishId}/wishlist`, this.httpOptions);
  }
} 
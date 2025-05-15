import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ShopItem } from '../models/shop-item.model';

@Injectable({
  providedIn: 'root'
})
export class ShopItemService {
  private apiUrl = `${environment.apiUrl}/shop-items`;

  constructor(private http: HttpClient) {}

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  // Get all shop items
  getShopItems(): Observable<ShopItem[]> {
    return this.http.get<ShopItem[]>(this.apiUrl).pipe(
      tap(items => console.log('Fetched shop items:', items)),
      catchError(this.handleError)
    );
  }

  // Get shop items created by a specific teacher/parent
  getShopItemsByCreator(creatorId: number): Observable<ShopItem[]> {
    return this.http.get<ShopItem[]>(`${this.apiUrl}/creator/${creatorId}`).pipe(
      tap(items => console.log('Fetched creator shop items:', items)),
      catchError(this.handleError)
    );
  }

  // Create a new shop item
  createShopItem(item: Partial<ShopItem>): Observable<ShopItem> {
    return this.http.post<ShopItem>(this.apiUrl, item, this.httpOptions).pipe(
      tap(newItem => console.log('Created shop item:', newItem)),
      catchError(this.handleError)
    );
  }

  // Update an existing shop item
  updateShopItem(id: number, item: Partial<ShopItem>): Observable<ShopItem> {
    return this.http.put<ShopItem>(`${this.apiUrl}/${id}`, item, this.httpOptions).pipe(
      tap(updatedItem => console.log('Updated shop item:', updatedItem)),
      catchError(this.handleError)
    );
  }

  // Delete a shop item
  deleteShopItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => console.log('Deleted shop item:', id)),
      catchError(this.handleError)
    );
  }

  // Update points for a shop item
  updatePoints(id: number, points: number): Observable<ShopItem> {
    return this.http.patch<ShopItem>(`${this.apiUrl}/${id}/points`, { points }, this.httpOptions).pipe(
      tap(updatedItem => console.log('Updated points for shop item:', updatedItem)),
      catchError(this.handleError)
    );
  }

  // Approve a shop item
  approveShopItem(id: number): Observable<ShopItem> {
    return this.http.patch<ShopItem>(`${this.apiUrl}/${id}/approve`, {}, this.httpOptions).pipe(
      tap(approvedItem => console.log('Approved shop item:', approvedItem)),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => new Error(error.message || 'An error occurred'));
  }
} 
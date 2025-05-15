import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { ApiService, LoginResponse, LoginUserData } from './api.service';
import { isPlatformBrowser } from '@angular/common';
import { UserRole } from '../models/user-role.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  email?: string;
  points?: number;
  level?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<LoginUserData | null>;
  public currentUser$: Observable<LoginUserData | null>;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private isBrowser: boolean;
  private readonly USER_KEY = 'currentUser';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object,
    private http: HttpClient
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    let storedUser = null;
    if (this.isBrowser) {
      const storedUserStr = localStorage.getItem(this.USER_KEY);
      if (storedUserStr) {
        try {
          storedUser = JSON.parse(storedUserStr);
        } catch (e) {
          console.error('Error parsing stored user:', e);
          localStorage.removeItem(this.USER_KEY);
        }
      }
    }
    
    this.currentUserSubject = new BehaviorSubject<LoginUserData | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isAuthenticatedSubject.next(!!storedUser);
  }

  public get currentUserValue(): LoginUserData | null {
    return this.currentUserSubject.value;
  }

  getCurrentUser(): LoginUserData | null {
    const user = this.currentUserSubject.value;
    
    // If not available from the BehaviorSubject and we're in browser context
    if (!user && this.isBrowser) {
      try {
        const storedUser = localStorage.getItem(this.USER_KEY);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Ensure points and level are set
          const initializedUser: LoginUserData = {
            ...parsedUser,
            points: parsedUser.points || 0,
            level: parsedUser.level || 1
          };
          // Update the BehaviorSubject with the stored user
          this.setCurrentUser(initializedUser);
          return initializedUser;
        }
      } catch (error) {
        console.error('Error retrieving user from localStorage:', error);
        // Clear potentially corrupted data
        localStorage.removeItem(this.USER_KEY);
        this.setCurrentUser(null);
      }
    }
    
    return user;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  login(username: string, password: string): Observable<LoginUserData> {
    return this.apiService.login(username, password).pipe(
      map(response => {
        const userData: LoginUserData = {
          id: response.id,
          username: response.username,
          role: response.role,
          points: response.points,
          level: response.level
        };
        this.setCurrentUser(userData);
        return userData;
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(username: string, password: string, role: UserRole): Observable<LoginUserData> {
    return this.apiService.register(username, password, role).pipe(
      map(response => {
        const userData: LoginUserData = {
          id: response.id,
          username: response.username,
          role: role,
          points: response.points,
          level: response.level
        };
        this.setCurrentUser(userData);
        return userData;
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  private setCurrentUser(user: LoginUserData | null): void {
    if (this.isBrowser) {
      if (user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.USER_KEY);
      }
    }
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(!!user);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  getCurrentUserRole(): UserRole | null {
    return this.currentUserValue?.role || null;
  }

  updateUserPoints(points: number): void {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      const updatedUser = { 
        ...currentUser, 
        points: points || 0  // Ensure points is never undefined
      };
      this.setCurrentUser(updatedUser);
    }
  }

  updateUserLevel(level: number): void {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      const updatedUser = { 
        ...currentUser, 
        level: level || 1  // Ensure level is never undefined
      };
      this.setCurrentUser(updatedUser);
    }
  }
} 
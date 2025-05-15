import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';
import { UserRole } from '../models/user-role.model';

export interface LoginUserData {
  id: number;
  username: string;
  role: UserRole;
  points?: number;
  level?: number;
}

export interface LoginResponse {
  id: number;
  username: string;
  role: UserRole;
  points?: number;
  level?: number;
}

export interface ErrorResponse {
  message: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api'; // Spring Boot default port
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }),
    withCredentials: true
  };

  constructor(private http: HttpClient) {
    // Log when service is initialized
    console.log('ApiService initialized with baseUrl:', this.baseUrl);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.error && typeof error.error === 'object' && 'message' in error.error) {
        errorMessage = error.error.message;
      } else if (error.error && typeof error.error === 'string') {
        errorMessage = error.error;
      } else {
        errorMessage = `Server Error: ${error.status} ${error.statusText}`;
      }
    }
    
    console.error('Error details:', {
      status: error.status,
      statusText: error.statusText,
      error: error.error,
      message: errorMessage
    });
    
    return throwError(() => new Error(errorMessage));
  }

  login(username: string, password: string): Observable<LoginResponse> {
    const url = `${this.baseUrl}/login`;
    console.log('Attempting login to:', url);
    
    return this.http.post<LoginResponse>(url, { username, password }, this.httpOptions).pipe(
      timeout(10000), // Increased timeout to 10 seconds
      tap(response => console.log('Login response:', response)),
      catchError(this.handleError)
    );
  }

  register(username: string, password: string, role: UserRole): Observable<LoginResponse> {
    const url = `${this.baseUrl}/register/${role}`;
    console.log('Attempting registration to:', url);
    
    return this.http.post<LoginResponse>(url, { username, password }, this.httpOptions).pipe(
      timeout(10000), // Increased timeout to 10 seconds
      tap(response => {
        console.log('Register response:', response);
        // Add role to the response if not present
        if (!response.role) {
          response.role = role;
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  testConnection(): Observable<string> {
    const url = `${this.baseUrl}/test`;
    console.log('Testing connection to:', url);
    
    return this.http.get<string>(url, this.httpOptions).pipe(
      timeout(5000),
      tap(response => console.log('Connection test successful:', response)),
      catchError(this.handleError)
    );
  }
} 
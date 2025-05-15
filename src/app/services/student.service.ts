import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/students`;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }),
    withCredentials: true
  };

  constructor(private http: HttpClient) {}

  getStudentPoints(studentId: number): Observable<number> {
    console.log('Fetching points for student:', studentId);
    return this.http.get<number>(`${this.apiUrl}/${studentId}/points`, this.httpOptions).pipe(
      tap(points => console.log('Received points:', points)),
      catchError(error => {
        console.error('Error getting student points:', error);
        if (error.status) {
          console.error('HTTP Status:', error.status);
        }
        if (error.statusText) {
          console.error('Status Text:', error.statusText);
        }
        if (error.error) {
          console.error('Error details:', error.error);
        }
        return throwError(() => error);
      })
    );
  }
} 
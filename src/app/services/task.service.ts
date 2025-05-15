import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, Subject } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { Task } from '../models/task.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;
  private isBrowser: boolean;
  private studentDashboardRefreshSubject = new Subject<void>();
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // Helper method to check if we should make API calls
  private shouldMakeApiCall(): Observable<any> | null {
    // Skip API calls during server-side rendering
    if (!this.isBrowser) {
      console.log('Skipping API call during server-side rendering');
      return of([]); // Return empty array instead of null
    }
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser || !currentUser.id) {
      return throwError(() => new Error('User not authenticated'));
    }
    return null;
  }

  getAllTasks(): Observable<Task[]> {
    const skipCall = this.shouldMakeApiCall();
    if (skipCall) return skipCall;
    
    return this.http.get<Task[]>(this.apiUrl, this.httpOptions);
  }

  getTasksByUser(userId: number): Observable<Task[]> {
    const skipCall = this.shouldMakeApiCall();
    if (skipCall) return skipCall;
    
    return this.http.get<Task[]>(`${this.apiUrl}/tasks/user/${userId}`, this.httpOptions);
  }

  getStudentTasks(username: string): Observable<Task[]> {
    const skipCall = this.shouldMakeApiCall();
    if (skipCall) return skipCall as Observable<Task[]>;
    
    console.log(`Fetching tasks for student: ${username}`);
    return this.http.get<Task[]>(`${this.apiUrl}/student/${username}`, this.httpOptions).pipe(
      tap(tasks => {
        console.log(`Retrieved ${tasks.length} tasks for student: ${username}`);
        tasks.forEach(task => {
          console.log(`Task: ID=${task.id}, Title=${task.title}, Status=${task.status}`);
        });
      }),
      catchError(error => {
        console.error('Error fetching student tasks:', error);
        if (error.error) {
          console.error('Backend error details:', error.error);
        }
        return throwError(() => error);
      })
    );
  }

  getStudentTasksById(studentId: number): Observable<Task[]> {
    const skipCall = this.shouldMakeApiCall();
    if (skipCall) return skipCall;
    
    console.log(`Fetching tasks for student ID: ${studentId}`);
    return this.http.get<Task[]>(`${this.apiUrl}/student/id/${studentId}`, this.httpOptions).pipe(
      tap(tasks => {
        console.log(`Retrieved ${tasks.length} tasks for student ID: ${studentId}`);
        tasks.forEach(task => {
          console.log(`Task: ID=${task.id}, Title=${task.title}, Status=${task.status}`);
        });
      }),
      catchError(error => {
        console.error('Error fetching student tasks by ID:', error);
        if (error.error) {
          console.error('Backend error details:', error.error);
        }
        return throwError(() => error);
      })
    );
  }

  getCompletedTasks(): Observable<Task[]> {
    const skipCall = this.shouldMakeApiCall();
    if (skipCall) return skipCall;
    
    // Get the current user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const username = currentUser.username;
    
    if (!username) {
      console.error('User not found in localStorage');
      return throwError(() => new Error('User not available'));
    }
    
    console.log(`Fetching completed tasks for user: ${username}`);
    return this.http.get<Task[]>(`${this.apiUrl}/student/${username}`, this.httpOptions).pipe(
      tap(tasks => {
        console.log(`Retrieved ${tasks.length} tasks`);
        tasks.forEach(task => {
          console.log(`Task: ID=${task.id}, Title=${task.title}, Status=${task.status}`);
        });
      }),
      catchError(error => {
        console.error('Error fetching completed tasks:', error);
        if (error.error) {
          console.error('Backend error details:', error.error);
        }
        return throwError(() => new Error('Failed to fetch completed tasks. Please try again.'));
      })
    );
  }

  getStudents(): Observable<any[]> {
    const skipCall = this.shouldMakeApiCall();
    if (skipCall) return skipCall;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser || !currentUser.id) {
      return throwError(() => new Error('User not authenticated'));
    }

    let url: string;
    if (currentUser.role === 'teacher') {
      url = `${this.apiUrl}/teacher/${currentUser.id}/students`;
    } else if (currentUser.role === 'parent') {
      url = `${this.apiUrl}/parent/${currentUser.id}/students`;
    } else {
      return throwError(() => new Error('Invalid user role'));
    }

    console.log('TaskService: Fetching students from', url);
    
    return this.http.get<any[]>(url, this.httpOptions).pipe(
      tap(response => {
        console.log('Raw student response:', response);
        if (!response) {
          console.warn('No students found in response');
        } else {
          console.log(`Found ${response.length} students`);
          response.forEach(student => {
            console.log(`Student: ID=${student.id}, Username=${student.username}`);
          });
        }
      }),
      catchError(error => {
        console.error('Error fetching students:', error);
        if (error.error) {
          console.error('Backend error details:', error.error);
        }
        return throwError(() => new Error('Failed to load students. Please try again.'));
      })
    );
  }

  createTask(task: Task): Observable<Task> {
    const skipCall = this.shouldMakeApiCall();
    if (skipCall) return skipCall;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser || !currentUser.id) {
      return throwError(() => new Error('User not authenticated'));
    }
    
    // Format the task data to match the backend's TaskModel
    const taskData = {
      title: task.title,
      description: task.description,
      reward: task.reward,
      deadline: task.deadline instanceof Date ? task.deadline.toISOString() : task.deadline,
      duration: task.duration,
      assignedTo: {
        id: task.assignedTo.id,
        username: task.assignedTo.username
      },
      status: 'pending',
      assignedBy: currentUser.username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Creating task with data:', taskData);
    
    if (currentUser.role === 'teacher') {
      return this.http.post<Task>(`${this.apiUrl}/teacher/${currentUser.id}`, taskData, this.httpOptions).pipe(
        tap(response => {
          console.log('Task creation response:', response);
        }),
        catchError(error => {
          console.error('Task creation error:', error);
          if (error.error) {
            console.error('Backend error details:', error.error);
          }
          return throwError(() => new Error(`Failed to create task: ${error.message}`));
        })
      );
    } else if (currentUser.role === 'parent') {
      return this.http.post<Task>(`${this.apiUrl}/parent/${currentUser.id}`, taskData, this.httpOptions).pipe(
        tap(response => {
          console.log('Task creation response:', response);
        }),
        catchError(error => {
          console.error('Task creation error:', error);
          if (error.error) {
            console.error('Backend error details:', error.error);
          }
          return throwError(() => new Error(`Failed to create task: ${error.message}`));
        })
      );
    } else {
      return throwError(() => new Error('Invalid user role'));
    }
  }

  updateTask(id: number, task: Task): Observable<Task> {
    const skipCall = this.shouldMakeApiCall();
    if (skipCall) return skipCall;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser || !currentUser.id) {
      return throwError(() => new Error('User not authenticated'));
    }

    // Format the task data to match the backend's TaskModel
    const taskData = {
      id: id, // Include the task ID
      title: task.title,
      description: task.description,
      reward: task.reward,
      deadline: task.deadline instanceof Date ? task.deadline.toISOString() : task.deadline,
      duration: task.duration,
      assignedTo: {
        id: task.assignedTo.id,
        username: task.assignedTo.username,
        role: 'STUDENT'
      },
      status: task.status || 'pending',
      assignedBy: currentUser.username,
      createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : task.createdAt,
      updatedAt: new Date().toISOString()
    };

    console.log('Updating task with data:', taskData);
    console.log('Current user:', currentUser);

    // Use the correct endpoint based on user role
    let endpoint: string;
    if (currentUser.role === 'parent') {
      endpoint = `${this.apiUrl}/parent/${currentUser.id}/update/${id}`;
    } else if (currentUser.role === 'teacher') {
      endpoint = `${this.apiUrl}/teacher/${currentUser.id}/update/${id}`;
    } else {
      return throwError(() => new Error('Invalid user role'));
    }

    console.log('Using endpoint:', endpoint);

    return this.http.put<Task>(endpoint, taskData, this.httpOptions).pipe(
      tap(response => {
        console.log('Task update response:', response);
      }),
      catchError(error => {
        console.error('Task update error:', error);
        if (error.error) {
          console.error('Backend error details:', error.error);
          // Log the request payload for debugging
          console.error('Request payload:', taskData);
        }
        return throwError(() => new Error(error.error?.message || `Failed to update task: ${error.message}`));
      })
    );
  }

  deleteTask(id: number): Observable<void> {
    const skipCall = this.shouldMakeApiCall();
    if (skipCall) return skipCall;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser || !currentUser.id) {
      return throwError(() => new Error('User not authenticated'));
    }

    console.log(`Attempting to delete task ${id}`);

    // Use the correct endpoint based on user role
    if (currentUser.role === 'parent') {
      return this.http.delete<void>(`${this.apiUrl}/parent/${currentUser.id}/task/${id}`, this.httpOptions).pipe(
        tap(() => {
          console.log('Task deleted successfully');
        }),
        catchError(error => {
          console.error('Task deletion error:', error);
          if (error.error) {
            console.error('Backend error details:', error.error);
          }
          return throwError(() => new Error(`Failed to delete task: ${error.message}`));
        })
      );
    } else if (currentUser.role === 'teacher') {
      return this.http.delete<void>(`${this.apiUrl}/teacher/${currentUser.id}/task/${id}`, this.httpOptions).pipe(
        tap(() => {
          console.log('Task deleted successfully');
        }),
        catchError(error => {
          console.error('Task deletion error:', error);
          if (error.error) {
            console.error('Backend error details:', error.error);
          }
          return throwError(() => new Error(`Failed to delete task: ${error.message}`));
        })
      );
    } else {
      return throwError(() => new Error('Invalid user role'));
    }
  }

  completeTask(id: number): Observable<Task> {
    const skipCall = this.shouldMakeApiCall();
    if (skipCall) return skipCall;
    
    // Get the current student ID from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const studentId = currentUser.id;
    
    if (!studentId) {
      console.error('Student ID not found in localStorage');
      return throwError(() => new Error('Student ID not available'));
    }
    
    // Use the updated endpoint path
    return this.http.put<Task>(`${this.apiUrl}/student/${studentId}/task/${id}/complete`, {}, this.httpOptions).pipe(
      tap(task => {
        console.log('Task marked as awaiting approval:', task);
      }),
      catchError(error => {
        console.error('Error completing task:', error);
        return throwError(() => new Error('Failed to submit task for approval. Please try again.'));
      })
    );
  }

  reviewTask(taskId: number, reviewData: { status: string; rating?: number; feedback?: string }): Observable<Task> {
    const skipCall = this.shouldMakeApiCall();
    if (skipCall) return skipCall;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser || !currentUser.id) {
      return throwError(() => new Error('User not authenticated'));
    }

    let endpoint: string;
    if (currentUser.role === 'parent') {
      if (reviewData.status === 'approved') {
        endpoint = `${this.apiUrl}/parent/${currentUser.id}/approve/${taskId}`;
      } else {
        endpoint = `${this.apiUrl}/parent/${currentUser.id}/reject/${taskId}`;
      }
    } else if (currentUser.role === 'teacher') {
      if (reviewData.status === 'approved') {
        endpoint = `${this.apiUrl}/teacher/${currentUser.id}/approve/${taskId}`;
      } else {
        endpoint = `${this.apiUrl}/teacher/${currentUser.id}/reject/${taskId}`;
      }
    } else {
      return throwError(() => new Error('Invalid user role'));
    }

    return this.http.put<Task>(endpoint, reviewData, this.httpOptions).pipe(
      tap(task => {
        console.log('Task reviewed:', task);
      }),
      catchError(error => {
        console.error('Error reviewing task:', error);
        return throwError(() => new Error('Failed to review task. Please try again.'));
      })
    );
  }

  rateTask(taskId: number, rating: number): Observable<Task> {
    const skipCall = this.shouldMakeApiCall();
    if (skipCall) return skipCall;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser || !currentUser.id) {
      return throwError(() => new Error('User not authenticated'));
    }

    let endpoint: string;
    if (currentUser.role === 'parent') {
      endpoint = `${this.apiUrl}/parent/${currentUser.id}/task/${taskId}/rate`;
    } else if (currentUser.role === 'teacher') {
      endpoint = `${this.apiUrl}/teacher/${currentUser.id}/task/${taskId}/rate`;
    } else {
      return throwError(() => new Error('Invalid user role'));
    }

    return this.http.put<Task>(endpoint, { rating }, this.httpOptions).pipe(
      tap(task => {
        console.log('Task rated:', task);
      }),
      catchError(error => {
        console.error('Error rating task:', error);
        return throwError(() => new Error('Failed to rate task. Please try again.'));
      })
    );
  }

  getTask(id: number): Observable<Task> {
    const skipCall = this.shouldMakeApiCall();
    if (skipCall) return skipCall;
    
    return this.http.get<Task>(`${this.apiUrl}/${id}`, this.httpOptions);
  }

  getTasksAwaitingParentApproval(parentId: number): Observable<Task[]> {
    const skipCall = this.shouldMakeApiCall();
    if (skipCall) return skipCall;
    
    // Get the current user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const username = currentUser.username;
    
    if (!username) {
      console.error('Parent username not found in localStorage');
      return throwError(() => new Error('Parent username not available'));
    }
    
    console.log(`Fetching tasks awaiting parent approval for parent username: ${username}`);
    return this.http.get<Task[]>(`${this.apiUrl}/parent/${parentId}/tasks`, this.httpOptions).pipe(
      tap(tasks => {
        console.log(`Retrieved ${tasks.length} tasks awaiting approval`);
        tasks.forEach(task => {
          console.log(`Task: ID=${task.id}, Title=${task.title}, Status=${task.status}`);
        });
      }),
      catchError(error => {
        console.error('Error fetching tasks awaiting approval:', error);
        if (error.error) {
          console.error('Backend error details:', error.error);
        }
        return throwError(() => new Error('Failed to fetch tasks. Please try again.'));
      })
    );
  }

  getParentTasks(username: string): Observable<Task[]> {
    const skipCall = this.shouldMakeApiCall();
    if (skipCall) return skipCall;
    
    console.log(`Fetching tasks for parent username: ${username}`);
    return this.http.get<Task[]>(`${this.apiUrl}/parent/username/${username}/all-tasks`, this.httpOptions).pipe(
      tap(tasks => {
        console.log(`Retrieved ${tasks.length} tasks for parent`);
        tasks.forEach(task => {
          console.log(`Task: ID=${task.id}, Title=${task.title}, Status=${task.status}`);
        });
      }),
      catchError(error => {
        console.error('Error fetching parent tasks:', error);
        if (error.error) {
          console.error('Backend error details:', error.error);
        }
        return throwError(() => new Error('Failed to fetch tasks. Please try again.'));
      })
    );
  }

  getTasksAwaitingTeacherApproval(username: string): Observable<Task[]> {
    const skipCall = this.shouldMakeApiCall();
    if (skipCall) return skipCall;
    
    console.log(`Fetching tasks awaiting teacher approval for username: ${username}`);
    return this.http.get<Task[]>(`${this.apiUrl}/teacher/${username}/review`, this.httpOptions).pipe(
      tap(tasks => {
        console.log(`Retrieved ${tasks.length} tasks awaiting approval`);
        tasks.forEach(task => {
          console.log(`Task: ID=${task.id}, Title=${task.title}, Status=${task.status}`);
        });
      }),
      catchError(error => {
        console.error('Error fetching tasks awaiting approval:', error);
        if (error.error) {
          console.error('Backend error details:', error.error);
        }
        return throwError(() => new Error('Failed to fetch tasks. Please try again.'));
      })
    );
  }

  getTeacherTasks(username: string): Observable<Task[]> {
    const skipCall = this.shouldMakeApiCall();
    if (skipCall) return skipCall;
    
    console.log(`Fetching tasks for teacher username: ${username}`);
    return this.http.get<Task[]>(`${this.apiUrl}/teacher/username/${username}/all-tasks`, this.httpOptions).pipe(
      tap(tasks => {
        console.log(`Retrieved ${tasks.length} tasks for teacher`);
        tasks.forEach(task => {
          console.log(`Task: ID=${task.id}, Title=${task.title}, Status=${task.status}`);
        });
      }),
      catchError(error => {
        console.error('Error fetching teacher tasks:', error);
        if (error.error) {
          console.error('Backend error details:', error.error);
        }
        return throwError(() => new Error('Failed to fetch tasks. Please try again.'));
      })
    );
  }

  getPendingTasks(username: string): Observable<Task[]> {
    const skipCall = this.shouldMakeApiCall();
    if (skipCall) return skipCall;
    
    console.log(`Fetching pending tasks for username: ${username}`);
    return this.http.get<Task[]>(`${this.apiUrl}/pending/${username}`, this.httpOptions).pipe(
      tap(tasks => {
        console.log(`Retrieved ${tasks.length} pending tasks`);
        tasks.forEach(task => {
          console.log(`Task: ID=${task.id}, Title=${task.title}, Status=${task.status}`);
        });
      }),
      catchError(error => {
        console.error('Error fetching pending tasks:', error);
        if (error.error) {
          console.error('Backend error details:', error.error);
        }
        return throwError(() => new Error('Failed to fetch pending tasks. Please try again.'));
      })
    );
  }

  // Add method to refresh student dashboard
  refreshStudentDashboard(): void {
    this.studentDashboardRefreshSubject.next();
  }

  // Add observable for dashboard refresh
  getStudentDashboardRefresh(): Observable<void> {
    return this.studentDashboardRefreshSubject.asObservable();
  }
} 
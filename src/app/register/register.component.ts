import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';

interface Student {
  id: number;
  username: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  userType: 'student' | 'parent' | 'teacher' = 'student';
  availableStudents: Student[] = [];
  filteredStudents: Student[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  searchTerm: string = '';
  private searchSubject = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      studentId: [null]
    });

    // Setup search with debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.filterStudents(term);
    });
  }

  ngOnInit() {
    // Load available students when component initializes
    this.loadAvailableStudents();
  }

  onUserTypeChange(type: 'student' | 'parent' | 'teacher') {
    this.userType = type;
    this.registerForm.patchValue({ studentId: null });
    this.searchTerm = '';
    this.filteredStudents = [];
    
    // Update studentId validation based on user type
    const studentIdControl = this.registerForm.get('studentId');
    if (type === 'student') {
      studentIdControl?.clearValidators();
    } else {
      studentIdControl?.setValidators([Validators.required]);
    }
    studentIdControl?.updateValueAndValidity();
    
    // Only load students for parent/teacher registration
    if (type !== 'student') {
      this.loadAvailableStudents();
    }
  }

  loadAvailableStudents() {
    this.http.get<Student[]>('http://localhost:8080/api/register/available-students')
      .subscribe({
        next: (students) => {
          this.availableStudents = students;
          this.filteredStudents = students;
        },
        error: (error) => {
          this.errorMessage = 'Error loading available students';
          console.error('Error loading students:', error);
        }
      });
  }

  onSearchChange(term: string) {
    this.searchSubject.next(term);
  }

  filterStudents(term: string) {
    if (!term.trim()) {
      this.filteredStudents = this.availableStudents;
      return;
    }
    
    this.filteredStudents = this.availableStudents.filter(student => 
      student.username.toLowerCase().includes(term.toLowerCase())
    );
  }

  selectStudent(student: Student) {
    this.registerForm.patchValue({ studentId: student.id });
    this.searchTerm = student.username;
    this.filteredStudents = [];
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const formData = this.registerForm.value;
      let endpoint = '';

      switch (this.userType) {
        case 'student':
          endpoint = 'http://localhost:8080/api/register/student';
          break;
        case 'parent':
          endpoint = 'http://localhost:8080/api/register/parent';
          break;
        case 'teacher':
          endpoint = 'http://localhost:8080/api/register/teacher';
          break;
      }

      this.http.post(endpoint, formData)
        .subscribe({
        next: (response) => {
            this.successMessage = 'Registration successful!';
            this.errorMessage = '';
            // Redirect to login after successful registration
            setTimeout(() => {
          this.router.navigate(['/login']);
            }, 2000);
        },
        error: (error) => {
            this.errorMessage = error.error?.message || 'Registration failed';
            this.successMessage = '';
          }
        });
    }
  }
} 
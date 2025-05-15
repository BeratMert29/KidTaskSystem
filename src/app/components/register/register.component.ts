import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterService } from '../../services/register.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  userType: string = 'student';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private registerService: RegisterService,
    private router: Router
  ) { }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    const registerMethod = this.getRegisterMethod();
    registerMethod(this.username, this.password).subscribe({
      next: (response) => {
        this.successMessage = 'Registration successful!';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.error || 'Registration failed';
      }
    });
  }

  private getRegisterMethod() {
    switch (this.userType) {
      case 'student':
        return this.registerService.registerStudent.bind(this.registerService);
      case 'parent':
        return this.registerService.registerParent.bind(this.registerService);
      case 'teacher':
        return this.registerService.registerTeacher.bind(this.registerService);
      default:
        return this.registerService.registerStudent.bind(this.registerService);
    }
  }
} 
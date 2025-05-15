import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-task-create',
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class TaskCreateComponent implements OnInit {
  taskForm: FormGroup;
  tasks: Task[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  isEditing: boolean = false;
  editingTaskId?: number;
  students: any[] = [];
  currentUser: any;
  private isBrowser: boolean;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      reward: ['', [Validators.required, Validators.min(0)]],
      deadline: ['', Validators.required],
      duration: [''],
      assignedTo: ['']
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadTasks();
    this.loadStudents();
  }

  loadCurrentUser(): void {
    // First try to get from AuthService
    this.currentUser = this.authService.getCurrentUser();
    
    // If not found in AuthService, try localStorage
    if (!this.currentUser && this.isBrowser) {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          try {
            this.currentUser = JSON.parse(storedUser);
            console.log('Using user from localStorage:', this.currentUser);
          } catch (error) {
            console.error('Error parsing user from localStorage:', error);
          }
        }
      }

    // If still no user found, show error
    if (!this.currentUser) {
      console.error('No current user found in AuthService or localStorage');
      this.errorMessage = 'Please log in to continue.';
    }
  }

  loadStudents(): void {
    if (!this.currentUser) {
      console.error('No current user found');
      this.errorMessage = 'Please log in to continue.';
      return;
    }

    console.log('Loading students...');
    console.log('Current environment API URL:', environment.apiUrl);
    
    this.taskService.getStudents().subscribe({
      next: (students) => {
        console.log('Raw students response:', students);
        if (!students) {
          console.warn('No students found in the response');
          this.errorMessage = 'No students found. Please add students first.';
          return;
        }
        if (students.length === 0) {
          console.warn('Empty students array received');
          if (this.currentUser.role === 'teacher') {
            this.errorMessage = 'No students assigned to you yet. Please contact the administrator.';
          } else if (this.currentUser.role === 'parent') {
            this.errorMessage = 'No children registered under your account. Please contact the administrator.';
          } else {
          this.errorMessage = 'No students available. Please add students first.';
          }
          return;
        }
        console.log('Students loaded successfully:', students);
        this.students = students;
      },
      error: (error) => {
        console.error('Error loading students:', error);
        if (error.error) {
          console.error('Backend error details:', error.error);
        }
        if (error.status) {
          console.error('HTTP Status:', error.status);
        }
        if (error.statusText) {
          console.error('Status Text:', error.statusText);
        }
        this.errorMessage = error.message || 'Failed to load students. Please try again.';
      }
    });
  }

  loadTasks(): void {
    if (!this.currentUser) {
      console.error('No current user found');
      return;
    }

    this.taskService.getPendingTasks(this.currentUser.username).subscribe({
        next: (tasks: Task[]) => {
          this.tasks = tasks;
        console.log('Loaded pending tasks:', tasks);
        },
        error: (error: any) => {
        console.error('Error loading pending tasks:', error);
        this.errorMessage = 'Failed to load tasks. Please try again.';
        }
      });
  }

  onSubmit(): void {
    if (!this.currentUser) {
      this.loadCurrentUser();
      if (!this.currentUser) {
        this.errorMessage = 'Please log in to create tasks.';
        return;
      }
    }
    
    if (this.taskForm.valid) {
      const studentId = this.taskForm.value.assignedTo;
      
      // Find the student object if we have a studentId
      let student = null;
      if (studentId) {
        student = this.students.find(s => s.id.toString() === studentId.toString());
      if (!student) {
        this.errorMessage = 'Selected student not found.';
        console.error('Student not found with ID:', studentId);
        return;
        }
      }
      
      const deadlineDate = new Date(this.taskForm.value.deadline);
      console.log('Parsed deadline date:', deadlineDate);
      
      // Find the current task if we're editing
      let currentTask: Task | undefined;
      if (this.isEditing && this.editingTaskId) {
        currentTask = this.tasks.find(t => t.id === this.editingTaskId);
        console.log('Current task being edited:', currentTask);
        
        // Check if task can be edited
        if (currentTask && currentTask.status !== 'pending') {
          this.errorMessage = `Cannot edit task in ${currentTask.status} status. Only pending tasks can be edited.`;
          return;
        }
      }
      
      const taskData: Task = {
        id: this.editingTaskId,
        title: this.taskForm.value.title,
        description: this.taskForm.value.description,
        reward: parseFloat(this.taskForm.value.reward),
        deadline: deadlineDate,
        duration: this.taskForm.value.duration ? parseInt(this.taskForm.value.duration) : undefined,
        assignedTo: student ? {
          id: parseInt(studentId),
          username: student.username,
          role: 'STUDENT'
        } : (currentTask?.assignedTo || {
          id: 0,
          username: 'Unknown',
          role: 'STUDENT'
        }),
        status: 'pending', // Always set to pending for updates
        createdAt: currentTask?.createdAt || new Date(),
        updatedAt: new Date()
      };

      console.log('Prepared task data:', taskData);

      if (this.isEditing && this.editingTaskId) {
        console.log('Updating task with ID:', this.editingTaskId);
        this.taskService.updateTask(this.editingTaskId, taskData).subscribe({
          next: (response) => {
            console.log('Task update response:', response);
            this.successMessage = 'Task updated successfully!';
            this.resetForm();
            this.loadTasks();
            this.taskService.refreshStudentDashboard();
          },
          error: (error) => {
            console.error('Task update error details:', {
              status: error.status,
              statusText: error.statusText,
              error: error.error,
              message: error.message
            });
            if (error.error && error.error.message) {
              this.errorMessage = error.error.message;
            } else {
            this.errorMessage = 'Failed to update task. Please try again.';
            }
          }
        });
      } else {
        console.log('Creating new task');
        this.taskService.createTask(taskData).subscribe({
          next: (response) => {
            console.log('Task creation response:', response);
            this.successMessage = 'Task created successfully!';
            this.resetForm();
            this.loadTasks();
            this.taskService.refreshStudentDashboard();
          },
          error: (error) => {
            console.error('Task creation error details:', {
              status: error.status,
              statusText: error.statusText,
              error: error.error,
              message: error.message
            });
            if (error.error && error.error.message) {
              this.errorMessage = error.error.message;
            } else {
              this.errorMessage = 'Failed to create task. Please try again.';
            }
          }
        });
      }
    } else {
      console.log('Form validation errors:', this.taskForm.errors);
      Object.keys(this.taskForm.controls).forEach(key => {
        const control = this.taskForm.get(key);
        if (control?.errors) {
          console.log(`Validation errors for ${key}:`, control.errors);
        }
      });
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  editTask(task: Task): void {
    // Ensure we have the current user before proceeding
    if (!this.currentUser) {
      this.loadCurrentUser();
      if (!this.currentUser) {
        this.errorMessage = 'Please log in to edit tasks.';
        return;
      }
    }

    console.log('Editing task:', task);
    console.log('Task deadline:', task.deadline);
    console.log('Task assignedTo:', task.assignedTo);
    
    // Check if task can be edited
    if (task.status !== 'pending') {
      this.errorMessage = `Cannot edit task in ${task.status} status. Only pending tasks can be edited.`;
      return;
    }
    
    this.isEditing = true;
    this.editingTaskId = task.id;
    
    // Format the deadline for the input field
    let deadline: Date;
    try {
      deadline = task.deadline instanceof Date ? task.deadline : new Date(task.deadline);
      console.log('Parsed deadline:', deadline);
    } catch (error) {
      console.error('Error parsing deadline:', error);
      deadline = new Date();
    }
    
    const formattedDeadline = deadline.toISOString().split('T')[0];
    console.log('Formatted deadline:', formattedDeadline);

    // If students aren't loaded yet, load them first
    if (this.students.length === 0) {
      this.loadStudents();
      // Wait for students to load before setting form values
      const checkStudents = setInterval(() => {
        if (this.students.length > 0) {
          clearInterval(checkStudents);
          this.setFormValues(task, formattedDeadline);
        }
      }, 100);
    } else {
      this.setFormValues(task, formattedDeadline);
    }
  }

  private setFormValues(task: Task, formattedDeadline: string): void {
    // Prepare form values
    const formValues = {
      title: task.title || '',
      description: task.description || '',
      reward: task.reward?.toString() || '0',
      deadline: formattedDeadline,
      duration: task.duration?.toString() || '0',
      assignedTo: task.assignedTo?.id?.toString() || ''
    };
    
    console.log('Setting form values:', formValues);
    
    // Update the form with the task data
    this.taskForm.patchValue(formValues);
    
    // Verify form values were set
    console.log('Form values after patch:', this.taskForm.value);
    
    // Mark form as touched to show validation
    Object.keys(this.taskForm.controls).forEach(key => {
      const control = this.taskForm.get(key);
      control?.markAsTouched();
    });

    // Scroll to the form section
    const formSection = document.querySelector('.task-form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  deleteTask(task: Task): void {
    if (task.id && confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(task.id).subscribe({
        next: () => {
          this.successMessage = 'Task deleted successfully!';
          this.loadTasks();
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete task. Please try again.';
        }
      });
    }
  }

  resetForm(): void {
    this.taskForm.reset();
    this.isEditing = false;
    this.editingTaskId = undefined;
  }

  private formatDateForInput(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'completed': return 'status-completed';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  }
} 
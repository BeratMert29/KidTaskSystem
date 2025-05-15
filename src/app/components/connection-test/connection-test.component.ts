import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-connection-test',
  template: `
    <div class="connection-test">
      <h2>Backend Connection Test</h2>
      <button (click)="testConnection()">Test Connection</button>
      <div *ngIf="message" [class]="isError ? 'error' : 'success'">
        {{ message }}
      </div>
    </div>
  `,
  styles: [`
    .connection-test {
      padding: 20px;
      text-align: center;
    }
    button {
      padding: 10px 20px;
      margin: 10px;
      cursor: pointer;
    }
    .success {
      color: green;
      margin-top: 10px;
    }
    .error {
      color: red;
      margin-top: 10px;
    }
  `]
})
export class ConnectionTestComponent implements OnInit {
  message: string = '';
  isError: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {}

  testConnection(): void {
    this.message = 'Testing connection...';
    this.isError = false;
    
    this.apiService.testConnection().subscribe({
      next: (response) => {
        this.message = response;
        this.isError = false;
      },
      error: (error) => {
        this.message = error.message;
        this.isError = true;
      }
    });
  }
} 
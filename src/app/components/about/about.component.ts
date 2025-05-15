import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="about-container">
      <div class="about-header">
        <h1>About TaskMaster</h1>
        <div class="divider"></div>
        <p class="tagline">Empowering students, teachers, and parents with effective task management</p>
      </div>
      
      <div class="about-content">
        <div class="about-section">
          <div class="section-image">
            <img src="assets/images/about-mission.svg" alt="Our Mission" onerror="this.src='https://via.placeholder.com/400x300?text=Our+Mission'">
          </div>
          <div class="section-text">
            <h2>Our Mission</h2>
            <p>
              TaskMaster was created with a single mission: to make education more efficient and effective 
              by bridging the gap between students, teachers, and parents. We believe that proper task management 
              is key to academic success, and our platform provides the tools needed to achieve this.
            </p>
          </div>
        </div>
        
        <div class="about-section reverse">
          <div class="section-image">
            <img src="assets/images/about-features.svg" alt="Key Features" onerror="this.src='https://via.placeholder.com/400x300?text=Key+Features'">
          </div>
          <div class="section-text">
            <h2>Key Features</h2>
            <ul>
              <li><strong>Task Assignment:</strong> Teachers and parents can assign tasks to students</li>
              <li><strong>Progress Tracking:</strong> Students can mark tasks as completed</li>
              <li><strong>Task Review:</strong> Supervisors can review and rate completed tasks</li>
              <li><strong>Reward System:</strong> Incentivize task completion with rewards</li>
            </ul>
          </div>
        </div>
        
        <div class="about-section">
          <div class="section-image">
            <img src="assets/images/about-team.svg" alt="Our Team" onerror="this.src='https://via.placeholder.com/400x300?text=Our+Team'">
          </div>
          <div class="section-text">
            <h2>Our Team</h2>
            <p>
              Behind TaskMaster is a dedicated team of educators, developers, and designers passionate about 
              improving educational outcomes. We constantly work to enhance the platform based on feedback 
              from our users and the latest research in educational technology.
            </p>
          </div>
        </div>
      </div>
      
      <div class="about-cta">
        <h2>Ready to transform task management?</h2>
        <p>Join thousands of students, teachers, and parents already using TaskMaster.</p>
        <div class="cta-buttons">
          <a routerLink="/register" class="btn btn-primary">Get Started</a>
          <a routerLink="/login" class="btn btn-secondary">Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .about-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
      color: white;
      /* Add hardware acceleration to prevent ghosting */
      transform: translateZ(0);
      backface-visibility: hidden;
    }
    
    .about-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .about-header h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 700;
    }
    
    .divider {
      height: 4px;
      width: 60px;
      background: linear-gradient(90deg, #7928CA, #FF0080);
      margin: 0 auto 1.5rem;
      border-radius: 2px;
    }
    
    .tagline {
      font-size: 1.2rem;
      opacity: 0.8;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }
    
    .about-content {
      margin-bottom: 3rem;
    }
    
    .about-section {
      display: flex;
      margin-bottom: 4rem;
      gap: 2rem;
      align-items: center;
    }
    
    .about-section.reverse {
      flex-direction: row-reverse;
    }
    
    .section-image {
      flex: 1;
      text-align: center;
    }
    
    .section-image img {
      max-width: 100%;
      height: auto;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
    
    .section-text {
      flex: 1;
      /* Add stability to prevent text movement */
      transform: translateZ(0);
      will-change: transform;
      backface-visibility: hidden;
    }
    
    .section-text h2 {
      font-size: 1.8rem;
      margin-bottom: 1.5rem;
      position: relative;
    }
    
    .section-text h2:after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 0;
      width: 40px;
      height: 3px;
      background: linear-gradient(90deg, #7928CA, #FF0080);
      border-radius: 2px;
      transition: width 0.3s ease;
    }
    
    /* Remove any hover effects that might cause movement */
    .section-text h2:hover:after {
      width: 40px; /* Keep it the same */
    }
    
    .section-text p, .section-text ul {
      opacity: 0.9;
      line-height: 1.7;
    }
    
    .section-text ul {
      padding-left: 1.2rem;
    }
    
    .section-text li {
      margin-bottom: 0.7rem;
    }
    
    .about-cta {
      background: rgba(255, 255, 255, 0.1);
      padding: 3rem;
      border-radius: 10px;
      text-align: center;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .about-cta h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    
    .about-cta p {
      margin-bottom: 2rem;
      opacity: 0.9;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    
    .btn {
      display: inline-block;
      padding: 0.8rem 2rem;
      border-radius: 30px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
      /* Prevent text shift during transitions */
      backface-visibility: hidden;
      transform: translateZ(0);
    }
    
    .btn-primary {
      background: linear-gradient(90deg, #7928CA, #FF0080);
      color: white;
      box-shadow: 0 4px 15px rgba(121, 40, 202, 0.4);
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 12px rgba(121, 40, 202, 0.5);
    }
    
    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    @media (max-width: 768px) {
      .about-section, .about-section.reverse {
        flex-direction: column;
        gap: 2rem;
      }
      
      .section-image, .section-text {
        flex: none;
        width: 100%;
      }
      
      .about-header h1 {
        font-size: 2rem;
      }
      
      .about-cta {
        padding: 2rem;
      }
      
      .about-cta h2 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class AboutComponent {
} 
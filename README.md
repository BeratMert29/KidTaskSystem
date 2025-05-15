# 🎯 KidTaskSystem

[![Angular](https://img.shields.io/badge/Angular-19.2.3-red.svg)](https://angular.io/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-green.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.java.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)

A comprehensive task management and reward system designed for parents and teachers to help children develop good habits and learn responsibility through a gamified approach.

## 📋 Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## ✨ Features

### 👨‍👩‍👧‍👦 For Parents
- ✅ Create and assign tasks to children
- 🎁 Set rewards and point values for tasks
- 📊 Monitor task completion and progress
- 👍 Approve or reject completed tasks
- 📝 Manage wish lists and rewards
- 📈 Track children's progress and achievements

### 👨‍🏫 For Teachers
- 📚 Create and assign educational tasks
- 📊 Monitor student progress
- 💬 Provide feedback on completed tasks
- 🤝 Collaborate with parents on student development

### 👨‍🎓 For Students
- 📋 View assigned tasks
- ✅ Mark tasks as complete
- ⭐ Earn points for completed tasks
- 🎯 Create and manage wish lists
- 🎁 Redeem points for rewards
- 📈 Track personal progress

## 🛠️ Technology Stack

### Frontend
- Angular 19.2.3
- TypeScript
- HTML5/CSS3
- Bootstrap for responsive design

### Backend
- Spring Boot
- Java
- MySQL Database
- RESTful API architecture

## 📁 Project Structure

```
KidTaskSystem/
├── backend/           # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
└── src/              # Angular Frontend
    ├── app/
    │   ├── components/
    │   ├── services/
    │   └── models/
    └── assets/
```

## 🚀 Getting Started

### Prerequisites
- Java JDK 21 or higher
- Node.js 18 or higher
- MySQL 8.0 or higher
- Maven
- Angular CLI

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure your database settings in `src/main/resources/application.properties`
3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend Setup
1. Navigate to the project root:
   ```bash
   cd KidTaskSystem
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   ng serve
   ```
4. Open your browser and navigate to `http://localhost:4200`

## 📚 API Documentation

The backend provides RESTful APIs for:
- 🔐 User authentication and registration
- 📝 Task management
- 📊 Student progress tracking
- 🎯 Wish list management
- 🎁 Reward system

Detailed API documentation is available at `/swagger-ui.html` when running the backend server.

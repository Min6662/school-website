# Backend API Documentation for School Management System

## Overview
This document outlines the REST API endpoints required to connect your School Management System frontend to a backend server.

## Base URL
```
http://localhost:3000/api  (Development)
https://your-domain.com/api  (Production)
```

## Authentication
Add authentication headers if your backend requires them:
```javascript
headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

## API Endpoints

### 1. Dashboard Statistics
**GET** `/dashboard/stats`
- Returns overview statistics for the dashboard

**Response:**
```json
{
    "totalTeachers": 25,
    "totalStudents": 450,
    "totalClasses": 12,
    "presentToday": 380
}
```

### 2. Teachers

**GET** `/teachers`
- Get all teachers

**Response:**
```json
[
    {
        "id": 1,
        "name": "John Smith",
        "subject": "Mathematics",
        "createdAt": "2025-10-16T10:00:00Z"
    }
]
```

**POST** `/teachers`
- Add a new teacher

**Request Body:**
```json
{
    "name": "Jane Doe",
    "subject": "English"
}
```

**PUT** `/teachers/:id`
- Update teacher information

**DELETE** `/teachers/:id`
- Delete a teacher

### 3. Teacher Attendance

**GET** `/teacher-attendance?date=2025-10-16`
- Get teacher attendance for a specific date

**Response:**
```json
[
    {
        "id": 1,
        "teacherName": "John Smith",
        "subject": "Mathematics",
        "status": "present",
        "checkInTime": "08:30",
        "checkOutTime": "16:30",
        "date": "2025-10-16"
    }
]
```

**POST** `/teacher-attendance`
- Mark teacher attendance

**Request Body:**
```json
{
    "teacherName": "John Smith",
    "subject": "Mathematics",
    "status": "present",
    "checkInTime": "08:30",
    "checkOutTime": "16:30",
    "date": "2025-10-16"
}
```

### 4. Students

**GET** `/students?class=Grade-10-A`
- Get all students (optionally filtered by class)

**Response:**
```json
[
    {
        "id": 1,
        "name": "Alice Johnson",
        "rollNumber": "2025001",
        "class": "Grade-10-A",
        "createdAt": "2025-10-16T10:00:00Z"
    }
]
```

**POST** `/students`
- Add a new student

### 5. Student Attendance

**GET** `/student-attendance?date=2025-10-16&class=Grade-10-A`
- Get student attendance (filtered by date and/or class)

**POST** `/student-attendance`
- Mark student attendance

### 6. Classes

**GET** `/classes`
- Get all classes

**Response:**
```json
[
    {
        "id": 1,
        "name": "Grade-10-A",
        "teacher": "John Smith",
        "capacity": 30,
        "subjects": ["Mathematics", "English", "Science"],
        "createdAt": "2025-10-16T10:00:00Z"
    }
]
```

**POST** `/classes`
- Add a new class

### 7. Exam Results

**GET** `/exam-results?class=Grade-10-A&student=1`
- Get exam results (optionally filtered)

**Response:**
```json
[
    {
        "id": 1,
        "studentName": "Alice Johnson",
        "rollNumber": "2025001",
        "class": "Grade-10-A",
        "examName": "Mid-term",
        "subject": "Mathematics",
        "marksObtained": 85,
        "totalMarks": 100,
        "grade": "A",
        "percentage": 85,
        "date": "2025-10-16"
    }
]
```

**POST** `/exam-results`
- Add exam result

## Error Handling
All endpoints should return appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

**Error Response Format:**
```json
{
    "error": true,
    "message": "Error description",
    "details": "Additional error details"
}
```

## CORS Configuration
Ensure your backend allows requests from your frontend domain:
```javascript
// Express.js example
app.use(cors({
    origin: ['http://localhost:3000', 'https://your-frontend-domain.com']
}));
```

## Database Schema Examples

### Teachers Table
```sql
CREATE TABLE teachers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Students Table
```sql
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    class VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Teacher Attendance Table
```sql
CREATE TABLE teacher_attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_name VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    status ENUM('present', 'absent', 'late', 'leave') NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Student Attendance Table
```sql
CREATE TABLE student_attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_name VARCHAR(255) NOT NULL,
    roll_number VARCHAR(50) NOT NULL,
    class VARCHAR(100) NOT NULL,
    status ENUM('present', 'absent', 'late') NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Classes Table
```sql
CREATE TABLE classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL,
    teacher VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    subjects JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Exam Results Table
```sql
CREATE TABLE exam_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_name VARCHAR(255) NOT NULL,
    roll_number VARCHAR(50) NOT NULL,
    class VARCHAR(100) NOT NULL,
    exam_name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    marks_obtained INT NOT NULL,
    total_marks INT NOT NULL,
    grade VARCHAR(5) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
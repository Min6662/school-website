// Example Node.js/Express Backend for School Management System

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbConfig = {
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'school_management'
};

// Helper function to get database connection
async function getConnection() {
    return await mysql.createConnection(dbConfig);
}

// === DASHBOARD ROUTES ===
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const connection = await getConnection();
        
        const [teacherCount] = await connection.execute('SELECT COUNT(*) as count FROM teachers');
        const [studentCount] = await connection.execute('SELECT COUNT(*) as count FROM students');
        const [classCount] = await connection.execute('SELECT COUNT(*) as count FROM classes');
        
        const today = new Date().toISOString().split('T')[0];
        const [presentToday] = await connection.execute(
            'SELECT COUNT(*) as count FROM student_attendance WHERE date = ? AND status = "present"',
            [today]
        );
        
        await connection.end();
        
        res.json({
            totalTeachers: teacherCount[0].count,
            totalStudents: studentCount[0].count,
            totalClasses: classCount[0].count,
            presentToday: presentToday[0].count
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: true, message: 'Failed to fetch dashboard stats' });
    }
});

// === TEACHER ROUTES ===
app.get('/api/teachers', async (req, res) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.execute('SELECT * FROM teachers ORDER BY created_at DESC');
        await connection.end();
        
        res.json(rows);
    } catch (error) {
        console.error('Get teachers error:', error);
        res.status(500).json({ error: true, message: 'Failed to fetch teachers' });
    }
});

app.post('/api/teachers', async (req, res) => {
    try {
        const { name, subject } = req.body;
        
        if (!name || !subject) {
            return res.status(400).json({ error: true, message: 'Name and subject are required' });
        }
        
        const connection = await getConnection();
        const [result] = await connection.execute(
            'INSERT INTO teachers (name, subject) VALUES (?, ?)',
            [name, subject]
        );
        
        const [newTeacher] = await connection.execute(
            'SELECT * FROM teachers WHERE id = ?',
            [result.insertId]
        );
        
        await connection.end();
        
        res.status(201).json(newTeacher[0]);
    } catch (error) {
        console.error('Add teacher error:', error);
        res.status(500).json({ error: true, message: 'Failed to add teacher' });
    }
});

// === TEACHER ATTENDANCE ROUTES ===
app.get('/api/teacher-attendance', async (req, res) => {
    try {
        const { date } = req.query;
        const connection = await getConnection();
        
        let query = 'SELECT * FROM teacher_attendance';
        let params = [];
        
        if (date) {
            query += ' WHERE date = ?';
            params.push(date);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const [rows] = await connection.execute(query, params);
        await connection.end();
        
        res.json(rows);
    } catch (error) {
        console.error('Get teacher attendance error:', error);
        res.status(500).json({ error: true, message: 'Failed to fetch teacher attendance' });
    }
});

app.post('/api/teacher-attendance', async (req, res) => {
    try {
        const { teacherName, subject, status, checkInTime, checkOutTime, date } = req.body;
        
        if (!teacherName || !status || !date) {
            return res.status(400).json({ error: true, message: 'Teacher name, status, and date are required' });
        }
        
        const connection = await getConnection();
        const [result] = await connection.execute(
            'INSERT INTO teacher_attendance (teacher_name, subject, status, check_in_time, check_out_time, date) VALUES (?, ?, ?, ?, ?, ?)',
            [teacherName, subject, status, checkInTime || null, checkOutTime || null, date]
        );
        
        const [newRecord] = await connection.execute(
            'SELECT * FROM teacher_attendance WHERE id = ?',
            [result.insertId]
        );
        
        await connection.end();
        
        res.status(201).json(newRecord[0]);
    } catch (error) {
        console.error('Mark teacher attendance error:', error);
        res.status(500).json({ error: true, message: 'Failed to mark teacher attendance' });
    }
});

// === STUDENT ROUTES ===
app.get('/api/students', async (req, res) => {
    try {
        const { class: className } = req.query;
        const connection = await getConnection();
        
        let query = 'SELECT * FROM students';
        let params = [];
        
        if (className) {
            query += ' WHERE class = ?';
            params.push(className);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const [rows] = await connection.execute(query, params);
        await connection.end();
        
        res.json(rows);
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ error: true, message: 'Failed to fetch students' });
    }
});

app.post('/api/students', async (req, res) => {
    try {
        const { name, rollNumber, class: className } = req.body;
        
        if (!name || !rollNumber || !className) {
            return res.status(400).json({ error: true, message: 'Name, roll number, and class are required' });
        }
        
        const connection = await getConnection();
        const [result] = await connection.execute(
            'INSERT INTO students (name, roll_number, class) VALUES (?, ?, ?)',
            [name, rollNumber, className]
        );
        
        const [newStudent] = await connection.execute(
            'SELECT * FROM students WHERE id = ?',
            [result.insertId]
        );
        
        await connection.end();
        
        res.status(201).json(newStudent[0]);
    } catch (error) {
        console.error('Add student error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: true, message: 'Roll number already exists' });
        } else {
            res.status(500).json({ error: true, message: 'Failed to add student' });
        }
    }
});

// === STUDENT ATTENDANCE ROUTES ===
app.get('/api/student-attendance', async (req, res) => {
    try {
        const { date, class: className } = req.query;
        const connection = await getConnection();
        
        let query = 'SELECT * FROM student_attendance WHERE 1=1';
        let params = [];
        
        if (date) {
            query += ' AND date = ?';
            params.push(date);
        }
        
        if (className) {
            query += ' AND class = ?';
            params.push(className);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const [rows] = await connection.execute(query, params);
        await connection.end();
        
        res.json(rows);
    } catch (error) {
        console.error('Get student attendance error:', error);
        res.status(500).json({ error: true, message: 'Failed to fetch student attendance' });
    }
});

app.post('/api/student-attendance', async (req, res) => {
    try {
        const { studentName, rollNumber, class: className, status, date } = req.body;
        
        if (!studentName || !rollNumber || !className || !status || !date) {
            return res.status(400).json({ error: true, message: 'All fields are required' });
        }
        
        const connection = await getConnection();
        const [result] = await connection.execute(
            'INSERT INTO student_attendance (student_name, roll_number, class, status, date) VALUES (?, ?, ?, ?, ?)',
            [studentName, rollNumber, className, status, date]
        );
        
        const [newRecord] = await connection.execute(
            'SELECT * FROM student_attendance WHERE id = ?',
            [result.insertId]
        );
        
        await connection.end();
        
        res.status(201).json(newRecord[0]);
    } catch (error) {
        console.error('Mark student attendance error:', error);
        res.status(500).json({ error: true, message: 'Failed to mark student attendance' });
    }
});

// === CLASS ROUTES ===
app.get('/api/classes', async (req, res) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.execute('SELECT * FROM classes ORDER BY created_at DESC');
        
        // Parse JSON subjects field
        const classes = rows.map(cls => ({
            ...cls,
            subjects: typeof cls.subjects === 'string' ? JSON.parse(cls.subjects) : cls.subjects
        }));
        
        await connection.end();
        
        res.json(classes);
    } catch (error) {
        console.error('Get classes error:', error);
        res.status(500).json({ error: true, message: 'Failed to fetch classes' });
    }
});

app.post('/api/classes', async (req, res) => {
    try {
        const { name, teacher, capacity, subjects } = req.body;
        
        if (!name || !teacher || !capacity || !subjects) {
            return res.status(400).json({ error: true, message: 'All fields are required' });
        }
        
        const connection = await getConnection();
        const [result] = await connection.execute(
            'INSERT INTO classes (name, teacher, capacity, subjects) VALUES (?, ?, ?, ?)',
            [name, teacher, capacity, JSON.stringify(subjects)]
        );
        
        const [newClass] = await connection.execute(
            'SELECT * FROM classes WHERE id = ?',
            [result.insertId]
        );
        
        // Parse subjects for response
        const classData = {
            ...newClass[0],
            subjects: JSON.parse(newClass[0].subjects)
        };
        
        await connection.end();
        
        res.status(201).json(classData);
    } catch (error) {
        console.error('Add class error:', error);
        res.status(500).json({ error: true, message: 'Failed to add class' });
    }
});

// === EXAM RESULTS ROUTES ===
app.get('/api/exam-results', async (req, res) => {
    try {
        const { class: className, student } = req.query;
        const connection = await getConnection();
        
        let query = 'SELECT * FROM exam_results WHERE 1=1';
        let params = [];
        
        if (className) {
            query += ' AND class = ?';
            params.push(className);
        }
        
        if (student) {
            query += ' AND (student_name LIKE ? OR roll_number LIKE ?)';
            params.push(`%${student}%`, `%${student}%`);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const [rows] = await connection.execute(query, params);
        await connection.end();
        
        res.json(rows);
    } catch (error) {
        console.error('Get exam results error:', error);
        res.status(500).json({ error: true, message: 'Failed to fetch exam results' });
    }
});

app.post('/api/exam-results', async (req, res) => {
    try {
        const { 
            studentName, rollNumber, class: className, examName, 
            subject, marksObtained, totalMarks, grade, percentage, date 
        } = req.body;
        
        if (!studentName || !rollNumber || !className || !examName || !subject || 
            marksObtained === undefined || !totalMarks || !grade || !date) {
            return res.status(400).json({ error: true, message: 'All fields are required' });
        }
        
        const connection = await getConnection();
        const [result] = await connection.execute(
            'INSERT INTO exam_results (student_name, roll_number, class, exam_name, subject, marks_obtained, total_marks, grade, percentage, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [studentName, rollNumber, className, examName, subject, marksObtained, totalMarks, grade, percentage, date]
        );
        
        const [newResult] = await connection.execute(
            'SELECT * FROM exam_results WHERE id = ?',
            [result.insertId]
        );
        
        await connection.end();
        
        res.status(201).json(newResult[0]);
    } catch (error) {
        console.error('Add exam result error:', error);
        res.status(500).json({ error: true, message: 'Failed to add exam result' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`School Management API server running on port ${PORT}`);
});

module.exports = app;
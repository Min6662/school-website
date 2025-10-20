// School Management System JavaScript

// Global data storage
let schoolData = {
    teachers: [],
    students: [],
    classes: [],
    teacherAttendance: [],
    studentAttendance: [],
    examResults: []
};

// Load data from localStorage on page load
function loadData() {
    const savedData = localStorage.getItem('schoolManagementData');
    if (savedData) {
        schoolData = JSON.parse(savedData);
    }
    updateDashboard();
    populateClassDropdowns();
    setCurrentDate();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('schoolManagementData', JSON.stringify(schoolData));
}

// Set current date in date inputs
function setCurrentDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('teacher-date').value = today;
    document.getElementById('student-date').value = today;
}

// Section navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update displays based on section
    switch(sectionId) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'teacher-attendance':
            displayTeacherAttendance();
            break;
        case 'student-attendance':
            displayStudentAttendance();
            break;
        case 'classes':
            displayClasses();
            break;
        case 'exam-results':
            displayExamResults();
            break;
    }
}

// Dashboard functions
function updateDashboard() {
    document.getElementById('total-teachers').textContent = schoolData.teachers.length;
    document.getElementById('total-students').textContent = schoolData.students.length;
    document.getElementById('total-classes').textContent = schoolData.classes.length;
    
    // Calculate present today
    const today = new Date().toISOString().split('T')[0];
    const presentToday = schoolData.studentAttendance.filter(record => 
        record.date === today && record.status === 'present'
    ).length;
    document.getElementById('present-today').textContent = presentToday;
}

// Teacher Management
function addNewTeacher() {
    const name = prompt('Enter teacher name:');
    const subject = prompt('Enter subject:');
    
    if (name && subject) {
        const teacher = {
            id: Date.now(),
            name: name.trim(),
            subject: subject.trim()
        };
        schoolData.teachers.push(teacher);
        saveData();
        updateDashboard();
        alert('Teacher added successfully!');
    }
}

// Teacher Attendance Management
document.getElementById('teacher-attendance-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('teacher-name').value,
        subject: document.getElementById('teacher-subject').value,
        status: document.getElementById('teacher-status').value,
        checkInTime: document.getElementById('check-in-time').value,
        checkOutTime: document.getElementById('check-out-time').value,
        date: document.getElementById('teacher-date').value
    };
    
    // Add teacher if not exists
    const existingTeacher = schoolData.teachers.find(t => t.name === formData.name);
    if (!existingTeacher) {
        schoolData.teachers.push({
            id: Date.now(),
            name: formData.name,
            subject: formData.subject
        });
    }
    
    // Add attendance record
    const attendanceRecord = {
        id: Date.now(),
        teacherName: formData.name,
        subject: formData.subject,
        status: formData.status,
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime,
        date: formData.date
    };
    
    schoolData.teacherAttendance.push(attendanceRecord);
    saveData();
    updateDashboard();
    displayTeacherAttendance();
    this.reset();
    alert('Teacher attendance marked successfully!');
});

function displayTeacherAttendance() {
    const selectedDate = document.getElementById('teacher-date').value;
    const records = schoolData.teacherAttendance.filter(record => record.date === selectedDate);
    const container = document.getElementById('teacher-attendance-records');
    
    if (records.length === 0) {
        container.innerHTML = '<p>No attendance records for this date.</p>';
        return;
    }
    
    container.innerHTML = records.map(record => `
        <div class="attendance-record ${record.status}">
            <div class="record-header">
                <span class="record-name">${record.teacherName}</span>
                <span class="record-status status-${record.status}">${record.status}</span>
            </div>
            <div class="record-details">
                <p><strong>Subject:</strong> ${record.subject}</p>
                ${record.checkInTime ? `<p><strong>Check-in:</strong> ${record.checkInTime}</p>` : ''}
                ${record.checkOutTime ? `<p><strong>Check-out:</strong> ${record.checkOutTime}</p>` : ''}
            </div>
        </div>
    `).join('');
}

// Student Management
function addNewStudent() {
    const name = prompt('Enter student name:');
    const rollNumber = prompt('Enter roll number:');
    const className = prompt('Enter class name:');
    
    if (name && rollNumber && className) {
        const student = {
            id: Date.now(),
            name: name.trim(),
            rollNumber: rollNumber.trim(),
            class: className.trim()
        };
        schoolData.students.push(student);
        saveData();
        updateDashboard();
        populateClassDropdowns();
        alert('Student added successfully!');
    }
}

// Student Attendance Management
document.getElementById('student-attendance-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('student-name').value,
        rollNumber: document.getElementById('student-roll').value,
        class: document.getElementById('student-class').value,
        status: document.getElementById('student-status').value,
        date: document.getElementById('student-date').value
    };
    
    // Add student if not exists
    const existingStudent = schoolData.students.find(s => s.rollNumber === formData.rollNumber);
    if (!existingStudent) {
        schoolData.students.push({
            id: Date.now(),
            name: formData.name,
            rollNumber: formData.rollNumber,
            class: formData.class
        });
    }
    
    // Add attendance record
    const attendanceRecord = {
        id: Date.now(),
        studentName: formData.name,
        rollNumber: formData.rollNumber,
        class: formData.class,
        status: formData.status,
        date: formData.date
    };
    
    schoolData.studentAttendance.push(attendanceRecord);
    saveData();
    updateDashboard();
    displayStudentAttendance();
    this.reset();
    alert('Student attendance marked successfully!');
});

function displayStudentAttendance() {
    const selectedDate = document.getElementById('student-date').value;
    const selectedClass = document.getElementById('select-class').value;
    
    let records = schoolData.studentAttendance.filter(record => record.date === selectedDate);
    if (selectedClass) {
        records = records.filter(record => record.class === selectedClass);
    }
    
    const container = document.getElementById('student-attendance-records');
    
    if (records.length === 0) {
        container.innerHTML = '<p>No attendance records found.</p>';
        return;
    }
    
    container.innerHTML = records.map(record => `
        <div class="attendance-record ${record.status}">
            <div class="record-header">
                <span class="record-name">${record.studentName} (${record.rollNumber})</span>
                <span class="record-status status-${record.status}">${record.status}</span>
            </div>
            <div class="record-details">
                <p><strong>Class:</strong> ${record.class}</p>
                <p><strong>Date:</strong> ${record.date}</p>
            </div>
        </div>
    `).join('');
}

// Class Management
document.getElementById('class-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const classData = {
        id: Date.now(),
        name: document.getElementById('class-name').value,
        teacher: document.getElementById('class-teacher').value,
        capacity: parseInt(document.getElementById('class-capacity').value),
        subjects: document.getElementById('class-subjects').value.split(',').map(s => s.trim())
    };
    
    schoolData.classes.push(classData);
    saveData();
    updateDashboard();
    populateClassDropdowns();
    displayClasses();
    this.reset();
    alert('Class added successfully!');
});

function displayClasses() {
    const container = document.getElementById('classes-display');
    
    if (schoolData.classes.length === 0) {
        container.innerHTML = '<p>No classes available.</p>';
        return;
    }
    
    container.innerHTML = schoolData.classes.map(classItem => `
        <div class="class-card">
            <h4>${classItem.name}</h4>
            <div class="class-info">
                <div><strong>Teacher:</strong> <span>${classItem.teacher}</span></div>
                <div><strong>Capacity:</strong> <span>${classItem.capacity}</span></div>
                <div><strong>Subjects:</strong> <span>${classItem.subjects.join(', ')}</span></div>
                <div><strong>Enrolled:</strong> <span>${schoolData.students.filter(s => s.class === classItem.name).length}</span></div>
            </div>
        </div>
    `).join('');
}

function populateClassDropdowns() {
    const classOptions = schoolData.classes.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    
    // Update all class dropdowns
    document.getElementById('student-class').innerHTML = '<option value="">Select Class</option>' + classOptions;
    document.getElementById('select-class').innerHTML = '<option value="">Choose Class</option>' + classOptions;
    document.getElementById('exam-class').innerHTML = '<option value="">Select Class</option>' + classOptions;
    document.getElementById('filter-class').innerHTML = '<option value="">All Classes</option>' + classOptions;
}

// Exam Results Management
document.getElementById('exam-result-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const resultData = {
        id: Date.now(),
        studentName: document.getElementById('exam-student-name').value,
        rollNumber: document.getElementById('exam-student-roll').value,
        class: document.getElementById('exam-class').value,
        examName: document.getElementById('exam-name').value,
        subject: document.getElementById('exam-subject').value,
        marksObtained: parseInt(document.getElementById('marks-obtained').value),
        totalMarks: parseInt(document.getElementById('total-marks').value),
        grade: document.getElementById('exam-grade').value,
        percentage: Math.round((parseInt(document.getElementById('marks-obtained').value) / parseInt(document.getElementById('total-marks').value)) * 100),
        date: new Date().toISOString().split('T')[0]
    };
    
    schoolData.examResults.push(resultData);
    saveData();
    displayExamResults();
    this.reset();
    alert('Exam result added successfully!');
});

function displayExamResults() {
    const filterClass = document.getElementById('filter-class').value;
    const searchTerm = document.getElementById('search-student').value.toLowerCase();
    
    let results = schoolData.examResults;
    
    if (filterClass) {
        results = results.filter(result => result.class === filterClass);
    }
    
    if (searchTerm) {
        results = results.filter(result => 
            result.studentName.toLowerCase().includes(searchTerm) ||
            result.rollNumber.toLowerCase().includes(searchTerm)
        );
    }
    
    const container = document.getElementById('exam-results-display');
    
    if (results.length === 0) {
        container.innerHTML = '<p>No exam results found.</p>';
        return;
    }
    
    container.innerHTML = results.map(result => `
        <div class="result-card">
            <div class="result-header">
                <span class="result-student">${result.studentName} (${result.rollNumber})</span>
                <span class="result-grade grade-${result.grade.toLowerCase().replace('+', '')}">${result.grade}</span>
            </div>
            <div class="result-details">
                <div class="result-detail">
                    <span>Class:</span>
                    <span>${result.class}</span>
                </div>
                <div class="result-detail">
                    <span>Exam:</span>
                    <span>${result.examName}</span>
                </div>
                <div class="result-detail">
                    <span>Subject:</span>
                    <span>${result.subject}</span>
                </div>
                <div class="result-detail">
                    <span>Marks:</span>
                    <span>${result.marksObtained}/${result.totalMarks}</span>
                </div>
                <div class="result-detail">
                    <span>Percentage:</span>
                    <span>${result.percentage}%</span>
                </div>
                <div class="result-detail">
                    <span>Date:</span>
                    <span>${result.date}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Event listeners for filters
document.getElementById('filter-class').addEventListener('change', displayExamResults);
document.getElementById('search-student').addEventListener('input', displayExamResults);
document.getElementById('select-class').addEventListener('change', displayStudentAttendance);
document.getElementById('teacher-date').addEventListener('change', displayTeacherAttendance);
document.getElementById('student-date').addEventListener('change', displayStudentAttendance);

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    showSection('dashboard');
});
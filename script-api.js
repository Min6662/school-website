// School Management System JavaScript with API Integration

// Global data storage (now used as cache)
let schoolData = {
    teachers: [],
    students: [],
    classes: [],
    teacherAttendance: [],
    studentAttendance: [],
    examResults: []
};

// Load data from API on page load
async function loadData() {
    try {
        console.log('🔄 Starting to load data from Back4App...');
        
        // Load all data from backend
        const [teachers, students, classes, stats] = await Promise.all([
            apiService.getTeachers(),
            apiService.getStudents(),
            apiService.getClasses(),
            apiService.getDashboardStats()
        ]);

        console.log('📊 Data loaded from Back4App:');
        console.log('Teachers:', teachers);
        console.log('Students:', students);
        console.log('Classes:', classes);
        console.log('Stats:', stats);

        schoolData.teachers = teachers;
        schoolData.students = students;
        schoolData.classes = classes;

        updateDashboardFromAPI(stats);
        populateClassDropdowns();
        setCurrentDate();
        
        apiService.showSuccess(`Data loaded successfully! Found ${teachers.length} teachers, ${students.length} students, ${classes.length} classes`);
    } catch (error) {
        console.error('❌ Failed to load data from Back4App:', error);
        // Fallback to localStorage if API fails
        loadDataFromLocalStorage();
        apiService.showError('Failed to connect to Back4App server. Using offline data.');
    }
}

// Fallback to localStorage (keep existing functionality as backup)
function loadDataFromLocalStorage() {
    const savedData = localStorage.getItem('schoolManagementData');
    if (savedData) {
        schoolData = JSON.parse(savedData);
    }
    updateDashboard();
    populateClassDropdowns();
    setCurrentDate();
}

// Save data to localStorage as backup
function saveDataToLocalStorage() {
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
    
    // Load section-specific data
    switch(sectionId) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'teacher-attendance':
            loadTeachersData(); // Load teachers grid
            loadTeacherAttendanceData();
            break;
        case 'student-attendance':
            loadStudentsData(); // Load students grid
            loadStudentAttendanceData();
            break;
        case 'classes':
            loadClassesData();
            break;
        case 'exam-results':
            loadExamResultsData();
            break;
    }
}

// Dashboard functions
async function loadDashboardData() {
    try {
        const stats = await apiService.getDashboardStats();
        updateDashboardFromAPI(stats);
    } catch (error) {
        updateDashboard(); // Fallback to local calculation
    }
}

function updateDashboardFromAPI(stats) {
    document.getElementById('total-teachers').textContent = stats.totalTeachers || 0;
    document.getElementById('total-students').textContent = stats.totalStudents || 0;
    document.getElementById('total-classes').textContent = stats.totalClasses || 0;
    document.getElementById('present-today').textContent = stats.presentToday || 0;
}

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
async function addNewTeacher() {
    const name = prompt('Enter teacher name:');
    const subject = prompt('Enter subject:');
    const imageUrl = prompt('Enter teacher image URL (optional):');
    
    if (name && subject) {
        try {
            const teacherData = {
                name: name.trim(),
                subject: subject.trim()
            };
            
            // Add image URL if provided
            if (imageUrl && imageUrl.trim()) {
                teacherData.imageUrl = imageUrl.trim();
            }
            
            const newTeacher = await apiService.addTeacher(teacherData);
            schoolData.teachers.push(newTeacher);
            saveDataToLocalStorage(); // Backup
            
            updateDashboard();
            await loadTeachersData(); // Refresh teachers display
            populateTeacherDropdown(); // Update dropdown
            apiService.showSuccess('Teacher added successfully!');
        } catch (error) {
            apiService.showError('Failed to add teacher. Please try again.');
        }
    }
}

// Load and display teachers data
async function loadTeachersData() {
    try {
        console.log('👨‍🏫 Loading teachers data...');
        const teachers = await apiService.getTeachers();
        schoolData.teachers = teachers;
        displayTeachersGrid(teachers);
        populateTeacherDropdown();
        saveDataToLocalStorage();
    } catch (error) {
        console.error('Failed to load teachers:', error);
        // Fallback to local data
        displayTeachersGrid(schoolData.teachers);
    }
}

// Display teachers in a grid with pictures
function displayTeachersGrid(teachers) {
    const container = document.getElementById('teachers-grid');
    
    if (!teachers || teachers.length === 0) {
        container.innerHTML = `
            <div class="no-teachers">
                <i class="fas fa-chalkboard-teacher" style="font-size: 3rem; margin-bottom: 1rem; color: #bdc3c7;"></i>
                <h4>No Teachers Found</h4>
                <p>Click "Add New Teacher" to add your first teacher.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = teachers.map(teacher => {
        // Generate initials for avatar if no image
        const initials = teacher.name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        // Use image URL if available, otherwise show initials
        const avatarContent = teacher.imageUrl || teacher.image ? 
            `<img src="${teacher.imageUrl || teacher.image}" alt="${teacher.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
             <div class="teacher-avatar-placeholder" style="display:none;">${initials}</div>` :
            `<div class="teacher-avatar-placeholder">${initials}</div>`;
        
        return `
            <div class="teacher-card" data-teacher-id="${teacher.id || teacher.objectId}">
                <div class="teacher-avatar">
                    ${avatarContent}
                </div>
                <div class="teacher-info">
                    <h4>${teacher.name}</h4>
                    <div class="teacher-subject">${teacher.subject}</div>
                    <div class="teacher-details">
                        <div class="teacher-id">ID: ${teacher.id || teacher.objectId || 'N/A'}</div>
                        <div class="teacher-status status-active">Active</div>
                    </div>
                    <div class="teacher-actions">
                        <button class="btn-small btn-attendance" onclick="markTeacherAttendanceQuick('${teacher.name}', '${teacher.subject}')">
                            <i class="fas fa-check"></i> Mark Present
                        </button>
                        <button class="btn-small btn-edit" onclick="editTeacher('${teacher.id || teacher.objectId}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Populate teacher dropdown for attendance form
function populateTeacherDropdown() {
    const select = document.getElementById('teacher-select');
    if (!select) return;
    
    const teacherOptions = schoolData.teachers.map(teacher => 
        `<option value="${teacher.name}" data-subject="${teacher.subject}">${teacher.name} - ${teacher.subject}</option>`
    ).join('');
    
    select.innerHTML = '<option value="">Select Teacher</option>' + teacherOptions;
}

// Quick attendance marking
async function markTeacherAttendanceQuick(teacherName, subject) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
        
        const attendanceData = {
            teacherName: teacherName,
            subject: subject,
            status: 'present',
            checkInTime: currentTime,
            date: today
        };
        
        await apiService.markTeacherAttendance(attendanceData);
        apiService.showSuccess(`Marked ${teacherName} as present!`);
        await loadTeacherAttendanceData();
        await loadDashboardData();
    } catch (error) {
        apiService.showError('Failed to mark attendance. Please try again.');
    }
}

// Edit teacher function
async function editTeacher(teacherId) {
    const teacher = schoolData.teachers.find(t => (t.id || t.objectId) === teacherId);
    if (!teacher) return;
    
    const newName = prompt('Enter new name:', teacher.name);
    const newSubject = prompt('Enter new subject:', teacher.subject);
    const newImageUrl = prompt('Enter new image URL (optional):', teacher.imageUrl || teacher.image || '');
    
    if (newName && newSubject) {
        try {
            const updateData = {
                name: newName.trim(),
                subject: newSubject.trim()
            };
            
            if (newImageUrl && newImageUrl.trim()) {
                updateData.imageUrl = newImageUrl.trim();
            }
            
            await apiService.updateTeacher(teacherId, updateData);
            await loadTeachersData();
            apiService.showSuccess('Teacher updated successfully!');
        } catch (error) {
            apiService.showError('Failed to update teacher. Please try again.');
        }
    }
}

// Refresh teachers list
async function refreshTeachersList() {
    await loadTeachersData();
    apiService.showSuccess('Teachers list refreshed!');
}

// ============= STUDENT MANAGEMENT FUNCTIONS =============

// Load and display students data
async function loadStudentsData() {
    try {
        console.log('👨‍🎓 Loading students data...');
        const students = await apiService.getStudents();
        schoolData.students = students;
        displayStudentsGrid(students);
        populateStudentDropdown();
        saveDataToLocalStorage();
    } catch (error) {
        console.error('Failed to load students:', error);
        // Fallback to local data
        displayStudentsGrid(schoolData.students);
    }
}

// Display students in a grid with pictures
function displayStudentsGrid(students) {
    const container = document.getElementById('students-grid');
    if (!container) return; // Container doesn't exist, skip
    
    if (!students || students.length === 0) {
        container.innerHTML = `
            <div class="no-students">
                <i class="fas fa-user-graduate" style="font-size: 3rem; margin-bottom: 1rem; color: #bdc3c7;"></i>
                <h4>No Students Found</h4>
                <p>Click "Add New Student" to add your first student.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = students.map(student => {
        // Generate initials for avatar if no image
        const initials = student.name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        return `
            <div class="student-card">
                <div class="student-avatar">
                    ${student.imageUrl ? 
                        `<img src="${student.imageUrl}" alt="${student.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div class="student-avatar-placeholder" style="display:none;">${initials}</div>` :
                        `<div class="student-avatar-placeholder">${initials}</div>`
                    }
                </div>
                <div class="student-info">
                    <h4>${student.name}</h4>
                    <div class="student-class">${student.class || 'No Class Assigned'}</div>
                    <div class="student-roll">Roll: ${student.rollNumber || 'N/A'}</div>
                    <div class="student-details">
                        <span class="student-status ${student.status === 'active' ? 'status-enrolled' : 'status-inactive'}">
                            ${student.status || 'enrolled'}
                        </span>
                        <span class="student-id">ID: ${(student.id || student.objectId || '').substring(0, 8)}</span>
                    </div>
                    <div class="student-actions">
                        <button class="btn-small btn-present" onclick="markStudentAttendanceQuick('${student.name}', '${student.class}')">
                            <i class="fas fa-check"></i> Present
                        </button>
                        <button class="btn-small btn-absent" onclick="markStudentAttendanceQuick('${student.name}', '${student.class}', 'absent')">
                            <i class="fas fa-times"></i> Absent
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Populate student dropdown for attendance form
function populateStudentDropdown() {
    const select = document.getElementById('student-select');
    if (!select) return;
    
    const studentOptions = schoolData.students.map(student => 
        `<option value="${student.name}" data-class="${student.class}" data-roll="${student.rollNumber}">${student.name} - ${student.class} (${student.rollNumber})</option>`
    ).join('');
    
    select.innerHTML = '<option value="">Select Student</option>' + studentOptions;
}

// Quick attendance marking for students
async function markStudentAttendanceQuick(studentName, studentClass, status = 'present') {
    try {
        const today = new Date().toISOString().split('T')[0];
        const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
        
        const attendanceData = {
            studentName: studentName,
            class: studentClass,
            status: status,
            checkInTime: currentTime,
            date: today
        };
        
        await apiService.markStudentAttendance(attendanceData);
        apiService.showSuccess(`Marked ${studentName} as ${status}!`);
        await loadStudentAttendanceData();
        await loadDashboardData();
    } catch (error) {
        apiService.showError('Failed to mark attendance. Please try again.');
    }
}

// Filter students by class
function filterStudentsByClass(className) {
    if (!schoolData.students) return;
    
    const filteredStudents = className === 'all' ? 
        schoolData.students : 
        schoolData.students.filter(student => student.class === className);
    
    displayStudentsGrid(filteredStudents);
}

// Refresh students list
async function refreshStudentsList() {
    await loadStudentsData();
    apiService.showSuccess('Students list refreshed!');
}

// Handle teacher selection in dropdown
document.getElementById('teacher-select')?.addEventListener('change', function() {
    const selectedOption = this.options[this.selectedIndex];
    if (selectedOption.value) {
        document.getElementById('teacher-name').value = selectedOption.value;
        document.getElementById('teacher-subject').value = selectedOption.dataset.subject || '';
    }
});

// Teacher Attendance Management
document.getElementById('teacher-attendance-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        teacherName: document.getElementById('teacher-name').value,
        subject: document.getElementById('teacher-subject').value,
        status: document.getElementById('teacher-status').value,
        checkInTime: document.getElementById('check-in-time').value,
        checkOutTime: document.getElementById('check-out-time').value,
        date: document.getElementById('teacher-date').value
    };
    
    try {
        // Add teacher if not exists
        const existingTeacher = schoolData.teachers.find(t => t.name === formData.teacherName);
        if (!existingTeacher) {
            await apiService.addTeacher({
                name: formData.teacherName,
                subject: formData.subject
            });
        }
        
        // Add attendance record
        const attendanceRecord = await apiService.markTeacherAttendance(formData);
        schoolData.teacherAttendance.push(attendanceRecord);
        saveDataToLocalStorage();
        
        await loadDashboardData();
        await loadTeacherAttendanceData();
        this.reset();
        apiService.showSuccess('Teacher attendance marked successfully!');
    } catch (error) {
        apiService.showError('Failed to mark teacher attendance. Please try again.');
    }
});

async function loadTeacherAttendanceData() {
    try {
        const selectedDate = document.getElementById('teacher-date').value;
        const records = await apiService.getTeacherAttendance(selectedDate);
        displayTeacherAttendanceFromAPI(records);
    } catch (error) {
        displayTeacherAttendance(); // Fallback to local data
    }
}

function displayTeacherAttendanceFromAPI(records) {
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

function displayTeacherAttendance() {
    const selectedDate = document.getElementById('teacher-date').value;
    const records = schoolData.teacherAttendance.filter(record => record.date === selectedDate);
    displayTeacherAttendanceFromAPI(records);
}

// Student Management
async function addNewStudent() {
    const name = prompt('Enter student name:');
    const rollNumber = prompt('Enter roll number:');
    const className = prompt('Enter class name:');
    
    if (name && rollNumber && className) {
        try {
            const studentData = {
                name: name.trim(),
                rollNumber: rollNumber.trim(),
                class: className.trim()
            };
            
            const newStudent = await apiService.addStudent(studentData);
            schoolData.students.push(newStudent);
            saveDataToLocalStorage();
            
            updateDashboard();
            populateClassDropdowns();
            apiService.showSuccess('Student added successfully!');
        } catch (error) {
            apiService.showError('Failed to add student. Please try again.');
        }
    }
}

// Student Attendance Management
document.getElementById('student-attendance-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        studentName: document.getElementById('student-name').value,
        rollNumber: document.getElementById('student-roll').value,
        class: document.getElementById('student-class').value,
        status: document.getElementById('student-status').value,
        date: document.getElementById('student-date').value
    };
    
    try {
        // Add student if not exists
        const existingStudent = schoolData.students.find(s => s.rollNumber === formData.rollNumber);
        if (!existingStudent) {
            await apiService.addStudent({
                name: formData.studentName,
                rollNumber: formData.rollNumber,
                class: formData.class
            });
        }
        
        // Add attendance record
        const attendanceRecord = await apiService.markStudentAttendance(formData);
        schoolData.studentAttendance.push(attendanceRecord);
        saveDataToLocalStorage();
        
        await loadDashboardData();
        await loadStudentAttendanceData();
        this.reset();
        apiService.showSuccess('Student attendance marked successfully!');
    } catch (error) {
        apiService.showError('Failed to mark student attendance. Please try again.');
    }
});

async function loadStudentAttendanceData() {
    try {
        const selectedDate = document.getElementById('student-date').value;
        const selectedClass = document.getElementById('select-class').value;
        const records = await apiService.getStudentAttendance(selectedDate, selectedClass);
        displayStudentAttendanceFromAPI(records);
    } catch (error) {
        displayStudentAttendance(); // Fallback to local data
    }
}

function displayStudentAttendanceFromAPI(records) {
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

function displayStudentAttendance() {
    const selectedDate = document.getElementById('student-date').value;
    const selectedClass = document.getElementById('select-class').value;
    
    let records = schoolData.studentAttendance.filter(record => record.date === selectedDate);
    if (selectedClass) {
        records = records.filter(record => record.class === selectedClass);
    }
    
    displayStudentAttendanceFromAPI(records);
}

// Class Management
document.getElementById('class-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const classData = {
        name: document.getElementById('class-name').value,
        teacher: document.getElementById('class-teacher').value,
        capacity: parseInt(document.getElementById('class-capacity').value),
        subjects: document.getElementById('class-subjects').value.split(',').map(s => s.trim())
    };
    
    try {
        const newClass = await apiService.addClass(classData);
        schoolData.classes.push(newClass);
        saveDataToLocalStorage();
        
        updateDashboard();
        populateClassDropdowns();
        await loadClassesData();
        this.reset();
        apiService.showSuccess('Class added successfully!');
    } catch (error) {
        apiService.showError('Failed to add class. Please try again.');
    }
});

async function loadClassesData() {
    try {
        const classes = await apiService.getClasses();
        schoolData.classes = classes;
        displayClassesFromAPI(classes);
    } catch (error) {
        displayClasses(); // Fallback to local data
    }
}

function displayClassesFromAPI(classes) {
    const container = document.getElementById('classes-display');
    
    if (classes.length === 0) {
        container.innerHTML = '<p>No classes available.</p>';
        return;
    }
    
    container.innerHTML = classes.map(classItem => `
        <div class="class-card">
            <h4>${classItem.name}</h4>
            <div class="class-info">
                <div><strong>Teacher:</strong> <span>${classItem.teacher}</span></div>
                <div><strong>Capacity:</strong> <span>${classItem.capacity}</span></div>
                <div><strong>Subjects:</strong> <span>${Array.isArray(classItem.subjects) ? classItem.subjects.join(', ') : classItem.subjects}</span></div>
                <div><strong>Enrolled:</strong> <span>${schoolData.students.filter(s => s.class === classItem.name).length}</span></div>
            </div>
        </div>
    `).join('');
}

function displayClasses() {
    displayClassesFromAPI(schoolData.classes);
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
document.getElementById('exam-result-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const resultData = {
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
    
    try {
        const newResult = await apiService.addExamResult(resultData);
        schoolData.examResults.push(newResult);
        saveDataToLocalStorage();
        
        await loadExamResultsData();
        this.reset();
        apiService.showSuccess('Exam result added successfully!');
    } catch (error) {
        apiService.showError('Failed to add exam result. Please try again.');
    }
});

async function loadExamResultsData() {
    try {
        const filterClass = document.getElementById('filter-class').value;
        const results = await apiService.getExamResults(filterClass);
        schoolData.examResults = results;
        displayExamResultsFromAPI(results);
    } catch (error) {
        displayExamResults(); // Fallback to local data
    }
}

function displayExamResultsFromAPI(results) {
    const searchTerm = document.getElementById('search-student').value.toLowerCase();
    
    let filteredResults = results;
    
    if (searchTerm) {
        filteredResults = results.filter(result => 
            result.studentName.toLowerCase().includes(searchTerm) ||
            result.rollNumber.toLowerCase().includes(searchTerm)
        );
    }
    
    const container = document.getElementById('exam-results-display');
    
    if (filteredResults.length === 0) {
        container.innerHTML = '<p>No exam results found.</p>';
        return;
    }
    
    container.innerHTML = filteredResults.map(result => `
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

function displayExamResults() {
    displayExamResultsFromAPI(schoolData.examResults);
}

// Event listeners for filters
document.getElementById('filter-class').addEventListener('change', loadExamResultsData);
document.getElementById('search-student').addEventListener('input', () => {
    displayExamResultsFromAPI(schoolData.examResults);
});
document.getElementById('select-class').addEventListener('change', loadStudentAttendanceData);
document.getElementById('teacher-date').addEventListener('change', loadTeacherAttendanceData);
document.getElementById('student-date').addEventListener('change', loadStudentAttendanceData);

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 School Management System starting...');
    loadData();
    showSection('dashboard');
    
    // Initialize new dashboard components
    initializeCalendar();
    createAttendanceChart();
});

// Initialize calendar
function initializeCalendar() {
    generateCalendar(new Date());
}

// Generate calendar for a specific month
function generateCalendar(date) {
    const calendarDays = document.getElementById('calendar-days');
    const calendarMonth = document.querySelector('.calendar-month');
    
    if (!calendarDays || !calendarMonth) return;
    
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    calendarMonth.textContent = `${monthNames[month]}, ${year}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Clear previous days
    calendarDays.innerHTML = '';
    
    // Add previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayElement = createCalendarDay(daysInPrevMonth - i, true);
        calendarDays.appendChild(dayElement);
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createCalendarDay(day, false);
        
        // Mark today
        const today = new Date();
        if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        // Add sample events
        if (day === 25) {
            dayElement.classList.add('has-event');
            const eventDiv = document.createElement('div');
            eventDiv.className = 'event-indicator';
            eventDiv.textContent = 'Independence Day';
            eventDiv.style.fontSize = '0.7rem';
            eventDiv.style.color = '#27ae60';
            eventDiv.style.marginTop = '2px';
            dayElement.appendChild(eventDiv);
        }
        
        calendarDays.appendChild(dayElement);
    }
    
    // Add next month's leading days
    const totalCells = 42; // 6 rows × 7 days
    const cellsUsed = firstDay + daysInMonth;
    for (let day = 1; cellsUsed + day - 1 < totalCells; day++) {
        const dayElement = createCalendarDay(day, true);
        calendarDays.appendChild(dayElement);
    }
}

// Create individual calendar day element
function createCalendarDay(day, isOtherMonth) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    dayElement.textContent = day;
    return dayElement;
}

// Navigate calendar months
let currentCalendarDate = new Date();

function navigateMonth(direction) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
    generateCalendar(currentCalendarDate);
}

// Create attendance pie chart
function createAttendanceChart() {
    const canvas = document.getElementById('attendance-pie-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100;
    
    // Sample data - 87.5% present, 12.5% absent
    const data = [
        { label: 'Grade A', value: 87.5, color: '#3498db' },
        { label: 'Grade B', value: 12.5, color: '#e74c3c' }
    ];
    
    let currentAngle = -Math.PI / 2; // Start from top
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw pie slices
    data.forEach(segment => {
        const sliceAngle = (segment.value / 100) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = segment.color;
        ctx.fill();
        
        currentAngle += sliceAngle;
    });
    
    // Draw percentage text in center
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 24px Segoe UI';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('87.5%', centerX, centerY);
}

// Update showSection function to handle page titles and menu states
const originalShowSection = showSection;
function showSection(sectionId) {
    originalShowSection(sectionId);
    
    // Update page title
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        const titles = {
            'dashboard': 'Dashboard',
            'teacher-attendance': 'Teacher Management', 
            'student-attendance': 'Student Management',
            'classes': 'Academic Classes',
            'exam-results': 'Exam Results'
        };
        pageTitle.textContent = titles[sectionId] || 'Dashboard';
    }
    
    // Update active menu item
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to current section
    const menuItems = document.querySelectorAll('.menu-item');
    if (sectionId === 'dashboard' && menuItems[0]) {
        menuItems[0].classList.add('active');
    }
}

// Function to preview your existing data
async function previewExistingData() {
    console.log('� Previewing your existing Back4App data...');
    
    try {
        // Preview Teachers (you have 11)
        const teachers = await apiService.get('Teacher', { limit: 3 });
        console.log('👨‍🏫 Sample Teachers from your database:', teachers);
        
        // Preview Students (you have 10)  
        const students = await apiService.get('Student', { limit: 3 });
        console.log('👩‍🎓 Sample Students from your database:', students);
        
        // Preview Classes (you have 12)
        const classes = await apiService.get('Class', { limit: 3 });
        console.log('🏫 Sample Classes from your database:', classes);
        
        // Preview Attendance (you have 19)
        const attendance = await apiService.get('Attendance', { limit: 3 });
        console.log('📋 Sample Attendance from your database:', attendance);
        
        // Preview Grades (you have 1)
        const grades = await apiService.get('Grades', { limit: 3 });
        console.log('📊 Sample Grades from your database:', grades);
        
    } catch (error) {
        console.error('❌ Error previewing data:', error);
    }
}

// Function to explore your Back4App schema
async function exploreSchema() {
    console.log('🔍 Exploring Back4App schema...');
    
    try {
        // Try to access the schema endpoint
        const schemaResponse = await fetch(`${CONFIG.API_BASE_URL}/schemas`, {
            method: 'GET',
            headers: CONFIG.HEADERS
        });
        
        if (schemaResponse.ok) {
            const schemas = await schemaResponse.json();
            console.log('📋 Available schemas in your Back4App:', schemas);
            return schemas;
        } else {
            console.log('⚠️ Cannot access schema endpoint, trying manual discovery...');
            return null;
        }
    } catch (error) {
        console.error('❌ Error exploring schema:', error);
        return null;
    }
}

// Test function to add sample data (call from browser console)
async function addSampleData() {
    try {
        console.log('🎯 Adding sample data to Back4App...');
        
        // Add sample classes
        const sampleClasses = [
            { name: 'Grade 10-A', teacher: 'John Smith', capacity: 30, subjects: ['Mathematics', 'English', 'Science'] },
            { name: 'Grade 11-B', teacher: 'Jane Doe', capacity: 25, subjects: ['Physics', 'Chemistry', 'Biology'] },
            { name: 'Grade 12-C', teacher: 'Mike Johnson', capacity: 28, subjects: ['Advanced Math', 'Literature', 'History'] }
        ];
        
        for (const cls of sampleClasses) {
            await apiService.addClass(cls);
            console.log(`✅ Added class: ${cls.name}`);
        }
        
        // Add sample teachers
        const sampleTeachers = [
            { name: 'John Smith', subject: 'Mathematics' },
            { name: 'Jane Doe', subject: 'Physics' },
            { name: 'Mike Johnson', subject: 'Advanced Math' },
            { name: 'Sarah Wilson', subject: 'English' },
            { name: 'David Brown', subject: 'Science' }
        ];
        
        for (const teacher of sampleTeachers) {
            await apiService.addTeacher(teacher);
            console.log(`✅ Added teacher: ${teacher.name}`);
        }
        
        // Add sample students
        const sampleStudents = [
            { name: 'Alice Johnson', rollNumber: '2025001', class: 'Grade 10-A' },
            { name: 'Bob Wilson', rollNumber: '2025002', class: 'Grade 10-A' },
            { name: 'Charlie Brown', rollNumber: '2025003', class: 'Grade 11-B' },
            { name: 'Diana Davis', rollNumber: '2025004', class: 'Grade 11-B' },
            { name: 'Eva Martinez', rollNumber: '2025005', class: 'Grade 12-C' },
            { name: 'Frank Miller', rollNumber: '2025006', class: 'Grade 12-C' },
            { name: 'Grace Lee', rollNumber: '2025007', class: 'Grade 10-A' },
            { name: 'Henry Garcia', rollNumber: '2025008', class: 'Grade 11-B' }
        ];
        
        for (const student of sampleStudents) {
            await apiService.addStudent(student);
            console.log(`✅ Added student: ${student.name}`);
        }
        
        console.log('🎉 Sample data added successfully!');
        apiService.showSuccess('Sample data added! Refreshing dashboard...');
        
        // Refresh the dashboard
        await loadData();
        
    } catch (error) {
        console.error('❌ Error adding sample data:', error);
        apiService.showError('Failed to add sample data: ' + error.message);
    }
}
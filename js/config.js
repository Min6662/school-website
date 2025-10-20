// Back4App Configuration for School Management System
const CONFIG = {
    // Back4App Configuration
    // Your actual Back4App credentials
    APP_ID: 'EIbuzFd5v46RVy8iqf3vupM40l4PEcuS773XLUc5', // Your Back4App Application ID
    REST_API_KEY: '4GJK4JXTI2ow3Ca0hg9hMmdnJzMq8jIn6c085Vgo', // Your Back4App REST API Key
    
    // Back4App API Base URL (standard for all Back4App apps)
    API_BASE_URL: 'https://parseapi.back4app.com',
    
    // Back4App Class Names (Parse classes act like database tables)
    // Updated to match your existing Back4App database structure
    CLASSES: {
        TEACHERS: 'Teacher',           // You have 11 teachers
        STUDENTS: 'Student',           // You have 10 students  
        SCHOOL_CLASSES: 'Class',       // You have 12 classes
        TEACHER_ATTENDANCE: 'TeacherAttendance',  // You have 4 records
        STUDENT_ATTENDANCE: 'Attendance',         // You have 19 records
        EXAM_RESULTS: 'Grades'         // You have 1 grade record
    },
    
    // Request timeout in milliseconds
    TIMEOUT: 10000,
    
    // Back4App specific headers
    HEADERS: {
        'Content-Type': 'application/json',
        'X-Parse-Application-Id': '', // Will be set dynamically
        'X-Parse-REST-API-Key': ''    // Will be set dynamically
    },
    
    // Back4App query options
    QUERY_OPTIONS: {
        limit: 1000, // Maximum results per query
        order: '-createdAt' // Order by creation date (newest first)
    }
};

// Set headers with credentials (done after CONFIG is defined)
CONFIG.HEADERS['X-Parse-Application-Id'] = CONFIG.APP_ID;
CONFIG.HEADERS['X-Parse-REST-API-Key'] = CONFIG.REST_API_KEY;

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
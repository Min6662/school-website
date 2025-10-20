// Dashboard Management
class DashboardManager {
    constructor(apiService) {
        this.apiService = apiService;
        this.currentCalendarDate = new Date();
        this.init();
    }

    init() {
        this.loadDashboardStats();
        this.initializeCalendar();
        this.createAttendanceChart();
    }

    async loadDashboardStats() {
        try {
            const stats = await this.apiService.getDashboardStats();
            this.updateStatsDisplay(stats);
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
            // Fallback to local calculation
            this.loadFallbackStats();
        }
    }

    updateStatsDisplay(stats) {
        document.getElementById('total-teachers').textContent = stats.totalTeachers || 0;
        document.getElementById('total-students').textContent = stats.totalStudents || 0;
        document.getElementById('total-classes').textContent = stats.totalClasses || 0;
        document.getElementById('present-today').textContent = stats.presentToday || 0;
    }

    async loadFallbackStats() {
        try {
            // Get counts from individual API calls
            const [teachers, students, classes] = await Promise.all([
                this.apiService.getTeachers(),
                this.apiService.getStudents(),
                this.apiService.getClasses()
            ]);

            const stats = {
                totalTeachers: teachers.length,
                totalStudents: students.length,
                totalClasses: classes.length,
                presentToday: 7 // Default value
            };

            this.updateStatsDisplay(stats);
        } catch (error) {
            console.error('Error loading fallback stats:', error);
            // Use default values
            this.updateStatsDisplay({
                totalTeachers: 11,
                totalStudents: 62,
                totalClasses: 12,
                presentToday: 7
            });
        }
    }

    initializeCalendar() {
        this.generateCalendar(this.currentCalendarDate);
    }

    generateCalendar(date) {
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
            const dayElement = this.createCalendarDay(daysInPrevMonth - i, true);
            calendarDays.appendChild(dayElement);
        }
        
        // Add current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = this.createCalendarDay(day, false);
            
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
            const dayElement = this.createCalendarDay(day, true);
            calendarDays.appendChild(dayElement);
        }
    }

    createCalendarDay(day, isOtherMonth) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        dayElement.textContent = day;
        return dayElement;
    }

    createAttendanceChart() {
        const canvas = document.getElementById('attendance-pie-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 100;
        
        // Sample data - 87.5% present, 12.5% absent
        const data = [
            { label: 'Present', value: 87.5, color: '#3498db' },
            { label: 'Absent', value: 12.5, color: '#e74c3c' }
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
}

// Calendar navigation functions (global scope for onclick handlers)
function navigateMonth(direction) {
    if (dashboardManager) {
        dashboardManager.currentCalendarDate.setMonth(dashboardManager.currentCalendarDate.getMonth() + direction);
        dashboardManager.generateCalendar(dashboardManager.currentCalendarDate);
    }
}

function goToToday() {
    if (dashboardManager) {
        dashboardManager.currentCalendarDate = new Date();
        dashboardManager.generateCalendar(dashboardManager.currentCalendarDate);
    }
}

// Initialize dashboard manager when DOM is loaded
let dashboardManager;
document.addEventListener('DOMContentLoaded', function() {
    if (typeof apiService !== 'undefined') {
        dashboardManager = new DashboardManager(apiService);
    }
});
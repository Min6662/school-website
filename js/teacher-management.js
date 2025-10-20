// Teacher Management Module
class TeacherManager {
    constructor(apiService) {
        this.apiService = apiService;
        this.teachers = [];
        this.currentSection = 'teacher-list';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTeachers();
    }

    bindEvents() {
        // Add Teacher Form
        const addTeacherForm = document.getElementById('add-teacher-form');
        if (addTeacherForm) {
            addTeacherForm.addEventListener('submit', (e) => this.handleAddTeacher(e));
        }
    }

    async loadTeachers() {
        try {
            console.log('Loading teachers...');
            this.teachers = await this.apiService.getTeachers();
            this.displayTeachers(this.teachers);
            this.populateTeacherDropdown();
        } catch (error) {
            console.error('Error loading teachers:', error);
            this.showError('Failed to load teachers');
        }
    }

    displayTeachers(teachers) {
        const container = document.getElementById('teachers-grid');
        if (!container) return;

        if (!teachers || teachers.length === 0) {
            container.innerHTML = `
                <div class="no-teachers">
                    <i class="fas fa-chalkboard-teacher" style="font-size: 3rem; margin-bottom: 1rem; color: #bdc3c7;"></i>
                    <h4>No Teachers Found</h4>
                    <p>Click "Add Teacher" to add your first teacher.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = teachers.map(teacher => this.createTeacherCard(teacher)).join('');
    }

    createTeacherCard(teacher) {
        const initials = teacher.name ? teacher.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'T';
        
        return `
            <div class="teacher-card" data-teacher-id="${teacher.id || teacher.objectId}">
                <div class="teacher-avatar">
                    ${teacher.imageUrl ? 
                        `<img src="${teacher.imageUrl}" alt="${teacher.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div class="teacher-avatar-placeholder" style="display:none;">${initials}</div>` :
                        `<div class="teacher-avatar-placeholder">${initials}</div>`
                    }
                </div>
                <div class="teacher-info">
                    <h4>${teacher.name || 'Unnamed Teacher'}</h4>
                    <div class="teacher-subject">${teacher.subject || 'No Subject Assigned'}</div>
                    <div class="teacher-email">${teacher.email || 'No Email'}</div>
                    <div class="teacher-details">
                        <span class="teacher-status ${teacher.status === 'active' ? 'status-active' : 'status-inactive'}">
                            ${teacher.status || 'active'}
                        </span>
                        <span class="teacher-id">ID: ${(teacher.id || teacher.objectId || '').substring(0, 8)}</span>
                    </div>
                    <div class="teacher-actions">
                        <button class="btn-small btn-present" onclick="teacherManager.markAttendance('${teacher.id || teacher.objectId}', 'present')">
                            <i class="fas fa-check"></i> Present
                        </button>
                        <button class="btn-small btn-edit" onclick="teacherManager.editTeacher('${teacher.id || teacher.objectId}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async handleAddTeacher(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const teacherData = {
            name: formData.get('teacher-name'),
            subject: formData.get('teacher-subject'),
            email: formData.get('teacher-email'),
            phone: formData.get('teacher-phone'),
            qualification: formData.get('teacher-qualification'),
            experience: formData.get('teacher-experience'),
            address: formData.get('teacher-address'),
            dateOfJoining: formData.get('date-of-joining'),
            salary: formData.get('teacher-salary'),
            status: 'active'
        };

        // Validate required fields
        if (!teacherData.name || !teacherData.subject) {
            this.showError('Please fill in all required fields');
            return;
        }

        try {
            const newTeacher = await this.apiService.addTeacher(teacherData);
            this.teachers.push(newTeacher);
            this.displayTeachers(this.teachers);
            
            // Reset form
            e.target.reset();
            
            // Show success message
            this.showSuccess(`Teacher ${teacherData.name} added successfully!`);
            
            // Switch to teacher list view
            this.showTeacherList();
            
        } catch (error) {
            console.error('Error adding teacher:', error);
            this.showError('Failed to add teacher. Please try again.');
        }
    }

    async markAttendance(teacherId, status) {
        try {
            const teacher = this.teachers.find(t => (t.id || t.objectId) === teacherId);
            if (!teacher) return;

            const today = new Date().toISOString().split('T')[0];
            const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);

            const attendanceData = {
                teacherName: teacher.name,
                teacherId: teacherId,
                subject: teacher.subject,
                status: status,
                checkInTime: currentTime,
                date: today
            };

            await this.apiService.markTeacherAttendance(attendanceData);
            this.showSuccess(`Marked ${teacher.name} as ${status}!`);
            
            // Update dashboard if visible
            if (typeof loadDashboardData === 'function') {
                loadDashboardData();
            }
            
        } catch (error) {
            console.error('Error marking attendance:', error);
            this.showError('Failed to mark attendance. Please try again.');
        }
    }

    async editTeacher(teacherId) {
        const teacher = this.teachers.find(t => (t.id || t.objectId) === teacherId);
        if (!teacher) return;

        // Create edit modal
        this.showEditModal(teacher);
    }

    showEditModal(teacher) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Edit Teacher</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="edit-teacher-form">
                    <div class="form-group">
                        <label>Teacher Name *</label>
                        <input type="text" name="teacher-name" value="${teacher.name}" required>
                    </div>
                    <div class="form-group">
                        <label>Subject *</label>
                        <input type="text" name="teacher-subject" value="${teacher.subject}" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" name="teacher-email" value="${teacher.email || ''}">
                    </div>
                    <div class="form-group">
                        <label>Phone</label>
                        <input type="tel" name="teacher-phone" value="${teacher.phone || ''}">
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                        <button type="submit" class="btn-primary">Update Teacher</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        modal.querySelector('#edit-teacher-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleEditTeacher(e, teacher.id || teacher.objectId);
            modal.remove();
        });
    }

    async handleEditTeacher(e, teacherId) {
        const formData = new FormData(e.target);
        const updateData = {
            name: formData.get('teacher-name'),
            subject: formData.get('teacher-subject'),
            email: formData.get('teacher-email'),
            phone: formData.get('teacher-phone')
        };

        try {
            await this.apiService.updateTeacher(teacherId, updateData);
            
            // Update local data
            const teacherIndex = this.teachers.findIndex(t => (t.id || t.objectId) === teacherId);
            if (teacherIndex !== -1) {
                this.teachers[teacherIndex] = { ...this.teachers[teacherIndex], ...updateData };
            }
            
            this.displayTeachers(this.teachers);
            this.showSuccess('Teacher updated successfully!');
            
        } catch (error) {
            console.error('Error updating teacher:', error);
            this.showError('Failed to update teacher. Please try again.');
        }
    }

    populateTeacherDropdown() {
        const select = document.getElementById('teacher-select');
        if (!select) return;

        const teacherOptions = this.teachers.map(teacher => 
            `<option value="${teacher.name}" data-subject="${teacher.subject}">
                ${teacher.name} - ${teacher.subject}
            </option>`
        ).join('');

        select.innerHTML = '<option value="">Select Teacher</option>' + teacherOptions;
    }

    showTeacherForm() {
        this.currentSection = 'teacher-form';
        document.querySelectorAll('.teacher-section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById('add-teacher-section').style.display = 'block';
    }

    showTeacherList() {
        this.currentSection = 'teacher-list';
        document.querySelectorAll('.teacher-section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById('teachers-overview').style.display = 'block';
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize teacher manager when DOM is loaded
let teacherManager;
document.addEventListener('DOMContentLoaded', function() {
    if (typeof apiService !== 'undefined') {
        teacherManager = new TeacherManager(apiService);
    }
});
// Student Management Module
class StudentManager {
    constructor(apiService) {
        this.apiService = apiService;
        this.students = [];
        this.currentSection = 'student-list';
        
        // Check authentication before initializing
        this.checkAuthentication();
        this.init();
    }

    checkAuthentication() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn !== 'true') {
            window.location.href = 'login.html';
            return;
        }
    }

    init() {
        console.log('🚀 Initializing StudentManager...');
        this.bindEvents();
        this.loadStudents();
        this.loadClasses();
        
        // Ensure fallback classes are available
        setTimeout(() => {
            if (!this.classes || this.classes.length === 0) {
                console.log('📚 Using fallback classes...');
                this.classes = [
                    { id: 'class1', classname: 'Morning Class A' },
                    { id: 'class2', classname: 'Morning Class B' },
                    { id: 'class3', classname: 'Morning Class C' },
                    { id: 'class4', classname: 'Evening Class A' },
                    { id: 'class5', classname: 'Evening Class B' },
                    { id: 'class6', classname: 'Evening Class C' },
                    { id: 'class7', classname: 'Grade 1' },
                    { id: 'class8', classname: 'Grade 2' },
                    { id: 'class9', classname: 'Grade 3' },
                    { id: 'class10', classname: 'Grade 4' },
                    { id: 'class11', classname: 'Grade 5' },
                    { id: 'class12', classname: 'Special Class' }
                ];
            }
            console.log('✅ Final classes available:', this.classes);
        }, 1000);
    }

    bindEvents() {
        // Add Student Form
        const addStudentForm = document.getElementById('student-form');
        if (addStudentForm) {
            addStudentForm.addEventListener('submit', (e) => this.handleAddStudent(e));
        }

        // Student filter
        const classFilter = document.getElementById('class-filter');
        if (classFilter) {
            classFilter.addEventListener('change', (e) => this.filterStudentsByClass(e.target.value));
        }
    }

    async loadStudents() {
        try {
            console.log('Loading students...');
            this.students = await this.apiService.getStudents();
            
            // Debug: Log the first student to see actual field structure
            if (this.students && this.students.length > 0) {
                console.log('📋 First student data structure from Back4App:', this.students[0]);
                console.log('Available fields:', Object.keys(this.students[0]));
            }
            
            // If no students from API, add some sample data for testing
            if (!this.students || this.students.length === 0) {
                this.students = [
                    {
                        id: 'sample1',
                        name: 'John Doe',
                        motherName: 'Jane Doe',
                        fatherName: 'Robert Doe',
                        address: '123 Main St, City',
                        phoneNumber: '555-0123',
                        class: 'Grade 10',
                        morningClass: { classname: '3 H', objectId: 'morning1' },
                        eveningClass: { classname: '4 H', objectId: 'evening1' },
                        dateOfBirth: '2008-05-15'
                    },
                    {
                        id: 'sample2',
                        name: 'Emma Smith',
                        motherName: 'Sarah Smith',
                        fatherName: 'Michael Smith',
                        address: '456 Oak Ave, Town',
                        phoneNumber: '555-0456',
                        class: 'Grade 9',
                        morningClass: { classname: '5 H', objectId: 'morning2' },
                        eveningClass: { classname: '6 H', objectId: 'evening2' },
                        dateOfBirth: '2009-03-22'
                    }
                ];
            }
            
            this.displayStudents(this.students);
            this.populateStudentDropdown();
        } catch (error) {
            console.error('Error loading students:', error);
            this.showError('Failed to load students');
            
            // Show sample data even if API fails
            this.students = [
                {
                    id: 'sample1',
                    name: 'John Doe',
                    motherName: 'Jane Doe',
                    fatherName: 'Robert Doe',
                    address: '123 Main St, City',
                    phoneNumber: '555-0123',
                    class: 'Grade 10',
                    morningClass: { classname: '3 H', objectId: 'morning1' },
                    eveningClass: { classname: '4 H', objectId: 'evening1' },
                    dateOfBirth: '2008-05-15'
                }
            ];
            this.displayStudents(this.students);
        }
    }

    async loadClasses() {
        try {
            console.log('📚 Loading classes from API...');
            this.classes = await this.apiService.getClasses();
            console.log('✅ Classes loaded from API:', this.classes);
            
            // Debug: Log the first class to see actual field structure
            if (this.classes && this.classes.length > 0) {
                console.log('🔍 First class data structure:', this.classes[0]);
                console.log('🔍 Available class fields:', Object.keys(this.classes[0]));
            } else {
                console.log('⚠️ No classes returned from API');
            }
            
            this.populateClassDropdowns();
            this.populateClassFilter();
        } catch (error) {
            console.error('❌ Error loading classes from API:', error);
            console.log('📚 Using fallback classes...');
            // Use fallback classes with correct field name 'classname'
            this.classes = [
                { id: 'class1', classname: 'Morning Class A' },
                { id: 'class2', classname: 'Morning Class B' },
                { id: 'class3', classname: 'Morning Class C' },
                { id: 'class4', classname: 'Evening Class A' },
                { id: 'class5', classname: 'Evening Class B' },
                { id: 'class6', classname: 'Evening Class C' },
                { id: 'class7', classname: 'Grade 1' },
                { id: 'class8', classname: 'Grade 2' },
                { id: 'class9', classname: 'Grade 3' },
                { id: 'class10', classname: 'Grade 4' },
                { id: 'class11', classname: 'Grade 5' },
                { id: 'class12', classname: 'Special Class' }
            ];
            console.log('✅ Fallback classes set:', this.classes);
            this.populateClassDropdowns();
            this.populateClassFilter();
        }
    }

    populateEditClassDropdowns(student) {
        console.log('🔧 populateEditClassDropdowns called');
        
        const morningSelect = document.getElementById('edit-morning-class');
        const eveningSelect = document.getElementById('edit-evening-class');
        
        console.log('🔍 Morning select element:', morningSelect);
        console.log('🔍 Evening select element:', eveningSelect);
        console.log('🔍 Available classes:', this.classes);
        
        if (!morningSelect || !eveningSelect) {
            console.error('❌ Select elements not found!');
            return;
        }
        
        // Use the same classes that populate the filter dropdown
        if (!this.classes || this.classes.length === 0) {
            console.error('❌ No classes available! Attempting to reload...');
            this.loadClasses().then(() => {
                this.populateEditClassDropdowns(student);
            });
            return;
        }

        console.log('📚 Using classes for dropdowns:', this.classes);

        // Get current values for pre-selection
        const currentMorningClassId = (student.morningClass && typeof student.morningClass === 'object') ? 
            (student.morningClass.objectId || student.morningClass.id) : student.morningClass || '';
        const currentEveningClassId = (student.eveningClass && typeof student.eveningClass === 'object') ? 
            (student.eveningClass.objectId || student.eveningClass.id) : student.eveningClass || '';

        // Instead of filtering by "morning" and "evening", let's use ALL classes for both dropdowns
        // This matches what you see in the class filter dropdown
        
        // Populate morning class dropdown with ALL available classes
        if (morningSelect) {
            console.log('🌅 Populating morning dropdown with all classes...');
            morningSelect.innerHTML = '<option value="">Select Morning Class</option>';
            
            this.classes.forEach(classObj => {
                const className = classObj.classname || classObj.className || classObj.name || classObj.title || 'Unknown Class';
                const classId = classObj.id || classObj.objectId;
                console.log('📝 Adding class to morning dropdown:', className, classId);
                const option = document.createElement('option');
                option.value = classId;
                option.textContent = className;
                option.selected = (classId === currentMorningClassId);
                morningSelect.appendChild(option);
            });
            console.log('✅ Morning dropdown populated with', morningSelect.options.length, 'options');
        }

        // Populate evening class dropdown with ALL available classes
        if (eveningSelect) {
            console.log('🌆 Populating evening dropdown with all classes...');
            eveningSelect.innerHTML = '<option value="">Select Evening Class</option>';
            
            this.classes.forEach(classObj => {
                const className = classObj.classname || classObj.className || classObj.name || classObj.title || 'Unknown Class';
                const classId = classObj.id || classObj.objectId;
                console.log('📝 Adding class to evening dropdown:', className, classId);
                const option = document.createElement('option');
                option.value = classId;
                option.textContent = className;
                option.selected = (classId === currentEveningClassId);
                eveningSelect.appendChild(option);
            });
            console.log('✅ Evening dropdown populated with', eveningSelect.options.length, 'options');
        }
    }

    populateClassFilter() {
        const classFilter = document.getElementById('class-filter');
        if (!classFilter || !this.classes) return;

        // Clear existing options (except first default option)
        classFilter.innerHTML = '<option value="">All Classes</option>';

        // Populate filter with available classes
        this.classes.forEach((classObj, index) => {
            const className = classObj.classname || 
                            classObj.className || 
                            classObj.name || 
                            classObj.title ||
                            `Class ${index + 1}`;
            
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            classFilter.appendChild(option);
        });
    }

    populateClassDropdowns() {
        const mainClassSelect = document.getElementById('student-class');
        const morningSelect = document.getElementById('morning-class');
        const eveningSelect = document.getElementById('evening-class');
        
        if (!this.classes) return;

        console.log('🔧 Populating dropdowns with classes:', this.classes);

        // Populate main class dropdown
        if (mainClassSelect) {
            mainClassSelect.innerHTML = '<option value="">Select Class</option>';
            this.classes.forEach((classObj, index) => {
                // Use the correct field name from Back4App: 'classname'
                const className = classObj.classname || 
                                classObj.className || 
                                classObj.name || 
                                classObj.title || 
                                `Class ${index + 1}`;
                                
                const classId = classObj.id || classObj.objectId || `class_${index}`;
                
                console.log(`🎓 Class ${index}:`, { id: classId, name: className, originalObject: classObj });
                
                const option = document.createElement('option');
                option.value = className; // Use class name as value for main class
                option.textContent = className;
                mainClassSelect.appendChild(option);
            });
        }

        // Populate morning/evening class dropdowns (these use object IDs for pointers)
        if (morningSelect && eveningSelect) {
            // Clear existing options (except first default option)
            morningSelect.innerHTML = '<option value="">Select Morning Class</option>';
            eveningSelect.innerHTML = '<option value="">Select Evening Class</option>';

            // Populate both dropdowns with available classes
            this.classes.forEach((classObj, index) => {
                const className = classObj.classname || 
                                classObj.className || 
                                classObj.name || 
                                classObj.title || 
                                `Class ${index + 1}`;
                                
                const classId = classObj.id || classObj.objectId || `class_${index}`;
                
                const morningOption = document.createElement('option');
                morningOption.value = classId; // Use object ID for pointer references
                morningOption.textContent = className;
                morningSelect.appendChild(morningOption);
                
                const eveningOption = document.createElement('option');
                eveningOption.value = classId; // Use object ID for pointer references
                eveningOption.textContent = className;
                eveningSelect.appendChild(eveningOption);
            });
        }
    }

    displayStudents(students) {
        const tableBody = document.getElementById('students-table-body');
        if (!tableBody) return;

        if (!students || students.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-user-graduate" style="font-size: 2rem; margin-bottom: 1rem; color: #bdc3c7; display: block;"></i>
                        <div style="color: #7f8c8d;">No Students Found</div>
                        <small style="color: #95a5a6;">Click "Add Student" to add your first student.</small>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = students.map(student => this.createStudentRow(student)).join('');
    }

    createStudentRow(student) {
        const studentId = student.id || student.objectId || '';
        const shortId = studentId.substring(0, 8);
        const name = student.name || 'Unnamed Student';
        const motherName = student.motherName || '-';
        const fatherName = student.fatherName || '-';
        const address = student.address || '-';
        // Phone may be stored under different keys depending on import: phoneNumber, phone, parentPhone, contact
        const phone = student.phoneNumber || student.phone || student.parentPhone || student.contact || '-';

        // Debug logging to see the actual structure
        console.log('🔍 Student morning class data:', student.morningClass);
        console.log('🔍 Student evening class data:', student.eveningClass);

        // Handle morningClass (not morningClassId) - try multiple possible structures
        let morningClass = '-';
        if (student.morningClass) {
            if (typeof student.morningClass === 'object') {
                // It's a pointer object, try to get the classname
                morningClass = student.morningClass.classname || 
                              student.morningClass.className || 
                              student.morningClass.name || 
                              student.morningClass.objectId || 
                              'Unknown Morning Class';
            } else {
                // It's just a string ID
                morningClass = student.morningClass;
            }
        }

        // Handle eveningClass - try multiple possible structures  
        let eveningClass = '-';
        if (student.eveningClass) {
            if (typeof student.eveningClass === 'object') {
                // It's a pointer object, try to get the classname
                eveningClass = student.eveningClass.classname || 
                              student.eveningClass.className || 
                              student.eveningClass.name || 
                              student.eveningClass.objectId || 
                              'Unknown Evening Class';
            } else {
                // It's just a string ID
                eveningClass = student.eveningClass;
            }
        }

        const className = student.class || student.className || '-';
        const dob = student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '-';
        
        return `
            <tr data-student-id="${studentId}">
                <td>${shortId}</td>
                <td>${name}</td>
                <td>${motherName}</td>
                <td>${fatherName}</td>
                <td>${address}</td>
                <td>${phone}</td>
                <td><span class="class-badge">${morningClass}</span></td>
                <td><span class="class-badge">${eveningClass}</span></td>
                <td>${dob}</td>
                <td class="actions-cell">
                    <button class="btn btn-sm btn-secondary" onclick="studentManager.editStudent('${studentId}')" title="Edit Student">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="studentManager.deleteStudent('${studentId}')" title="Delete Student">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
    }

    async handleAddStudent(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const studentData = {
            name: formData.get('name'),
            class: formData.get('className'), // Store as 'class' for consistency
            className: formData.get('className'), // Also keep className for compatibility
            motherName: formData.get('motherName'),
            fatherName: formData.get('fatherName'),
            phoneNumber: formData.get('phoneNumber'), // Use correct field name
            address: formData.get('address'),
            dateOfBirth: formData.get('dateOfBirth'),
            parentName: formData.get('parentName'),
            parentPhone: formData.get('parentPhone'),
            status: 'active'
        };

        // Handle morning and evening class pointers
        const morningClassId = formData.get('morningClassId');
        const eveningClassId = formData.get('eveningClass');
        
        if (morningClassId) {
            // Create Back4App pointer format for morningClass (not morningClassId)
            studentData.morningClass = {
                __type: "Pointer",
                className: "Class", // Assuming your Back4App class name is "Class"
                objectId: morningClassId
            };
        }
        
        if (eveningClassId) {
            // Create Back4App pointer format
            studentData.eveningClass = {
                __type: "Pointer",
                className: "Class", // Assuming your Back4App class name is "Class"
                objectId: eveningClassId
            };
        }

        console.log('🎓 Sending student data to Back4App:', studentData);

        // Validate required fields
        if (!studentData.name || !studentData.class) {
            this.showError('Please fill in all required fields (Name and Class)');
            return;
        }

        try {
            const newStudent = await this.apiService.addStudent(studentData);
            this.students.push(newStudent);
            this.displayStudents(this.students);
            
            // Reset form
            e.target.reset();
            
            // Show success message
            this.showSuccess(`Student ${studentData.name} added successfully!`);
            
            // Switch to student list view
            this.showStudentList();
            
        } catch (error) {
            console.error('Error adding student:', error);
            this.showError('Failed to add student. Please try again.');
        }
    }

    async markAttendance(studentId, status) {
        try {
            const student = this.students.find(s => (s.id || s.objectId) === studentId);
            if (!student) return;

            const today = new Date().toISOString().split('T')[0];
            const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);

            const attendanceData = {
                studentName: student.name,
                studentId: studentId,
                class: student.class,
                status: status,
                checkInTime: currentTime,
                date: today
            };

            await this.apiService.markStudentAttendance(attendanceData);
            this.showSuccess(`Marked ${student.name} as ${status}!`);
            
            // Update dashboard if visible
            if (typeof loadDashboardData === 'function') {
                loadDashboardData();
            }
            
        } catch (error) {
            console.error('Error marking attendance:', error);
            this.showError('Failed to mark attendance. Please try again.');
        }
    }

    async editStudent(studentId) {
        const student = this.students.find(s => (s.id || s.objectId) === studentId);
        if (!student) return;

        // Close any existing modals first
        const existingModals = document.querySelectorAll('.modal-overlay, .modal, #student-modal');
        console.log('🗑️ Removing existing modals:', existingModals.length);
        existingModals.forEach(modal => modal.remove());

        // Also check for any rogue select elements that might be floating
        const floatingSelects = document.querySelectorAll('select:not([id])');
        console.log('🗑️ Removing floating selects:', floatingSelects.length);
        floatingSelects.forEach(select => select.remove());

        // Create edit modal
        this.showEditModal(student);
    }

    showEditModal(student) {
        console.log('🔧 Opening Edit Modal for student:', student);
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        // Get morning and evening class names if they exist
        const currentMorningClass = (student.morningClass && typeof student.morningClass === 'object') ? 
            student.morningClass.classname || student.morningClass.className || student.morningClass.name : 
            student.morningClass || '';
            
        const currentEveningClass = (student.eveningClass && typeof student.eveningClass === 'object') ? 
            student.eveningClass.classname || student.eveningClass.className || student.eveningClass.name : 
            student.eveningClass || '';

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2>Edit Student</h2>
                    <button class="close" onclick="this.closest('.modal-overlay').remove()" type="button">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="edit-student-form" class="modal-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-student-name">Full Name *</label>
                                <input type="text" id="edit-student-name" name="name" value="${student.name || ''}" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-mother-name">Mother Name</label>
                                <input type="text" id="edit-mother-name" name="motherName" value="${student.motherName || ''}">
                            </div>
                            <div class="form-group">
                                <label for="edit-father-name">Father Name</label>
                                <input type="text" id="edit-father-name" name="fatherName" value="${student.fatherName || ''}">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-student-phone">Phone Number</label>
                                <input type="tel" id="edit-student-phone" name="phoneNumber" value="${student.phoneNumber || student.phone || ''}">
                            </div>
                            <div class="form-group">
                                <label for="edit-student-dob">Date of Birth</label>
                                <input type="date" id="edit-student-dob" name="dateOfBirth" value="${student.dateOfBirth || ''}">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-student-address">Address</label>
                                <textarea id="edit-student-address" name="address" rows="2">${student.address || ''}</textarea>
                            </div>
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <label for="edit-morning-class" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Morning Class</label>
                            <select id="edit-morning-class" name="morningClassId" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; background: white;">
                                <option value="">Select Morning Class</option>
                                <!-- Will be populated dynamically -->
                            </select>
                        </div>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <label for="edit-evening-class" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Evening Class</label>
                            <select id="edit-evening-class" name="eveningClass" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; background: white;">
                                <option value="">Select Evening Class</option>
                                <!-- Will be populated dynamically -->
                            </select>
                        </div>
                    </form>
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button type="submit" form="edit-student-form" class="btn btn-primary">Update Student</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        console.log('✅ Modal appended to body, now populating dropdowns...');
        // Add a small delay to ensure DOM elements are available
        setTimeout(() => {
            this.populateEditClassDropdowns(student);
        }, 100);

        // Handle form submission
        modal.querySelector('#edit-student-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleEditStudent(e, student.id || student.objectId);
            modal.remove();
        });
    }

    async handleEditStudent(e, studentId) {
        const formData = new FormData(e.target);
        const updateData = {
            name: formData.get('name'),
            motherName: formData.get('motherName'),
            fatherName: formData.get('fatherName'),
            phoneNumber: formData.get('phoneNumber'),
            address: formData.get('address'),
            dateOfBirth: formData.get('dateOfBirth')
        };

        // Handle morning and evening class pointers
        const morningClassId = formData.get('morningClassId');
        const eveningClassId = formData.get('eveningClass');
        
        if (morningClassId) {
            updateData.morningClass = {
                __type: "Pointer",
                className: "Class",
                objectId: morningClassId
            };
        } else {
            updateData.morningClass = null; // Clear the pointer if no selection
        }
        
        if (eveningClassId) {
            updateData.eveningClass = {
                __type: "Pointer",
                className: "Class",
                objectId: eveningClassId
            };
        } else {
            updateData.eveningClass = null; // Clear the pointer if no selection
        }

        console.log('🔄 Updating student with data:', updateData);

        try {
            await this.apiService.updateStudent(studentId, updateData);
            
            // Update local data
            const studentIndex = this.students.findIndex(s => (s.id || s.objectId) === studentId);
            if (studentIndex !== -1) {
                this.students[studentIndex] = { ...this.students[studentIndex], ...updateData };
            }
            
            this.displayStudents(this.students);
            this.showSuccess('Student updated successfully!');
            
        } catch (error) {
            console.error('Error updating student:', error);
            this.showError('Failed to update student. Please try again.');
        }
    }

    async deleteStudent(studentId) {
        console.log('🗑️ Delete student requested for ID:', studentId);
        
        const student = this.students.find(s => (s.id || s.objectId) === studentId);
        if (!student) {
            console.error('Student not found for deletion');
            return;
        }

        // Show custom confirmation dialog
        this.showDeleteConfirmation(student, studentId);
    }

    showDeleteConfirmation(student, studentId) {
        // Remove any existing modals
        const existingModals = document.querySelectorAll('.modal-overlay');
        existingModals.forEach(modal => modal.remove());

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; width: 90%; background: white; border-radius: 12px; padding: 0; overflow: hidden;">
                <div class="modal-header" style="background: #e74c3c; color: white; padding: 1.5rem 2rem; border-bottom: none;">
                    <h2 style="margin: 0; color: white; display: flex; align-items: center;">
                        <i class="fas fa-exclamation-triangle" style="margin-right: 0.5rem;"></i>
                        Confirm Deletion
                    </h2>
                </div>
                <div class="modal-body" style="padding: 2rem;">
                    <p style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #2c3e50;">
                        Are you sure you want to delete this student?
                    </p>
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; border-left: 4px solid #e74c3c;">
                        <strong style="color: #2c3e50;">Student: ${student.name}</strong><br>
                        <span style="color: #6c757d; font-size: 0.9rem;">Mother: ${student.motherName || 'N/A'}</span><br>
                        <span style="color: #6c757d; font-size: 0.9rem;">Father: ${student.fatherName || 'N/A'}</span>
                    </div>
                    <p style="margin: 1rem 0 0 0; color: #e74c3c; font-weight: 500;">
                        <i class="fas fa-warning"></i> This action cannot be undone.
                    </p>
                </div>
                <div class="modal-actions" style="padding: 1rem 2rem 2rem 2rem; display: flex; gap: 1rem; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()" style="padding: 0.75rem 1.5rem;">
                        Cancel
                    </button>
                    <button type="button" class="btn btn-danger" id="confirm-delete-btn" style="padding: 0.75rem 1.5rem; background: #e74c3c; border-color: #e74c3c;">
                        <i class="fas fa-trash"></i> Delete Student
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle confirm delete
        document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
            modal.remove();
            await this.performDeleteStudent(studentId, student);
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    async performDeleteStudent(studentId, student) {
        try {
            console.log('🗑️ Deleting student from database...');
            
            // Call API to delete student
            await this.apiService.deleteStudent(studentId);
            
            console.log('✅ Student deleted from database');
            
            // Remove student from local array
            this.students = this.students.filter(s => (s.id || s.objectId) !== studentId);
            
            // Refresh the student list display
            this.displayStudents(this.students);
            
            // Show success message
            this.showSuccess(`Student "${student.name}" has been deleted successfully.`);
            
        } catch (error) {
            console.error('❌ Error deleting student:', error);
            this.showError('Failed to delete student. Please try again.');
        }
    }

    filterStudentsByClass(className) {
        if (!className || className === '') {
            this.displayStudents(this.students);
        } else {
            const filteredStudents = this.students.filter(student => 
                student.class === className || student.className === className
            );
            this.displayStudents(filteredStudents);
        }
    }

    populateStudentDropdown() {
        const select = document.getElementById('student-select');
        if (!select) return;

        const studentOptions = this.students.map(student => 
            `<option value="${student.name}" data-class="${student.class}" data-roll="${student.rollNumber}">
                ${student.name} - ${student.class} (${student.rollNumber})
            </option>`
        ).join('');

        select.innerHTML = '<option value="">Select Student</option>' + studentOptions;
    }

    showStudentForm() {
        this.currentSection = 'student-form';
        document.querySelectorAll('.student-section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById('add-student-section').style.display = 'block';
    }

    showStudentList() {
        this.currentSection = 'student-list';
        document.querySelectorAll('.student-section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById('students-overview').style.display = 'block';
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

    showAddStudentModal() {
        // Remove any existing modals
        const existingModals = document.querySelectorAll('.modal-overlay');
        existingModals.forEach(modal => modal.remove());

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        // Use the same form structure as showEditModal, but with empty/default values
        const emptyStudent = {
            name: '',
            motherName: '',
            fatherName: '',
            phoneNumber: '',
            address: '',
            dateOfBirth: '',
            morningClass: '',
            eveningClass: ''
        };

        // Create modal using the same logic as showEditModal
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2>Add Student</h2>
                    <button class="close" onclick="this.closest('.modal-overlay').remove()" type="button">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="add-student-form" class="modal-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="add-student-name">Full Name *</label>
                                <input type="text" id="add-student-name" name="name" value="" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="add-mother-name">Mother Name</label>
                                <input type="text" id="add-mother-name" name="motherName" value="">
                            </div>
                            <div class="form-group">
                                <label for="add-father-name">Father Name</label>
                                <input type="text" id="add-father-name" name="fatherName" value="">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="add-student-phone">Phone Number</label>
                                <input type="tel" id="add-student-phone" name="phoneNumber" value="">
                            </div>
                            <div class="form-group">
                                <label for="add-student-dob">Date of Birth</label>
                                <input type="date" id="add-student-dob" name="dateOfBirth" value="">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="add-student-address">Address</label>
                                <textarea id="add-student-address" name="address" rows="2"></textarea>
                            </div>
                        </div>
                        <div style="margin-bottom: 1.5rem;">
                            <label for="add-morning-class" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Morning Class</label>
                            <select id="add-morning-class" name="morningClassId" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; background: white;">
                                <option value="">Select Morning Class</option>
                            </select>
                        </div>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <label for="add-evening-class" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Evening Class</label>
                            <select id="add-evening-class" name="eveningClass" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; background: white;">
                                <option value="">Select Evening Class</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button type="submit" form="add-student-form" class="btn btn-primary">Add Student</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Populate dropdowns
        this.populateEditClassDropdowns({});

        // Handle form submission
        modal.querySelector('#add-student-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAddStudent(e);
            modal.remove();
        });
    }
}

// Initialize student manager when DOM is loaded
let studentManager;
document.addEventListener('DOMContentLoaded', function() {
    if (typeof apiService !== 'undefined') {
        studentManager = new StudentManager(apiService);
    }
});
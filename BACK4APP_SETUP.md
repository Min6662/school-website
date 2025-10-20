# Back4App Integration Setup Guide

## 🚀 Quick Setup for Back4App Integration

### Step 1: Get Your Back4App Credentials

1. **Login to Back4App Dashboard**
   - Go to [https://www.back4app.com/](https://www.back4app.com/)
   - Login to your account

2. **Navigate to Your App**
   - Select your existing app OR create a new app
   - Go to **App Settings > Security & Keys**

3. **Copy Your Credentials**
   - **Application ID**: Copy this value
   - **REST API Key**: Copy this value

### Step 2: Configure Your Frontend

1. **Update config.js**
   Open `config.js` and replace the placeholder values:
   ```javascript
   APP_ID: 'YOUR_ACTUAL_APPLICATION_ID',          // Replace with your App ID
   REST_API_KEY: 'YOUR_ACTUAL_REST_API_KEY',      // Replace with your REST API Key
   ```

### Step 3: Set Up Back4App Database Classes

Your School Management System will create these classes in Back4App:

#### Required Classes (Tables):

1. **Teachers**
   - Fields: `name` (String), `subject` (String)

2. **Students**
   - Fields: `name` (String), `rollNumber` (String), `class` (String)

3. **SchoolClasses**
   - Fields: `name` (String), `teacher` (String), `capacity` (Number), `subjects` (Array)

4. **TeacherAttendance**
   - Fields: `teacherName` (String), `subject` (String), `status` (String), `checkInTime` (String), `checkOutTime` (String), `date` (String)

5. **StudentAttendance**
   - Fields: `studentName` (String), `rollNumber` (String), `class` (String), `status` (String), `date` (String)

6. **ExamResults**
   - Fields: `studentName` (String), `rollNumber` (String), `class` (String), `examName` (String), `subject` (String), `marksObtained` (Number), `totalMarks` (Number), `grade` (String), `percentage` (Number), `date` (String)

### Step 4: Test the Integration

1. **Open your website** (`index.html`)
2. **Check browser console** (F12) for any connection errors
3. **Try adding data**:
   - Add a class first
   - Add teachers and students
   - Mark attendance
   - Enter exam results

## 🔧 Manual Database Setup (Optional)

If you want to create the classes manually in Back4App:

### Option A: Auto-Creation (Recommended)
- Classes will be created automatically when you first add data
- Just start using the system!

### Option B: Manual Creation
1. Go to **Back4App Dashboard > Database Browser**
2. Click **"Create a class"**
3. Create each class with the specified fields

## 📋 Sample Data Structure

### Sample Teacher Record:
```json
{
  "objectId": "abc123",
  "name": "John Smith",
  "subject": "Mathematics",
  "createdAt": "2025-10-16T10:00:00.000Z",
  "updatedAt": "2025-10-16T10:00:00.000Z"
}
```

### Sample Student Record:
```json
{
  "objectId": "def456",
  "name": "Alice Johnson",
  "rollNumber": "2025001",
  "class": "Grade-10-A",
  "createdAt": "2025-10-16T10:00:00.000Z",
  "updatedAt": "2025-10-16T10:00:00.000Z"
}
```

### Sample Class Record:
```json
{
  "objectId": "ghi789",
  "name": "Grade-10-A",
  "teacher": "John Smith",
  "capacity": 30,
  "subjects": ["Mathematics", "English", "Science"],
  "createdAt": "2025-10-16T10:00:00.000Z",
  "updatedAt": "2025-10-16T10:00:00.000Z"
}
```

## 🔒 Security Configuration

### Class-Level Permissions (Optional)
For production, set appropriate permissions in Back4App:

1. Go to **Database Browser > [Class Name] > Security**
2. Configure permissions as needed:
   - **Public Read**: Allow for dashboard stats
   - **Public Write**: Allow for adding records
   - **Add Authentication**: For user-specific access

### CORS Settings
Back4App automatically handles CORS for web applications.

## 🚨 Troubleshooting

### Common Issues:

1. **"Invalid Application ID"**
   - Check that `APP_ID` in config.js matches your Back4App Application ID
   - Ensure no extra spaces or characters

2. **"Unauthorized"**
   - Verify `REST_API_KEY` is correct
   - Check that REST API is enabled in Back4App settings

3. **"Class not found"**
   - Classes are created automatically on first data insertion
   - Check class names match exactly (case-sensitive)

4. **CORS Errors**
   - Back4App should handle CORS automatically
   - Try testing from `http://localhost` or your deployed domain

### Debug Steps:

1. **Check Browser Console**
   ```javascript
   // Test API connection in browser console
   console.log('CONFIG:', CONFIG);
   apiService.getClasses().then(console.log).catch(console.error);
   ```

2. **Verify API Calls**
   - Open Browser Developer Tools > Network tab
   - Look for requests to `parseapi.back4app.com`
   - Check request headers include correct Application ID and API Key

3. **Test with Minimal Data**
   - Start by adding one class
   - Then add one teacher
   - Check if data appears in Back4App Dashboard

## 📊 Data Migration (If You Have Existing Data)

### From localStorage to Back4App:

1. **Export localStorage data**:
   ```javascript
   // Run in browser console
   const data = localStorage.getItem('schoolManagementData');
   console.log('Existing data:', JSON.parse(data));
   ```

2. **Import to Back4App**:
   - Use Back4App Dashboard's Import feature
   - Or manually add data through your website interface

## 🌟 Production Checklist

Before going live:

- [ ] Replace placeholder credentials with actual Back4App keys
- [ ] Test all CRUD operations (Create, Read, Update, Delete)
- [ ] Set appropriate class-level permissions in Back4App
- [ ] Test error handling (try with network disconnected)
- [ ] Verify data persistence across browser sessions
- [ ] Test on different devices/browsers

## 📞 Support

### Back4App Resources:
- [Back4App Documentation](https://www.back4app.com/docs/)
- [Back4App REST API Guide](https://www.back4app.com/docs/rest/rest-api-guide)
- [Back4App Community](https://community.back4app.com/)

### Common Back4App Queries:

```javascript
// Get all records
apiService.getStudents()

// Get with filter
apiService.getStudentAttendance('2025-10-16', 'Grade-10-A')

// Add new record
apiService.addStudent({
    name: 'John Doe',
    rollNumber: '2025002',
    class: 'Grade-10-A'
})
```

---

Your School Management System is now ready to work with Back4App! 🎉
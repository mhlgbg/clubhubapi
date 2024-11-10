const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const companyRoutes = require('./routes/company');


const bodyParser = require('body-parser');
const uploadRoutes = require('./routes/upload.js');  // Route cho upload

const userRoutes = require('./routes/user.js');

const issueCategory = require('./routes/issueCategory.js');
const issueRoutes = require('./routes/issue.js');

const issueCommentRoutes = require('./routes/issueComment.js');

const logRoutes = require('./routes/log.js'); // Đường dẫn đến file logRoutes

const sportRoutes  = require('./routes/sport.js');

const articleRoutes  = require('./routes/article.js');
const coachRoutes = require('./routes/coach.js');
const clubRoutes = require('./routes/club.js');

const refereeRoutes = require('./routes/referee.js');
const videoRoutes = require('./routes/video.js');
const clubMemberRoutes = require('./routes/clubMember.js');
const clubUserRoutes = require('./routes/clubUser.js');
const departmentCustomersRoutes = require('./routes/departmentCustomer.js');

const departmentRoutes = require('./routes/department.js');
const pendingUserRoutes = require('./routes/pendingUser.js');
const clubRegistrationRoutes = require('./routes/clubRegistration.js');
const stadiumRegistrationRoutes = require('./routes/stadiumRegistation.js');
const practiceSessionRoutes = require('./routes/practiceSession.js');
const matchRoutes = require('./routes/match.js');
const tournamentRoutes = require('./routes/tournament.js');
const stadiumRoutes = require('./routes/stadium.js');
const playgroundRoutes = require('./routes/playground.js');
const timeSlotRoutes = require('./routes/timeSlot.js');
const configurationRoutes = require('./routes/configuration.js');
const customerRoutes = require('./routes/customer.js');
const customerTodoListRoutes = require('./routes/customerTodoList.js');
const categoryRoutes = require('./routes/category.js');
const contactRoutes = require('./routes/contact.js');
const taskRoutes = require('./routes/task.js');
const classRoutes = require('./routes/class.js');
const classReportRoutes = require('./routes/classReport.js');
const studentScheduleRoutes = require('./routes/studentSchedule.js');
const studentTaskRoutes = require('./routes/studentTask.js');

const scheduleRoutes = require('./routes/schedule.js');
const userGradeRoutes = require('./routes/userGrade.js');
const employeesRoutes = require('./routes/employee.js');

const app = express();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use(express.json());
// Middleware
app.use(cors());

app.use(bodyParser.json());
app.use('/api/employees', employeesRoutes);

app.use('/api/student-task', studentTaskRoutes);
app.use('/api/user-grade', userGradeRoutes);

app.use('/api/student-schedule', studentScheduleRoutes);

app.use('/api/class-report', classReportRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/classes', classRoutes);

app.use('/api/tasks', taskRoutes);

app.use('/api/companies', companyRoutes);

app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/department-customer', departmentCustomersRoutes);

app.use('/api/issue-categories', issueCategory);
app.use('/api/issues', issueRoutes);
app.use('/api/issues-comment', issueCommentRoutes);
app.use('/api/logs', logRoutes);

app.use('/api/sports', sportRoutes);
app.use('/api/contacts', contactRoutes);

app.use('/api', uploadRoutes);  // Route cho upload ảnh
// Cấu hình để phục vụ các file tĩnh (ảnh upload)


app.use('/api/articles', articleRoutes);  

app.use('/api/coaches', coachRoutes);

app.use('/api/videos', videoRoutes);
app.use('/api/club-members', clubMemberRoutes);
app.use('/api/club-users', clubUserRoutes);

app.use('/api/pending-users', pendingUserRoutes);
app.use('/api/club-registrations', clubRegistrationRoutes);
app.use('/api/stadium-registrations', stadiumRegistrationRoutes);
app.use('/api', clubRoutes);
app.use('/api/matches', matchRoutes);

app.use('/api', refereeRoutes);
app.use('/api/practice-sessions', practiceSessionRoutes);

app.use('/api/tournaments', tournamentRoutes);
app.use('/api/stadiums', stadiumRoutes);
app.use('/api/playgrounds', playgroundRoutes);
app.use('/api/timeslots', timeSlotRoutes);
app.use('/api/configurations', configurationRoutes);
app.use('/api/categories', categoryRoutes);

// Cấu hình để phục vụ các file tĩnh (ảnh upload)

// Use the routes
app.use('/api/customers', customerRoutes);
app.use('/api/customer-todos', customerTodoListRoutes);
// MongoDB connection
mongoose.connect('mongodb://localhost:27017/clubhub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

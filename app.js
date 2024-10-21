const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const bodyParser = require('body-parser');
const uploadRoutes = require('./routes/upload');  // Route cho upload

const userRoutes = require('./routes/user');

const issueCategory = require('./routes/issueCategory');
const issueRoutes = require('./routes/issue');

const issueCommentRoutes = require('./routes/issueComment');

const logRoutes = require('./routes/log'); // Đường dẫn đến file logRoutes

const sportRoutes  = require('./routes/sport');

const articleRoutes  = require('./routes/article');
const coachRoutes = require('./routes/coach');
const clubRoutes = require('./routes/club');

const refereeRoutes = require('./routes/referee');
const videoRoutes = require('./routes/video');
const clubMemberRoutes = require('./routes/clubMember');
const clubUserRoutes = require('./routes/clubUser');
const departmentCustomersRoutes = require('./routes/departmentCustomer');

const departmentRoutes = require('./routes/department');
const pendingUserRoutes = require('./routes/pendingUser');
const clubRegistrationRoutes = require('./routes/clubRegistration');
const stadiumRegistrationRoutes = require('./routes/stadiumRegistation');
const practiceSessionRoutes = require('./routes/practiceSession');
const matchRoutes = require('./routes/match.js');
const tournamentRoutes = require('./routes/tournament.js');
const stadiumRoutes = require('./routes/stadium.js');
const playgroundRoutes = require('./routes/playground.js');
const timeSlotRoutes = require('./routes/timeSlot.js');
const configurationRoutes = require('./routes/configuration.js');
const customerRoutes = require('./routes/customer');
const customerTodoListRoutes = require('./routes/customerTodoList');
const app = express();
app.use(express.json());
// Middleware
app.use(cors());

app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/department-customer', departmentCustomersRoutes);

app.use('/api/issue-categories', issueCategory);
app.use('/api/issues', issueRoutes);
app.use('/api/issues-comment', issueCommentRoutes);
app.use('/api/logs', logRoutes);

app.use('/api/sports', sportRoutes);

app.use('/api', uploadRoutes);  // Route cho upload ảnh
// Cấu hình để phục vụ các file tĩnh (ảnh upload)

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use('/api/articles', articleRoutes);  // Route cho upload ảnh

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

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

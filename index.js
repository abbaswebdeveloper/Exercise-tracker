const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// In-memory database
let users = [];
let exercises = [];
let userIdCounter = 1;
let exerciseIdCounter = 1;

// User Schema
class User {
  constructor(username) {
    this.username = username;
    this._id = userIdCounter++;  // FIX: _id instead of _id
  }
}

// Exercise Schema  
class Exercise {
  constructor(userId, description, duration, date) {
    this._id = exerciseIdCounter++;  // FIX: _id instead of _id
    this.userId = userId;
    this.description = description;
    this.duration = parseInt(duration);
    this.date = date ? new Date(date).toDateString() : new Date().toDateString();
  }
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Exercise Tracker API' });
});

// 1. Create new user
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  
  if (!username) return res.json({ error: 'Username is required' });
  
  const existingUser = users.find(user => user.username === username);
  if (existingUser) return res.json(existingUser);
  
  const newUser = new User(username);
  users.push(newUser);
  
  res.json({ username: newUser.username, _id: newUser._id }); // FIX: _id
});

// 2. Get all users
app.get('/api/users', (req, res) => {
  res.json(users.map(user => ({ username: user.username, _id: user._id }))); // FIX: _id
});

// 3. Add exercise
app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = parseInt(req.params._id);
  const { description, duration, date } = req.body;
  
  const user = users.find(u => u._id === userId);
  if (!user) return res.json({ error: 'User not found' });
  
  if (!description || !duration) return res.json({ error: 'Description and duration are required' });
  
  const exercise = new Exercise(userId, description, duration, date);
  exercises.push(exercise);
  
  res.json({ // FIX: All _id instead of _id
    _id: user._id,
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date
  });
});

// 4. Get exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = parseInt(req.params._id);
  const { from, to, limit } = req.query;
  
  const user = users.find(u => u._id === userId);
  if (!user) return res.json({ error: 'User not found' });
  
  let userExercises = exercises.filter(ex => ex.userId === userId);
  
  if (from) userExercises = userExercises.filter(ex => new Date(ex.date) >= new Date(from));
  if (to) userExercises = userExercises.filter(ex => new Date(ex.date) <= new Date(to));
  if (limit) userExercises = userExercises.slice(0, parseInt(limit));
  
  const log = userExercises.map(ex => ({
    description: ex.description,
    duration: ex.duration,
    date: ex.date
  }));
  
  res.json({ // FIX: _id instead of _id
    _id: user._id,
    username: user.username,
    count: log.length,
    log: log
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = app;
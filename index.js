const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory database (for free tier - no MongoDB needed)
let users = [];
let exercises = [];
let userIdCounter = 1;
let exerciseIdCounter = 1;

// User Schema
class User {
  constructor(username) {
    this.username = username;
    this._id = userIdCounter++;
  }
}

// Exercise Schema  
class Exercise {
  constructor(userId, description, duration, date) {
    this._id = exerciseIdCounter++;
    this.userId = userId;
    this.description = description;
    this.duration = parseInt(duration);
    this.date = date ? new Date(date).toDateString() : new Date().toDateString();
  }
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Exercise Tracker API',
    endpoints: {
      'POST /api/users': 'Create new user',
      'GET /api/users': 'Get all users', 
      'POST /api/users/:_id/exercises': 'Add exercise',
      'GET /api/users/:_id/logs': 'Get exercise log'
    }
  });
});

// 1. Create new user
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.json({ error: 'Username is required' });
  }
  
  // Check if username already exists
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.json(existingUser);
  }
  
  // Create new user
  const newUser = new User(username);
  users.push(newUser);
  
  res.json({
    username: newUser.username,
    _id: newUser._id
  });
});

// 2. Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// 3. Add exercise
app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = parseInt(req.params._id);
  const { description, duration, date } = req.body;
  
  // Find user
  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.json({ error: 'User not found' });
  }
  
  if (!description || !duration) {
    return res.json({ error: 'Description and duration are required' });
  }
  
  // Create exercise
  const exercise = new Exercise(userId, description, duration, date);
  exercises.push(exercise);
  
  // Return user object with exercise fields
  res.json({
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
  
  // Find user
  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.json({ error: 'User not found' });
  }
  
  // Get user's exercises
  let userExercises = exercises.filter(ex => ex.userId === userId);
  
  // Apply date filters
  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(ex => new Date(ex.date) >= fromDate);
  }
  
  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(ex => new Date(ex.date) <= toDate);
  }
  
  // Apply limit
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }
  
  // Format response
  const log = userExercises.map(ex => ({
    description: ex.description,
    duration: ex.duration,
    date: ex.date
  }));
  
  res.json({
    _id: user._id,
    username: user.username,
    count: log.length,
    log: log
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Server configuration
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Exercise Tracker running on port ${PORT}`);
});

module.exports = app;
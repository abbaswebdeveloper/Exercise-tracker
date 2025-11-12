const express = require('express');
const cors = require('cors');

const app = express();

// Middleware - SIMPLIFIED
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SIMPLE IN-MEMORY STORAGE (No classes)
let users = [];
let exercises = [];
let userIdCounter = 1;

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Exercise Tracker API - Working' });
});

// 1. Create new user - SIMPLIFIED
app.post('/api/users', (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.json({ error: 'Username is required' });
    }
    
    // Check if username exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
      return res.json(existingUser);
    }
    
    // Create new user
    const newUser = {
      username: username,
      _id: userIdCounter.toString()
    };
    
    users.push(newUser);
    userIdCounter++;
    
    res.json(newUser);
  } catch (error) {
    res.json({ error: 'Server error' });
  }
});

// 2. Get all users - SIMPLIFIED
app.get('/api/users', (req, res) => {
  try {
    res.json(users);
  } catch (error) {
    res.json({ error: 'Server error' });
  }
});

// 3. Add exercise - SIMPLIFIED
app.post('/api/users/:_id/exercises', (req, res) => {
  try {
    const userId = req.params._id;
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
    const exercise = {
      userId: userId,
      description: description,
      duration: parseInt(duration),
      date: date ? new Date(date).toDateString() : new Date().toDateString()
    };
    
    exercises.push(exercise);
    
    // Response
    res.json({
      _id: user._id,
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date
    });
  } catch (error) {
    res.json({ error: 'Server error' });
  }
});

// 4. Get exercise log - SIMPLIFIED
app.get('/api/users/:_id/logs', (req, res) => {
  try {
    const userId = req.params._id;
    const { from, to, limit } = req.query;
    
    // Find user
    const user = users.find(u => u._id === userId);
    if (!user) {
      return res.json({ error: 'User not found' });
    }
    
    // Get user's exercises
    let userExercises = exercises.filter(ex => ex.userId === userId);
    
    // Apply filters
    if (from) {
      userExercises = userExercises.filter(ex => new Date(ex.date) >= new Date(from));
    }
    if (to) {
      userExercises = userExercises.filter(ex => new Date(ex.date) <= new Date(to));
    }
    if (limit) {
      userExercises = userExercises.slice(0, parseInt(limit));
    }
    
    // Create log
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
  } catch (error) {
    res.json({ error: 'Server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Export for Vercel
module.exports = app;
/**
 * Birthday Surprise Website - Express Server
 * Serves static files and provides API endpoints
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// ─── Multer Setup for Photo Uploads ─────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'public', 'assets', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
});

// ─── API Routes ──────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Birthday server is running! 🎂' });
});

// Get all birthday messages
app.get('/api/messages', (req, res) => {
  const messages = [
    {
      id: 1,
      title: 'Thank You',
      content: 'Thank you for being the light in my ordinary days.',
      icon: '💖',
    },
    {
      id: 2,
      title: 'You Matter',
      content: 'You made ordinary days feel extraordinary just by being you.',
      icon: '✨',
    },
    {
      id: 3,
      title: 'Your Smile',
      content: 'Your smile is a gift to everyone who gets to witness it.',
      icon: '😊',
    },
    {
      id: 4,
      title: 'Cherished Memories',
      content: 'Every moment we shared is a treasure I hold close.',
      icon: '🌸',
    },
    {
      id: 5,
      title: 'Miss You',
      content: 'I miss our late-night conversations and all the laughter.',
      icon: '🌙',
    },
  ];
  res.json({ success: true, messages });
});

// Get compliments list
app.get('/api/compliments', (req, res) => {
  const compliments = [
    'You have a beautiful soul that lights up every room ✨',
    'Your smile is absolutely adorable and contagious 😊',
    'You make people feel comfortable just by being near them 🌸',
    'You are stronger than you know and braver than you believe 💪',
    'Your kindness is one of the most beautiful things about you 💖',
    'You have an amazing ability to make people laugh 😄',
    'You are genuinely one of a kind, and the world is better with you 🌟',
    'Your heart is as golden as the stars above 💛',
    'You radiate warmth and love wherever you go 🌺',
    'Your intelligence and creativity are truly inspiring 🦋',
    'You are not just beautiful on the outside, but deeply within 🌷',
    'You deserve all the happiness this world has to offer 🎉',
  ];
  res.json({ success: true, compliments });
});

// Get quiz questions
app.get('/api/quiz', (req, res) => {
  const questions = [
    {
      id: 1,
      question: 'What language did we learn together?',
      options: ['Spanish', 'Japanese', 'Tagalog', 'French'],
      answer: 2,
      explanation: 'Yes! We learned Tagalog together — one of my favorite memories! 🇵🇭',
    },
    {
      id: 2,
      question: 'What time were most of our best conversations?',
      options: ['Morning', 'Afternoon', 'Late night', 'Evening'],
      answer: 2,
      explanation: 'Those late-night chats were the most magical moments! 🌙',
    },
    {
      id: 3,
      question: 'What do I appreciate most about you?',
      options: ['Your humor', 'Your kindness', 'Your honesty', 'All of the above'],
      answer: 3,
      explanation: 'Everything about you is something to appreciate! ❤️',
    },
    {
      id: 4,
      question: 'How did this surprise make you feel?',
      options: ['Happy', 'Emotional', 'Loved', 'All of the above'],
      answer: 3,
      explanation: 'You deserve to feel all of that and so much more! 🌟',
    },
  ];
  res.json({ success: true, questions });
});

// Photo upload endpoint
app.post('/api/upload-photo', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const photoUrl = `/assets/uploads/${req.file.filename}`;
  res.json({ success: true, photoUrl, message: 'Photo uploaded successfully!' });
});

// Catch-all route → serve index.html (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Something went wrong!' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎂 Birthday Surprise Server is running!`);
  console.log(`🌐 Open: http://localhost:${PORT}`);
  console.log(`✨ Surprise is ready to be delivered!\n`);
});

module.exports = app;

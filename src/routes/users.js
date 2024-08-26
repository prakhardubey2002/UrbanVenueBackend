const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const router = express.Router()

// Register route
router.post('/register', async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await User.findOne({ username })
    if (user) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const newUser = new User({ username, password })
    await newUser.save()

    res.status(201).json({ message: 'User registered successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', {
      expiresIn: '1h',
    })
    res.json({ token })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router

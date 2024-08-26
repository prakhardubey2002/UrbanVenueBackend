const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const app = express()
const PORT = 3000

// Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// MongoDB Connection
mongoose
  .connect('mongodb+srv://user:user@urbanvenue.jez4o.mongodb.net/?retryWrites=true&w=majority&appName=UrbanVenue', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err))

// Routes
const userRoutes = require('./src/routes/users')
app.use('/api/users', userRoutes)
app.get('/', (req, res) => {
  res.send('Hello World');
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

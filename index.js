const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors');
const app = express()
const PORT = 3000
const path = require('path');
// Middleware
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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
const bookRoutes =require('./src/routes/booking')
const calenderRoutes = require('./src/routes/Calender')
const invoiceRoutes = require('./src/routes/invoice')
const occasionRoutes = require('./src/routes/occasion')
app.use('/', userRoutes)
app.use('/',bookRoutes)
app.use('/api/calender',calenderRoutes)
app.use('/api/invoices', invoiceRoutes);
app.use('/occasion', occasionRoutes);
app.get('/', (req, res) => {
  res.send('Hello World');
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

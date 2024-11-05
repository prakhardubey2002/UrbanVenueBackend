const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors');
const app = express()
const PORT = 9000
const path = require('path');
require('dotenv').config()
// Middleware
// app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// app.use(cors({
//   origin: '*',  // Replace with your frontend's URL
// }));

// Configure CORS options
const corsOptions = {
  origin: 'http://localhost:5173', // Allow only this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow specific HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  credentials: true, // Enable cookies and other credentials if needed
};

// Enable CORS with the configured options
app.use(cors(corsOptions));

// MongoDB Connection
mongoose
  .connect(`${process.env.Link}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err))

// Routes
const userRoutes = require('./src/routes/users')
const bookRoutes = require('./src/routes/booking')
const calenderRoutes = require('./src/routes/Calender')
const invoiceRoutes = require('./src/routes/invoice')
const occasionRoutes = require('./src/routes/occasion')
app.use('/', userRoutes)
app.use('/', bookRoutes)
app.use('/api/calender', calenderRoutes)
app.use('/api/invoices', invoiceRoutes);
app.use('/occasion', occasionRoutes);
app.get('/', (req, res) => {
  res.send('Hello World');
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
  // console.log(process.env.Link)
})

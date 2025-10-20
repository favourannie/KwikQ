
require('dotenv').config();
// Log JWT_SECRET status for debugging (mask most of the value)
if (process.env.JWT_SECRET) {
  const secret = process.env.JWT_SECRET;
  console.log('JWT_SECRET loaded:', secret.length > 6 ? secret.slice(0, 3) + '...' + secret.slice(-3) : secret);
} else {
  console.warn('JWT_SECRET is NOT set!');
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const PORT = process.env.PORT || 1234;
const DB = process.env.DB_URI;
const organizationRoutes = require('./routes/organizationRoutes');


const branchRouter = require('./routes/branchRoutes');

const jwt = require("jsonwebtoken");


const app = express();
app.use(express.json());
app.use(cors());


// app.use('/', (req, res) => {
//   res.send('Connected to Backend Server')
// // });

app.use('/api/v1/',branchRouter);
app.use('/api/v1', organizationRoutes);

app.use((error, req, res, next) => {
  if (error) {
    return res.status(500).json({
      message: error.message
    })
  };
  next();
});


mongoose.connect(DB).then(() => {
  console.log('Connected to Database')
  app.listen(PORT, () => {
    console.log('Server is running on Port:', PORT)
  })
}).catch((error) => {
  console.log('Error connecting to Database', error.message)
});



// DB_URI = mongodb+srv://javour0422_db_user:dl0rqY9ziUbbFedP@cluster0.ysjfjkf.mongodb.net/

// PORT = 6767

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const PORT = process.env.PORT || 1234;
const DB = process.env.DB_URI;
const organizationRoutes = require('./routes/organizationRoutes');
const branchRouter = require('./routes/branchRoutes');
const passport = require('passport');
const session = require('express-session');

const jwt = require("jsonwebtoken");
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi= require('swagger-ui-express');


const app = express();
app.use(express.json());
app.use(cors());

app.use(session({
  secret: 'session-app',
  resave: true,
  saveUninitialized:true
}))
app.use(passport.initialize())
app.use(passport.session())

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
  title: 'API Documentation for KWIKQ App',
    version: '1.0.0',
    description:
      'API Documentation for all Endpoints.',
    // license: {
    //   name: 'Licensed Under MIT',
    //   url: 'https://spdx.org/licenses/MIT.html',
    // },
    contact: {
      name: 'JSONPlaceholder',
      url: 'https://google.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:1230',
      description: 'Development server',
    },
    {
      url: 'https://kwikq-1.onrender.com',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format **Bearer &lt;token&gt;**',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/v1',branchRouter);
app.use('/api/v1', organizationRoutes);

app.use((error, req, res, next) => {
  if (error) {
    return res.status(500).json({
      message: error.message
    })
  };
  next();
});

app.use('/', (req, res) => {
  res.send('Connected to Backend Server')
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
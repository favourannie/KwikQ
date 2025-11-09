require('dotenv').config();
const mongoose = require("mongoose")

const express = require('express');

const cors = require('cors');
const PORT = process.env.PORT || 1234;
const DB = process.env.DB_URI;
const organizationRoutes = require('./routes/organizationRoutes');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const session = require('express-session');
const passport = require('passport');
const superAdminOverviewRoutes = require('./routes/superAdminOverviewRoutes');
const branchRouter = require('./routes/branchRoutes');
const analyticsRouter = require('./routes/analyticsRoutes');
const dashboardRouter = require('./routes/dashboardRoutes');
const customerRouter = require('./routes/customerRoutes');
const qrCodeRoutes = require('./routes/qrCodeRoutes');
const superAdminOrgSettings = require('./routes/superAdminOrgSettings');
const superAdminBranchMgt = require('./routes/superAdminBranchMgt');
const superAdminAnalytics = require('./routes/superAdminAnalytics');
const queueConfigRouter = require("./routes/queueConfigRoutes")
const adminQueueMgtRoute = require("./routes/adminQueueMgtRoute")
const adminNotificationRouter = require("./routes/adminNotificationRoute")
const adminHistoryRouter = require("./routes/adminHistoryRoute")
const adminSettingsRouter = require("./routes/adminSettingsRoute")
const jwt = require("jsonwebtoken");


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
      url: 'https://kwikq-1.onrender.com',
      description: 'Production server',
    },
    {
      url: 'http://localhost:6767',
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

// Root route for basic server check
app.get('/', (req, res) => {
  res.send('Connected to Backend Server')
});

// API routes
app.use('/api/v1/', branchRouter);
app.use('/api/v1', organizationRoutes);

app.use('/api/v1/', analyticsRouter);
app.use('/api/v1/', dashboardRouter);

app.use('/api/v1/', customerRouter);
app.use('/api/v1/', qrCodeRoutes);
app.use('/api/v1/', superAdminOverviewRoutes);
app.use('/api/v1/', superAdminOrgSettings);
app.use('/api/v1/', superAdminBranchMgt);
app.use('/api/v1/', superAdminAnalytics);
app.use("/api/v1/", queueConfigRouter)
app.use("/api/v1/", adminQueueMgtRoute)
app.use("/api/v1/", adminNotificationRouter)
app.use("/api/v1/", adminHistoryRouter)
app.use("/api/v1/", adminSettingsRouter)

// Error handling middleware
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
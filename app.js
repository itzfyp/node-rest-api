const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

/**
 *  Importing Mongo DB connection 
 */
const db = require('./core/connect-db');

/**
 *  Importing Image Upload module 
 */
const imageUpload = require('./core/upload-image');


/**
 *  Importing Redis cache module
 */
require('./core/cache');

/**
 *  Importing Middleware to hanle Error and Headers
 */
const authorizedHeaders = require('./middleware/app-auth-headers');
const appErrorHandler = require('./middleware/app-error-handler');

/**
 *  Importing App Routes
 */
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

/**
 *  Initializing App
 */
const app = express();

/**
 *  Initializing middlewares
 */
app.use(bodyParser.json()) // Parsing incoming json data
app.use(imageUpload);
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(authorizedHeaders);

/**
 *  Initializing App Routes
 */
app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use(appErrorHandler);

/**
 *  Connecting DB
 */
db.connect(() => {
  app.listen(8080);
});


const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const uuidv4 = require('uuid/v4');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const MONGODB_URI =
  "mongodb+srv://node-complete:node-complete@cluster0-ubk2k.mongodb.net/messages";

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4());
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg')
    cb(null, true);
  else
    cb(null, false);
}

app.use(bodyParser.json()) // Parsing incoming json data
app.use(
  multer({
    storage: fileStorage, fileFilter
  })
    .single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-origin', '*');
  res.setHeader('Access-control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
})

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {

  const status = error.statusCode || 500;
  const message = error.message || '';
  const data = error.data;
  res.status(status).json({ message, data });

});

mongoose.connect(MONGODB_URI)
  .then(() => {
    app.listen(8080);
  })
  .catch(err => console.log(err));


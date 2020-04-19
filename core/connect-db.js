const mongoose = require('mongoose');

const MONGODB_URI =
    "mongodb+srv://node-complete:node-complete@cluster0-ubk2k.mongodb.net/messages";

module.exports.connect = (cb) => {
    mongoose.connect(MONGODB_URI)
        .then(cb)
        .catch(err => console.log(err));
};
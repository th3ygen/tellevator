const mongoose = require('mongoose');

const User = new mongoose.Schema({
    username: String,
    hash: String,
    role: String
});

mongoose.model('User', User);
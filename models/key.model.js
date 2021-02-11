const mongoose = require('mongoose');

const key = new mongoose.Schema({
    value: String,
    isUsed: Boolean,
    lastUsed: Number
});

mongoose.model('Key', key);
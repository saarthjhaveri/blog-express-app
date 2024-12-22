const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    name: {
        type: String,
        required: true
    },
    profession: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    specialties: {
        type: String,
        required: true
    },
    interests: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    field: {
        type: String,
        required: true
    },
    projects: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', UserSchema);
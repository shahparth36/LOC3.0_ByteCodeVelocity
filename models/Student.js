const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    age: Number,
    gender: String,
    contactNo: Number,
    isStudent: Boolean,
    isTeacher: Boolean
});

module.exports = mongoose.model('Student', StudentSchema);
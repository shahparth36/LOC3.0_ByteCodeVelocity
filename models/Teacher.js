const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    age: Number,
    gender: String,
    contactNo: Number,
    isStudent: Boolean,
    isTeacher: Boolean,
    createdClassrooms: [{
        type      : mongoose.Schema.Types.ObjectId,
        ref       : "Classroom"
    }]
});

module.exports = mongoose.model('Teacher', TeacherSchema);
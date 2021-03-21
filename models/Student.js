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
    isTeacher: Boolean,
    classroomsEnrolled: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom'
    }],
    assignmentsSubmitted : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment'
    }]

});

module.exports = mongoose.model('Student', StudentSchema);
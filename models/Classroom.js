const mongoose = require('mongoose');

const ClassroomSchema = new mongoose.Schema({
    subject: String,
    createdBy: String,
    meetingLink: String,
    description: String,
    uniqueCode: String,
    assignments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment" 
    }],
    studentsEnrolled: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    }]
});

module.exports = mongoose.model('Classroom', ClassroomSchema);
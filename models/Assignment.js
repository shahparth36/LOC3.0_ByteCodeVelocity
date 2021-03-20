const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
    title: String,
    instructions: String,
    dueDate: Date,
    points: Number,
    createdAt: Date,
    pdfLink: String,
    classroomID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom'
    }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);
const mongoose = require('mongoose');

const ClassroomSchema = new mongoose.Schema({
    subject: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher"
    },
    description: String,
    uniqueCode: String
});

module.exports = mongoose.model('Classroom', ClassroomSchema);
const express = require('express');
const router = express.Router();

const Classroom = require('../models/Classroom');

router.post('/join-classroom', async (req, res) => {
    Classroom.findOne({ uniqueCode: req.body.uniqueCode }, async (err, foundClassroom) => {
        if (err)
            return res.send('something went wrong');
        foundClassroom.studentsEnrolled.push(req.body.studentID);
        await foundClassroom.save();
        return res.send('joined successfully');
    });;
});

module.exports = router;

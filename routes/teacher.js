const express = require('express');
const router = express.Router();
const randomString = require('randomstring');

const emailService = require('../helpers/email');

const Classroom = require('../models/Classroom');
const Teacher = require('../models/Teacher');

router.post('/create-classroom', async (req, res) => {
    const uniqueCode = randomString.generate(6);
    const newClassroom = new Classroom({
        subject: req.body.subject,
        createdBy: req.body.teacherID,
        description: req.body.description,
        uniqueCode: uniqueCode
    });
    const classroomCreated = await Classroom.create(newClassroom);

    Teacher.findById( req.body.teacherID, (err, foundTeacher) => {
        if (err)
            return res.render('route to send');
        foundTeacher.createdClassrooms.push(classroomCreated);
        foundTeacher.save();
        const emailSubject = `Classroom Created`;
        const emailBody = `This is to inform you that your classroom has be created successfully.
Unique Classroom Code is ${uniqueCode}.
Please share this code with your students to join your classroom

Regards,
Virtual Classroom Name`;
        emailService.sendEmail(foundTeacher.email, emailSubject, emailBody);

        return res.send('created successfully');
    });
});

module.exports = router;
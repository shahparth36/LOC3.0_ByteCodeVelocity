const express = require('express');
const router = express.Router();
const multer = require('multer');
const client = require('filestack-js').init(process.env.apikey);

const Classroom = require('../models/Classroom');
const Student = require('../models/Student');
const Assignment = require('../models/Assignment');

var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});

var upload = multer({
    dest: "uploads/",
    storage: storage,
});

router.get('/student-home/:student_id', async (req, res) => {
    await Student.findById(req.params.student_id).populate('classroomsEnrolled').exec((err, foundStudent) => {
        if (err)
            return res.send('something went wrong');
        let array = [];
        if (foundStudent.classroomsEnrolled != null) {
            array = foundStudent.classroomsEnrolled;
        }
        return res.render('studentHome', { classrooms: array, student: foundStudent });
    });
});

router.post('/submit-answer/:assignment_id/:student_id', upload.single('pdf'),async (req, res) => {
    Assignment.findById(req.params.assignment_id,async (err, foundAssignment) => {
        if (err)
            return res.send('something went wrong');
        client.upload(req.file.path).then(
            function (result) {
                var pdfUrl = result.url;
                var answer = {
                    pdfLink: pdfUrl,
                    student: req.user
                }
                req.user.assignmentsSubmitted.push(foundAssignment);
                req.user.save();
                foundAssignment.answers.push(answer);
                foundAssignment.hasSubmitted = true;
                foundAssignment.save();
                
                return res.redirect(`/student-home/${req.params.student_id}`);
            },
            function (error) {
                return res.send('something went wrong');
            }
        );
    });
});

router.get('/view-classroom-by-student/:classroom_id/:student_id', async (req, res) => {
    Classroom.findOne({ _id: req.params.classroom_id }).populate({
        path: "assignments",
        populate: {
            path: "studentsEnrolled",
            populate: {
                path: 'AssignmentID'
            } 
        }
    }).exec((err, foundClassroom) => {
        if (err)
            return res.send('something went wrong');
        Student.findById(req.params.student_id, (err, foundStudent) => {
            return res.render('studentAssignment', {classroom: foundClassroom, student_id: foundStudent._id});
        });
    });
});

router.post('/join-classroom/:student_id', async (req, res) => {
    console.log("uniqueCode: "+ req.body.uniqueCode)
    Classroom.findOne({ uniqueCode: req.body.uniqueCode }, async (err, foundClassroom) => {
        if (err)
            return res.send('something went wrong'); 
        console.log("foundClassroom" + foundClassroom)
        foundClassroom.studentsEnrolled.push(req.params.student_id);
        foundClassroom.save();
        await Student.findById(req.params.student_id).populate('classroomsEnrolled').exec((err, foundStudent) => {
            if (err)
                return res.send('something went wrong');
            
            foundStudent.classroomsEnrolled.push(foundClassroom._id);
            foundStudent.save();
            return res.redirect(`/student-home/${foundStudent._id}`);
        });
    });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const randomString = require('randomstring');
const client = require('filestack-js').init(process.env.apikey);
const multer = require('multer');
const emailService = require('../helpers/email');
const { v4: uuidv4 } = require('uuid')

const Classroom = require('../models/Classroom');
const Teacher = require('../models/Teacher');
const Assignment = require('../models/Assignment');
const Student = require('../models/Student');

var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});

var upload = multer({
    dest: "uploads/",
    storage: storage,
});

router.get('/teacher-home/:teacher_id', async (req, res) => {
    Teacher.findOne({ _id: req.params.teacher_id }).populate('createdClassrooms').exec((err, foundTeacher) => {
        if (err)
            console.log(err);
        const array = foundTeacher.createdClassrooms;
        return res.render('teacherHome', { classrooms: array, teacher: foundTeacher});
    });
});

router.get('/view-classroom/:uniqueCode/:teacher_id', async (req, res) => {
    Classroom.findOne({ uniqueCode: req.params.uniqueCode }).populate('assignments').exec((err, foundClassroom) => {
        if (err)
            return res.send('something went wrong');
        Classroom.findById(foundClassroom._id).populate('studentsEnrolled').exec((err, newClassroom) => {
            return res.render('teacherAssignment', { classroom: foundClassroom , students: newClassroom.studentsEnrolled, teacher_id: req.params.teacher_id});
        });
    });
});

router.post('/create-classroom', async (req, res) => {
    Teacher.findById(req.body.teacherID, async (err, foundTeacher) => {
        if (err)
            return res.send('something went wrong');
        const uniqueCode = randomString.generate(6);
        const newClassroom = new Classroom({
            subject: req.body.subject,
            createdBy: foundTeacher.firstName + " " + foundTeacher.lastName,
            description: req.body.description,
            uniqueCode: uniqueCode,
            meetingLink: `${uniqueCode}`,
        });
        const classroomCreated = await Classroom.create(newClassroom);

        await foundTeacher.createdClassrooms.push(classroomCreated);
        await foundTeacher.save();
        const emailSubject = `Classroom Created`;
        const emailBody = `This is to inform you that your classroom has be created successfully.
Unique Classroom Code is ${uniqueCode}.
Please share this code with your students to join your classroom

Regards,
Virtual Classroom Name`;
        emailService.sendEmail(foundTeacher.email, emailSubject, emailBody);
        // return res.send('created successfully');
        return res.redirect(`/teacher-home/${foundTeacher._id}`);
    });
});

router.post('/create-assignment/:classroom_id/:teacher_id', upload.single('pdfLink'), async (req, res) => {
    var pdfUrl;
    await client.upload(req.file.path).then(
        function (result) {
            pdfUrl = result.url;
        },
        function (error) {
            console.log(error);
        }
    );
    const dateFields = req.body.dueDate.split('-');
    console.log(req.body.instructions);
    console.log(pdfUrl);
    const newAssignment = new Assignment({
        title: req.body.title,
        instructions: req.body.instructions,
        dueDate: new Date(dateFields[0], parseInt(dateFields[1]) - 1, dateFields[2]),
        createdAt: new Date(),
        points: req.body.points,
        pdfLink: pdfUrl,
        classroomID: req.params.classroom_id,
        hasSubmitted: false
    });
    console.log(newAssignment);
    
    const createdAssignment = await Assignment.create(newAssignment);
    await Classroom.findOne({_id: req.params.classroom_id}).populate('assignments').exec( (err, foundClassroom) => {
        if (err)
            return res.send('something went wrong!');
        
        Teacher.findById(req.params.teacher_id, (err, foundTeacher) => {
            foundTeacher.createdAssignments.push(createdAssignment);
            foundTeacher.save();
            foundClassroom.assignments.push(createdAssignment._id);
            foundClassroom.save();
            return res.redirect(`/teacher-home/${req.params.teacher_id}`);
        });
    });

});
// 6056825c93ef4c3d048a35e2/6056853d51f6505b10dbfb8b
router.get("/viewSubmissions/:classroom_id/:assignment_id/:teacher_id",(req,res)=>{
    Classroom.findById(req.params.classroom_id).populate('assignments').exec( async (err, foundClassroom) => {
        if (err) {
            console.error(err)
            res.redirect("back")
        } else {
            let array = [];
            await foundClassroom.assignments.forEach((assignment) => {
                if (assignment._id == req.params.assignment_id)
                    array.push(assignment);
                array = assignment.answers;
            });
            return res.render('teachersubmission', {array: array,assignment_id: req.params.assignment_id, teacher_id: req.params.teacher_id});
        }
    });
})

router.post("/viewSubmissions/:student_id/:assignment_id",(req,res)=>{
    
    Student.findById(req.params.student_id).populate('assignmentsSubmitted').exec( async (err, foundStudent) => {
        if (err) {
            console.error(err)
            res.redirect("back")
        } else {
            let array = [];
            await foundStudent.assignmentsSubmitted.forEach((assignment) => {
                if (assignment._id == req.params.assignment_id){
                    assignment.marksScored = req.body.marks;
                    assignment.isGraded = true;
                    assignment.save();
                }
            console.log("foundStudent"+foundStudent)
            res.redirect("back");
            });
        }
    });
})

module.exports = router;
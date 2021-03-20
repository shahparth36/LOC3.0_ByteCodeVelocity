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
const { Upload } = require('filestack-js/build/main/lib/api/upload');

var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});

var upload = multer({
    dest: "uploads/",
    storage: storage,
});

router.get('/teacher-home', async (req, res) => {
    Teacher.findOne({ _id: req.user._id }).populate('createdClassrooms').exec((err, foundTeacher) => {
        if (err)
            console.log(err);
        const array = foundTeacher.createdClassrooms;
        return res.render('teacherHome', { classrooms: array });
    });
});

router.post('/create-classroom', async (req, res) => {
    const uniqueCode = randomString.generate(6);
    const newClassroom = new Classroom({
        subject: req.body.subject,
        createdBy: req.body.teacherID,
        description: req.body.description,
        uniqueCode: uniqueCode,
        meetingLink: `/${uuidv4()}`,
    });
    const classroomCreated = await Classroom.create(newClassroom);

    Teacher.findById( req.body.teacherID, (err, foundTeacher) => {
        if (err)
            return res.render('route to send');
        // console.log(foundTeacher);
        foundTeacher.createdClassrooms.push(classroomCreated);
        foundTeacher.save();
        const emailSubject = `Classroom Created`;
        const emailBody = `This is to inform you that your classroom has be created successfully.
Unique Classroom Code is ${uniqueCode}.
Please share this code with your students to join your classroom

Regards,
Virtual Classroom Name`;
        emailService.sendEmail(foundTeacher.email, emailSubject, emailBody);
        console.log(classroomCreated);
        // return res.send('created successfully');
        return res.redirect(""+classroomCreated.meetingLink)
    });
});

router.post('/create-assignment', upload.single('pdf'), async (req, res) => {
    var pdfUrl;
    await client.upload(req.file.path).then(
        function(error){
            console.log(error);
        },
        function(result){
            pdfUrl = result.url;
        }
    );
    const dateFields = req.body.dueDate.split('-');
    const newAssignment = new Assignment({
        title: req.body.title,
        instructions: req.body.instructions,
        dueDate: new Date(dateFields[0],parseInt(dateFields[1])-1,dateFields[2]),
        createdAt: new Date(),
        points: req.body.points,
        pdfLink: pdfUrl,
        classroomID: req.body.classroomID,
    });
    
    const createdAssignment = await Assignment.create(newAssignment);
    
    Classroom.findById(req.body.classroomID, (err, foundClassroom) => {
        if (err)
        return res.send('something went wrong!');
        
        foundClassroom.assignments.push(createdAssignment);
    });

    res.send(createdAssignment);
});


router.get('/test1', (req,res)=>{
    res.render("test");
})

// router.get('/:room', (req, res) => {
//     res.render('meet', { roomId: req.params.room })
// })

// io.on('connection', socket => {
//     socket.on('join-room', (roomId, userId) => {
//       console.log(roomId,userId);
//       socket.join(roomId);
//       socket.to(roomId).broadcast.emit('user-connected', userId);
  
//       socket.on('disconnect', () => {
//         socket.to(roomId).broadcast.emit('user-disconnected', userId);
//       })
//     })
//   })

module.exports = router;
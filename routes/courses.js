const express = require('express');
const {getCourses ,getCourse ,creatCourse ,updateCourse,deleteCourse} = require('../controllers/course');
const Course = require('../models/Course');
const advancedResults = require('../middleware/advencedResults');
const router = express.Router({mergeParams : true});
const {protect ,auhtorize} = require('../middleware/auth');


router.get('/',advancedResults(Course ,{
    path : 'bootcamp' ,
    select : 'name description'
}) ,getCourses);
router.get('/:id' , getCourse);
router.post('/',protect,auhtorize('publisher','admin'), creatCourse);
router.put('/:id' ,protect,auhtorize('publisher','admin'), updateCourse);
router.delete('/:id',protect, auhtorize('publisher','admin'),deleteCourse)




module.exports = router;
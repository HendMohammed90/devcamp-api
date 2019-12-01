const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponce');
const asyncHandler = require('../middleware/async');
const _ = require('lodash');
const Bootcamp = require('../models/Bootcamp');


// @description Get All courses
// Rout GET api/v1/courses 
// Rout GET api/v1/bootcamps/:bootcampId/courses 
// Access Public 
exports.getCourses = asyncHandler(async (req, res, next) => {
    //The style of OLD Query before using advancedResult 
    //  let query;

    //  if(req.params.bootcampId) {
    //      query = Course.find({ bootcamp: req.params.bootcampId });
    //  } else {
    //      // query = Course.find(); //we can use simple query like that 
    //      //OR to get all data or main data for each bootcamp we have to use populate & select
    //      query = Course.find().populate({
    //          path : 'bootcamp' ,
    //          select : 'name description'
    //      });
    //  }
    //  const courses = await query;
    //  res.status(200).json({
    //      state: true,
    //      msg: 'Get All courses Data From Database',
    //      count: courses.length,
    //      data: courses
    //  })

    if (req.params.bootcampId) {
        courses = await Course.find({ bootcamp: req.params.bootcampId });

        if (!courses) {
            return next(new ErrorResponse(`Error in bootcampId: ${req.params.bootcampId}`, 404));
        }

        res.status(200).json({
            state: true,
            msg: 'Get All courses Data From Database In That Bootcamp',
            count: courses.length,
            data: courses
        })
    } else {
        res.status(200).json(res.advancedResults)
    }

})


// @description Get single courses
// Rout GET api/v1/courses/:id
//Access Public 
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!course) {
        return next(new ErrorResponse(`Error in ID: ${req.params.id}`, 404));
    }

    res.status(200).json({
        state: true,
        msg: `Get Data With id:${req.params.id}`,
        data: course
    })
})

// @description Creat new  course
// Rout POST api/v1/bootcamps/:bootcampId/courses
//Access Private 
exports.creatCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;

    //Add user to req.body 
    req.body.user = req.user.id ;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(new ErrorResponse(`There is no bootcamp with that ID: ${req.params.bootcampId}`, 404));
    }

    //Check for the  owner user of the bootcamp
    // console.log(req.user.role)
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`the user with that ID: ${req.user.id} not Authorized to add the course`, 404));
    }

    const course = await Course.create(req.body);
    res.status(201).json({
        state: true,
        msg: 'Creat New Data',
        data: course
    })
})


// @description Update course
// Rout PUT api/v1/courses/:id
//Access Private 
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);

    if (!course) {
        return next(new ErrorResponse(`Error bootcamp doesn't found in database: ${req.params.id}`, 404));
    }

    //Check for the  owner user of the course
    // console.log(req.user.role)
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`the user with that ID: ${req.user.id} not Authorized to Update that course`, 404));
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true //this for make validation n our schema works 
    })
    res.status(201).json({
        state: true,
        msg: `Update Data With id:${req.params.id}`,
        data: course
    })
})


// @description Delete  course
// Rout Delete api/v1/courses/:id
//Access Private 
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(new ErrorResponse(`Error bootcamp doesn't found in database: ${req.params.id}`, 404));
    }

      //Check for the  owner user of the course
    // console.log(req.user.role)
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`the user with that ID: ${req.user.id} not Authorized to Delete that course`, 404));
    }

    course.remove();

    res.status(201).json({
        state: true,
        msg: `Deleted Data With id:${req.params.id}`,
        data: {}
    })
})





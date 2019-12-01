const Review = require('../models/Review');
const ErrorResponse = require('../utils/errorResponce');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');
const Course = require('../models/Course');

// @description Get All Reviews
// Rout GET api/v1/reviews
// Rout GET api/v1/bootcamps/:bootcampId/reviews 
//Access Public

exports.getReviews = asyncHandler(async (req, res, next) => {

    if (req.params.bootcampId) {
        reviews = await Review.find({ bootcamp: req.params.bootcampId });

        if (!reviews) {
            return next(new ErrorResponse(`Error in bootcampId: ${req.params.bootcampId}`, 404));
        }

        res.status(200).json({
            state: true,
            msg: 'Get All reviews Data From Database In That Bootcamp',
            count: reviews.length,
            data: reviews
        })
    } else {
        res.status(200).json(res.advancedResults)
    }

})

// @description Get single review
// Rout GET api/v1/reviews/:id
//Access Public 
exports.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
        path : 'bootcamp' ,
        select : 'name description'
    });

    if (!review) {
        return next(new ErrorResponse(`Error in ID: ${req.params.id}`, 404));
    }

    res.status(200).json({
        state: true,
        msg: `Get Data With id:${req.params.id}`,
        data: review
    })
})

// @description Creat new  review
// Rout POST api/v1/bootcamps/:bootcampId/reviews 
//Access Private 
exports.creatReview = asyncHandler(async (req, res, next) => {
    //Add user to req.body 
    req.body.user = req.user.id ;
    //Add BOOTCAMP to req.body 
    req.body.bootcamp = req.params.bootcampId;

    //Check for published Course
    const  publishedBootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!publishedBootcamp) {
        return next(new ErrorResponse(`Error in ID of the bootcamp: ${req.params.id}`, 404));
    }

    const review = await Review.create(req.body);
    res.status(201).json({
        state: true,
        msg: 'Creat New Data',
        data: review
    })
})



// @description Update review
// Rout PUT api/v1/reviews/:id
//Access Private 
exports.updatereview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id);

    if (!review) {
        return next(new ErrorResponse(`Error review doesn't found in database: ${req.params.id}`, 404));
    }

    //Check for the  owner user of the course
    // console.log(req.user.role)
    if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`the user with that ID: ${req.user.id} not Authorized to Update that review`, 401));
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true //this for make validation run on our schema works 
    })
    res.status(201).json({
        state: true,
        msg: `Update Data With id:${req.params.id}`,
        data: review
    })
})


// @description Delete  review
// Rout Delete api/v1/reviews/:id
//Access Private 
exports.deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(new ErrorResponse(`Error review doesn't found in database: ${req.params.id}`, 404));
    }

      //Check for the  owner user of the course
    // console.log(req.user.role)
    if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`the user with that ID: ${req.user.id} not Authorized to Delete that review`, 404));
    }

    review.remove();

    res.status(201).json({
        state: true,
        msg: `Deleted Data With id:${req.params.id}`,
        data: {}
    })
})





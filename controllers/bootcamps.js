const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponce');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const _ = require('lodash');
const path = require('path');

// @description Get All Bootcamp
// Rout GET api/v1/bootcamps
//Access Public 
exports.getBootCamps = asyncHandler(async (req, res, next) => {
    // throw new Error;
    //OLD RESULT  OBJECT {
    //     state: true,
    //     msg: 'Get All Bootcamps Data From Database',
    //     count: bootcamps.length,
    //     // data:bootcamps.forEach(element => _.pick(element ,['name']))   //Ask in it
    //     //Also Try to make a select Element in query part to include main info when searching nat all data
    //     data: bootcamps,
    //     pagination
    // }
    res.status(200).json(res.advancedResults)

    // res.status(400).json({state : false , msg : 'Error has happened on Fetch Data'})
    // next(error);
})

// @description Get single Bootcamp
// Rout GET api/v1/bootcamps/:id
//Access Public 
exports.getBootCamp = asyncHandler(async (req, res, next) => {
    // try {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        // return res.status(400).json({state : false , msg : 'Error in ID'}); also here for reson on line 39
        return next(new ErrorResponse(`Error in ID: ${req.params.id}`, 404));
    }

    res.status(200).json({
        state: true,
        msg: `Get Data With id:${req.params.id}`,
        data: bootcamp
    })


    // } catch (error) {
    // res.status(400).json({state : false , msg : 'Error has happened on Fetch Data'})
    // next(error); //we here comment to use our costume errorHandler Class
    // next( new ErrorResponse(`Error has happened on Fetch Data with ID: ${req.params.id}` ,404));// here we also comment that to do that handing with our custom errorHandler in our error Middleware instead of doing that here
    //     next(error);
    // }
})

// @description Creat new  Bootcamp
// Rout POST api/v1/bootcamps
//Access Private 
exports.creatBootCamps = asyncHandler(async (req, res, next) => {
    // console.log(req.body);
    // try {

    //Add user to req.body 
    req.body.user = req.user.id ;

    //Check for published bootcamp
    const  publishedBootcamp = await Bootcamp.findOne({user : req.user.id});

    //Check if the user is not an admin as they can only creat one bootcamp
    if(publishedBootcamp && req.user.role !== 'admin'){
        return next(new ErrorResponse(`The user with that ID : ${req.user.id} has alredy published a bootcamp`, 400));
    }

    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
        state: true,
        msg: 'Creat New Data',
        data: bootcamp
    })
    // } catch (error) {
    //     // res.status(400).json({state : false , msg : 'Error has happened on Creat New Data'})
    //     next(error);
    // }
})

// @description Update  Bootcamp
// Rout GET api/v1/bootcamps/:id
//Access Private 
exports.updateBootCamps = asyncHandler(async (req, res, next) => {
    // try {
    const bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        // return res.status(400).json({state : false , msg : "Error bootcamp doesn't found in database"});
        return next(new ErrorResponse(`Error bootcamp doesn't found in database: ${req.params.id}`, 404));
    }

    //Check for the  owner user of the bootcamp

    // console.log(req.user.role)
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`the user with that ID: ${req.user.id} not Authorized to update that bootcamp`, 404));
    }

    //Ubdate The bootcamp 
    bootcamp.update( req.body, {
        new: true,
        runValidators: true //this for make validation n our schema works 
    })

    res.status(201).json({
        state: true,
        msg: `Update Data With id:${req.params.id}`,
        data: bootcamp
    })
    // } catch (error) {
    // res.status(400).json({state : false , msg : 'Error has happened on update '})
    //     next(error);
    // }
})

// @description Delete  Bootcamp
// Rout GET api/v1/bootcamps/:id
//Access Private 
exports.deleteBootCamps = asyncHandler(async (req, res, next) => {
    // try {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        // return res.status(400).json({state : false , msg : "Error bootcamp doesn't found in database"});
        return next(new ErrorResponse(`Error bootcamp doesn't found in database: ${req.params.id}`, 404));

    }

    //Check for the  owner user of the bootcamp
    // console.log(req.user.role)
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`the user with that ID: ${req.user.id} not Authorized to delete that bootcamp`, 404));
    }

    bootcamp.remove();

    res.status(201).json({
        state: true,
        msg: `Deleted Data With id:${req.params.id}`,
        data: {}
    })
    // } catch (error) {
    // res.status(400).json({state : false , msg : 'Error has happened on Delete Bootcamp '})
    //     next(error);
    // }
})


// @desc      Get bootcamps within a radius
// @route     GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access    Public
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius using radians
    // Divide dist by radius of Earth
    // Earth Radius = 3,963 mi / 6,378 km
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });
});


// @description Upload a Bootcamp Photo  
// Rout GET api/v1/bootcamps/:id/photo
//Access Private 
exports.uploadBootCampPhoto = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Error bootcamp doesn't found in database: ${req.params.id}`, 404));
    }

    //Check for the  owner user of the bootcamp
    // console.log(req.user.role)
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`the user with that ID: ${req.user.id} not Authorized to Update that bootcamp`, 404));
    }

    if (!req.files) {
        return next(new ErrorResponse(`There is no files have been uploaded: ${req.params.id}`, 404));
    }
    console.log(req.files);

    const file = req.files.file;

    //Make sure file is a Photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`the file is not in the correct formate : ${req.params.id}`, 400));
    }

    //Check fileSize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an Image with size less than: ${process.env.MAX_FILE_UPLOAD}`, 400));
    }

    //Creat Custom Filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
    // console.log(path.parse(file.name));
    console.log(file.name);

    //Save the File to Our Folder
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`Problem with uploading the file`, 500));
        }
        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

        res.status(200).json({
            state: true,
            msg: `file has been uploaded`,
            data: file.name
        })
    })


})

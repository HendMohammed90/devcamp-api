const express = require('express');
const advancedResults = require('../middleware/advencedResults');
const Bootcamp = require('../models/Bootcamp');
const {protect ,auhtorize} = require('../middleware/auth');
//Bring Other Resources 
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

const router = express.Router();
const { getBootCamp ,getBootCamps ,creatBootCamps ,updateBootCamps ,deleteBootCamps ,getBootcampsInRadius ,uploadBootCampPhoto} = require('../controllers/bootcamps');


//Re-route into other resource route
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);


router.get('/',advancedResults(Bootcamp , 'courses') ,getBootCamps);

router.get('/radius/:zipcode/:distance', getBootcampsInRadius);

router.get('/:id',protect, getBootCamp);

router.post('/',protect,creatBootCamps);

router.put('/:id',protect,auhtorize('publisher','admin'), updateBootCamps);

router.put('/:id/photo',protect,auhtorize('publisher','admin'), uploadBootCampPhoto);

router.delete('/:id',auhtorize('publisher','admin'),protect,deleteBootCamps);


module.exports = router;
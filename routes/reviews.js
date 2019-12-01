const express = require('express');
const {getReviews ,getReview ,creatReview ,updatereview ,deleteReview} = require('../controllers/reviews');
const Review = require('../models/Review');
const advancedResults = require('../middleware/advencedResults');
const router = express.Router({mergeParams : true});
const {protect ,auhtorize} = require('../middleware/auth');


router.get('/',advancedResults(Review ,{
    path : 'bootcamp' ,
    select : 'name description'
}) ,getReviews);
router.get('/:id' , getReview);
router.post('/',protect,auhtorize('user','admin'), creatReview);
router.put('/:id' ,protect,auhtorize('user','admin'), updatereview);
router.delete('/:id',protect, auhtorize('publisher','admin'),deleteReview)




module.exports = router;
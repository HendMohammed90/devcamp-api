const express = require('express');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/users');

const User = require('../models/User');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advencedResults');
const { protect , auhtorize } = require('../middleware/auth');

router.use(protect);
router.use(auhtorize('admin'));


// router.get('/', advancedResults(User), getUsers);

// router.post('/' , createUser);

// router.get('/:id',getUser );

// router.put('/:id' , updateUser);

// router.delete('/:id' , deleteUser)



router
    .route('/')
    .get(advancedResults(User), getUsers)
    .post(createUser);

    
router
    .route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;
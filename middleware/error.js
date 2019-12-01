const ErrorResponse = require('../utils/errorResponce');

const errorHandler = (err, req, res, next) => {
    //log some exception
     console.log(`Error: ${err.message.red}`); //this give me a declared error msg ^_^
    // console.log(`Error: ${err.stack.red}`);  //this didn't give me a declared error msg m -_-

    let error = {...err}; 
    error.message = err.message ;
    // console.log(error);


    //here we will creat our instance Error from our Custom ErrorResponse Class
    //Mongoose Bad OpjectID
    if(err.name ==='CastError'){
        // const message = `Resource Not Found on Database With That ID: ${err.value}` ;
        const message = `Resource Not Found on Database ` ;
        error = new ErrorResponse( message ,404);
    }

    //Mongoose Duplicate Key
    if(err.code === 11000){
        const message = `Duplicate Field Value There is another Resource with that name` ;
        error = new ErrorResponse( message ,400);
    }
    // Mongoose validation error
    if(err.name === 'ValidationError'){
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse( message ,400);
    }
    //Original Error Message 
    res.status(error.statusCode || 500).send({
        state: false,
        msg: 'Internal server error',
        error: error.message || 'Server Error'
    });
}

module.exports  = errorHandler
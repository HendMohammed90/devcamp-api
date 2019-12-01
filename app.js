const express = require('express');
//load environment variables 
const dotenv = require('dotenv').config({ path: './config/config.env' });
const app = express();

//add some custom middleware
//body-parser
app.use(express.json()); //here we don't need to install it now it's part of express included 
const morgan = require('morgan');
const colors = require('colors') //this to add custom colors to terminal 
const errorHandler = require('./middleware/error');
const fileUpload = require('express-fileupload');
const path = require('path');
const cookie = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors')


//Connect to Our DB 
const connectDB = require('./config/db');
connectDB();
//Rout Files 
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const review = require('./routes/reviews');

//Use Some Of Middleware 
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('tiny'));
}
//File upload
app.use(fileUpload());
app.use(cookie());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, //This gives 10 min
    max: 100
});

app.use(limiter);
app.use(hpp());
app.use(cors());

//Set static folder
app.use(express.static(path.join(__dirname, 'public')))

//Mount Our Routes
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', review);
app.use(errorHandler);
const PORT = process.env.PORT || 3000

//set The listening 
const server = app.listen(PORT, () => {
    console.log(`App Running in ${process.env.NODE_ENV} mode on Port ${PORT}`.yellow.bold);
});

//Handle Unhandled Promise Rejections
process.on('unhandledRejection', (error, promise) => {
    //log some exception
    console.log(`Error: ${error.message}`.rainbow.bold);
    //Close Server & Exit Process
    server.close(() => process.exit(1));
})
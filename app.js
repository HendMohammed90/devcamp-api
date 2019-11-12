const express = require('express');
const dotenv = require('dotenv');

//load environment variables 
dotenv.config({ path :'./config/config.env'});

const app = express();


const PORT = process.env.PORT || 3000

//set The listening 
app.listen(PORT, () => {
    console.log(`App Running in ${process.env.NODE_ENV} mode on Port ${PORT}`);
});
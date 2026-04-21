const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const dbConnection = require('./config/data.base');
 const categoryRoute = require('./routes/categoryRoute')
dotenv.config({path: 'config.env'});

const app = express();

dbConnection();
 
//middleware
app.use(express.json());

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
    console.log(`mode: ${process.env.NODE_ENV}`);
}

 //routes
app.use('/api/v1/categories', categoryRoute);
const PORT = process.env.PORT || 8000;
app.listen(PORT, ()=> {
   console.log('app run');
});

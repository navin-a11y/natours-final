const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldDB = err => {
  const value = err.errmsg.match(/(["'])(\\7.)*7\1/)[0];
  console.log(value);
  const message = `Duplicate field value: ${value}. Please use another unique value!`
  return new AppError(message, 400);
};

const handleInvalidUrlErrorDB = err => {
  const value = err.value;
  const message = `Invalid ID entered ${value}`;
  return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 404);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
}

const sendErrorProd =(err, res) => {
  // Operational, trusted error: send message to client
  if(err.isOperational){
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

    // Programming or other unknown error: don't leak error details to client
  }else{
    // 1. log the error
    console.error('Error', err);

    // 2. Send the Generic error
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    })
  }
}

module.exports = (err, req, res, next) => {
    // console.log(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
  
    if(process.env.NODE_ENV === 'development'){
      sendErrorDev(err, res);
    } 
    else if (process.env.NODE_ENV === 'production') {
      let error = {...err};

      if(error.name === 'CastError') error = handleCastErrorDB(error);
      if(error.kind === 'ObjectId') error = handleInvalidUrlErrorDB(error);
      if(error.code === 11000) error = handleDuplicateFieldDB(error);
      if(error.name === 'ValidationError') error = handleValidationErrorDB(error);

      sendErrorProd(error, res);
    }
  };


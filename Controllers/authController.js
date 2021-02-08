const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// For new User
exports.signup = catchAsync(async (req, res, next) => {
  const {
    name = null,
    email = null,
    password = null,
    passwordConfirm = null,
  } = req.body;
  //check
  if (!name && !email && !password && !passwordConfirm) {
    console.log('ERROR');
  }

  const postData = { name, email, password, passwordConfirm};
  if(req.body.role) {
    postData["role"] = req.body.role;
  }

  const newUser = await User.create(postData);

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

// For existing users
exports.login = catchAsync(async (req, res, next) => {
  const { email = null, password = null } = req.body;

  // 1. check if email and password exists
  if (!email || !password) {
    return next(
      new AppError('Please provide the email and password to login', 400)
    );
  }
  // 2. check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password'); // select password explicitly from DB

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3. if everything ok, send token to the client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

// Implement protected routes so that only logged in user can access to all tours
exports.protect = catchAsync(async (req, res, next) => {
  // 1. getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in, Please login to get access', 401)
    );
  }

  // 2. Verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does not longer exists',
        401
      )
    );
  }

  // 4. check if user changed password after token was issued
  if (currentUser.changedPaswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again. ', 401)
    );
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

// using restrictTo function in order to pass arg in middleware
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array as it might be ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    
    next();
  };
};

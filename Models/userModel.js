const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const async = require('../utils/catchAsync');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
  },
  email: {
    type: String,
    required: [true, 'Please enter your email id'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid Email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'You must have to enter a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'You must have to enter a password'],
    validate: {
      // This is only works on Create & SAVE!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'The password are not same here!',
    },
  },
});

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified.
  if (!this.isModified('password')) return next();

  //hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12); //default cost value is 10

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// Instance schema for comparing the user password with encrypted password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;

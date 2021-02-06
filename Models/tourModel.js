const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');

const tourSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
    maxlength: 30,
    minlength: 6
    // validate: [validator.isAlpha, 'Tour name only contains characters']
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficulty'],
      message: 'Difficulty is either: easy, medium, difficult'
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: 1,
    max: 5
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function(val) {
        // this only point to current doc on NEW document creation
        return val < this.price;
      },
      message: 'Discount price ({VALUE}) should be below the regular price', 
    }
  },
  summary: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
   // required: [true, 'A tour must have a description']
  },
  imageCover: {
    tyrpe: String,
    //required: [true, 'A tour must have a image cover']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  }
},
{
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// Document middleware: runs before .save() and .create() not on .insert() and find()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, {lower: true});
  next();
});

// tourSchema.pre('save', function(next) {
//   console.log('Will save document....');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// Query Middleware: 
tourSchema.pre(/^find/, function(next) {
  // tourSchema.pre('find', function(next) {
  this.find({ secretTour: { $ne: true}})
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});


// Aggregation Middleware: 
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: {$ne:true}}});

  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;



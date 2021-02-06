const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Handling uncalled exception
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! Shutting DOWN....');
  console.log(err.name, err.message);
  process.exit(1);  // 0 for successs and 1 for uncalled exception
});

dotenv.config({ path: './config.env' });
const app = require('./app');


// console.log(process.env);
const mongouri =
  'mongodb+srv://Navin_2701:root@cluster0.d0wqh.mongodb.net/natours';

mongoose.connect(mongouri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

mongoose.connection.on('connection', () => {
  console.log('Database connected successfully');
});

mongoose.connection.on('error', (error) => {
  console.log('Database is not connected');
});

const PORT = process.env.PORT || 3020;
app.listen(PORT, () => {
  console.log(`app is running on the post ${PORT}`);
});

// Handling unhandled rejection Async code
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! Shutting DOWN....');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);  // 0 for successs and 1 for uncalled exception
  });
});


// console.log(x);
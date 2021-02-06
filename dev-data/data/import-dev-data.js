const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../Models/tourModel');
dotenv.config({ path: './config.env' });

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

// Read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

// Import Data into DB
const importData = async() => {
    try {
        await Tour.create(tours);
        console.log('Data loaded successfully!');
    } catch (error) {
        console.log(error);
    }
    process.exit();
};

// Delete all data from DB
const deleteData = async() => {
    try {
        console.log(Tour);
        await Tour.deleteMany();
        console.log('Data deleted successfully!');
    } catch (error) {
        console.log(error);
    }
    process.exit();
};

if(process.argv[2] === '--import'){
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}

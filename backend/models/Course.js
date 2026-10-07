const mongoose = require('mongoose');

const ModuleSchema = new mongoose.Schema({
  name: String,
  image: String, 
  article: String,   
  youtubeUrl: String, 
});


const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  image: String,        
  modules: [ModuleSchema],
});

const Course = mongoose.model('Course', CourseSchema);

module.exports = Course;

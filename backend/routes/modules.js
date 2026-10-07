const express = require('express');
const multer = require('multer');
const path = require('path');
const Course = require('../models/Course');
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.get('/courses/:courseId/modules', async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course.modules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/courses/:courseId/modules', upload.single('image'), async (req, res) => {
  try {
    const { courseId } = req.params;
    const { name, article, youtubeUrl } = req.body;
    
    if (!name || !article || !youtubeUrl) {
      return res.status(400).json({ message: 'Name, article, and youtubeUrl are required' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const newModule = {
      name,
      image: req.file.filename,
      article,
      youtubeUrl
    };

    course.modules.push(newModule);
    await course.save();

    const createdModule = course.modules[course.modules.length - 1];
    res.status(201).json(createdModule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/courses/:courseId/modules/:moduleId', async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const { name, article, youtubeUrl } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    if (name) module.name = name;
    if (article) module.article = article;
    if (youtubeUrl) module.youtubeUrl = youtubeUrl;

    await course.save();
    res.json(module);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/courses/:courseId/modules/:moduleId', async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    course.modules.pull(moduleId);
    await course.save();

    res.json({ message: 'Module deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/courses/:courseId/modules/:moduleId', async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    res.json(module);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
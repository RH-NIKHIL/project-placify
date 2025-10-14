const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true })
      .populate('company', 'companyName logo location')
      .populate('applications.user', 'name email profilePicture college department phone')
      .sort({ createdAt: -1 });
    
    res.json({ jobs, count: jobs.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'companyName logo location description')
      .populate('applications.user', 'name email profilePicture');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json({ job });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create job posting (Company only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('Create job request received');
    console.log('User from token:', req.user);
    console.log('User role:', req.user.role);
    
    if (req.user.role !== 'company' && req.user.role !== 'admin') {
      console.log('Access denied - role is:', req.user.role);
      return res.status(403).json({ message: 'Access denied. Company only.' });
    }

    const {
      title,
      description,
      requirements,
      responsibilities,
      location,
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax,
      skills,
      deadline
    } = req.body;

    // For now, we'll use the logged-in user's info as company info
    // You can later fetch from Company model if needed
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    const job = new Job({
      title,
      company: null, // We'll make this optional or use a placeholder
      companyName: user.name || 'Company',
      description,
      requirements,
      responsibilities,
      location,
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax,
      skills,
      deadline,
      postedBy: req.user.id
    });

    await job.save();

    res.status(201).json({ 
      message: 'Job posted successfully',
      job 
    });
  } catch (error) {
    console.error('Job creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update job
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Only the company that posted the job or admin can update
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({ 
      message: 'Job updated successfully',
      job: updatedJob 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete job
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('Delete job request received');
    console.log('User from token:', req.user);
    console.log('Job ID:', req.params.id);
    
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    console.log('Job postedBy:', job.postedBy);
    console.log('User ID:', req.user.id);
    console.log('User role:', req.user.role);

    // Only the company that posted the job or admin can delete
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      console.log('Access denied - user cannot delete this job');
      return res.status(403).json({ message: 'Access denied' });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Apply for a job
router.post('/:id/apply', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Only users can apply for jobs' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user already applied
    const alreadyApplied = job.applications.some(
      app => app.user.toString() === req.user.id
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const { resume, coverLetter } = req.body;

    job.applications.push({
      user: req.user.id,
      resume,
      coverLetter,
      status: 'pending'
    });

    await job.save();

    res.json({ 
      message: 'Application submitted successfully',
      job 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update application status (Company/Admin only)
router.put('/:jobId/applications/:applicationId', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'company' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status } = req.body;
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const application = job.applications.id(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    await job.save();

    res.json({ 
      message: 'Application status updated',
      application 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

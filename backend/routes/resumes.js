const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
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

// Get all resumes for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const resumes = await Resume.find({ 
      userId: req.user.id,
      isActive: true 
    }).sort({ isPrimary: -1, createdAt: -1 });
    
    res.json({ resumes, count: resumes.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get resume by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json({ resume });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new resume
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Basic validation
    const fileName = (req.body.fileName || '').toString().trim();
    if (!fileName) {
      return res.status(400).json({ message: 'fileName is required' });
    }

    // Helper to normalize URL (server-side safety)
    const normalizeUrl = (v) => {
      if (!v) return '';
      const s = String(v).trim();
      if (!s) return '';
      if (/^https?:\/\//i.test(s)) return s;
      return `https://${s}`;
    };

    // Apply safe defaults and sanitize inputs
    const body = req.body || {};
    const content = body.content || {};
    const personalInfo = content.personalInfo || {};
    const skills = content.skills || {};

    const resumeData = {
      userId: req.user.id,
      fileName,
      fileType: body.fileType || 'json',
      fileUrl: body.fileUrl ?? '',
      fileSize: typeof body.fileSize === 'number' ? body.fileSize : 0,
      isPrimary: !!body.isPrimary,
      content: {
        personalInfo: {
          name: personalInfo.name || '',
          email: personalInfo.email || '',
          phone: personalInfo.phone || '',
          location: personalInfo.location || '',
          linkedin: normalizeUrl(personalInfo.linkedin || ''),
          github: normalizeUrl(personalInfo.github || ''),
          website: normalizeUrl(personalInfo.website || ''),
        },
        summary: content.summary || '',
        experience: Array.isArray(content.experience) ? content.experience : [],
        education: Array.isArray(content.education) ? content.education : [],
        skills: {
          technical: Array.isArray(skills.technical) ? skills.technical : [],
          soft: Array.isArray(skills.soft) ? skills.soft : [],
          languages: Array.isArray(skills.languages) ? skills.languages : [],
          tools: Array.isArray(skills.tools) ? skills.tools : [],
        },
        projects: Array.isArray(content.projects) ? content.projects : [],
        certifications: Array.isArray(content.certifications) ? content.certifications : [],
      },
    };

    // If this is set as primary, unset other primary resumes
    if (resumeData.isPrimary) {
      await Resume.updateMany(
        { userId: req.user.id },
        { $set: { isPrimary: false } }
      );
    }

    const resume = new Resume(resumeData);
    await resume.save();

    // Increment user resume counters (non-blocking)
    try {
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { resumesCreated: 1, score: 5 },
        $set: { lastScoreUpdate: new Date() }
      });
    } catch (_) {}

    res.status(201).json({ 
      message: 'Resume created successfully',
      resume 
    });
  } catch (error) {
    // Return validation details when available
    if (error.name === 'ValidationError') {
      const details = Object.fromEntries(
        Object.entries(error.errors || {}).map(([k, v]) => [k, v.message])
      );
      return res.status(400).json({ message: 'Validation failed', details });
    }
    console.error('Error creating resume:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update resume
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // If setting as primary, unset other primary resumes
    if (req.body.isPrimary && !resume.isPrimary) {
      await Resume.updateMany(
        { userId: req.user.id, _id: { $ne: req.params.id } },
        { $set: { isPrimary: false } }
      );
    }

    Object.assign(resume, req.body);
    resume.version += 1;
    await resume.save();

    res.json({ 
      message: 'Resume updated successfully',
      resume 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete resume (soft delete)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    resume.isActive = false;
    await resume.save();

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Match resume with a specific job
router.post('/:id/match-job/:jobId', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Simple keyword matching algorithm
    // This is a placeholder for Resume-Matcher integration
    const resumeSkills = [
      ...(resume.content.skills?.technical || []),
      ...(resume.content.skills?.tools || [])
    ].map(s => s.toLowerCase());

    const jobSkills = (job.requiredSkills || []).map(s => s.toLowerCase());
    
    const matchedKeywords = jobSkills.filter(skill => 
      resumeSkills.some(rSkill => rSkill.includes(skill) || skill.includes(rSkill))
    );

    const missingKeywords = jobSkills.filter(skill => 
      !matchedKeywords.includes(skill)
    );

    const matchScore = jobSkills.length > 0 
      ? Math.round((matchedKeywords.length / jobSkills.length) * 100)
      : 0;

    // Generate suggestions
    const suggestions = [];
    if (matchScore < 50) {
      suggestions.push(`Add more relevant skills: ${missingKeywords.slice(0, 3).join(', ')}`);
      suggestions.push('Tailor your experience section to match job requirements');
    } else if (matchScore < 75) {
      suggestions.push(`Consider adding: ${missingKeywords.slice(0, 2).join(', ')}`);
      suggestions.push('Highlight achievements that align with job description');
    } else {
      suggestions.push('Your resume is well-matched! Consider minor optimizations.');
    }

    // Add or update match in resume
    const existingMatchIndex = resume.matchedJobs.findIndex(
      m => m.jobId.toString() === req.params.jobId
    );

    const matchData = {
      jobId: req.params.jobId,
      matchScore,
      matchedKeywords,
      missingKeywords,
      suggestions,
      matchedAt: new Date()
    };

    if (existingMatchIndex >= 0) {
      resume.matchedJobs[existingMatchIndex] = matchData;
    } else {
      resume.matchedJobs.push(matchData);
    }

    await resume.save();

    res.json({ 
      message: 'Resume matched successfully',
      matchScore,
      matchedKeywords,
      missingKeywords,
      suggestions,
      job: {
        title: job.title,
        company: job.company,
        location: job.location
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all matched jobs for a resume
router.get('/:id/matches', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('matchedJobs.jobId');

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json({ matches: resume.matchedJobs });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: false,
    default: ''
  },
  fileType: {
    type: String,
    enum: ['pdf', 'doc', 'docx', 'json'],
    required: false,
    default: 'json'
  },
  fileSize: {
    type: Number,
    required: false,
    default: 0
  },
  content: {
    personalInfo: {
      name: String,
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      github: String,
      website: String
    },
    summary: String,
    experience: [{
      company: String,
      position: String,
      location: String,
      startDate: Date,
      endDate: Date,
      current: Boolean,
      description: String,
      achievements: [String]
    }],
    education: [{
      institution: String,
      degree: String,
      field: String,
      location: String,
      startDate: Date,
      endDate: Date,
      gpa: String,
      achievements: [String]
    }],
    skills: {
      technical: [String],
      soft: [String],
      languages: [String],
      tools: [String]
    },
    projects: [{
      name: String,
      description: String,
      technologies: [String],
      link: String,
      startDate: Date,
      endDate: Date
    }],
    certifications: [{
      name: String,
      issuer: String,
      date: Date,
      expiryDate: Date,
      credentialId: String,
      link: String
    }]
  },
  atsScore: {
    type: Number,
    default: 0
  },
  matchedJobs: [{
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    matchScore: Number,
    matchedKeywords: [String],
    missingKeywords: [String],
    suggestions: [String],
    matchedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Index for faster queries
resumeSchema.index({ userId: 1, isActive: 1 });
resumeSchema.index({ userId: 1, isPrimary: 1 });

module.exports = mongoose.model('Resume', resumeSchema);

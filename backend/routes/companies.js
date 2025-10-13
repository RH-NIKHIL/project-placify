const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
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

// Get all companies
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find()
      .select('-password')
      .populate('employees', 'name email')
      .populate('jobPostings');
    
    res.json({ companies, count: companies.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get company by ID
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .select('-password')
      .populate('employees', 'name email')
      .populate('jobPostings');
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    res.json({ company });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create company
router.post('/', async (req, res) => {
  try {
    const { companyName, email, password, industry, description, website, location, phone } = req.body;

    // Check if company already exists
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({ message: 'Company already exists with this email' });
    }

    const company = new Company({
      companyName,
      email,
      password,
      industry,
      description,
      website,
      location,
      phone
    });

    await company.save();

    res.status(201).json({ 
      message: 'Company created successfully',
      company: company.toObject()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update company
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const { companyName, industry, description, website, location, phone, logo, totalEmployees, activeProjects, revenue } = req.body;

    if (companyName) company.companyName = companyName;
    if (industry) company.industry = industry;
    if (description) company.description = description;
    if (website) company.website = website;
    if (location) company.location = location;
    if (phone) company.phone = phone;
    if (logo) company.logo = logo;
    if (totalEmployees !== undefined) company.totalEmployees = totalEmployees;
    if (activeProjects !== undefined) company.activeProjects = activeProjects;
    if (revenue !== undefined) company.revenue = revenue;

    await company.save();

    res.json({ 
      message: 'Company updated successfully',
      company: company.toObject()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete company (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

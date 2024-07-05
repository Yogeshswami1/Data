const Enrollment = require('../models/Enrollment');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const enrollUser = async (req, res) => {
  try {
    const { enrollmentId, primaryContact, service } = req.body;

    // Check if the enrollmentId already exists
    const existingEnrollment = await Enrollment.findOne({ enrollmentId });
    if (existingEnrollment) {
      return res.status(400).send({ message: 'Enrollment ID already exists' });
    }

    // Check if the primary contact number is unique for the given service
    const existingContact = await Enrollment.findOne({ primaryContact, service });
    if (existingContact) {
      return res.status(400).send({ message: 'Primary contact number already exists for this service' });
    }

    const enrollment = new Enrollment(req.body);
    await enrollment.save();
    res.status(201).send(enrollment);
  } catch (error) {
    res.status(400).send(error);
  }
};



// Read all enrollments
const getEnrollments = async (req, res) => {
    try {
      const enrollments = await Enrollment.find();
      res.status(200).send(enrollments);
    } catch (error) {
      res.status(500).send(error);
    }
  };
  
  // Read a single enrollment by ID
  const getEnrollmentById = async (req, res) => {
    try {
      const enrollment = await Enrollment.findById(req.params.id);
      if (!enrollment) {
        return res.status(404).send({ message: 'Enrollment not found' });
      }
      res.status(200).send(enrollment);
    } catch (error) {
      res.status(500).send(error);
    }
  };
  
  // Update an enrollment by ID
  const updateEnrollment = async (req, res) => {
    try {
      const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!enrollment) {
        return res.status(404).send({ message: 'Enrollment not found' });
      }
      res.status(200).send(enrollment);
    } catch (error) {
      res.status(400).send(error);
    }
  };
  
  // Delete an enrollment by ID
  const deleteEnrollment = async (req, res) => {
    try {
      const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
      if (!enrollment) {
        return res.status(404).send({ message: 'Enrollment not found' });
      }
      res.status(200).send({ message: 'Enrollment deleted successfully' });
    } catch (error) {
      res.status(500).send(error);
    }
  };
  

  const uploadCSV = (req, res) => {
    const results = [];
    const filePath = path.join(__dirname, '..', req.file.path);
  
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const skippedEntries = [];
          for (const item of results) {
            const { enrollmentId, primaryContact, service } = item;
  
            // Check if the enrollmentId already exists
            const existingEnrollment = await Enrollment.findOne({ enrollmentId });
            if (existingEnrollment) {
              skippedEntries.push(enrollmentId);
              continue;
            }
  
            // Check if the primary contact number is unique for the given service
            const existingContact = await Enrollment.findOne({ primaryContact, service });
            if (existingContact) {
              skippedEntries.push(`${primaryContact} (${service})`);
              continue;
            }
  
            // Create new entry
            const newEnrollment = new Enrollment(item);
            await newEnrollment.save();
          }
          res.status(200).send({
            message: 'CSV data processed successfully',
            skippedEntries
          });
        } catch (error) {
          res.status(500).send({ message: 'Error processing CSV data', error });
        } finally {
          // Remove the uploaded file after processing
          fs.unlinkSync(filePath);
        }
      });
  };
  
  

module.exports = { enrollUser, getEnrollments, getEnrollmentById, updateEnrollment, deleteEnrollment, uploadCSV };

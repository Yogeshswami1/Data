const express = require('express');
const router = express.Router();
const multer = require('multer');
const { enrollUser, getEnrollments, getEnrollmentById, updateEnrollment, deleteEnrollment, uploadCSV } = require('../controllers/enrollmentController.js');
// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

router.post('/enroll', enrollUser);
router.get('/enrollments', getEnrollments);
router.get('/enrollments/:id', getEnrollmentById);
router.put('/enrollments/:id', updateEnrollment);
router.delete('/enrollments/:id', deleteEnrollment);
router.post('/upload', upload.single('file'), uploadCSV);
// Search route
router.get('/search', async (req, res) => {
    try {
      const { enrollmentId } = req.query;
      const enrollments = await Enrollment.find({ enrollmentId: new RegExp(enrollmentId, 'i') });
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching data', error });
    }
  });

module.exports = router;

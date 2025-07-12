const express = require("express");
const router = express.Router();

const {
  submitConsultancyRequest,
  submitConsultancyRequestByUserId,
  getAllConsultancyRequests,
  getConsultancyRequestById,
  updateConsultancyRequest,
} = require("../controllers/consultationController");

router.post("/submit", submitConsultancyRequest); // For app (non-authenticated)
router.post("/submit/user", submitConsultancyRequestByUserId); // For app (authenticated with user ID)
router.get("/all", getAllConsultancyRequests); // For admin panel
router.get("/:id", getConsultancyRequestById); // For admin panel
router.patch("/:id", updateConsultancyRequest); // For admin panel
router.put("/:id/assign", updateConsultancyRequest); // For assignment (alias for update)

module.exports = router;
// // routes/consultancyRoutes.js
// const express = require('express');
// const router = express.Router();

// const {
//   submitConsultancyRequest,
//   getAllConsultancyRequests, getConsultancyRequestById, updateConsultancyRequest
// } = require('../controllers/consultationController');

// router.post('/submit', submitConsultancyRequest); // For app

// router.get('/all', getAllConsultancyRequests);
// router.get('/:id', getConsultancyRequestById);  // For admin panel

// router.patch('/:id', updateConsultancyRequest);

// module.exports = router;

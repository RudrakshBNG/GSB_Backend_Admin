const ConsultancyRequest = require("../models/Consultation"); // Fixed import name
const User = require("../models/User"); // Import User model for validation

exports.submitConsultancyRequest = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, message } = req.body;

    const request = new ConsultancyRequest({
      firstName,
      lastName,
      email,
      phoneNumber,
      message,
    });

    await request.save();
    res.status(201).json({ message: "Request submitted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to submit request", error: err.message });
  }
};

exports.submitConsultancyRequestByUserId = async (req, res) => {
  try {
    const { userId, firstName, lastName, email, phoneNumber, message } =
      req.body;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const request = new ConsultancyRequest({
      user: userId,
      firstName: firstName || userExists.fullName?.split(" ")[0] || "", // Optional: Use user's first name if provided
      lastName:
        lastName || userExists.fullName?.split(" ").slice(1).join(" ") || "", // Optional: Use user's last name
      email: email || userExists.email || "", // Optional: Use user's email
      phoneNumber,
      message,
    });

    const savedRequest = await request.save();

    // Populate user details in the response
    const populatedRequest = await ConsultancyRequest.findById(savedRequest._id)
      .populate("user", "fullName email")
      .populate("assignedTo", "fullName email")
      .exec();

    res.status(201).json({
      message: "Consultancy request submitted successfully",
      data: populatedRequest,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to submit request", error: err.message });
  }
};

exports.getAllConsultancyRequests = async (req, res) => {
  try {
    const requests = await ConsultancyRequest.find()
      .populate("assignedTo", "fullName email")
      .populate("user", "fullName email") // Populate user field
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Fetched consultancy requests",
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch requests", error: error.message });
  }
};

exports.getConsultancyRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await ConsultancyRequest.findById(id)
      .populate("assignedTo", "fullName email")
      .populate("user", "fullName email"); // Populate user field

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({ message: "Success", data: request });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching request", error: error.message });
  }
};

exports.updateConsultancyRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo, status, notes } = req.body;

    const updatedRequest = await ConsultancyRequest.findByIdAndUpdate(
      id,
      {
        ...(assignedTo && { assignedTo }),
        ...(status && { status }),
        ...(notes && { notes }),
      },
      { new: true }
    )
      .populate("assignedTo", "fullName email")
      .populate("user", "fullName email"); // Populate user field

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({
      message: "Request updated successfully",
      data: updatedRequest,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update request", error: error.message });
  }
};
// // controllers/consultancyController.js
// const ConsultancyRequest = require('../models/Consultation');

// exports.submitConsultancyRequest = async (req, res) => {
//   try {
//     const { firstName, lastName, email, phoneNumber, message } = req.body;

//     const request = new ConsultancyRequest({
//       firstName,
//       lastName,
//       email,
//       phoneNumber,
//       message,
//     });

//     await request.save();
//     res.status(201).json({ message: 'Request submitted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to submit request', error: err.message });
//   }
// };

// // // controllers/consultancyController.js
// // exports.getAllConsultancyRequests = async (req, res) => {
// //   try {
// //     const requests = await ConsultancyRequest.find().sort({ createdAt: -1 });
// //     res.status(200).json({ message: 'Success', count: requests.length, data: requests });
// //   } catch (err) {
// //     res.status(500).json({ message: 'Failed to fetch requests', error: err.message });
// //   }
// // };
// exports.getAllConsultancyRequests = async (req, res) => {
//   try {
//     const requests = await ConsultancyRequest.find()
//       .populate('assignedTo', 'fullName email') // show assigned team member name/email
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       message: 'Fetched consultancy requests',
//       count: requests.length,
//       data: requests
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to fetch requests', error: error.message });
//   }
// };

// exports.getConsultancyRequestById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const request = await ConsultancyRequest.findById(id)
//       .populate('assignedTo', 'fullName email');

//     if (!request) {
//       return res.status(404).json({ message: 'Request not found' });
//     }

//     res.status(200).json({ message: 'Success', data: request });
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching request', error: error.message });
//   }
// };

// exports.updateConsultancyRequest = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { assignedTo, status, notes } = req.body;

//     const updatedRequest = await ConsultancyRequest.findByIdAndUpdate(
//       id,
//       {
//         ...(assignedTo && { assignedTo }), // optional update
//         ...(status && { status }),
//         ...(notes && { notes })
//       },
//       { new: true }
//     ).populate('assignedTo', 'fullName email');

//     if (!updatedRequest) {
//       return res.status(404).json({ message: 'Request not found' });
//     }

//     res.status(200).json({
//       message: 'Request updated successfully',
//       data: updatedRequest
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to update request', error: error.message });
//   }
// };

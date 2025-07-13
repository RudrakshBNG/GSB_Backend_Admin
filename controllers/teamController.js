const TeamMember = require("../models/TeamMember");
const Department = require("../models/Department");
const Chat = require("../models/Chat");

exports.addTeamMember = async (req, res) => {
  try {
    const { fullName, email, password, departmentId } = req.body;

    // Validate department IDs (accept single UUID or array of UUIDs)
    let departmentIds = [];
    if (departmentId) {
      const deptIds = Array.isArray(departmentId)
        ? departmentId
        : [departmentId];
      const departments = await Department.find({
        departmentId: { $in: deptIds },
      });
      if (departments.length !== deptIds.length) {
        return res
          .status(400)
          .json({ message: "One or more department IDs are invalid" });
      }
      departmentIds = departments.map((dept) => dept._id);
    }

    // Check if email already exists
    const existing = await TeamMember.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Team member already exists with this email" });
    }

    const newMember = new TeamMember({
      fullName,
      email,
      password: password,
      department: departmentIds,
    });

    await newMember.save();
    // Populate department details in the response
    const populatedMember = await TeamMember.findById(newMember._id).populate(
      "department",
      "departmentId name description"
    );
    res.status(201).json({
      message: "Team member added successfully",
      data: populatedMember,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add team member", error: error.message });
  }
};

exports.getAllTeamMembers = async (req, res) => {
  try {
    const teamMembers = await TeamMember.find();
    // .populate("department", "departmentId name description")
    // .select("fullName email department");
    res.status(200).json({
      message: "Fetched team members successfully",
      count: teamMembers.length,
      data: teamMembers,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch team members", error: error.message });
  }
};

exports.getAssignedChats = async (req, res) => {
  try {
    const { memberId } = req.params;

    const member = await TeamMember.findById(memberId)
      .populate({
        path: "assignedChats",
        select: "customerName status createdAt messages",
      })
      .populate("department", "departmentId name description");

    if (!member) {
      return res.status(404).json({ message: "Team member not found" });
    }

    res.status(200).json({
      message: "Assigned chats fetched successfully",
      count: member.assignedChats.length,
      data: {
        teamMember: {
          fullName: member.fullName,
          email: member.email,
          department: member.department,
        },
        assignedChats: member.assignedChats,
      },
    });
  } catch (error) {
    console.error("Error fetching assigned chats:", error);
    res.status(500).json({
      message: "Failed to fetch assigned chats",
      error: error.message,
    });
  }
};

exports.updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, departmentId, password } = req.body;

    // Validate department IDs (accept single UUID or array of UUIDs)
    let departmentIds = [];
    if (departmentId) {
      const deptIds = Array.isArray(departmentId)
        ? departmentId
        : [departmentId];
      const departments = await Department.find({
        departmentId: { $in: deptIds },
      });
      if (departments.length !== deptIds.length) {
        return res
          .status(400)
          .json({ message: "One or more department IDs are invalid" });
      }
      departmentIds = departments.map((dept) => dept._id);
    }

    const updatedData = {};
    if (fullName) updatedData.fullName = fullName;
    if (email) updatedData.email = email;
    if (departmentId) updatedData.department = departmentIds;
    if (password) updatedData.password = password;

    const team = await TeamMember.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true }
    ).populate("department", "departmentId name description");

    if (!team) {
      return res.status(404).json({ message: "Team member not found" });
    }

    res
      .status(200)
      .json({ message: "Team member updated successfully", data: team });
  } catch (error) {
    console.error("Error updating team member:", error);
    res
      .status(500)
      .json({ message: "Failed to update team member", error: error.message });
  }
};
exports.updatePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions, role } = req.body;

    const updateData = { updatedAt: new Date() };
    if (permissions) updateData.permissions = permissions;
    if (role) updateData.role = role;

    const teamMember = await TeamMember.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("department", "departmentId name description");

    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    res.status(200).json({
      message: "Permissions updated successfully",
      data: teamMember,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update permissions",
      error: error.message,
    });
  }
};

exports.teamMemberLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const teamMember = await TeamMember.findOne({
      email,
      isActive: true,
    }).populate("department", "departmentId name description");

    if (!teamMember || teamMember.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    teamMember.lastLogin = new Date();
    await teamMember.save();

    // Generate JWT token (you might want to use actual JWT here)
    const token = Buffer.from(
      JSON.stringify({
        id: teamMember._id,
        email: teamMember.email,
        role: teamMember.role,
        timestamp: Date.now(),
      })
    ).toString("base64");

    res.status(200).json({
      message: "Login successful",
      user: {
        id: teamMember._id,
        fullName: teamMember.fullName,
        email: teamMember.email,
        role: teamMember.role,
        permissions: teamMember.permissions,
        department: teamMember.department,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

exports.getCurrentTeamMember = async (req, res) => {
  try {
    // Extract team member ID from token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    let teamMemberId;

    try {
      // Decode the base64 token
      const tokenPayload = JSON.parse(Buffer.from(token, "base64").toString());
      teamMemberId = tokenPayload.id;
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const teamMember = await TeamMember.findById(teamMemberId)
      .populate("department", "departmentId name description")
      .select("-password");

    if (!teamMember || !teamMember.isActive) {
      return res.status(404).json({ message: "Team member not found" });
    }

    res.status(200).json({
      message: "Current team member fetched successfully",
      user: {
        id: teamMember._id,
        fullName: teamMember.fullName,
        email: teamMember.email,
        role: teamMember.role,
        permissions: teamMember.permissions,
        department: teamMember.department,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch current team member",
      error: error.message,
    });
  }
};

exports.deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params; // team member ID

    // Check if team member exists
    const teamMember = await TeamMember.findById(id);

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    // Delete the team member
    await TeamMember.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Team member deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting team member",
      error: error.message,
    });
  }
};

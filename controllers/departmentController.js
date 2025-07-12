const Department = require("../models/Department");
const TeamMember = require("../models/TeamMember");

exports.addDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ message: "Department name is required" });
    }

    // Check if department already exists
    const existing = await Department.findOne({ name });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Department already exists with this name" });
    }

    const newDepartment = new Department({
      name,
      description: description || "",
    });

    await newDepartment.save();
    res
      .status(201)
      .json({ message: "Department added successfully", data: newDepartment });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add department", error: error.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params; // departmentId
    const { name, description } = req.body;

    const updatedData = {};
    if (name) updatedData.name = name;
    if (description !== undefined) updatedData.description = description;

    const department = await Department.findOneAndUpdate(
      { departmentId: id },
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res
      .status(200)
      .json({ message: "Department updated successfully", data: department });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update department", error: error.message });
  }
};

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find(
      {},
      "departmentId name description"
    );
    res.status(200).json({
      message: "Fetched departments successfully",
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch departments", error: error.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params; // departmentId

    // Check if department exists
    const department = await Department.findOne({ departmentId: id });
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Check if any team members are assigned to this department
    const teamMembers = await TeamMember.find({ department: department._id });
    if (teamMembers.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete department because it is assigned to one or more team members",
        assignedTo: teamMembers.map((member) => ({
          id: member._id,
          fullName: member.fullName,
          email: member.email,
        })),
      });
    }

    // Delete the department
    await Department.deleteOne({ departmentId: id });
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete department", error: error.message });
  }
};

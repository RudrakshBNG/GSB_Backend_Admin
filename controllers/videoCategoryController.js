const VideoCategory = require("../models/VideoCategory");
const Video = require("../models/Video");

exports.addVideoCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existing = await VideoCategory.findOne({ name });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Category already exists with this name" });
    }

    const newCategory = new VideoCategory({
      name,
      description: description || "",
    });

    await newCategory.save();
    res
      .status(201)
      .json({
        message: "Video category added successfully",
        data: newCategory,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add video category", error: error.message });
  }
};

exports.updateVideoCategory = async (req, res) => {
  try {
    const { id } = req.params; // categoryId
    const { name, description } = req.body;

    const updatedData = {};
    if (name) updatedData.name = name;
    if (description !== undefined) updatedData.description = description;

    const category = await VideoCategory.findOneAndUpdate(
      { categoryId: id },
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Video category not found" });
    }

    res
      .status(200)
      .json({ message: "Video category updated successfully", data: category });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to update video category",
        error: error.message,
      });
  }
};

exports.getAllVideoCategories = async (req, res) => {
  try {
    const categories = await VideoCategory.find(
      {},
      "categoryId name description"
    );
    res.status(200).json({
      message: "Fetched video categories successfully",
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to fetch video categories",
        error: error.message,
      });
  }
};

exports.deleteVideoCategory = async (req, res) => {
  try {
    const { id } = req.params; // categoryId

    const category = await VideoCategory.findOne({ categoryId: id });
    if (!category) {
      return res.status(404).json({ message: "Video category not found" });
    }

    const videos = await Video.find({ category: category._id });
    if (videos.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete category because it is assigned to one or more videos",
        assignedTo: videos.map((video) => ({
          id: video._id,
          title: video.title,
        })),
      });
    }

    await VideoCategory.deleteOne({ categoryId: id });
    res.status(200).json({ message: "Video category deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to delete video category",
        error: error.message,
      });
  }
};

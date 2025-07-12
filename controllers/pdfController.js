const mongoose = require('mongoose');
const PDF = require('../models/PDF');
const { GridFSBucket } = require('mongodb');
const fs = require('fs');

const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../utils/S3Client");
const { v4: uuidv4 } = require("uuid");

exports.uploadDietPlan = async (req, res) => {
  try {
    const { title, description } = req.body;
    const pdfFile = req.files?.pdfFile?.[0];
    const thumbnail = req.files?.thumbnail?.[0];

    if (!pdfFile) return res.status(400).json({ message: "PDF file missing" });

    const pdfKey = `diet-plans/${Date.now()}-${uuidv4()}-${pdfFile.originalname}`;
    const thumbKey = thumbnail
      ? `thumbnails/${Date.now()}-${uuidv4()}-${thumbnail.originalname}`
      : null;

    // Upload PDF
    await s3.send(
new PutObjectCommand({
  Bucket: process.env.S3_BUCKET_NAME, // ✅ Must be defined
  Key: pdfKey,
  Body: pdfFile.buffer,
  ContentType: pdfFile.mimetype,
  ACL: "public-read",
})

    );
console.log("Bucket Env:", process.env.S3_BUCKET_NAME); // ✅ should log 'gsb-data'

    // Upload thumbnail if exists
    if (thumbnail) {
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: thumbKey,
          Body: thumbnail.buffer,
          ContentType: thumbnail.mimetype,
          ACL: "public-read",
        })
      );
    }

   // ✅ After both uploads, save to MongoDB
    const pdfUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${pdfKey}`;
    const thumbnailUrl = thumbKey
      ? `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbKey}`
      : null;

    await PDF.create({
      title,
      description,
      pdfUrl,
      thumbnailUrl,
    });

    // ✅ Then return response
    res.status(200).json({
      message: "Upload successful",
      title,
      description,
      pdfUrl,
      thumbnailUrl,
    });
  } catch (err) {
    console.error("S3 upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};



exports.getAllDietPlans = async (req, res) => {
  try {
    const plans = await PDF.find()
      .sort({ createdAt: -1 })
      .select("title description pdfUrl thumbnailUrl"); // ✅ Only return these fields

    res.status(200).json({
      message: "Success",
      count: plans.length,
      data: plans,
    });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Failed to fetch diet plans", error: err.message });
  }
};




exports.deletePDF = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPDF = await PDF.findByIdAndDelete(id);

    if (!deletedPDF) {
      return res.status(404).json({ message: "PDF not found" });
    }

    // Extract S3 keys from URLs
    const pdfKey = new URL(deletedPDF.pdfUrl).pathname.substring(1); // remove leading '/'
    const thumbKey = deletedPDF.thumbnailUrl ? new URL(deletedPDF.thumbnailUrl).pathname.substring(1) : null;

    // Delete PDF from S3
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: pdfKey,
    }));

    // Delete thumbnail if present
    if (thumbKey) {
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: thumbKey,
      }));
    }

    res.status(200).json({ message: "PDF deleted successfully", pdf: deletedPDF });
  } catch (error) {
    console.error("Error deleting PDF:", error);
    res.status(500).json({ message: "Failed to delete PDF", error: error.message });
  }
};
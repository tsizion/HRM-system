const mongoose = require("mongoose");

const performanceReviewSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HROperationsManager",
      required: true,
    },
    reviewDate: {
      type: Date,
      required: true,
    },
    performanceScore: {
      type: Number,
      required: true,
    },
    comments: {
      type: String,
    },
    goalsForNextPeriod: {
      type: String,
    },
  },
  { timestamps: true }
);

const PerformanceReview = mongoose.model(
  "PerformanceReview",
  performanceReviewSchema
);

module.exports = PerformanceReview;

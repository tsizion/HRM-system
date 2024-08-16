const mongoose = require("mongoose");

const probationReportSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    hrManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HROperationsManager",
      required: true,
    },
    evaluationDate: {
      type: Date,
      required: true,
    },
    performanceSummary: {
      type: String,
      required: true,
    },
    recommendations: {
      type: String,
    },
    outcome: {
      type: String,
      enum: ["Pass", "Fail", "Extended"],
      required: true,
    },
  },
  { timestamps: true }
);

const ProbationReport = mongoose.model(
  "ProbationReport",
  probationReportSchema
);

module.exports = ProbationReport;

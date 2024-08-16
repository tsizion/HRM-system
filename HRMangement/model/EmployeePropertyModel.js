const mongoose = require("mongoose");

const employeePropertySchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    propertyType: {
      type: String,
      required: true,
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    approvalDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Requested", "Approved", "Denied"],
      default: "Requested",
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

const EmployeeProperty = mongoose.model(
  "EmployeeProperty",
  employeePropertySchema
);

module.exports = EmployeeProperty;

const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    payPeriodStart: {
      type: Date,
      required: true,
    },
    payPeriodEnd: {
      type: Date,
      required: true,
    },
    grossSalary: {
      type: Number,
      required: true,
    },
    deductions: {
      tax: Number,
      insurance: Number,
    },
    netSalary: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Payroll = mongoose.model("Payroll", payrollSchema);

module.exports = Payroll;

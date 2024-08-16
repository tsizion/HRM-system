const mongoose = require("mongoose");

const hiringLetterSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    issuedDate: {
      type: Date,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    signedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CEO",
      required: true,
    },
  },
  { timestamps: true }
);

const HiringLetter = mongoose.model("HiringLetter", hiringLetterSchema);

module.exports = HiringLetter;

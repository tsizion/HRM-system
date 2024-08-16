const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { type } = require("os");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    description: {
      type: String,
    },
    location: {
      building: String,
      floor: String,
    },
    location: {
      type: String,
    },
    contact: {
      type: String,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Exclude from queries by default
    },
  },
  { timestamps: true }
);
departmentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
departmentSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to create a password reset token
departmentSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  return crypto.createHash("sha256").update(resetToken).digest("hex");
};

const Department = mongoose.model("Department", departmentSchema);

module.exports = Department;

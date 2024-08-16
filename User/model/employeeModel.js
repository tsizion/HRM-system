const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const employeeSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      unique: true,
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
    },
    hireDate: {
      type: Date,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    salary: {
      type: Number,
      required: true,
    },
    benefits: {
      healthInsurance: Boolean,
      retirementPlan: Boolean,
      otherBenefits: [String],
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

// Hash the password before saving
employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
employeeSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to create a password reset token
employeeSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  return crypto.createHash("sha256").update(resetToken).digest("hex");
};

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;

const catchAsync = require("../../ErrorHandlers/catchAsync");
const Department = require("../model/departmentModel");
const AppError = require("../../ErrorHandlers/appError");
const mongoose = require("mongoose");
const { checkUniqueFields } = require("../../Utils/checkUniqueFields");

// Create a new Department
exports.Create = catchAsync(async (req, res, next) => {
  const { name, status, description, location, contact, password } = req.body;

  // Validate required fields
  if (!name || !password) {
    return next(new AppError("Name and password are required.", 400));
  }

  // Start MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  // Check for existing record with same email or phone
  const recordExists = await checkUniqueFields(null, contact, session);
  if (recordExists) {
    await session.abortTransaction();
    session.endSession();
    return next(
      new AppError("A department with this contact already exists.", 400)
    );
  }

  // Create new Department
  const newDepartment = await Department.create(
    [
      {
        name,
        status,
        description,
        location,
        contact,
        password,
      },
    ],
    { session }
  );

  await session.commitTransaction();
  session.endSession();

  res.status(201).json({
    status: "success",
    data: {
      department: newDepartment[0],
    },
  });
});

// Update an existing Department

// Read all Departments
exports.ReadAll = catchAsync(async (req, res, next) => {
  const departments = await Department.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: departments.length,
    data: {
      departments,
    },
  });
});

// Read one Department by ID
exports.ReadOne = catchAsync(async (req, res, next) => {
  const department = await Department.findById(req.params.id);

  if (!department) {
    return next(new AppError("Department not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      department,
    },
  });
});

// Update an existing Department
exports.Update = catchAsync(async (req, res, next) => {
  const departmentId = req.params.id;
  const updateData = req.body;

  // Start MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  // Find existing Department
  const existingDepartment = await Department.findById(departmentId).session(
    session
  );
  if (!existingDepartment) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError("Department not found", 404));
  }

  // Check for existing record with same email or phone
  const recordExists = await checkUniqueFields(
    null,
    updateData.contact,
    session
  );
  if (recordExists) {
    await session.abortTransaction();
    session.endSession();
    return next(
      new AppError("A department with this contact already exists.", 400)
    );
  }

  // Update Department
  const updatedDepartment = await Department.findByIdAndUpdate(
    departmentId,
    updateData,
    {
      new: true,
      runValidators: true,
      session,
    }
  );

  await session.commitTransaction();
  session.endSession();

  res.status(200).json({
    status: "success",
    data: {
      department: updatedDepartment,
    },
  });
});

// Delete a Department
exports.Delete = catchAsync(async (req, res, next) => {
  const departmentId = req.params.id;

  // Start MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  // Delete Department
  const deletedDepartment = await Department.findByIdAndDelete(departmentId, {
    session,
  });

  if (!deletedDepartment) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError("Department not found", 404));
  }

  await session.commitTransaction();
  session.endSession();

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Update Department password
exports.updatePassword = catchAsync(async (req, res, next) => {
  const id = req.userId;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return next(
      new AppError("Please provide both old and new passwords.", 400)
    );
  }

  // Start a Mongoose session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  // Fetch the existing Department document from the database within the transaction
  const department = await Department.findById(id)
    .select("+password")
    .session(session);

  if (!department) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError("Department not found", 404));
  }

  // Check if the old password is correct
  const isMatch = await department.correctPassword(oldPassword);
  if (!isMatch) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError("Incorrect old password", 401));
  }

  // Save the new password
  department.password = newPassword;
  await department.save({ session });

  // Commit the transaction
  await session.commitTransaction();
  session.endSession();

  res.status(200).json({
    status: "success",
    message: "Password updated successfully",
  });
});

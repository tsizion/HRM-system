const catchAsync = require("../../ErrorHandlers/catchAsync");
const CEO = require("../model/CEOModel");
const AppError = require("../../ErrorHandlers/appError");
const mongoose = require("mongoose");
const { checkUniqueFields } = require("../../Utils/checkUniqueFields");

exports.Create = catchAsync(async (req, res, next) => {
  const {
    fullName,
    username,
    email,
    phoneNumber,
    password,
    companyVision,
    boardMeetingSchedule,
    executiveDecisions,
  } = req.body;

  // Validate required fields
  if (
    !fullName ||
    !username ||
    !email ||
    !phoneNumber ||
    !password ||
    !companyVision
  ) {
    return next(new AppError("All required fields must be provided.", 400));
  }

  // Start MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  // Check for existing CEO with same email or phone number
  const recordExists = await checkUniqueFields(email, phoneNumber, session);
  if (recordExists) {
    await session.abortTransaction();
    session.endSession();
    return next(
      new AppError("A User with this email or phone number already exists.", 400)
    );
  }

  // Create new CEO
  const newCEO = await CEO.create(
    [
      {
        fullName,
        username,
        email,
        phoneNumber,
        password,
        companyVision,
        boardMeetingSchedule,
        executiveDecisions,
      },
    ],
    { session }
  );

  await session.commitTransaction();
  session.endSession();

  res.status(201).json({
    status: "success",
    data: {
      ceo: newCEO[0],
    },
  });
});

// Read all CEOs
exports.ReadAll = catchAsync(async (req, res, next) => {
  const ceos = await CEO.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: ceos.length,
    data: {
      ceos,
    },
  });
});

// Read one CEO by ID
exports.ReadOne = catchAsync(async (req, res, next) => {
  const ceo = await CEO.findById(req.params.id);

  if (!ceo) {
    return next(new AppError("CEO not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      ceo,
    },
  });
});

// Update a CEO
exports.Update = catchAsync(async (req, res, next) => {
  const ceoId = req.params.id;
  const updateData = req.body;

  // Start MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  // Find existing CEO
  const existingCEO = await CEO.findById(ceoId).session(session);
  if (!existingCEO) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError("CEO not found", 404));
  }

  // Check for existing record with same email or phone number
  const recordExists = await checkUniqueFields(
    updateData.email,
    updateData.phoneNumber,
    session
  );
  if (recordExists) {
    await session.abortTransaction();
    session.endSession();
    return next(
      new AppError("A CEO with this email or phone number already exists.", 400)
    );
  }

  // Update CEO
  const updatedCEO = await CEO.findByIdAndUpdate(ceoId, updateData, {
    new: true,
    runValidators: true,
    session,
  });

  if (!updatedCEO) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError("CEO not found", 404));
  }

  await session.commitTransaction();
  session.endSession();

  res.status(200).json({
    status: "success",
    data: {
      ceo: updatedCEO,
    },
  });
});

// Delete a CEO
exports.Delete = catchAsync(async (req, res, next) => {
  const ceoId = req.params.id;

  // Start MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  // Delete CEO
  const deletedCEO = await CEO.findByIdAndDelete(ceoId, { session });

  if (!deletedCEO) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError("CEO not found", 404));
  }

  await session.commitTransaction();
  session.endSession();

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Update CEO password
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

  // Fetch the existing CEO document from the database within the transaction
  const ceo = await CEO.findById(id).select("+password").session(session);

  if (!ceo) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError("CEO not found", 404));
  }

  // Check if the old password is correct
  const isMatch = await ceo.correctPassword(oldPassword);
  if (!isMatch) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError("Incorrect old password", 401));
  }

  // Save the new password
  ceo.password = newPassword;
  await ceo.save({ session });

  // Commit the transaction
  await session.commitTransaction();
  session.endSession();

  res.status(200).json({
    status: "success",
    message: "Password updated successfully",
  });
});

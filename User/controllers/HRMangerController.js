const catchAsync = require("../../ErrorHandlers/catchAsync");
const HRManager = require("../model/HRManager");
const AppError = require("../../ErrorHandlers/appError");
const authUtils = require("../../Utils/authUtils");
const mongoose = require("mongoose");
const { checkUniqueFields } = require("../../Utils/checkUniqueFields");

// Create a new HR Manager
exports.Create = catchAsync(async (req, res, next) => {
  const { fullName, username, email, phoneNumber, password } = req.body;

  // Validate required fields
  if (!fullName || !username || !email || !phoneNumber || !password) {
    return next(
      new AppError(
        "All fields (fullName, username, email, phoneNumber, password) are required.",
        400
      )
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check for existing records across all models
    const isDuplicate = await checkUniqueFields(email, phoneNumber, session);
    if (isDuplicate) {
      await session.abortTransaction();
      session.endSession();
      return next(
        new AppError(
          "A record with this email or phone number already exists.",
          400
        )
      );
    }

    // Create new HR Manager
    const newHRManager = await HRManager.create(
      [{ fullName, username, email, phoneNumber, password }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      status: "success",
      data: {
        hrManager: newHRManager[0],
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError("Error creating HR Manager", 500));
  }
});

// Read all HR Managers
exports.ReadAll = catchAsync(async (req, res, next) => {
  const hrManagers = await HRManager.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: hrManagers.length,
    data: {
      hrManagers,
    },
  });
});

// Read one HR Manager by ID
exports.ReadOne = catchAsync(async (req, res, next) => {
  const hrManager = await HRManager.findById(req.params.id);

  if (!hrManager) {
    return next(new AppError("HR Manager not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      hrManager,
    },
  });
});

// Update an HR Manager
exports.Update = catchAsync(async (req, res, next) => {
  const hrManagerId = req.params.id;
  const { email, phoneNumber } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find existing HR Manager
    const existingHRManager = await HRManager.findById(hrManagerId).session(
      session
    );

    if (!existingHRManager) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError("HR Manager not found", 404));
    }

    // Check for existing records across all models
    if (email || phoneNumber) {
      const isDuplicate = await checkUniqueFields(email, phoneNumber, session);
      if (isDuplicate) {
        await session.abortTransaction();
        session.endSession();
        return next(
          new AppError(
            "A record with this email or phone number already exists.",
            400
          )
        );
      }
    }

    // Update HR Manager
    const updatedHRManager = await HRManager.findByIdAndUpdate(
      hrManagerId,
      req.body,
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
        hrManager: updatedHRManager,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError("Error updating HR Manager", 500));
  }
});

// Delete an HR Manager
exports.Delete = catchAsync(async (req, res, next) => {
  const hrManagerId = req.params.id;

  // Start MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Delete HR Manager
    const deletedHRManager = await HRManager.findByIdAndDelete(hrManagerId, {
      session,
    });

    if (!deletedHRManager) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError("HR Manager not found", 404));
    }

    await session.commitTransaction();
    session.endSession();

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError("Error deleting HR Manager", 500));
  }
});

// Update HR Manager password
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

  try {
    // Fetch the existing HR Manager document from the database within the transaction
    const hrManager = await HRManager.findById(id)
      .select("+password")
      .session(session);

    if (!hrManager) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError("HR Manager not found", 404));
    }

    // Check if the old password is correct
    const isMatch = await hrManager.correctPassword(oldPassword);
    if (!isMatch) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError("Incorrect old password", 401));
    }

    // Save the new password
    hrManager.password = newPassword;
    await hrManager.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError("Error updating password", 500));
  }
});

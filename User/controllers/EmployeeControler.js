const catchAsync = require("../../ErrorHandlers/catchAsync");
const Employee = require("../model/employeeModel");
const AppError = require("../../ErrorHandlers/appError");
const mongoose = require("mongoose");
const { checkUniqueFields } = require("../../Utils/checkUniqueFields");

exports.Create = catchAsync(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    username,
    phone,
    address,
    hireDate,
    jobTitle,
    departmentId,
    salary,
    benefits,
    password,
  } = req.body;

  // Validate required fields
  if (
    !firstName ||
    !lastName ||
    !email ||
    !username ||
    !phone ||
    !hireDate ||
    !jobTitle ||
    !salary ||
    !password
  ) {
    return next(new AppError("All required fields must be provided.", 400));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check for unique email and phone across models
    await checkUniqueFields({ email, phone }, session, [
      Employee,
      HRManager,
      CEO,
      Department,
    ]);

    // Create new Employee
    const newEmployee = await Employee.create(
      [
        {
          firstName,
          lastName,
          email,
          username,
          phone,
          address,
          hireDate,
          jobTitle,
          departmentId,
          salary,
          benefits,
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
        employee: newEmployee[0],
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return next(err);
  }
});

// Read all Employees
exports.ReadAll = catchAsync(async (req, res, next) => {
  const employees = await Employee.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: employees.length,
    data: {
      employees,
    },
  });
});

// Read one Employee by ID
exports.ReadOne = catchAsync(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    return next(new AppError("Employee not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      employee,
    },
  });
});

// Update an Employee
exports.Update = catchAsync(async (req, res, next) => {
  const employeeId = req.params.id;
  const { email, phone, ...updateData } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find existing employee
    const existingEmployee = await Employee.findById(employeeId).session(
      session
    );

    if (!existingEmployee) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError("Employee not found", 404));
    }

    // Check for unique email and phone across models, excluding current employee
    await checkUniqueFields(
      { email, phone },
      session,
      [Employee, HRManager, CEO, Department],
      employeeId
    );

    // Update Employee
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      { email, phone, ...updateData },
      {
        new: true,
        runValidators: true,
        session,
      }
    );

    if (!updatedEmployee) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError("Employee not found", 404));
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: "success",
      data: {
        employee: updatedEmployee,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return next(err);
  }
});

// Delete an Employee
exports.Delete = catchAsync(async (req, res, next) => {
  const employeeId = req.params.id;

  // Start MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  // Delete Employee
  const deletedEmployee = await Employee.findByIdAndDelete(employeeId, {
    session,
  });

  if (!deletedEmployee) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError("Employee not found", 404));
  }

  await session.commitTransaction();
  session.endSession();

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Update Employee password
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

  // Fetch the existing Employee document from the database within the transaction
  const employee = await Employee.findById(id)
    .select("+password")
    .session(session);

  if (!employee) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError("Employee not found", 404));
  }

  // Check if the old password is correct
  const isMatch = await employee.correctPassword(oldPassword);
  if (!isMatch) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError("Incorrect old password", 401));
  }

  // Save the new password
  employee.password = newPassword;
  await employee.save({ session });

  // Commit the transaction
  await session.commitTransaction();
  session.endSession();

  res.status(200).json({
    status: "success",
    message: "Password updated successfully",
  });
});

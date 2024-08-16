const AppError = require("../../ErrorHandlers/appError");
const Employee = require("../User/model/employeeModel"); // Adjust the path as necessary
const CEO = require("../User/model/CEOModel"); // Adjust the path as necessary
const Department = require("../User/model/departmentModel"); // Adjust the path as necessary
const HRManager = require("../User/model/HRManager");
const authUtils = require("../../Utils/authUtils");
const catchAsync = require("../../Utils/catchAsync"); // Ensure you have this utility

exports.login = catchAsync(async (req, res, next) => {
  const { email, phoneNumber, password } = req.body;

  if ((!email && !phoneNumber) || !password) {
    return next(
      new AppError(
        "Email or phone number and password should be provided to login!",
        401
      )
    );
  }

  let userLogged;

  if (email) {
    userLogged = await HRManager.findOne({ email }).select("+password");
    if (!userLogged)
      userLogged = await CEO.findOne({ email }).select("+password");
    if (!userLogged)
      userLogged = await Department.findOne({ email }).select("+password");
    if (!userLogged)
      userLogged = await Employee.findOne({ email }).select("+password");
  } else if (phoneNumber) {
    userLogged = await HRManager.findOne({ phoneNumber }).select("+password");
    if (!userLogged)
      userLogged = await CEO.findOne({ phoneNumber }).select("+password");
    if (!userLogged)
      userLogged = await Department.findOne({ phoneNumber }).select(
        "+password"
      );
    if (!userLogged)
      userLogged = await Employee.findOne({ phoneNumber }).select("+password");
  }

  if (!userLogged) {
    return next(new AppError("The user doesn't exist!", 400));
  }

  const compare = await userLogged.correctPassword(password);

  if (compare) {
    const token = await authUtils.signToken(userLogged._id);

    res.status(200).json({
      token,
      user: {
        id: userLogged._id,
        email: userLogged.email,
        phoneNumber: userLogged.phoneNumber,
        role: userLogged.role || "User", // Default role if not specified
      },
    });
  } else {
    return next(
      new AppError("Your phone number or password is incorrect.", 403)
    );
  }
});

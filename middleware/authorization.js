const jwt = require("jsonwebtoken");
const AppError = require("../ErrorHandlers/appError");
const Employee = require("../User/model/employeeModel"); // Adjust the path as necessary
const CEO = require("../User/model/CEOModel"); // Adjust the path as necessary
const Department = require("../User/model/departmentModel"); // Adjust the path as necessary
const HRManager = require("../User/model/HRManager"); // Adjust the path as necessary

// Middleware to protect routes for HR Manager authentication
exports.protectHRManager = async (req, res, next) => {
  try {
    let token;

    // Checking the Authorization header for the token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      return next(
        new AppError(
          "Not authorized. Please log in to access this resource.",
          401
        )
      );
    }

    // Verifying the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Extracting HR Manager id from the token payload
    const hrManagerId = decoded.id;

    // Find the HR Manager using the retrieved id
    const hrManager = await HRManager.findById(hrManagerId);

    if (!hrManager) {
      return next(new AppError("HR Manager not found.", 404));
    }

    // Attach the HR Manager id to the request object for use in subsequent middleware or route handlers
    req.hrManagerId = hrManagerId;

    next();
  } catch (error) {
    return next(
      new AppError(
        "Not authorized. Please log in to access this resource.",
        401
      )
    );
  }
};

// Middleware to protect routes for HR Manager authentication
exports.protectHRManager = async (req, res, next) => {
  try {
    let token;

    // Checking the Authorization header for the token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      return next(
        new AppError(
          "Not authorized. Please log in to access this resource.",
          401
        )
      );
    }

    // Verifying the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Extracting user id from the token payload
    const userId = decoded.id;

    // Find the user using the retrieved id
    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError("User not found.", 404));
    }

    // Check if the user role is HR Manager
    if (user.role !== "HR Manager") {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }

    // Attach the user id to the request object for use in subsequent middleware or route handlers
    req.userId = userId;

    next();
  } catch (error) {
    return next(
      new AppError(
        "Not authorized. Please log in to access this resource.",
        401
      )
    );
  }
};

// Middleware to protect routes for employee authentication
exports.protectEmployee = async (req, res, next) => {
  try {
    let token;

    // Checking the Authorization header for the token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      return next(
        new AppError(
          "Not authorized. Please log in to access this resource.",
          401
        )
      );
    }

    // Verifying the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Extracting employee id from the token payload
    const employeeId = decoded.id;

    // Find the employee using the retrieved id
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return next(new AppError("Employee not found.", 404));
    }

    // Attach the employee id to the request object for use in subsequent middleware or route handlers
    req.employeeId = employeeId;

    next();
  } catch (error) {
    return next(
      new AppError(
        "Not authorized. Please log in to access this resource.",
        401
      )
    );
  }
};

// Middleware to protect routes for CEO authentication
exports.protectCEO = async (req, res, next) => {
  try {
    let token;

    // Checking the Authorization header for the token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      return next(
        new AppError(
          "Not authorized. Please log in to access this resource.",
          401
        )
      );
    }

    // Verifying the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Extracting CEO id from the token payload
    const ceoId = decoded.id;

    // Find the CEO using the retrieved id
    const ceo = await CEO.findById(ceoId);

    if (!ceo) {
      return next(new AppError("CEO not found.", 404));
    }

    // Attach the CEO id to the request object for use in subsequent middleware or route handlers
    req.ceoId = ceoId;

    next();
  } catch (error) {
    return next(
      new AppError(
        "Not authorized. Please log in to access this resource.",
        401
      )
    );
  }
};

// Middleware to protect routes for department authentication
exports.protectDepartment = async (req, res, next) => {
  try {
    let token;

    // Checking the Authorization header for the token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      return next(
        new AppError(
          "Not authorized. Please log in to access this resource.",
          401
        )
      );
    }

    // Verifying the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Extracting department id from the token payload
    const departmentId = decoded.id;

    // Find the department using the retrieved id
    const department = await Department.findById(departmentId);

    if (!department) {
      return next(new AppError("Department not found.", 404));
    }

    // Attach the department id to the request object for use in subsequent middleware or route handlers
    req.departmentId = departmentId;

    next();
  } catch (error) {
    return next(
      new AppError(
        "Not authorized. Please log in to access this resource.",
        401
      )
    );
  }
};

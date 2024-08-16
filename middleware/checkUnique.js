const AppError = require("../ErrorHandlers/appError");
const {
  checkUniqueEmail,
  checkUniquePhoneNumber,
} = require("../services/uniqueCheckService");
const catchAsync = require("../Utils/authUtils");

exports.checkUnique = (modelType) =>
  catchAsync(async (req, res, next) => {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) return next(); // Proceed if no email or phoneNumber

    if (email) {
      const emailExists = await checkUniqueEmail(email);
      if (emailExists) {
        return next(
          new AppError("Email is already in use across all models.", 400)
        );
      }
    }

    if (phoneNumber) {
      const phoneNumberExists = await checkUniquePhoneNumber(phoneNumber);
      if (phoneNumberExists) {
        return next(
          new AppError("Phone number is already in use across all models.", 400)
        );
      }
    }

    req.modelType = modelType; // Attach the model type to the request if needed
    next();
  });

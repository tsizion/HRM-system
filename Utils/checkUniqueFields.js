const HRManager = require("../User/model/HRManager");
const CEO = require("../User/model/CEOModel");
const Department = require("../User/model/departmentModel");
const Employee = require("../User/model/employeeModel");

exports.checkUniqueFields = async (email, phoneNumber, session) => {
  const existingHRManager = await HRManager.findOne({
    $or: [
      { email: { $regex: new RegExp(`^${email}$`, "i") } },
      { phoneNumber },
    ],
  }).session(session);

  const existingCEO = await CEO.findOne({
    $or: [
      { email: { $regex: new RegExp(`^${email}$`, "i") } },
      { phoneNumber },
    ],
  }).session(session);

  const existingDepartment = await Department.findOne({
    $or: [
      { contact: { $regex: new RegExp(`^${email}$`, "i") } },
      { contact: phoneNumber },
    ],
  }).session(session);

  const existingEmployee = await Employee.findOne({
    $or: [
      { email: { $regex: new RegExp(`^${email}$`, "i") } },
      { phone: phoneNumber },
    ],
  }).session(session);

  if (
    existingHRManager ||
    existingCEO ||
    existingDepartment ||
    existingEmployee
  ) {
    return true; // Record with this email or phone number exists
  }
  return false; // No record found
};

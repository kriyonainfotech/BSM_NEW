const UserModel = require("../models/user");
const Account = require("../models/Account");
const AddAccount = async (req, res) => {
  try {
    const { userId, accountHolderName, address, mobileNumber, accountType } =
      req.body;
    if (
      !accountHolderName ||
      !userId ||
      !address ||
      !mobileNumber ||
      !accountType
    ) {
      return res
        .status(400)
        .send({ success: false, message: "All Field Is Required" });
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(400)
        .send({ success: false, message: "User not found." });
    }
    const existingname = await Account.findOne({
      accountHolderName,
      userId,
      accountType,
    });
    if (existingname) {
      return res.status(400).json({
        success: false,
        message: "Account Holder name already exists",
      });
    }
    const account = new Account({
      userId,
      accountHolderName,
      address,
      mobileNumber,
      accountType,
    });
    await account.save();
    return res.status(200).json({
      success: true,
      message: "Account created successfully",
      account,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};
const getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.find();
    if (!accounts || accounts.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No accounts found" });
    }
    return res.status(200).json({
      success: true,
      message: "Accounts retrieved successfully",
      accounts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};
const getAccountsByUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const accounts = await Account.find({ userId });
    if (!accounts || accounts.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No accounts found for this user" });
    }
    return res.status(200).json({
      success: true,
      message: "Accounts retrieved successfully",
      accounts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};

const updateAccount = async (req, res) => {
  try {
    const { accountId } = req.body; // Account ID from URL parameters
    const { accountHolderName, address, mobileNumber, accountType } = req.body;
    console.log(req.body, "acc rb");

    // Validate if account exists
    const account = await Account.findById(accountId);
    console.log(account, "account");
    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found" });
    }
    // Update fields only if they are provided
    if (accountHolderName) account.accountHolderName = accountHolderName;
    if (address) account.address = address;
    if (mobileNumber) account.mobileNumber = mobileNumber;
    if (accountType) account.accountType = accountType;

    // Save the updated account
    await account.save();

    console.log(account, "save");
    return res.status(200).json({
      success: true,
      message: "Account updated successfully",
      account,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { accountId } = req.body; // Account ID from URL parameters

    // Find and delete the account
    const account = await Account.findByIdAndDelete(accountId);
    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};

module.exports = {
  AddAccount,
  getAllAccounts,
  getAccountsByUser,
  updateAccount,
  deleteAccount,
};

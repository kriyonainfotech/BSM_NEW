const UserModel = require("../models/user");
const nodemailer = require("nodemailer");
const OtpModel = require("../models/otp");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto"); // To generate a random OTP
const transporter = nodemailer.createTransport({
  service: "Gmail", // Update if using a different provider
  auth: {
    user: process.env.EMAIL, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your email password or app password
  },
});

const SentOtp = async (req, res) => {
  try {
    const { email, mobileNumber } = req.body;
    console.log(email);

    // Generate OTP and expiration time
    const otp = crypto.randomInt(100000, 999999);
    const otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    // Check if OTP entry already exists for this email
    let otpEntry = await OtpModel.findOne({ email });
    if (otpEntry) {
      // Update the OTP and expiration time
      otpEntry.otp = otp;
      otpEntry.otpExpires = otpExpires;
    } else {
      // Create new OTP entry
      otpEntry = new OtpModel({ email, otp, otpExpires, mobileNumber });
    }
    await otpEntry.save();

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Verify Your Email",
      text: `Your OTP for verification is ${otp}. This code is valid for 10 minutes.`,
    };
    await transporter.sendMail(mailOptions);

    res.status(200).send({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).send({ success: false, message: "Server error" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find OTP entry
    const otpEntry = await OtpModel.findOne({ email, otp });
    if (!otpEntry) {
      return res.status(400).send({ success: false, message: "Invalid OTP" });
    }
    // Check if OTP has expired
    if (otpEntry.otpExpires < Date.now()) {
      await OtpModel.deleteOne({ email }); // Clean up expired OTP
      return res
        .status(400)
        .send({ success: false, message: "OTP has expired" });
    }
    let userMobileNumber = otpEntry.mobileNumber;
    // Create user in UserModel
    const newUser = new UserModel({
      email,
      isVerified: true,
    });
    await newUser.save();

    // Delete OTP entry after successful verification
    await OtpModel.deleteOne({ email });

    res.status(200).send({
      success: true,
      message: "User created and verified successfully",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).send({ success: false, message: "Server error" });
  }
};

const completeRegistration = async (req, res) => {
  try {
    const { email, password, mobileNumber, address } = req.body;
    console.log(req.body, "register");

    const userExist = await UserModel.findOne({ email });
    if (!userExist || !userExist.isVerified) {
      return res
        .status(400)
        .send({ success: false, message: "Email not Verified" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    // Update user details
    const updatedUser = await UserModel.findOneAndUpdate(
      { email },
      {
        password: hashedPassword,
        mobileNumber,
        address,
        lastLoginTime: new Date(),
        isLoggedin: true,
      },
      { new: true, runValidators: true }
    );

    res.status(201).send({
      success: true,
      message: "User registered successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error completing registration:", error);
    res.status(500).send({ success: false, message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user with the provided email exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid email or password" });
    }

    // Compare provided password with the hashed password
    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid email or password" });
    }
    user.isLoggedin = true;
    user.lastLoginTime = new Date();
    await user.save();
    res.status(200).send({ success: true, message: "Login successful", user });
  } catch (error) {
    console.error("Error during user Login:", error);
    res.status(500).send({ success: false, message: "Server error" });
  }
};
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    const otp = crypto.randomInt(100000, 999999);
    const otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    // Check if an OTP entry already exists for the email
    const existingOtp = await OtpModel.findOne({ email });

    if (existingOtp) {
      // Update existing OTP record
      await OtpModel.updateOne({ email }, { otp, otpExpires });
    } else {
      // Create a new OTP record
      await OtpModel.create({ email, otp, otpExpires });
    }

    // Send OTP to user's email
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Verify Your Email",
      text: `Your OTP for verification is ${otp}. This code is valid for 10 minutes.`,
    };
    await transporter.sendMail(mailOptions);

    res.status(200).send({ success: true, message: "OTP sent to email" });
  } catch (error) {
    res.status(500).send({ success: false, message: "Server error", error });
  }
};

const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await OtpModel.findOne({ email, otp });

    if (!record || record.otpExpires < Date.now()) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid or expired OTP" });
    }

    res.status(200).send({ success: true, message: "OTP verified" });
  } catch (error) {
    res.status(500).send({ success: false, message: "Server error", error });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const numericOtp = parseInt(otp, 10);
    const record = await OtpModel.findOne({ email });

    // Check if the OTP record exists
    if (!record) {
      return res
        .status(400)
        .send({ success: false, message: "OTP does not match" });
    }

    // Check if OTP matches
    if (record.otp !== numericOtp) {
      return res.status(400).send({ success: false, message: "Incorrect OTP" });
    }

    // Check if OTP is expired
    if (record.otpExpires < Date.now()) {
      await OtpModel.deleteOne({ email, otp }); // Optionally delete expired OTP
      return res.status(400).send({ success: false, message: "OTP expired" });
    }

    // Hash the new password and update it in the user model
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    await UserModel.updateOne({ email }, { password: hashedPassword });

    // Delete OTP after successful password reset
    await OtpModel.deleteOne({ email, otp });

    res
      .status(200)
      .send({ success: true, message: "Password reset successful" });
  } catch (error) {
    res.status(500).send({ success: false, message: "Server error", error });
  }
};
const isLoggedin = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res
        .status(400)
        .send({ success: false, message: "UserId is required." });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found." });
    }

    // Check if lastLoginTime is more than 24 hours ago
    const hoursSinceLogin =
      (Date.now() - new Date(user.lastLoginTime)) / (1000 * 60 * 60);
    if (hoursSinceLogin >= 24) {
      // Update `isLoggedin` to false if 24 hours have passed
      user.isLoggedin = false;
      await user.save();
      return res.status(400).send({
        success: false,
        message: "User session expired. Please log in again.",
      });
    }
    // const minutesSinceLogin = (Date.now() - new Date(user.lastLoginTime)) / (1000 * 60);

    // if (minutesSinceLogin >= 1) {
    //   // Update `isLoggedin` to false if 5 minutes have passed
    //   user.isLoggedin = false;
    //   await user.save();
    //   return res.status(400).send({ success: false, message: "User session expired. Please log in again." });
    // }

    // If within 24 hours and `isLoggedin` is true
    if (user.isLoggedin) {
      return res
        .status(200)
        .send({ success: true, message: "User is logged in." });
    } else {
      return res
        .status(400)
        .send({ success: false, message: "User is not logged in." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};

module.exports = {
  SentOtp,
  loginUser,
  verifyOtp,
  completeRegistration,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
  isLoggedin,
};

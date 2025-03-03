const Company = require("../models/company");
const UserModel = require("../models/user");
const AddCompany = async (req, res) => {
  try {
    const { company, userId } = req.body;

    if (!company || !userId) {
      return res
        .status(400)
        .send({ success: false, message: "All fields are required" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(400)
        .send({ success: false, message: "User not found." });
    }

    const existCompany = await Company.findOne({ company });
    if (existCompany) {
      return res
        .status(400)
        .send({ success: false, message: "Company already exists." });
    }

    const newCompany = new Company({ company, userId });
    await newCompany.save();

    res
      .status(201)
      .send({
        success: true,
        message: "Company added successfully",
        company: newCompany,
      });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};
const getCompany = async (req, res) => {
  try {
    const { companyId } = req.body;
    const company = await Company.findById(companyId);

    if (!company) {
      return res
        .status(404)
        .send({ success: false, message: "Company not found" });
    }

    res.status(200).send({ success: true, company });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find();

    res.status(200).send({ success: true, companies });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};
const updateCompany = async (req, res) => {
  try {
    const { company, companyId } = req.body;

    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      { company },
      { new: true, runValidators: true }
    );

    if (!updatedCompany) {
      return res
        .status(404)
        .send({ success: false, message: "Company not found" });
    }

    res
      .status(200)
      .send({
        success: true,
        message: "Company updated successfully",
        company: updatedCompany,
      });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};
const deleteCompany = async (req, res) => {
  try {
    const { companyId } = req.body;
    const deletedCompany = await Company.findByIdAndDelete(companyId);

    if (!deletedCompany) {
      return res
        .status(404)
        .send({ success: false, message: "Company not found" });
    }

    res
      .status(200)
      .send({ success: true, message: "Company deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};
const getCompanyByUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const companies = await Company.find({ userId });
    if (!companies || companies.length === 0) {
      return res
        .status(404)
        .send({ success: false, message: "No companies found for this user" });
    }
    res.status(200).send({ success: true, companies });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};
module.exports = {
  AddCompany,
  getCompany,
  getAllCompanies,
  updateCompany,
  deleteCompany,
  getCompanyByUser,
};

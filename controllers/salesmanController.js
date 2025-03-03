const salesmanModel = require("../models/Salesman");
const UserModel = require("../models/user");

exports.addSaleman = async (req, res) => {
  try {
    const { salesman, userId } = req.body;

    if (!salesman || !userId) {
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

    const existsalesman = await salesmanModel.findOne({ salesman });
    if (existsalesman) {
      return res
        .status(400)
        .send({ success: false, message: "salesman already exists." });
    }

    const newsalesman = new salesmanModel({ salesman, userId });
    await newsalesman.save();

    res.status(201).send({
      success: true,
      message: "salesman added successfully",
      salesman: newsalesman,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};

exports.getSalesmanByUser = async (req, res) => {
  const { userId } = req.body;

  try {
    const sales = await salesmanModel.find({ userId });
    res.status(200).json({
      success: true,
      message: "user's salesman retrived succesfully!",
      sales,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving sales", error });
  }
};

// exports.getAllSalesman = async (req, res) => {
//   try {
//     const salesmans = await salesmanModel.find();

//     res.status(200).send({ success: true, salesmans });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ success: false, message: "Server error", error });
//   }
// };
exports.updateSalesman = async (req, res) => {
  try {
    const { salesman, salesmanId } = req.body;

    const updatedsalesman = await salesmanModel.findByIdAndUpdate(
      salesmanId,
      { salesman },
      { new: true, runValidators: true }
    );

    if (!updatedsalesman) {
      return res
        .status(404)
        .send({ success: false, message: "salesman not found" });
    }

    res.status(200).send({
      success: true,
      message: "salesman updated successfully",
      salesman: updatedsalesman,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};
exports.deleteSalesman = async (req, res) => {
  try {
    const { salesmanId } = req.body;
    const deletedsalesman = await salesmanModel.findByIdAndDelete(salesmanId);

    if (!deletedsalesman) {
      return res
        .status(404)
        .send({ success: false, message: "salesman not found" });
    }

    res
      .status(200)
      .send({ success: true, message: "salesman deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};

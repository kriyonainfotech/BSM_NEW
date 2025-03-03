const Category = require("../models/category");
const UserModel = require("../models/user");
const mongoose = require("mongoose");

const AddCategory = async (req, res) => {
  try {
    const { category, userId } = req.body;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(400)
        .send({ success: false, message: "User not found." });
    }
    if (!category || !userId) {
      return res
        .status(400)
        .send({ success: false, message: "All Field Is Required" });
    }
    const existCategory = await Category.findOne({ category });
    if (existCategory) {
      return res
        .status(400)
        .send({ success: false, message: "Category Already Exists." });
    }
    let cate = await new Category({
      category,
      userId,
    });
    if (!cate) {
      return res
        .status(400)
        .send({ success: false, message: "Category Not Found" });
    }
    await cate.save();
    return res
      .status(201)
      .send({ success: true, message: "Category Added Succesfully", cate });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    if (!categories) {
      return res
        .status(200)
        .send({ success: true, categories, message: "Category Not Found" });
    }
    return res.status(200).send({ success: true, categories });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};
const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return res
        .status(404)
        .send({ success: false, message: "Category not found" });
    }
    return res
      .status(200)
      .send({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};
const updateCategory = async (req, res) => {
  try {
    const { category, categoryId } = req.body;
    console.log(req.body, "cate");

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid category ID" });
    }

    const cate = await Category.findByIdAndUpdate(
      categoryId,
      { category },
      { new: true, runValidators: true }
    );
    console.log(cate, "update cate");
    if (!category) {
      return res
        .status(404)
        .send({ success: false, message: "Category not found" });
    }
    return res
      .status(200)
      .send({
        success: true,
        message: "Category updated successfully",
        category: cate,
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};
const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.body;
    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .send({ success: false, message: "Category not found" });
    }
    return res.status(200).send({ success: true, category });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};
const getCategoryByUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const categories = await Category.find({ userId });

    if (!categories || categories.length === 0) {
      return res
        .status(404)
        .send({ success: false, message: "No categories found for this user" });
    }

    return res.status(200).send({ success: true, categories });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};
module.exports = {
  AddCategory,
  getCategories,
  deleteCategory,
  updateCategory,
  getCategoryById,
  getCategoryByUser,
};

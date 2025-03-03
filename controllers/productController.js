const Category = require("../models/category");
const Company = require("../models/company");
const Product = require("../models/product");
const cloudinary = require("cloudinary").v2;
const getPublicIdFromUrl = (url) => {
  const regex = /\/(?:v\d+\/)?([^\/]+)\/([^\/]+)\.[a-z]+$/;
  const match = url.match(regex);
  if (match) {
    return `${match[1]}/${match[2]}`; // captures the folder and file name without versioning or extension
  }
  return null;
};

const AddProduct = async (req, res) => {
  try {
    const { title, units, categoryId, companyId, userId } = req.body;
    console.log(req.body, "addp");

    if (!title || !units || !categoryId || !companyId || !userId) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const image = req.file ? req.file.path : null;
    console.log(req.file);

    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "Category not found" });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res
        .status(401)
        .json({ success: false, message: "Company not found" });
    }

    const existingProduct = await Product.findOne({ title, userId });
    if (existingProduct) {
      return res
        .status(402)
        .json({ success: false, message: "Product name already exists" });
    }

    const product = new Product({
      title,
      categoryId,
      userId,
      companyId,
      image,
      units,
    });
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// const AddProduct = async (req, res) => {
//   try {
//     const {
//       title,
//       units,
//       categoryId,
//       companyId,
//       userId,
//       mrp,
//       quantity,
//       purchaseBillId,
//     } = req.body;

//     if (
//       !title ||
//       !units ||
//       !categoryId ||
//       !companyId ||
//       !userId ||
//       !mrp ||
//       !quantity
//     ) {
//       return res.status(400).json({ message: "Please fill in all fields" });
//     }

//     const image = req.file ? req.file.path : null;

//     // Validate category
//     const category = await Category.findById(categoryId);
//     if (!category) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Category not found" });
//     }

//     // Check if the product already exists for the same user
//     const existingProduct = await Product.findOne({ title, userId });
//     let product;

//     if (existingProduct) {
//       product = existingProduct;
//     } else {
//       // Create a new product if it doesn't exist
//       product = new Product({
//         title,
//         categoryId,
//         userId,
//         companyId,
//         image,
//         units,
//       });
//       await product.save();
//     }

//     // Check if stock already exists for the same product, MRP, and user
//     const existingStock = await ProductStock.findOne({
//       productId: product._id,
//       userId,
//       "stocks.mrp": mrp,
//     });

//     if (existingStock) {
//       // Update the existing stock by adding the quantity
//       const stockIndex = existingStock.stocks.findIndex(
//         (stock) => stock.mrp === mrp
//       );
//       if (stockIndex !== -1) {
//         existingStock.stocks[stockIndex].quantity += quantity;
//         existingStock.stocks[stockIndex].purchaseBillId.push(purchaseBillId);
//         existingStock.totalStock += quantity;
//         await existingStock.save();
//       }
//     } else {
//       // Create new stock entry for this product and user
//       const newStock = new ProductStock({
//         productId: product._id,
//         userId,
//         stocks: [{ mrp, quantity, purchaseBillId: [purchaseBillId] }],
//         totalStock: quantity,
//       });
//       await newStock.save();
//     }

//     return res.status(200).json({
//       success: true,
//       message: existingProduct
//         ? "Product already existed, stock updated successfully"
//         : "Product created successfully and stock added",
//       product,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Server error", error });
//   }
// };

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
const getProductById = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId)
      .populate("categoryId")
      .populate("companyId")
      .populate("userId");
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
const updateProduct = async (req, res) => {
  try {
    const { productId, title, units, categoryId, companyId, userId } = req.body;
    console.log(req.file, req.body, "log");
    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }
    const image = req.file ? req.file.path : null;
    console.log(req.file);

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let imageUrl = product.image;

    if (req.file) {
      if (imageUrl) {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId) {
          const result = await cloudinary.uploader.destroy(publicId);
        } else {
          console.log("Could not extract publicId from URL:", imageUrl);
        }
      }

      imageUrl = req.file.path;
    }

    product.title = title || product.title;
    product.units = units || product.units;
    product.categoryId = categoryId || product.categoryId;
    product.companyId = companyId || product.companyId;
    product.userId = userId || product.userId;
    product.image = imageUrl;

    await product.save();
    console.log(product, "ppppp");
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error in updateProduct:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    console.log(req.body);

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    if (product.image) {
      const publicId = getPublicIdFromUrl(product.image);
      if (publicId) {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Cloudinary deletion result:", result);
      } else {
        console.log(
          "Could not extract publicId from image URL:",
          product.image
        );
      }
    }
    await Product.findByIdAndDelete(productId);

    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
const getProductByUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const products = await Product.find({ userId })
      .populate("categoryId", "category") // Populate the 'category' field from the 'Category' model
      .populate("companyId", "company");

    if (products.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No products found for this user" });
    }

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      products,
    });
  } catch (error) {
    console.error("Error in getProductByUser:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
module.exports = {
  AddProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductByUser,
};

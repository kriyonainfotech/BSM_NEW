const Product = require("../models/product");
const ProductStock = require("../models/productStock");
const mongoose = require("mongoose");
const PurchaseBill = require("../models/purchaseBill");

const getProductStockByUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const productStocks = await ProductStock.find({ userId })
      .populate({
        path: "stocks.purchaseBillId",
        select: "accountId createdAt grandTotal items",
        populate: {
          path: "accountId",
          select: "accountHolderName",
        },
      })
      .populate({
        path: "productId",
        select: "title categoryId companyId",
        populate: [
          { path: "categoryId", select: "category" },
          { path: "companyId", select: "company" },
        ],
      });

    if (!productStocks.length) {
      return res
        .status(404)
        .json({ success: false, message: "No stocks found for this user." });
    }

    const formattedStocks = productStocks.map((productStock) => {
      const groupedStock = productStock.stocks.map((stock) => ({
        purchaseRate: stock.purchaseRate,
        quantity: stock.quantity,
        purchaseBillId: stock.purchaseBillId.map((bill) => {
          // Find the item in the bill matching the stock's productId or MRP
          const matchingItem = bill.items.find(
            (item) =>
              item.productId.toString() ===
                productStock.productId._id.toString() && item.mrp === stock.mrp
          );

          return {
            accountHolderName: bill.accountId.accountHolderName,
            createdAt: bill.createdAt,
            grandTotal: bill.grandTotal,
            discount: bill.discount, // Include discount
            netAmount: bill.grandTotal - bill.discount, // Calculate netAmount
            purchaseRate: stock.purchaseRate,
            saleRate: matchingItem ? matchingItem.saleRate : null,
            totalAmount: stock.quantity * stock.purchaseRate,
            mrp: stock.mrp,
          };
        }),
      }));
      return {
        productId: productStock.productId,
        totalStock: productStock.totalStock,
        stocks: groupedStock,
      };
    });

    return res.status(200).json({
      success: true,
      stocks: formattedStocks,
    });
  } catch (error) {
    console.error("Error fetching product stocks:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};

const getUnbilledProductStocks = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required." });
    }

    // Get all product stocks for the user
    const productStocks = await ProductStock.find({ userId });

    // Extract all unique purchaseBillIds from stocks
    const allPurchaseBillIds = productStocks.flatMap((stock) =>
      stock.stocks.flatMap((entry) => entry.purchaseBillId)
    );

    // Fetch only existing PurchaseBill IDs
    const existingBills = new Set(
      (await PurchaseBill.find({ _id: { $in: allPurchaseBillIds } })).map(
        (bill) => bill._id.toString()
      )
    );

    // Filter out product stocks where all stock entries have non-existent purchaseBillIds
    const productsToDelete = productStocks.filter((stock) =>
      stock.stocks.every((entry) =>
        entry.purchaseBillId.every(
          (billId) => !existingBills.has(billId.toString())
        )
      )
    );
    console.log(productsToDelete, "pd");

    // Delete the identified productStock entries
    const deletedProducts = await ProductStock.deleteMany({
      _id: { $in: productsToDelete.map((stock) => stock._id) },
    });

    console.log(productsToDelete, "Deleted product stocks");

    res.status(200).json({
      success: true,
      message: "Deleted product stocks with non-existent purchaseBillIds.",
      deletedCount: deletedProducts.deletedCount,
      deletedProducts: productsToDelete,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const getproductstockByPBill = async (req, res) => {
  try {
    const { purchaseBillId } = req.params; // Get purchaseBillId from the URL parameter
    const { userId } = req.query; // Assuming userId is passed as query parameter (for user-specific data)

    // Find ProductStock by purchaseBillId and userId
    const productStock = await ProductStock.findOne({
      purchaseBillId: purchaseBillId,
      userId: userId,
    }).exec();

    if (!productStock) {
      return res.status(404).send({
        success: false,
        message: `ProductStock not found for purchaseBillId: ${purchaseBillId}`,
      });
    }

    return res.status(200).send({
      success: true,
      productStock,
    });
  } catch (error) {
    console.error("Error fetching ProductStock:", error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while fetching ProductStock",
    });
  }
};

const getTotalProductStock = async (req, res) => {
  try {
    const { productId, userId } = req.body;

    if (!productId || !userId) {
      return res.status(400).json({
        success: false,
        message: "❌ Product ID and User ID are required.",
      });
    }

    console.log(`🔍 Fetching total stock for product: ${productId}`);

    const productStock = await ProductStock.findOne({ productId, userId });

    if (!productStock) {
      return res.status(404).json({
        success: false,
        message: `⚠️ No stock found for product ${productId}.`,
        totalStock: 0,
      });
    }

    return res.status(200).json({
      success: true,
      message: "✅ Total product stock retrieved successfully.",
      totalStock: productStock.totalStock || 0,
    });
  } catch (error) {
    console.error(`❌ Error fetching total stock:`, error);
    res.status(500).json({ success: false, message: "⚠️ Server error", error });
  }
};

module.exports = {
  getProductStockByUser,
  getUnbilledProductStocks,
  getproductstockByPBill,
  getTotalProductStock,
};

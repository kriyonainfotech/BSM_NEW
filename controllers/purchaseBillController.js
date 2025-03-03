const PurchaseBill = require("../models/purchaseBill");
const Product = require("../models/product");
const ProductStock = require("../models/productStock");
const Counter = require("../models/counter");
const SaleBill = require("../models/SaleBill");

const createPurchaseBill = async (req, res) => {
  try {
    console.log("🟢 [START] Processing purchase bill...");

    const { accountId, items, userId } = req.body;

    if (!accountId || !Array.isArray(items) || !userId || items.length === 0) {
      console.warn(
        "⚠️ [VALIDATION ERROR] Invalid input data or empty items list."
      );
      return res.status(400).json({
        success: false,
        message: "Invalid input data or empty items list.",
      });
    }

    let grandTotal = 0;
    const formattedItems = [];

    // Generate the bill number
    console.log("🔢 Generating bill number...");
    const counter = await Counter.findOneAndUpdate(
      { modelName: "PurchaseBill" },
      { $inc: { counter: 1 } },
      { new: true, upsert: true }
    );

    const billNo = `bsmP${String(counter.counter).padStart(2, "0")}`;
    console.log(`✅ Bill number generated: ${billNo}`);

    // Create the initial purchase bill
    console.log("📜 Creating new purchase bill...");
    const newBill = new PurchaseBill({
      accountId,
      items: [],
      grandTotal: 0,
      userId,
      billNo,
    });
    await newBill.save();
    console.log(`✅ Purchase bill created with ID: ${newBill._id}`);

    console.log(`🔄 Updating stock for ${items.length} items...`);

    for (let index = 0; index < items.length; index++) {
      const { productId, quantity, purchaseRate, mrp, saleRate } = items[index];

      if (!productId || !quantity || !purchaseRate) {
        console.log(
          `❌ [ITEM ERROR] Invalid product details at index ${index}.`
        );
        return res.status(400).json({
          success: false,
          message: `Invalid product details at index ${index}.`,
        });
      }

      if (mrp < saleRate) {
        console.log(
          `❌ [PRICE ERROR] Sale rate cannot exceed MRP at index ${index}.`
        );
        return res.status(400).json({
          success: false,
          message: "Sale rate MRP કરતાં વધુ હોઈ શકતી નથી..",
        });
      }

      const totalAmount = purchaseRate * quantity;
      grandTotal += totalAmount;

      formattedItems.push({
        productId,
        quantity,
        mrp,
        purchaseRate,
        saleRate,
        totalAmount,
      });

      console.log(
        `📦 Processing stock for product ${productId} (Qty: ${quantity})...`
      );

      let existingStock = await ProductStock.findOne({ userId, productId });

      if (existingStock) {
        let stockEntry = existingStock.stocks.find(
          (stock) => Math.abs(stock.purchaseRate - purchaseRate) < 0.01
        );

        if (stockEntry) {
          console.log(
            `🔄 Updating existing stock entry for product ${productId}...`
          );
          stockEntry.quantity += quantity;
          stockEntry.purchaseBillId.push(newBill._id);
        } else {
          console.log(`➕ Adding new stock entry for product ${productId}...`);
          existingStock.stocks.push({
            purchaseRate,
            mrp,
            quantity,
            purchaseBillId: [newBill._id],
          });
        }

        existingStock.totalStock += quantity;
        existingStock.stocks.sort((a, b) => a.purchaseRate - b.purchaseRate);
        await existingStock.save();
      } else {
        console.log(`🆕 Creating new stock record for product ${productId}...`);
        await ProductStock.create({
          productId,
          userId,
          stocks: [
            { purchaseRate, quantity, mrp, purchaseBillId: [newBill._id] },
          ],
          totalStock: quantity,
        });
      }
    }

    console.log("✅ Stock updates completed.");

    // Update bill with formatted items and total amount
    newBill.items = formattedItems;
    newBill.grandTotal = grandTotal;
    await newBill.save();
    console.log(`💰 Final bill updated with grand total: ₹${grandTotal}`);

    console.log("🟢 [SUCCESS] Purchase bill created successfully.");
    return res.status(201).json({
      success: true,
      message: "Purchase bill created successfully.",
      bill: newBill,
    });
  } catch (error) {
    console.log("❌ [ERROR] Failed to create purchase bill:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getPurchaseBillById = async (req, res) => {
  try {
    const { purchaseId, userId } = req.body;

    // Validate the purchaseId and userId
    if (!purchaseId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Purchase ID and User ID are required.",
      });
    }

    // Find the purchase bill by ID and populate necessary fields
    const bill = await PurchaseBill.findById(purchaseId)
      .populate({
        path: "accountId",
        select: "accountHolderName",
      })
      .populate({
        path: "items.productId", // Populate the productId within items array
        select: "title categoryId companyId", // Select the fields you need from the product schema
        populate: [
          {
            path: "categoryId", // Populate the categoryId field from Product schema
            select: "category", // Or any field from the Category schema you need
          },
          {
            path: "companyId", // Populate the companyId field from Product schema
            select: "company", // Or any field from the Company schema you need
          },
        ],
      });

    if (!bill) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase bill not found" });
    }

    // Check if the user is the creator of the bill
    if (bill.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this bill.",
      });
    }

    return res.status(200).json({ success: true, bill });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const updatePurchaseBill = async (req, res) => {
  try {
    const { purchaseId, accountId, items, userId, deletedProduct } = req.body;

    if (!purchaseId || !accountId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "❌ જરૂરી ફીલ્ડ ગુમ છે: purchaseId, accountId, items.",
      });
    }

    console.log(`🔍 Fetching purchase bill with ID: ${purchaseId}`);
    const existingBill = await PurchaseBill.findById(purchaseId);
    if (!existingBill) {
      console.log(`⚠️ Purchase bill not found: ${purchaseId}`);
      return res
        .status(404)
        .json({ success: false, message: "❌ ખરીદી બીલ મળી નથી." });
    }

    if (existingBill.userId.toString() !== userId) {
      console.log(`⛔ Unauthorized access attempt by user: ${userId}`);
      return res
        .status(403)
        .json({ success: false, message: "⛔ Unauthorized." });
    }

    // Handle product deletions
    if (
      deletedProduct &&
      Array.isArray(deletedProduct) &&
      deletedProduct.length > 0
    ) {
      for (const productId of deletedProduct) {
        console.log(`🗑️ Removing product: ${productId}`);

        const oldItem = existingBill.items.find(
          (item) => item.productId.toString() === productId.toString()
        );

        if (oldItem) {
          console.log(
            `🔎 Found product in existing bill: ${JSON.stringify(oldItem)}`
          );
          const productStock = await ProductStock.findOne({
            productId,
            userId,
          });

          if (productStock) {
            const stockEntry = productStock.stocks.find(
              (s) => Math.abs(s.purchaseRate - oldItem.purchaseRate) < 0.01
            );

            if (stockEntry) {
              console.log(
                `📉 Reducing stock for Existing Qty: ${stockEntry.quantity}, Removing: ${oldItem.quantity}`
              );
              stockEntry.quantity -= oldItem.quantity;
              productStock.totalStock -= oldItem.quantity;

              if (stockEntry.quantity <= 0) {
                console.log(`🚫 Removing empty stock entry for ${productId}`);
                productStock.stocks = productStock.stocks.filter(
                  (s) => Math.abs(s.purchaseRate - oldItem.purchaseRate) >= 0.01
                );
              }

              if (productStock.stocks.length === 0) {
                console.log(
                  `🗑️ No stocks left for ${productId}, deleting record.`
                );
                await ProductStock.deleteOne({ productId, userId });
              } else {
                await productStock.save();
              }
            }
          }

          existingBill.items = existingBill.items.filter(
            (item) => item.productId.toString() !== productId.toString()
          );
        }
      }
    }

    // Process new or updated items
    for (const item of items) {
      const { productId, quantity, purchaseRate, oldMrp, newMrp, saleRate } =
        item;

      console.log(
        "All details of product(to update)",
        productId,
        quantity,
        purchaseRate,
        oldMrp,
        newMrp,
        saleRate
      );
      const finalMrp = newMrp || oldMrp;

      if (saleRate > finalMrp) {
        return res.status(400).json({
          success: false,
          message: `⚠️ વેચાણ દર (${saleRate}) MRP (${finalMrp}) કરતા વધુ થઈ શકતો નથી માટે productId: ${
            (productId, product?.title)
          }`,
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `⚠️ ઉત્પાદન મળ્યું નથી: ${(productId, product?.title)}`,
        });
      }

      console.log(
        `🔄 Updating stock for product ${
          (productId, product?.title, product?.title)
        }: Requested Qty: ${quantity}`
      );

      let productStock = await ProductStock.findOne({ productId, userId });
      if (!productStock) {
        console.log(
          `📦 No existing stock found for ${
            (productId, product?.title)
          }, creating new record.`
        );
        productStock = new ProductStock({
          productId,
          userId,
          stocks: [],
          totalStock: 0,
        });
      }

      let stockEntry = productStock.stocks.find(
        (s) => Math.abs(s.purchaseRate - purchaseRate) < 0.01
      );
      const existingItem = existingBill.items.find(
        (i) => i.productId.toString() === productId
      );
      const previousQuantity = existingItem ? existingItem.quantity : 0;
      const quantityDifference = existingItem
        ? quantity - previousQuantity
        : quantity;

      console.log(
        `📌 Product ${
          (productId, product?.title, product?.title)
        } | Previous: ${previousQuantity}, Requested: ${quantity}, Difference: ${quantityDifference}`
      );

      if (stockEntry) {
        console.log(
          `🔢 Existing stock found for ${
            (productId, product?.title)
          }: Before Update: ${stockEntry.quantity}, Requested: ${quantity}`
        );

        if (stockEntry.quantity + quantityDifference < 0) {
          console.log(
            `⚠️ Stock for product ${
              (productId, product?.title)
            } cannot go below zero.`
          );
          return res.status(400).json({
            success: false,
            message: `⚠️ ઉત્પાદન ${
              (productId, product?.title)
            } માટે સ્ટોક શૂન્યથી નીચે જઈ શકતું નથી. તમારું વર્તમાન સ્ટોક ${
              stockEntry.quantity
            } છે`,
          });
        }

        stockEntry.quantity += quantityDifference;
        stockEntry.saleRate = saleRate;
      } else {
        if (quantity < 0) {
          return res.status(400).json({
            success: false,
            message: `⚠️ ઉત્પાદન ${
              (productId, product?.title)
            } માટે નકારાત્મક સ્ટોક બનાવી શકાય નહીં.`,
          });
        }

        console.log(
          `➕ Adding new stock entry for ${
            (productId, product?.title)
          } with Qty: ${quantity}`
        );
        productStock.stocks.push({
          purchaseRate,
          quantity,
          saleRate,
          mrp: finalMrp,
          purchaseBillId: [purchaseId],
        });
      }

      console.log(
        `📊 pela no stock for ${(productId, product?.title)}: ${
          productStock.totalStock
        }`
      );

      productStock.totalStock += quantityDifference;
      await productStock.save();

      console.log(
        `📊 Final stock for ${(productId, product?.title)}: ${
          productStock.totalStock
        }`
      );

      const totalAmount = purchaseRate * quantity;
      console.log(`🔢 TotalAmt: ${existingBill.grandTotal}`);
      if (existingItem) {
        console.log(`🔄 Updating purchase bill entry for ${totalAmount}`);
        existingItem.quantity = quantity;
        existingItem.purchaseRate = purchaseRate;
        existingItem.mrp = finalMrp;
        existingItem.saleRate = saleRate;
        existingItem.totalAmount = totalAmount;
      } else {
        console.log(
          `➕ Adding new purchase bill entry for ${(productId, product?.title)}`
        );
        console.log(`🔢 TotalAmt: ${totalAmount}`);
        existingBill.items.push({
          productId,
          quantity,
          purchaseRate,
          mrp: finalMrp,
          saleRate,
          totalAmount,
        });
      }
    }

    existingBill.grandTotal = existingBill.items.reduce(
      (sum, item) => sum + item.totalAmount,
      0
    );
    console.log(`🔢 Recalculated Grand Total: ${existingBill.grandTotal}`);

    existingBill.accountId = accountId;
    await existingBill.save();

    console.log(`✅ Purchase bill ${purchaseId} updated successfully! 📝`);
    res.status(200).json({
      success: true,
      message: "✅ Purchase bill updated successfully.",
      purchaseBill: existingBill,
    });
  } catch (error) {
    console.log(`❌ Error updating purchase bill:`, error);
    res.status(500).json({ success: false, message: "⚠️ Server error", error });
  }
};

const createInvoiceBill = async (saleBillId, kasar, billNo) => {
  try {
    const saleBill = await SaleBill.findById(saleBillId);
    if (!saleBill) {
      throw new Error("Sale bill not found.");
    }

    const totalSaleAmount = saleBill.grandTotal - kasar;
    console.log(totalSaleAmount, "ts");

    const totalProducts = saleBill.products.reduce(
      (sum, product) => sum + product.quantity,
      0
    );

    const totalCostAmount = saleBill.products.reduce(
      (sum, product) => sum + product.purchaseRate * product.quantity,
      0
    );
    console.log(totalCostAmount, "tca");
    const totalFreeQuantityCost = saleBill.products.reduce(
      (sum, product) =>
        sum +
        Number(product.purchaseRate) * (Number(product.freeQuantity) || 0),
      0
    );

    // Include cash discount in profit calculation
    const cashDiscount = saleBill.cashDiscount || 0;
    console.log(cashDiscount, "cd");

    // Apply cash discount as a percentage of the totalSaleAmount
    const discountAmount = (totalSaleAmount * cashDiscount) / 100;

    // Calculate total profit or loss after applying the discount
    const totalProfitOrLoss =
      totalSaleAmount -
      totalCostAmount -
      discountAmount -
      totalFreeQuantityCost;

    console.log(totalProfitOrLoss, "tp");

    const profitOrLossPerProduct = totalProfitOrLoss / totalProducts;

    const isProfit = totalProfitOrLoss >= 0;

    const newInvoiceBill = new InvoiceBill({
      saleBillId,
      billNo,
      totalSaleAmount,
      kasar,
      cashDiscount, // Include cash discount in the invoice
      totalProducts,
      totalCostAmount,
      profitOrLossPerProduct,
      totalProfitOrLoss,
      isProfit,
    });

    await newInvoiceBill.save();
  } catch (error) {
    console.log("Error in creating invoice bill:", error);
    throw new Error("Error generating invoice bill.");
  }
};

const deletePurchaseBill = async (req, res) => {
  try {
    const { purchaseId, userId } = req.body;

    // Validate the purchaseId and userId
    if (!purchaseId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Purchase ID and User ID are required.",
      });
    }

    // Find the purchase bill by ID
    const bill = await PurchaseBill.findById(purchaseId);

    if (!bill) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase bill not found" });
    }

    // Check if the user is the creator of the bill
    if (bill.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this bill.",
      });
    }

    // Adjust stock for each product in the bill before deletion
    for (const item of bill.items) {
      const { productId, quantity, purchaseRate } = item;

      const existingStock = await ProductStock.findOne({ userId, productId });
      if (existingStock) {
        const stockEntry = existingStock.stocks.find(
          (stock) => stock.purchaseRate === purchaseRate
        );

        if (stockEntry) {
          stockEntry.quantity -= quantity;
          existingStock.totalStock -= quantity;

          // Remove stock entry if quantity becomes zero
          if (stockEntry.quantity <= 0) {
            existingStock.stocks = existingStock.stocks.filter(
              (stock) => stock !== stockEntry
            );
          }
        }

        // Remove the entire ProductStock if no stocks remain
        if (existingStock.stocks.length === 0) {
          await existingStock.deleteOne();
        } else {
          await existingStock.save();
        }
      }
    }

    // Delete the purchase bill
    const deletedBill = await PurchaseBill.findByIdAndDelete(purchaseId);

    return res.status(200).json({
      success: true,
      message: "Purchase bill deleted successfully",
      bill: deletedBill,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const getAllPurchaseBills = async (req, res) => {
  try {
    const bills = await PurchaseBill.find();
    return res.status(200).json({ success: true, bills });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};

const getPurchaseBillByUserId = async (req, res) => {
  try {
    const { userId } = req.body;

    // Fetch all purchase bills for the given userId
    const purchaseBills = await PurchaseBill.find({ userId })
      .populate({
        path: "items.productId",
        select: "title",
      })
      .populate({
        path: "accountId",
        select: "accountHolderName",
      });

    if (!purchaseBills.length) {
      return res.status(404).json({
        success: false,
        message: "No purchase bills found for this user.",
      });
    }

    res.status(200).json({
      success: true,
      purchaseBills,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

module.exports = {
  createPurchaseBill,
  getPurchaseBillById,
  updatePurchaseBill,
  deletePurchaseBill,
  getAllPurchaseBills,
  getPurchaseBillByUserId,
};

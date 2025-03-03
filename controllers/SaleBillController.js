const SaleBill = require("../models/SaleBill");
const ProductStock = require("../models/productStock");
const PurchaseBill = require("../models/purchaseBill");
const Salesman = require("../models/Salesman");
const InvoiceBill = require("../models/invoicebill");
const mongoose = require("mongoose");
const Counter = require("../models/counter");
const User = require("../models/user");

// const createInvoiceBill = async (saleBillId, kasar, billNo) => {
//   try {
//     const saleBill = await SaleBill.findById(saleBillId);
//     if (!saleBill) {
//       throw new Error("Sale bill not found.");
//     }
//     const totalSaleAmount = saleBill.grandTotal - kasar;
//     const totalProducts = saleBill.products.reduce(
//       (sum, product) => sum + product.quantity,
//       0
//     );

//     const totalCostAmount = saleBill.products.reduce(
//       (sum, product) => sum + product.purchaseRate * product.quantity,
//       0
//     );

//     const totalFreeQuantityCost = saleBill.products.reduce(
//       (sum, product) =>
//         sum +
//         Number(product.purchaseRate) * (Number(product.freeQuantity) || 0),
//       0
//     ); // 66 * 1 = 66

//     // const costPerProduct = totalCostAmount / totalProducts;
//     const polpp =
//       saleBill.products.reduce(
//         (sum, product) =>
//           sum + (product.saleRate - product.purchaseRate) * product.quantity,
//         0
//       ) / totalProducts;

//     const profitOrLossPerProduct = polpp * totalProducts; //totalprofitorloass che aa
//     const totalProfitOrLoss = profitOrLossPerProduct - totalFreeQuantityCost;
//     const isProfit = totalProfitOrLoss >= 0;

//     const newInvoiceBill = new InvoiceBill({
//       saleBillId,
//       billNo,
//       totalSaleAmount,
//       kasar,
//       totalProducts,
//       totalCostAmount,
//       profitOrLossPerProduct,
//       totalProfitOrLoss,
//       isProfit,
//     });

//     await newInvoiceBill.save();
//   } catch (error) {
//     console.error("Error in creating invoice bill:", error);
//     throw new Error("Error generating invoice bill.");
//   }
// };
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
    console.error("Error in creating invoice bill:", error);
    throw new Error("Error generating invoice bill.");
  }
};

// const createSaleBill = async (req, res) => {
//   try {
//     const { salesmanId, accountId, products, cashDiscount } = req.body;

//     console.log(req.body, "rb");
//     if (!salesmanId || !accountId || !products || products.length === 0) {
//       return res
//         .status(400)
//         .send({ success: false, message: "All fields are required." });
//     }

//     let grandTotal = 0;

//     // Loop through products to check stock and deduct sold quantity
//     for (const product of products) {
//       const {
//         productId,
//         mrp,
//         quantity,
//         freeQuantity,
//         purchaseRate,
//         saleRate,
//         discount,
//       } = product;

//       // Fetch stock with sufficient quantity for sale
//       // const stock = await ProductStock.findOne({
//       //   productId,
//       //   "stocks.mrp": mrp,
//       //   "stocks.quantity": { $gte: quantity + (freeQuantity || 0) },
//       // });

//       const stock = await ProductStock.findOne({
//         productId,
//         "stocks.purchaseRate": purchaseRate, // Filter by purchase rate
//         "stocks.quantity": { $gte: quantity + (freeQuantity || 0) }, // Ensure enough stock is available
//       });

//       if (!stock) {
//         return res.status(400).send({
//           success: false,
//           message: `No matching stock entry for productId: ${productId}`,
//         });
//       }

//       let stockEntry = null;

//       for (const s of stock.stocks) {
//         if (s.mrp === mrp && s.quantity >= quantity + (freeQuantity || 0)) {
//           stockEntry = s;
//           break;
//         }
//       }

//       if (!stockEntry || stockEntry.quantity < quantity + (freeQuantity || 0)) {
//         return res.status(400).send({
//           success: false,
//           message: `Insufficient stock for product: ${productId}`,
//         });
//       }

//       // Reduce stock for the quantity sold (including freeQuantity)
//       // await ProductStock.updateOne(
//       //   { productId, "stocks.mrp": mrp },
//       //   {
//       //     $inc: {
//       //       "stocks.$.quantity": -(quantity + (freeQuantity || 0)),
//       //       totalStock: -(quantity + (freeQuantity || 0)),
//       //     },
//       //   }
//       // );

//       await ProductStock.updateOne(
//         { productId, "stocks.purchaseRate": purchaseRate }, // ✅ Match by purchaseRate
//         {
//           $inc: {
//             "stocks.$.quantity": -(quantity + (freeQuantity || 0)), // Reduce stock
//             totalStock: -(quantity + (freeQuantity || 0)), // Update total stock
//           },
//         }
//       );

//       const amount = saleRate * quantity;
//       const netAmount = amount - amount * (discount / 100);
//       grandTotal += netAmount;
//       console.log(grandTotal, netAmount);

//       product.amount = amount;
//       product.netAmount = netAmount;
//       product.purchaseRate = purchaseRate;
//       product.totalAmount = netAmount;
//     }
//     // if (cashDiscount) {
//     //   grandTotal -= cashDiscount; // Corrected to modify the existing variable
//     // }

//     if (cashDiscount) {
//       // Apply the cash discount as a percentage of the grand total
//       const discountAmount = (grandTotal * cashDiscount) / 100;
//       const grandTotala = grandTotal - discountAmount;

//       console.log(`Cash Discount: ${cashDiscount}%`);
//       console.log(`Discount Amount: ${discountAmount}`);
//       console.log(`Grand Total after Discount: ${grandTotala}`);
//     }

//     console.log(cashDiscount, "cd");
//     let counter = await Counter.findOneAndUpdate(
//       { modelName: "SaleBill" },
//       { $inc: { counter: 1 } },
//       { new: true, upsert: true }
//     );

//     const billNo = `bsmS${String(counter.counter).padStart(2, "0")}`;

//     // Create and save the new SaleBill
//     const newSaleBill = new SaleBill({
//       salesmanId,
//       accountId,
//       products,
//       grandTotal,
//       billNo,
//       cashDiscount,
//     });

//     await newSaleBill.save();

//     await createInvoiceBill(newSaleBill._id, 0, billNo); // Assuming kasar = 0 initially

//     res.status(201).send({
//       success: true,
//       message: "Sale bill created successfully",
//       saleBill: newSaleBill,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ success: false, message: "Server error", error });
//   }
// };

// const updateSaleBill = async (req, res) => {
//   try {
//     const { saleBillId, products, salesmanId, accountId } = req.body;

//     if (!saleBillId || !products?.length) {
//       return res
//         .status(400)
//         .send({ success: false, message: "All fields are required." });
//     }

//     // Fetch the existing sale bill
//     const existingSaleBill = await SaleBill.findById(saleBillId);
//     if (!existingSaleBill) {
//       return res
//         .status(404)
//         .send({ success: false, message: "Sale bill not found." });
//     }

//     // Restore previous stock quantities
//     for (const oldProduct of existingSaleBill.products) {
//       await ProductStock.updateOne(
//         { productId: oldProduct.productId, "stocks.mrp": oldProduct.mrp },
//         {
//           $inc: {
//             "stocks.$.quantity":
//               oldProduct.quantity + (oldProduct.freeQuantity || 0),
//             totalStock: oldProduct.quantity + (oldProduct.freeQuantity || 0),
//           },
//         }
//       );
//     }

//     let grandTotal = 0;

//     // Validate and update stock for the new products
//     for (const product of products) {
//       const {
//         productId,
//         quantity,
//         mrp,
//         purchaseRate,
//         discount,
//         freeQuantity = 0,
//       } = product;

//       // Fetch stock entry matching purchase rate and MRP
//       const stock = await ProductStock.findOne({
//         productId,
//         "stocks.mrp": mrp,
//       }).populate("stocks.purchaseBillId");

//       if (!stock) {
//         return res.status(400).send({
//           success: false,
//           message: `No stock found for product: ${productId}`,
//         });
//       }

//       const stockEntry = stock.stocks.find(
//         (s) => s.mrp === mrp && s.quantity >= quantity + freeQuantity
//       );

//       if (!stockEntry) {
//         return res.status(400).send({
//           success: false,
//           message: `Insufficient stock for product: ${productId}`,
//         });
//       }

//       // Deduct the sold quantity
//       await ProductStock.updateOne(
//         { productId, "stocks.mrp": mrp },
//         {
//           $inc: {
//             "stocks.$.quantity": -(quantity + freeQuantity),
//             totalStock: -(quantity + freeQuantity),
//           },
//         }
//       );

//       const amount = purchaseRate * quantity;
//       const netAmount = amount - discount;
//       grandTotal += netAmount;

//       product.saleRate = purchaseRate;
//       product.amount = amount;
//       product.totalAmount = netAmount;
//     }

//     // Update Sale Bill
//     const updatedSaleBill = await SaleBill.findByIdAndUpdate(
//       saleBillId,
//       { salesmanId, accountId, products, grandTotal },
//       { new: true }
//     );

//     res.status(200).send({
//       success: true,
//       message: "Sale bill updated successfully",
//       updatedSaleBill,
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).send({ success: false, message: "Server error", error });
//   }
// };

// const deleteSaleBill = async (req, res) => {
//   try {
//     const { saleBillId, salesmanId } = req.body;

//     // Fetch the existing sale bill
//     const existingSaleBill = await SaleBill.findById(saleBillId);
//     if (!existingSaleBill) {
//       return res
//         .status(404)
//         .send({ success: false, message: "Sale bill not found." });
//     }

//     // Check if the sale bill belongs to the given salesman
//     if (existingSaleBill.salesmanId.toString() !== salesmanId.toString()) {
//       return res.status(403).send({
//         success: false,
//         message: "You are not authorized to delete this sale bill.",
//       });
//     }

//     // Restore the stock for products in the deleted sale bill
//     for (const oldProduct of existingSaleBill.products) {
//       await ProductStock.updateOne(
//         { productId: oldProduct.productId, "stocks.mrp": oldProduct.mrp },
//         {
//           $inc: {
//             "stocks.$.quantity":
//               oldProduct.quantity + (oldProduct.freeQuantity || 0), // Restore the sold quantity (and free quantity)
//             totalStock: oldProduct.quantity + (oldProduct.freeQuantity || 0), // Restore total stock
//           },
//         }
//       );
//     }

//     // Delete the sale bill from the database
//     await SaleBill.findByIdAndDelete(saleBillId);

//     res.status(200).send({
//       success: true,
//       message: "Sale bill deleted and stock restored successfully.",
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).send({ success: false, message: "Server error", error });
//   }
// };

const createSaleBill = async (req, res) => {
  try {
    console.log("🟢 [START] Processing sale bill...");

    const { salesmanId, accountId, products, cashDiscount } = req.body;

    if (
      !salesmanId ||
      !accountId ||
      !Array.isArray(products) ||
      products.length === 0
    ) {
      console.warn(
        "⚠️ [VALIDATION ERROR] Missing required fields or empty product list."
      );
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    let grandTotal = 0;

    console.log(`🔄 Checking stock for ${products.length} products...`);

    const stockUpdates = products.map(async (product, index) => {
      const {
        productId,
        mrp,
        quantity,
        freeQuantity = 0,
        purchaseRate,
        saleRate,
        discount = 0,
      } = product;
      const requiredQuantity = quantity + freeQuantity;

      // Fetch matching stock
      const stock = await ProductStock.findOne({
        productId,
        "stocks.purchaseRate": purchaseRate,
        "stocks.quantity": { $gte: requiredQuantity },
      });

      if (!stock) {
        throw new Error(
          `❌ No matching stock entry for productId: ${productId}`
        );
      }

      // Find the specific stock entry
      let stockEntry = stock.stocks.find(
        (s) => s.mrp === mrp && s.quantity >= requiredQuantity
      );

      if (!stockEntry) {
        throw new Error(`❌ Insufficient stock for productId: ${productId}`);
      }
      console.log(stockEntry, "stockEntry");
      // Extract stockId and purchaseId
      const stockId = stockEntry._id;
      // const purchaseId = stockEntry.purchaseBillId; // Assuming purchaseId exists in stockEntry

      // Deduct stock quantity
      stockEntry.quantity -= requiredQuantity;
      stock.totalStock -= requiredQuantity;

      await stock.save();

      // Calculate amounts
      const amount = saleRate * quantity;
      const netAmount = amount - (amount * discount) / 100;
      grandTotal += netAmount;

      console.log(
        `✅ Processed product ${
          index + 1
        }: ${productId}, Net Amount: ${netAmount}`
      );

      // Update product details in the sale bill
      return {
        ...product,
        amount,
        netAmount,
        totalAmount: netAmount,
        stockId,
        // purchaseId,
      };
    });

    // Execute all stock updates concurrently
    const updatedProducts = await Promise.all(stockUpdates);

    // Apply cash discount
    if (cashDiscount) {
      const discountAmount = (grandTotal * cashDiscount) / 100;
      grandTotal -= discountAmount;
      console.log(
        `💰 Applied Cash Discount: ${cashDiscount}%, Amount Deducted: ${discountAmount}`
      );
    }

    console.log("🔢 Generating bill number...");
    let counter = await Counter.findOneAndUpdate(
      { modelName: "SaleBill" },
      { $inc: { counter: 1 } },
      { new: true, upsert: true }
    );

    const billNo = `bsmS${String(counter.counter).padStart(2, "0")}`;
    console.log(`✅ Bill number generated: ${billNo}`);

    // Create and save SaleBill
    const newSaleBill = new SaleBill({
      salesmanId,
      accountId,
      products: updatedProducts,
      grandTotal,
      billNo,
      cashDiscount,
    });

    await newSaleBill.save();
    console.log("🟢 [SUCCESS] Sale bill created:", newSaleBill);

    await createInvoiceBill(newSaleBill._id, 0, billNo);

    res.status(201).json({
      success: true,
      message: "Sale bill created successfully.",
      saleBill: newSaleBill,
    });
  } catch (error) {
    console.error("❌ [ERROR] Failed to create sale bill:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const updateSaleBill = async (req, res) => {
  try {
    const { saleBillId, products, salesmanId, accountId, kasar, cashDiscount } =
      req.body;

    if (!saleBillId || !products?.length) {
      return res
        .status(400)
        .send({ success: false, message: "All fields are required." });
    }

    // Fetch the existing sale bill
    const existingSaleBill = await SaleBill.findById(saleBillId);
    if (!existingSaleBill) {
      return res
        .status(404)
        .send({ success: false, message: "Sale bill not found." });
    }

    // Restore previous stock quantities
    // for (const oldProduct of existingSaleBill.products) {
    //   await ProductStock.updateOne(
    //     { productId: oldProduct.productId, "stocks.mrp": oldProduct.mrp },
    //     {
    //       $inc: {
    //         "stocks.$.quantity":
    //           oldProduct.quantity + (oldProduct.freeQuantity || 0),
    //         totalStock: oldProduct.quantity + (oldProduct.freeQuantity || 0),
    //       },
    //     }
    //   );
    // }

    for (const oldProduct of existingSaleBill.products) {
      await ProductStock.updateOne(
        {
          productId: oldProduct.productId,
          "stocks.purchaseRate": oldProduct.purchaseRate,
        },
        {
          $inc: {
            "stocks.$.quantity":
              oldProduct.quantity + (oldProduct.freeQuantity || 0),
            totalStock: oldProduct.quantity + (oldProduct.freeQuantity || 0),
          },
        }
      );
    }

    let grandTotal = 0;

    // Validate and update stock for the new products
    for (const product of products) {
      const {
        productId,
        quantity,
        mrp,
        purchaseRate,
        discount,
        saleRate,
        freeQuantity = 0,
      } = product;

      // Fetch stock entry matching purchase rate and MRP
      // const stock = await ProductStock.findOne({
      //   productId,
      //   "stocks.mrp": mrp,
      // }).populate("stocks.purchaseBillId");

      // if (!stock) {
      //   return res.status(400).send({
      //     success: false,
      //     message: `No stock found for product: ${productId}`,
      //   });
      // }
      const stock = await ProductStock.findOne({
        productId,
        "stocks.purchaseRate": purchaseRate, // ✅ Match by purchaseRate instead of mrp
      }).populate("stocks.purchaseBillId");

      if (!stock) {
        return res.status(400).send({
          success: false,
          message: `No stock found for product: ${productId} with purchaseRate: ${purchaseRate}`,
        });
      }

      const stockEntry = stock.stocks.find(
        (s) => s.mrp === mrp && s.quantity >= quantity + freeQuantity
      );

      // if (!stockEntry) {
      //   return res.status(400).send({
      //     success: false,
      //     message: `Insufficient stock for product: ${productId}`,
      //   });
      // }

      if (!stockEntry) {
        return res.status(400).send({
          success: false,
          message: `Insufficient stock for product: ${productId} with purchaseRate: ${purchaseRate}`,
        });
      }

      // Deduct the sold quantity
      // await ProductStock.updateOne(
      //   { productId, "stocks.mrp": mrp },
      //   {
      //     $inc: {
      //       "stocks.$.quantity": -(quantity + freeQuantity),
      //       totalStock: -(quantity + freeQuantity),
      //     },
      //   }
      // );

      await ProductStock.updateOne(
        { productId, "stocks.purchaseRate": purchaseRate }, // ✅ Update based on purchaseRate
        {
          $inc: {
            "stocks.$.quantity": -(quantity + freeQuantity),
            totalStock: -(quantity + freeQuantity),
          },
        }
      );

      const amount = saleRate * quantity; // 927.24
      const netAmount = amount - amount * (discount / 100);
      grandTotal += netAmount;
      console.log(grandTotal, netAmount);

      product.amount = amount;
      product.netAmount = netAmount;
      product.purchaseRate = purchaseRate;
      product.totalAmount = netAmount;
    }

    console.log(grandTotal, "gt");

    // Apply cash discount as a percentage of the grandTotal
    if (cashDiscount) {
      const discountAmount = (grandTotal * cashDiscount) / 100; // Apply discount as percentage
      grandTotal -= discountAmount; // Modify the existing grandTotal
    }

    console.log(cashDiscount, "cd");

    // Update Sale Bill
    const updatedSaleBill = await SaleBill.findByIdAndUpdate(
      saleBillId,
      { salesmanId, accountId, products, grandTotal, cashDiscount },
      { new: true }
    );

    // const totalSaleAmount =
    //   Number(updatedSaleBill.grandTotal) - (Number(kasar) || 0);
    // console.log(totalSaleAmount, "tsa");

    // const totalProducts = updatedSaleBill.products.reduce(
    //   (sum, product) => sum + Number(product.quantity),
    //   0
    // );

    // const totalCostAmount = updatedSaleBill.products.reduce(
    //   (sum, product) =>
    //     sum + Number(product.purchaseRate) * Number(product.quantity),
    //   0
    // );
    // console.log(totalCostAmount, "tca");

    // // Calculate the total cost of free quantity
    // const totalFreeQuantityCost = updatedSaleBill.products.reduce(
    //   (sum, product) =>
    //     sum +
    //     Number(product.purchaseRate) * (Number(product.freeQuantity) || 0),
    //   0
    // );
    // console.log(totalFreeQuantityCost, "tfqc");

    // const polpp =
    //   totalProducts > 0
    //     ? updatedSaleBill.products.reduce(
    //         (sum, product) =>
    //           sum +
    //           (Number(product.saleRate) - Number(product.purchaseRate)) *
    //             Number(product.quantity),
    //         0
    //       ) / totalProducts
    //     : 0;
    // console.log(polpp * totalProducts, "Profit/Loss");

    // const profitOrLossPerProduct = polpp * totalProducts;
    // // const totalProfitOrLoss =
    // // profitOrLossPerProduct - cashDiscount - totalFreeQuantityCost;

    // const totalProfitOrLoss =
    //   totalSaleAmount - totalCostAmount - totalFreeQuantityCost;

    // console.log(totalProfitOrLoss, "total profit/loss ");

    // const isProfit = totalProfitOrLoss >= 0;

    // // Update the Invoice Bill
    // const updatedInvoiceBill = await InvoiceBill.findOneAndUpdate(
    //   { saleBillId },
    //   {
    //     totalSaleAmount,
    //     kasar,
    //     totalProducts,
    //     totalCostAmount,
    //     profitOrLossPerProduct,
    //     totalProfitOrLoss,
    //     isProfit,
    //   },
    //   { new: true }
    // );
    // console.log(updatedInvoiceBill, "updatedInvoiceBill");

    const totalSaleAmount =
      Number(updatedSaleBill.grandTotal) - (Number(kasar) || 0);

    const totalProducts = updatedSaleBill.products.reduce(
      (sum, product) => sum + Number(product.quantity),
      0
    );

    const totalCostAmount = updatedSaleBill.products.reduce(
      (sum, product) =>
        sum + Number(product.purchaseRate) * Number(product.quantity),
      0
    );

    // Calculate the total cost of free quantity
    const totalFreeQuantityCost = updatedSaleBill.products.reduce(
      (sum, product) =>
        sum +
        Number(product.purchaseRate) * (Number(product.freeQuantity) || 0),
      0
    );

    const totalProfitOrLoss =
      totalSaleAmount - totalCostAmount - totalFreeQuantityCost;

    console.log(totalProfitOrLoss, "Total Profit/Loss");

    const profitOrLossPerProduct =
      totalProducts > 0 ? totalProfitOrLoss / totalProducts : 0;

    const isProfit = totalProfitOrLoss >= 0;

    // Update the Invoice Bill
    const updatedInvoiceBill = await InvoiceBill.findOneAndUpdate(
      { saleBillId },
      {
        totalSaleAmount,
        kasar,
        totalProducts,
        totalCostAmount,
        profitOrLossPerProduct,
        totalProfitOrLoss,
        isProfit,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Sale bill and invoice bill updated successfully",
      updatedSaleBill,
      updatedInvoiceBill,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};

const deleteSaleBill = async (req, res) => {
  try {
    const { saleBillId, salesmanId } = req.body;

    // Fetch the existing sale bill
    const existingSaleBill = await SaleBill.findById(saleBillId);
    if (!existingSaleBill) {
      return res
        .status(404)
        .send({ success: false, message: "Sale bill not found." });
    }

    // Check if the sale bill belongs to the given salesman
    if (existingSaleBill.salesmanId.toString() !== salesmanId.toString()) {
      return res.status(403).send({
        success: false,
        message: "You are not authorized to delete this sale bill.",
      });
    }

    // Restore the stock for products in the deleted sale bill
    for (const oldProduct of existingSaleBill.products) {
      await ProductStock.updateOne(
        { productId: oldProduct.productId, "stocks.mrp": oldProduct.mrp },
        {
          $inc: {
            "stocks.$.quantity":
              oldProduct.quantity + (oldProduct.freeQuantity || 0), // Restore the sold quantity (and free quantity)
            totalStock: oldProduct.quantity + (oldProduct.freeQuantity || 0), // Restore total stock
          },
        }
      );
    }

    // Delete the associated invoice bill
    await InvoiceBill.findOneAndDelete({ saleBillId });

    // Delete the sale bill from the database
    await SaleBill.findByIdAndDelete(saleBillId);

    res.status(200).send({
      success: true,
      message:
        "Sale bill and corresponding invoice bill deleted and stock restored successfully.",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};

const getSalesBillByUser = async (req, res) => {
  const { userId } = req.body;

  try {
    // Find all salesmen linked to the provided userId
    const salesmen = await Salesman.find({ userId }).lean();
    if (!salesmen.length) {
      return res
        .status(404)
        .json({ message: "No salesmen found for this user." });
    }

    // Extract all salesman IDs
    const salesmanIds = salesmen.map((salesman) => salesman._id);

    console.log(salesmanIds, "sid");

    const saleBills = await Promise.all(
      salesmanIds.map(async (id) => {
        return await SaleBill.find({ salesmanId: id })
          .populate("salesmanId", "salesman")
          .populate("accountId", "accountHolderName address")
          .populate("products.productId", "title");
      })
    );

    // Flatten and filter out empty arrays
    const flattenedSaleBills = saleBills
      .flat()
      .filter((saleBill) => saleBill.products.length > 0);

    if (!flattenedSaleBills.length) {
      return res
        .status(404)
        .json({ message: "No SaleBills found for this user." });
    }

    res.status(200).send({
      success: true,
      message: "Sale bills retrieved successfully!",
      saleBills: flattenedSaleBills,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getPastHistory = async (req, res) => {
  try {
    const { accountId, productId } = req.body;

    if (!accountId || !productId) {
      return res.status(400).send({
        success: false,
        message: "Account ID and Product ID are required.",
      });
    }

    // Find all SaleBills for the given accountId
    const saleBills = await SaleBill.find({ accountId })
      .populate("products.productId") // Populate product details (name, etc.)
      .populate("accountId")
      .select("createdAt products productId accountId") // Populate account holder details (name)
      .exec();

    if (!saleBills || saleBills.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No sales found for the given account.",
      });
    }

    // Extracting only required fields from each saleBill, and filter by productId
    const responseData = saleBills.reduce((acc, saleBill) => {
      saleBill.products.forEach((product) => {
        if (
          product.productId &&
          product.productId._id.toString() === productId
        ) {
          const accountHolderName = saleBill.accountId
            ? saleBill.accountId.accountHolderName
            : "Unknown"; // Account holder name
          const totalQuantity = product.quantity || 1; // Ensure quantity is not zero or undefined
          const netRate = product.netAmount / totalQuantity; // Calculate netRate
          acc.push({
            title: product.productId.title, // Product Name (from Product schema)
            mrp: product.mrp, // MRP from the SaleBill
            saleRate: product.saleRate, // Sale Rate from the SaleBill
            netAmount: product.netAmount,
            netRate,
            accountHolderName, // Account holder name (from Account schema)
            // productId: product.productId._id, // Include the productId
            createdAt: saleBill.createdAt,
          });
        }
      });

      return acc;
    }, []);

    if (responseData.length === 0) {
      return res.status(404).send({
        success: false,
        message: `No sales found for the product ID: ${productId} in this account.`,
      });
    }

    // Send the aggregated data as the response
    res.status(200).send({
      success: true,
      message: "Product sold to account retrieved successfully.",
      data: responseData,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};

const getInvoiceBillsByUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).send({
        success: false,
        message: "User ID is required.",
      });
    }

    // Aggregate query to fetch InvoiceBills for a user
    const invoiceBills = await InvoiceBill.aggregate([
      {
        $lookup: {
          from: "salebills", // The SaleBill collection
          localField: "saleBillId",
          foreignField: "_id",
          as: "saleBillDetails",
        },
      },
      {
        $unwind: "$saleBillDetails", // Unwind SaleBill details to filter
      },
      {
        $lookup: {
          from: "salesmen", // The Salesman collection
          localField: "saleBillDetails.salesmanId",
          foreignField: "_id",
          as: "salesmanDetails",
        },
      },
      {
        $unwind: "$salesmanDetails", // Unwind Salesman details to filter by userId
      },
      {
        $match: {
          "salesmanDetails.userId": new mongoose.Types.ObjectId(userId), // Match the userId in Salesman schema
        },
      },
      {
        $project: {
          // Dynamically project all fields
          saleBillId: 1,
          billNo: 1,
          totalSaleAmount: 1,
          kasar: 1,
          cashDiscount: 1,
          totalProducts: 1,
          totalCostAmount: 1,
          totalProfitOrLoss: 1,
          profitOrLossPerProduct: 1,
          isProfit: 1,
          paymentReceived: 1,
          balanceDue: 1,
          paymentStatus: 1,
          createdAt: 1,
        },
      },
    ]);

    if (invoiceBills.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No invoice bills found for this user.",
      });
    }

    res.status(200).send({
      success: true,
      data: invoiceBills,
    });
  } catch (error) {
    console.error("Error fetching invoice bills:", error);
    res.status(500).send({
      success: false,
      message: "Error fetching invoice bills.",
    });
  }
};

// const receivePayment = async (req, res) => {
//   try {
//     const { invoiceBillId, kasar, cashDiscount, paymentAmount } = req.body;

//     if (!invoiceBillId || !paymentAmount) {
//       return res.status(400).send({
//         success: false,
//         message: "InvoiceBillId and Payment Amount are required.",
//       });
//     }

//     // Find the InvoiceBill document
//     const invoiceBill = await InvoiceBill.findById(invoiceBillId);
//     if (!invoiceBill) {
//       return res.status(404).send({
//         success: false,
//         message: "InvoiceBill not found.",
//       });
//     }

//     // Prevent updates if the bill is already fully paid
//     if (invoiceBill.paymentStatus === "Paid") {
//       return res.status(400).send({
//         success: false,
//         message: "Payment has already been completed for this invoice.",
//       });
//     }

//     // Calculate the new sale amount considering discounts
//     const updatedSaleAmount =
//       invoiceBill.totalSaleAmount - (kasar || 0) - (cashDiscount || 0);

//     // Validate cashDiscount to prevent cumulative updates
//     if (cashDiscount && cashDiscount > invoiceBill.cashDiscount) {
//       invoiceBill.cashDiscount = cashDiscount;
//     }

//     // Recalculate profit considering the cash discount
//     const adjustedProfit = updatedSaleAmount - invoiceBill.totalCostAmount;
//     invoiceBill.totalProfitOrLoss = adjustedProfit;
//     invoiceBill.profitOrLossPerProduct =
//       adjustedProfit / invoiceBill.totalProducts;
//     invoiceBill.isProfit = adjustedProfit >= 0;

//     // Update payment fields (limit paymentReceived to updatedSaleAmount)
//     const newPaymentReceived =
//       invoiceBill.paymentReceived + paymentAmount - (cashDiscount || 0);

//     invoiceBill.paymentReceived = Math.min(
//       newPaymentReceived,
//       updatedSaleAmount
//     );

//     // Recalculate balance due
//     // invoiceBill.balanceDue = updatedSaleAmount - invoiceBill.paymentReceived;
//     invoiceBill.balanceDue = parseFloat(
//       (updatedSaleAmount - invoiceBill.paymentReceived).toFixed(2)
//     );

//     // Update payment status
//     invoiceBill.paymentStatus =
//       invoiceBill.balanceDue <= 0 ? "Paid" : "Pending";

//     // Update totalSaleAmount with the adjusted amount
//     invoiceBill.totalSaleAmount = updatedSaleAmount;

//     // Save the updated InvoiceBill
//     await invoiceBill.save();
//     console.log(invoiceBill, "ib");

//     res.status(200).send({
//       success: true,
//       message: "Payment received and Invoice updated successfully.",
//       invoiceBill: {
//         _id: invoiceBill._id,
//         billNo: invoiceBill.billNo,
//         saleBillId: invoiceBill.saleBillId,
//         totalSaleAmount: invoiceBill.totalSaleAmount,
//         kasar: invoiceBill.kasar,
//         cashDiscount: invoiceBill.cashDiscount,
//         paymentReceived: invoiceBill.paymentReceived,
//         balanceDue: invoiceBill.balanceDue,
//         paymentStatus: invoiceBill.paymentStatus,
//         totalProducts: invoiceBill.totalProducts,
//         totalCostAmount: invoiceBill.totalCostAmount,
//         totalProfitOrLoss: invoiceBill.totalProfitOrLoss,
//         profitOrLossPerProduct: invoiceBill.profitOrLossPerProduct,
//         isProfit: invoiceBill.isProfit,
//         createdAt: invoiceBill.createdAt,
//       },
//     });
//   } catch (error) {
//     console.error("Error in receiving payment:", error);
//     res.status(500).send({
//       success: false,
//       message: "Server error while processing payment.",
//       error,
//     });
//   }
// };

const receivePayment = async (req, res) => {
  try {
    const {
      invoiceBillId,
      kasar: kasarRaw,
      cashDiscount: cashDiscountRaw,
      paymentAmount: paymentAmountRaw,
    } = req.body;
    // Parse inputs and ensure they're valid numbers
    const kasar = parseFloat(kasarRaw) || 0;
    const cashDiscount = parseFloat(cashDiscountRaw) || 0;
    const paymentAmount = parseFloat(paymentAmountRaw);
    if (!invoiceBillId || isNaN(paymentAmount)) {
      return res.status(400).send({
        success: false,
        message:
          "InvoiceBillId and Payment Amount are required and must be valid.",
      });
    }
    // Find the InvoiceBill document
    const invoiceBill = await InvoiceBill.findById(invoiceBillId);
    if (!invoiceBill) {
      return res.status(404).send({
        success: false,
        message: "InvoiceBill not found.",
      });
    }
    // Prevent updates if the bill is already fully paid
    if (invoiceBill.paymentStatus === "Paid") {
      return res.status(400).send({
        success: false,
        message: "Payment has already been completed for this invoice.",
      });
    }
    // Adjust the sale amount and validate
    const updatedSaleAmount = parseFloat(
      (invoiceBill.totalSaleAmount - kasar - cashDiscount).toFixed(2)
    );
    if (cashDiscount >= 0) {
      invoiceBill.cashDiscount = cashDiscount;
    }
    // Adjust profit calculations
    const adjustedProfit = updatedSaleAmount - invoiceBill.totalCostAmount;
    invoiceBill.totalProfitOrLoss = adjustedProfit;
    invoiceBill.profitOrLossPerProduct = parseFloat(
      (adjustedProfit / invoiceBill.totalProducts).toFixed(2)
    );
    invoiceBill.isProfit = adjustedProfit >= 0;
    // Update paymentReceived and balanceDue
    const newPaymentReceived = parseFloat(
      (
        invoiceBill.paymentReceived +
        paymentAmount -
        (cashDiscount || 0)
      ).toFixed(2)
    );
    invoiceBill.paymentReceived = Math.min(
      newPaymentReceived,
      updatedSaleAmount
    );
    invoiceBill.balanceDue = parseFloat(
      (updatedSaleAmount - invoiceBill.paymentReceived).toFixed(2)
    );
    // Update payment status
    invoiceBill.paymentStatus =
      invoiceBill.balanceDue <= 0 ? "Paid" : "Pending";
    // Update total sale amount
    invoiceBill.totalSaleAmount = updatedSaleAmount;
    // Save the updated InvoiceBill
    await invoiceBill.save();
    console.log("Updated InvoiceBill:", {
      id: invoiceBill.id,
      balanceDue: invoiceBill.balanceDue,
      paymentStatus: invoiceBill.paymentStatus,
    });
    res.status(200).send({
      success: true,
      message: "Payment received and Invoice updated successfully.",
      invoiceBill: {
        id: invoiceBill.id,
        billNo: invoiceBill.billNo,
        saleBillId: invoiceBill.saleBillId,
        totalSaleAmount: invoiceBill.totalSaleAmount,
        kasar: invoiceBill.kasar,
        cashDiscount: invoiceBill.cashDiscount,
        paymentReceived: invoiceBill.paymentReceived,
        balanceDue: invoiceBill.balanceDue,
        paymentStatus: invoiceBill.paymentStatus,
        totalProducts: invoiceBill.totalProducts,
        totalCostAmount: invoiceBill.totalCostAmount,
        totalProfitOrLoss: invoiceBill.totalProfitOrLoss,
        profitOrLossPerProduct: invoiceBill.profitOrLossPerProduct,
        isProfit: invoiceBill.isProfit,
        createdAt: invoiceBill.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in receiving payment:", error);
    res.status(500).send({
      success: false,
      message:
        "An error occurred while processing the payment. Please try again.",
    });
  }
};

// const getReceivedPaymentBills = async (req, res) => {
//   try {
//     const {
//       userId,
//       page = 1,
//       limit = 10,
//       sortBy = "createdAt",
//       order = "desc",
//       paymentStatus,
//       search,
//     } = req.body;

//     if (!userId) {
//       return res.status(400).send({
//         success: false,
//         message: "User ID is required.",
//       });
//     }

//     // Fetch the user to get associated salesman IDs
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).send({
//         success: false,
//         message: "User not found.",
//       });
//     }

//     const salesmanIds = user.salesmanIds || [];
//     if (salesmanIds.length === 0) {
//       return res.status(404).send({
//         success: false,
//         message: "No salesmen found for the user.",
//       });
//     }

//     // Build the query object for InvoiceBill
//     const query = { salesmanId: { $in: salesmanIds } };
//     if (paymentStatus) {
//       query.paymentStatus = paymentStatus;
//     }
//     if (search) {
//       query.$or = [
//         { billNo: { $regex: search, $options: "i" } },
//         { saleBillId: { $regex: search, $options: "i" } },
//       ];
//     }

//     // Pagination and sorting
//     const skip = (page - 1) * limit;
//     const sort = { [sortBy]: order === "asc" ? 1 : -1 };

//     // Fetch bills with pagination, filtering, and sorting
//     const bills = await InvoiceBill.find(query)
//       .sort(sort)
//       .skip(skip)
//       .limit(parseInt(limit));

//     // Total count for pagination
//     const totalBills = await InvoiceBill.countDocuments(query);

//     res.status(200).send({
//       success: true,
//       message: "Received payment bills fetched successfully.",
//       data: {
//         bills,
//         pagination: {
//           currentPage: parseInt(page),
//           totalPages: Math.ceil(totalBills / limit),
//           totalBills,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching received payment bills:", error);
//     res.status(500).send({
//       success: false,
//       message: "Server error while fetching payment bills.",
//       error,
//     });
//   }
// };

module.exports = {
  createSaleBill,
  updateSaleBill,
  getSalesBillByUser,
  deleteSaleBill,
  createInvoiceBill,
  getPastHistory,
  getInvoiceBillsByUser,
  receivePayment,
  // getReceivedPaymentBills,
};

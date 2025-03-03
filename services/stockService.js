const ProductStock = require("../models/productStock");

// const createOrUpdateStock = async ({
//   productId,
//   userId,
//   mrp,
//   quantity,
//   purchaseBillId,
// }) => {
//   console.log(productId, userId, mrp, quantity, purchaseBillId, "psc");

//   if (
//     !productId ||
//     !userId ||
//     !purchaseBillId ||
//     isNaN(quantity) ||
//     isNaN(mrp)
//   ) {
//     return { success: false, message: "Invalid input data provided." };
//   }

//   let existingStock = await ProductStock.findOne({
//     productId,
//     userId,
//     "stocks.mrp": mrp,
//   });
//   console.log(existingStock, "exs");
//   if (existingStock) {
//     const stockIndex = existingStock.stocks.findIndex(
//       (stock) => stock.mrp === mrp
//     );

//     if (!Array.isArray(existingStock.stocks[stockIndex].purchaseBillId)) {
//       existingStock.stocks[stockIndex].purchaseBillId = [];
//     }
//     existingStock.stocks[stockIndex].purchaseBillId.push(purchaseBillId);
//     existingStock.stocks[stockIndex].quantity += quantity;
//   } else {
//     existingStock = new ProductStock({
//       productId,
//       userId,
//       stocks: [{ mrp, quantity, purchaseBillId: [purchaseBillId] }],
//       totalStock: quantity,
//     });
//   }

//   existingStock.totalStock = existingStock.stocks.reduce(
//     (sum, stock) => sum + stock.quantity,
//     0
//   );

//   console.log("Final Stock Data:", JSON.stringify(existingStock, null, 2));
//   await existingStock.save();

//   return { success: true };
// };

const createOrUpdateStock = async ({
  productId,
  userId,
  mrp,
  quantity,
  purchaseBillId,
}) => {
  // console.log(productId, userId, mrp, quantity, purchaseBillId, "psc");

  if (
    !productId ||
    !userId ||
    !purchaseBillId ||
    isNaN(quantity) ||
    isNaN(mrp)
  ) {
    return { success: false, message: "Invalid input data provided." };
  }

  let existingStock = await ProductStock.findOne({
    productId,
    userId,
    "stocks.mrp": mrp,
  });
  // console.log(existingStock, "exs");
  if (existingStock) {
    const stockIndex = existingStock.stocks.findIndex(
      (stock) => stock.mrp === mrp
    );

    if (!Array.isArray(existingStock.stocks[stockIndex].purchaseBillId)) {
      existingStock.stocks[stockIndex].purchaseBillId = [];
    }
    existingStock.stocks[stockIndex].purchaseBillId.push(purchaseBillId);
    existingStock.stocks[stockIndex].quantity += quantity;
    existingStock.markModified(`stocks.${stockIndex}.purchaseBillId`);
  } else {
    existingStock = new ProductStock({
      productId,
      userId,
      stocks: [{ mrp, quantity, purchaseBillId: [purchaseBillId] }],
      totalStock: quantity,
    });
  }

  existingStock.totalStock = existingStock.stocks.reduce(
    (sum, stock) => sum + stock.quantity,
    0
  );

  // console.log("Final Stock Data:", JSON.stringify(existingStock, null, 2));
  await existingStock.save();

  return { success: true };
};

module.exports = {
  createOrUpdateStock,
};

const mongoose = require("mongoose");
const ConnectDb = async () => {
  try {
    const db = await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb+srv://bsmcustomer01:bsm123@cluster0.4ig22.mongodb.net/BSM_App"
    );
    console.log(`Mongodb Connected !!`);
  } catch (error) {
    console.log(error);
  }
};
module.exports = ConnectDb;

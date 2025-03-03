// const sharp = require("sharp");
// const { createCanvas, loadImage } = require("canvas");

// const addcardimage = async (req, res) => {
//   try {
//     const { email, phone, address, companyName } = req.body;
//     console.log(req.files);

//     // Access the uploaded image files
//     const bgImageBuffer = req.files["bgImageUrl"][0].buffer;
//     const profilePicBuffer = req.files["profilePicUrl"][0].buffer;

//     // Start with background image
//     let image = sharp(bgImageBuffer);

//     // Overlay profile image (resize if needed)
//     image = image.composite([
//       {
//         input: profilePicBuffer,
//         top: 50, // Y position
//         left: 50, // X position
//         blend: "overlap",
//       },
//     ]);

//     // Create canvas to draw text (using canvas module)
//     const canvas = createCanvas(500, 500); // Adjust width/height as per your requirement
//     const ctx = canvas.getContext("2d");

//     // Draw text on the canvas
//     ctx.font = "24px Arial";
//     ctx.fillStyle = "black";
//     ctx.fillText(companyName, 200, 150); // Example for company name
//     ctx.fillText(email, 200, 250); // Example for email
//     ctx.fillText(phone, 200, 300); // Example for phone
//     ctx.fillText(address, 200, 350); // Example for address

//     // Convert canvas to buffer
//     const textBuffer = canvas.toBuffer();

//     // Composite the text buffer onto the background image
//     image = image.composite([
//       {
//         input: textBuffer,
//         top: 100, // Y position where text will be overlayed
//         left: 100, // X position where text will be overlayed
//       },
//     ]);

//     // Final image output
//     const outputBuffer = await image.toBuffer();

//     // Send the final image back to the frontend
//     res.set("Content-Type", "image/png");
//     res.send(outputBuffer);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Error creating flyer: " + error.message);
//   }
// };

// module.exports = {
//   addcardimage,
// };

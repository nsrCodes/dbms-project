const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mysqlConnection = require("./database/db");
const PORT = process.env.PORT || 5500;
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");


const options = {
  dotfiles: "ignore",
  etag: true,
  extensions: ["png", "jpg", "jpeg", "webp"],
  index: false,
  maxAge: "7d",
  redirect: false,
  setHeaders: (res, path, stat) => {
    res.set("x-timestamp", Date.now());
  },
};

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());
app.use(express.static("static", options));

const insurance_portfolio = require("./routes/insurance-portfolio");
const clients = require("./routes/clients");
const insurance = require("./routes/insurance");
const admins = require("./routes/admins");
const claim = require("./routes/claim");

app.use("/api/insurance-portfolio", insurance_portfolio);
app.use("/api/clients", clients);
app.use("/api/admins", admins);
app.use("/api/insurance", insurance);
app.use("/api/claim", claim);

dotenv.config();

mysqlConnection.connect((err) => {
  if (!err) console.log("MYSQL database connected successfully!");
  else console.log("Connection failed", err);
});

app.listen(PORT, () => {
  console.log(`Server running at Port ${PORT}`);
});

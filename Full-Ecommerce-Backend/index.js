require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

const ProductRoute = require("./routes/Product");
const FeaturedProduct = require("./routes/FeaturedProduct");
const OnlineProduct = require("./routes/OnlineProduct");
const OfferProduct = require("./routes/OfferProduct");
const UserRoute = require("./routes/User");
const CartRoute = require("./routes/Cart");
const WishRoute = require("./routes/Wishlist");
const CommentRoute = require("./routes/Comment");
const withoutRoutes = require("./routes/WithoutRegister");
const CouponRoute = require("./routes/Coupon");

const app = express();
app.use(express.json({ limit: "Infinity" })); 

/* -------------------- 🔹 1- CORS -------------------- */
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://perfume-frontend-taupe.vercel.app"
  ],
  credentials: true,
}));
app.use("/images", express.static(path.join(__dirname, "/images")));
/* -------------------- 🔹 2- Security & Parsers -------------------- */
app.use(helmet());
app.use(express.urlencoded({ extended: true, limit: "Infinity" }));
app.use(cookieParser());
app.use(morgan("tiny"));


/* -------------------- 🔹 3- Cron  Schedule  -------------------- */
const cron = require("node-cron");
const { deleteExpiredOffers } = require("./controllers/OfferProduct");


cron.schedule("* * * * *", () => {
  deleteExpiredOffers();
});



/* -------------------- 🔹 5- Routes -------------------- */
app.use("/api/product", ProductRoute);
app.use("/api/featuredProduct", FeaturedProduct);
app.use("/api/onlineProduct", OnlineProduct);
app.use("/api/offerProduct", OfferProduct);
app.use("/api/user", UserRoute);
app.use("/api/cart", CartRoute);
app.use("/api/wish", WishRoute);
app.use("/api/comment", CommentRoute);
app.use("/api/without", withoutRoutes );
app.use("/api/coupon", CouponRoute);

/* -------------------- 🔹 6- Database -------------------- */
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 4000;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to the database successfully!");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error.message);
  });

app.listen(PORT, () => {
  console.log(`Port is running on port ${PORT}`);
});
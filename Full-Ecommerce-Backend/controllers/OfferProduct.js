const OfferProduct = require("../models/OfferProduct");
const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");



exports.addOffer = async (req, res) => {
  try {
    const { title, description, price, category, discount, brand, startDate, endDate } = req.body;


    if (!title || !description || price === undefined || !startDate || !endDate) {
      return res.status(400).json({ message: "title, description, price, startDate, endDate are required" });
    }

    const newOffer = new OfferProduct({
      title,
      description,
      brand,
      price,
      category,
      discount,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      image: req.files?.image ? req.files.image[0].path : null,
      images: req.files?.images ? req.files.images.map(file => file.path) : []
    });

    await newOffer.save();

    res.status(201).json({
      status: "Success",
      message: "Offer Created Successfully!",
      offer: newOffer
    });
  } catch (err) {
    console.error("Offer create error:", err);
    res.status(500).json({
      message: "خطأ أثناء إضافة العرض",
      error: err.message,
      stack: err.stack
    });
  }
};

// تعديل عرض
exports.updateOffer = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // دعم الصور
    if (req.files?.image) updateData.image = req.files.image[0].path;
    if (req.files?.images) updateData.images = req.files.images.map(file => file.path);

    // تحديث العرض
    const updatedOffer = await OfferProduct.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    if (!updatedOffer) return res.status(404).json({ message: "العرض غير موجود" });

    res.status(200).json({ status: "Success", message: "تم تعديل العرض بنجاح!", offer: updatedOffer });
  } catch (err) {
    console.error("Offer update error:", err);
    res.status(500).json({ message: "خطأ أثناء تعديل العرض", error: err.message, stack: err.stack });
  }
};


exports.getOfferById = async (req, res) => {
  try {
    const offer = await OfferProduct.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "المنتج غير موجود" });
    res.status(200).json({ product: offer });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ في السيرفر", error: err.message });
  }
};

// حذف عرض
exports.deleteOffer = async (req, res) => {
  try {
    const offer = await OfferProduct.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ message: "العرض غير موجود" });
    // حذف من Cart و Wish لو موجود
    await Cart.deleteMany({ featuredOfferId: offer._id });
    await Wish.deleteMany({ featuredOfferId: offer._id });
    res.json({ message: "تم حذف العرض وكل المرتبط به" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ أثناء حذف العرض" });
  }
};

// جلب العروض النشطة
exports.getActiveOffers = async (req, res) => {
  try {
    const now = new Date();
    const offers = await OfferProduct.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
    });
    res.status(200).json({ offers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ أثناء جلب العروض" });
  }
};

// حذف العروض المنتهية تلقائيًا
exports.deleteExpiredOffers = async () => {
  try {
    const now = new Date();
    const expired = await OfferProduct.find({ endDate: { $lt: now } });

    for (let offer of expired) {
      await Cart.deleteMany({ featuredOfferId: offer._id });
      await Wishlist.deleteMany({ featuredOfferId: offer._id });
      await offer.deleteOne();
    }

    if (expired.length > 0)
      console.log(`تم حذف ${expired.length} عرض منتهٍ تلقائيًا`);
  } catch (err) {
    console.error("خطأ أثناء حذف العروض المنتهية:", err);
  }
};

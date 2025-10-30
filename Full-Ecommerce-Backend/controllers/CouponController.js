const Coupon = require("../models/Coupon");

// 🟢 إضافة كوبون جديد
exports.createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, expiryDate } = req.body;

    const exists = await Coupon.findOne({ code: code.toUpperCase() });
    if (exists) return res.status(400).json({ message: "الكوبون موجود بالفعل" });

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      expiryDate,
    });

    res.status(201).json({ message: "تم إنشاء الكوبون بنجاح", coupon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟡 تعديل كوبون
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "تم التحديث بنجاح", coupon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔴 حذف كوبون
exports.deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "تم حذف الكوبون بنجاح" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 جلب كل الكوبونات
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json({ coupons });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 التحقق من كوبون (للمستخدم)
exports.validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) return res.status(404).json({ message: "كود الكوبون غير صحيح ❌" });

    if (new Date(coupon.expiryDate) < new Date())
      return res.status(400).json({ message: "انتهت صلاحية الكوبون ❌" });

    res.json({ message: "✅ كوبون صالح", coupon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

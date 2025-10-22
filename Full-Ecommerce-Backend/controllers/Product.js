const Product = require("../models/Product")


exports.CreateProduct = async (req, res) => {
  try {
    const { title, description, price, category, discount, brand } = req.body;

    if (!title || !description || price === undefined) {
      return res.status(404).json({ message: "title, description, price are required" });
    }

    const NewProduct = new Product({
      title,
      description,
      brand,
      price,
      category,
      discount,
      image: req.files?.image ? req.files.image[0].path : null,
      images: req.files?.images ? req.files.images.map(file => file.path) : []
    });
console.log("BODY:", req.body);
console.log("FILES:", req.files);
    await NewProduct.save();

    res.status(201).json({
      status: "Success",
      message: "Product Created Successfully!",
      product: NewProduct
    });
  } catch (err) {
     console.error("Product create error:", err);
      res.status(500).json({
    message: err.message,
    stack: err.stack,
    error: err
  })}
};

exports.GetProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    // فلترة الكاتيجوري
    if (req.query.categories) {
      // لو الفلتر جاي كمصفوفة أو قيمة واحدة
      const categories = req.query.categories.split(','); // تحويل السلسلة لمصفوفة
      filter.category = { $in: categories };
    }

    // فلترة البراند
    if (req.query.brands) {
      const brands = req.query.brands.split(','); // تحويل السلسلة لمصفوفة
      filter.brand = { $in: brands };
    }

    let query = Product.find(filter);

    // ترتيب
    if (req.query.sort === "low-high") {
      query = query.sort({ price: 1 });
    } else if (req.query.sort === "high-low") {
      query = query.sort({ price: -1 });
    }

    const totalProducts = await Product.countDocuments(filter);

    const products = await query.skip(skip).limit(limit);

    res.status(200).json({
      status: "Success",
      products,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts: totalProducts,
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch Products", error: err.message });
  }
};


exports.UpdateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.files?.image) updateData.image = req.files.image[0].path;
    if (req.files?.images) updateData.images = req.files.images.map(file => file.path);

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ status: "Success", message: "Product Updated Successfully!", product: updatedProduct });
  } catch (err) {
    res.status(500).json(err);
  }
};


exports.DeleteProduct = async (req,res)=>{
    try{
        await Product.findByIdAndDelete(req.params.id)
        res.status(200).json({message:"Prodcut Delete Successfully!"})
    }catch(err){
        res.status(500).json(err)
    }
}

exports.GetProduct = async (req,res)=>{
    try{
        const GetProduct = await Product.findById(req.params.id)
        if(!GetProduct){
          return res.status(404).json({ message: "Product Not Found!" });
        }
        return res.status(200).json({
          status:"Success",
          message: "Product!",
          product: GetProduct
        })
    }catch(err){
        res.status(500).json(err)
    }
}
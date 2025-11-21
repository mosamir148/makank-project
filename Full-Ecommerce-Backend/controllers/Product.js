const Product = require("../models/Product")


exports.CreateProduct = async (req, res) => {
  try {
    const { title, description, price, category, brand, purchasePrice, stock, shippingPrice } = req.body;

    if (!title || !description || price === undefined) {
      return res.status(404).json({ message: "title, description, price are required" });
    }

    // Convert price fields to numbers (preserve exact decimal values)
    const priceNum = parseFloat(price);
    const purchasePriceNum = purchasePrice ? parseFloat(purchasePrice) : priceNum;
    const stockNum = stock ? parseInt(stock) : 0;
    const shippingPriceNum = shippingPrice ? parseFloat(shippingPrice) : 0;

    // Validate price is a valid number
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ message: "Invalid price value" });
    }

    const NewProduct = new Product({
      title,
      description,
      brand,
      price: priceNum, // Store as number, preserving exact decimal precision
      category,
      purchasePrice: purchasePriceNum,
      stock: stockNum,
      shippingPrice: shippingPriceNum,
      image: req.files?.image ? req.files.image[0].path : null,
      images: req.files?.images ? req.files.images.map(file => file.path) : []
    });
console.log("BODY:", req.body);
console.log("FILES:", req.files);
    await NewProduct.save();

    // Exclude sensitive fields (purchasePrice and stock) from response
    const productResponse = NewProduct.toObject();
    delete productResponse.purchasePrice;
    delete productResponse.stock;

    res.status(201).json({
      status: "Success",
      message: "Product Created Successfully!",
      product: productResponse
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

    // Search functionality
    if (req.query.search && req.query.search.trim() !== '') {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
        { category: searchRegex }
      ];
    }

    // فلترة الكاتيجوري
    if (req.query.categories && req.query.categories.trim() !== '') {
      // لو الفلتر جاي كمصفوفة أو قيمة واحدة
      const categories = req.query.categories.split(',').filter(cat => cat.trim() !== ''); // تحويل السلسلة لمصفوفة وإزالة القيم الفارغة
      if (categories.length > 0) {
        filter.category = { $in: categories };
        console.log('Filtering by categories:', categories);
      }
    }

    // فلترة البراند
    if (req.query.brands && req.query.brands.trim() !== '') {
      const brands = req.query.brands.split(',').filter(brand => brand.trim() !== ''); // تحويل السلسلة لمصفوفة وإزالة القيم الفارغة
      if (brands.length > 0) {
        filter.brand = { $in: brands };
        console.log('Filtering by brands:', brands);
      }
    }

    console.log('Final filter:', JSON.stringify(filter));

    let query = Product.find(filter);

    // ترتيب
    if (req.query.sort === "low-high") {
      query = query.sort({ price: 1 });
    } else if (req.query.sort === "high-low") {
      query = query.sort({ price: -1 });
    } else {
      // Default: Sort by newest first (createdAt descending)
      query = query.sort({ createdAt: -1 });
    }

    const totalProducts = await Product.countDocuments(filter);

    const products = await query.skip(skip).limit(limit).select("-purchasePrice -stock");

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

    // Convert price fields to numbers if they exist (preserve exact decimal values)
    if (updateData.price !== undefined) {
      const priceNum = parseFloat(updateData.price);
      if (isNaN(priceNum) || priceNum < 0) {
        return res.status(400).json({ message: "Invalid price value" });
      }
      updateData.price = priceNum;
    }
    if (updateData.purchasePrice !== undefined) {
      updateData.purchasePrice = updateData.purchasePrice ? parseFloat(updateData.purchasePrice) : updateData.price || 0;
    }
    if (updateData.stock !== undefined) {
      updateData.stock = updateData.stock ? parseInt(updateData.stock) : 0;
    }
    if (updateData.shippingPrice !== undefined) {
      updateData.shippingPrice = updateData.shippingPrice ? parseFloat(updateData.shippingPrice) : 0;
    }

    if (req.files?.image) updateData.image = req.files.image[0].path;
    if (req.files?.images) updateData.images = req.files.images.map(file => file.path);

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });

    // Exclude sensitive fields (purchasePrice and stock) from response
    const productResponse = updatedProduct.toObject();
    delete productResponse.purchasePrice;
    delete productResponse.stock;

    res.status(200).json({ status: "Success", message: "Product Updated Successfully!", product: productResponse });
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
        const GetProduct = await Product.findById(req.params.id).select("-purchasePrice -stock")
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
const DeliveryAddress = require("../models/DeliveryAddress");

// Get all delivery addresses for the logged-in user
exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.user._id;

    const addresses = await DeliveryAddress.find({ user: userId }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.status(200).json({
      addresses,
      status: 200,
    });
  } catch (error) {
    console.error("❌ GetUserAddresses error:", error);
    res.status(500).json({
      message: "Error fetching delivery addresses",
      status: 500,
      error: error.message,
    });
  }
};

// Create a new delivery address
exports.createAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, phone, city, governorate, street, number, buildingNumber, isDefault } = req.body;

    // Validate required fields
    if (!name || !phone || !city || !governorate || !street) {
      return res.status(400).json({
        message: "Name, phone, city, governorate, and street are required",
        status: 400,
        error: "Missing required fields",
      });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await DeliveryAddress.updateMany({ user: userId }, { isDefault: false });
    }

    const address = await DeliveryAddress.create({
      user: userId,
      name,
      phone,
      city,
      governorate,
      street,
      number: number || "",
      buildingNumber: buildingNumber || "",
      isDefault: isDefault || false,
    });

    res.status(201).json({
      address,
      message: "Delivery address created successfully",
      status: 201,
    });
  } catch (error) {
    console.error("❌ CreateAddress error:", error);
    res.status(500).json({
      message: "Error creating delivery address",
      status: 500,
      error: error.message,
    });
  }
};

// Update a delivery address
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { name, phone, city, governorate, street, number, buildingNumber, isDefault } = req.body;

    const address = await DeliveryAddress.findById(id);

    if (!address) {
      return res.status(404).json({
        message: "Delivery address not found",
        status: 404,
        error: "Address does not exist",
      });
    }

    // Check if the address belongs to the user
    if (address.user.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Access denied",
        status: 403,
        error: "You can only update your own addresses",
      });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await DeliveryAddress.updateMany(
        { user: userId, _id: { $ne: id } },
        { isDefault: false }
      );
    }

    // Update address
    if (name) address.name = name;
    if (phone) address.phone = phone;
    if (city) address.city = city;
    if (governorate) address.governorate = governorate;
    if (street) address.street = street;
    if (number !== undefined) address.number = number;
    if (buildingNumber !== undefined) address.buildingNumber = buildingNumber;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await address.save();

    res.status(200).json({
      address,
      message: "Delivery address updated successfully",
      status: 200,
    });
  } catch (error) {
    console.error("❌ UpdateAddress error:", error);
    res.status(500).json({
      message: "Error updating delivery address",
      status: 500,
      error: error.message,
    });
  }
};

// Delete a delivery address
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const address = await DeliveryAddress.findById(id);

    if (!address) {
      return res.status(404).json({
        message: "Delivery address not found",
        status: 404,
        error: "Address does not exist",
      });
    }

    // Check if the address belongs to the user
    if (address.user.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Access denied",
        status: 403,
        error: "You can only delete your own addresses",
      });
    }

    await DeliveryAddress.findByIdAndDelete(id);

    res.status(200).json({
      message: "Delivery address deleted successfully",
      status: 200,
    });
  } catch (error) {
    console.error("❌ DeleteAddress error:", error);
    res.status(500).json({
      message: "Error deleting delivery address",
      status: 500,
      error: error.message,
    });
  }
};

// Set default delivery address
exports.setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const address = await DeliveryAddress.findById(id);

    if (!address) {
      return res.status(404).json({
        message: "Delivery address not found",
        status: 404,
        error: "Address does not exist",
      });
    }

    // Check if the address belongs to the user
    if (address.user.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Access denied",
        status: 403,
        error: "You can only set your own addresses as default",
      });
    }

    // Unset other defaults
    await DeliveryAddress.updateMany({ user: userId, _id: { $ne: id } }, { isDefault: false });

    // Set this as default
    address.isDefault = true;
    await address.save();

    res.status(200).json({
      address,
      message: "Default address updated successfully",
      status: 200,
    });
  } catch (error) {
    console.error("❌ SetDefaultAddress error:", error);
    res.status(500).json({
      message: "Error setting default address",
      status: 500,
      error: error.message,
    });
  }
};

// Get default delivery address for user
exports.getDefaultAddress = async (req, res) => {
  try {
    const userId = req.user._id;

    const address = await DeliveryAddress.findOne({ user: userId, isDefault: true });

    if (!address) {
      return res.status(404).json({
        message: "No default address found",
        status: 404,
        error: "Please set a default address",
      });
    }

    res.status(200).json({
      address,
      status: 200,
    });
  } catch (error) {
    console.error("❌ GetDefaultAddress error:", error);
    res.status(500).json({
      message: "Error fetching default address",
      status: 500,
      error: error.message,
    });
  }
};
















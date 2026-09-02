const Service = require("../models/Service");

// @desc    Get all active services (public)
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, services });
  } catch (error) {
    console.error("getServices error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc    Get single service by id (admin)
// @route   GET /api/services/:id
// @access  Private/Admin
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found." });
    }
    return res.status(200).json({ success: true, service });
  } catch (error) {
    console.error("getServiceById error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc    Create a new service
// @route   POST /api/services
// @access  Private/Admin
exports.createService = async (req, res) => {
  try {
    const { title, description, imageUrl, timings, isActive } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required.",
      });
    }

    const service = await Service.create({
      title,
      description,
      imageUrl,
      timings,
      isActive,
    });

    return res.status(201).json({ success: true, service });
  } catch (error) {
    console.error("createService error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc    Update an existing service
// @route   PUT /api/services/:id
// @access  Private/Admin
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found." });
    }

    const { title, description, imageUrl, timings, isActive } = req.body;

    service.title = title ?? service.title;
    service.description = description ?? service.description;
    service.imageUrl = imageUrl ?? service.imageUrl;
    service.timings = timings ?? service.timings;
    service.isActive = isActive ?? service.isActive;

    const updatedService = await service.save();
    return res.status(200).json({ success: true, service: updatedService });
  } catch (error) {
    console.error("updateService error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Admin
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found." });
    }

    await service.deleteOne();
    return res
      .status(200)
      .json({ success: true, message: "Service deleted successfully." });
  } catch (error) {
    console.error("deleteService error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

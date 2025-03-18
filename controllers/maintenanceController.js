const MaintenanceRequestModel = require("../models/maintenanceRequest");

const createMaintenanceRequest = async (req, res) => {
  try {
    const { roomId, residentId, description, category, urgency } = req.body;
    console.log(req.body);
    if (!roomId || !residentId || !description || !category || !urgency) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newRequest = new MaintenanceRequestModel({
      roomId,
      residentId,
      description,
      category,
      urgency,
      status: "Pending",
    });

    await newRequest.save();

    res
      .status(201)
      .json({ message: "Request submitted successfully", request: newRequest });
  } catch (error) {
    console.error("Error submitting request:", error);
    res.status(500).json({ error: "Error submitting request" });
  }
};

const getMaintenanceRequests = async (req, res) => {
  try {
    const { residentId, assignedStaff } = req.query;
    let query = {};

    if (residentId) {
      query.residentId = residentId;
    }
    if (assignedStaff) {
      query.assignedStaff = assignedStaff;
    }

    const requests = await MaintenanceRequestModel.find(query)
      .populate("roomId", "roomNumber floor type")
      .populate("residentId", "name email phone")
      .populate("assignedStaff", "name email phone");

    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching maintenance requests:", err);
    res
      .status(500)
      .json({ message: "Error while fetching maintenance requests" });
  }
};

const editMaintenanceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({ error: "Request ID is required" });
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ error: "At least one field must be updated" });
    }

    const updatedRequest = await MaintenanceRequestModel.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ error: "Maintenance request not found" });
    }

    res.status(200).json({
      message: "Request updated successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating maintenance request:", error);
    res.status(500).json({ error: "Error updating maintenance request" });
  }
};

module.exports = {
  createMaintenanceRequest,
  getMaintenanceRequests,
  editMaintenanceRequest,
};

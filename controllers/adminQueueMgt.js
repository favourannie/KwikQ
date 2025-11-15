
const adminQueueMgtModel = require("../models/adminQueueMgt");
const QueuePoint = require("../models/queueModel");
const CustomerInterface = require("../models/customerQueueModel");
const organizationModel = require("../models/organizationModel");
const branchModel = require("../models/branchModel");
const { sendMail } = require("../middleware/brevo");
exports.getAllQueues = async (req, res) => {
  try {
    const { id } = req.params;

    let business = await organizationModel.findById(id);
    if (!business) business = await branchModel.findById(id);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const query =
      business.role === "multi"
        ? { branchId: id }
        : { individualId: id };

    const queuePoints = await QueuePoint.find(query).populate("customers");

    if (!queuePoints.length) {
      return res.status(200).json({
        message: "No customers currently in queue",
        data: [],
      });
    }

    const customersInQueue = [];

    queuePoints.forEach((queue) => {
      queue.customers.forEach((c) => {
        if (["waiting", "in_service"].includes(c.status)) {
          const joinedAt = c.joinedAt ? new Date(c.joinedAt) : null;
          const waitTime =
            joinedAt
              ? Math.round((Date.now() - joinedAt.getTime()) / 60000)
              : 0;

          customersInQueue.push({
            id: c._id,
            serialNumber: `T-${c.serialNumber}`,
            queueNumber: c.queueNumber || "N/A",
            fullName: c.formDetails?.fullName || "Unknown",
            service: c.formDetails?.serviceNeeded || "N/A",
            phone: c.formDetails?.phone || "N/A",
            joinedAt: c.joinedAt || "N/A",
            waitTime: `${waitTime} min`,
          });
        }
      });
    });

    // Sort oldest first
    customersInQueue.sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt));

    res.status(200).json({
      message: "Customers currently in queue fetched successfully",
      count: customersInQueue.length,
      data: customersInQueue,
    });
  } catch (error) {
    console.error("Error fetching queue data:", error);
    res.status(500).json({
      message: "Error fetching queue data",
      error: error.message,
    });
  }
};


exports.alertCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Find customer
    const queue = await CustomerInterface.findById(id);
    if (!queue)
      return res.status(404).json({ message: "Customer not found in queue" });

    // ---- MARK CUSTOMER AS IN SERVICE ----
    // Only update if not already in service or completed
    if (queue.status === "waiting") {
      queue.status = "in_service";
      queue.servedAt = new Date(); // ⏳ Start service
      // waitTime will be auto-calculated by your Mongoose hook
      await queue.save();
    }

    // ---- SEND EMAIL ALERT ----
    const detail = {
      email: queue.formDetails.email,
      subject: "Queue Alert!!! Your Turn!",
      html: `Hello ${queue.formDetails.fullName}, please proceed to your service point to be attended to.`,
    };

    await sendMail(detail);

    res.status(200).json({
      message: "Customer alerted successfully",
      data: {
        fullName: queue.formDetails.fullName,
        email: queue.formDetails.email,
        status: queue.status,
        servedAt: queue.servedAt,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error alerting customer",
      error: error.message,
    });
  }
};


// exports.alertCustomer = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const queue = await CustomerInterface.findById(id);
//     if (!queue)
//       return res.status(404).json({ message: "Customer not found in queue" });

//     const query = queue.branchId
//       ? { branchId: queue.branchId }
//       : { individualId: queue.individualId };

//     const currentServed = await CustomerInterface.findOne({
//       ...query,
//       status: "in_service",
//     });

//     if (currentServed) {
//       currentServed.status = "completed";
//       currentServed.completedAt = new Date();

//       if (currentServed.joinedAt) {
//         const joined = new Date(currentServed.joinedAt);
//         const completed = currentServed.completedAt;
//         const diff = completed - joined;
//         currentServed.waitTime = diff > 0 ? diff : 0;
//       }

//       await currentServed.save();
//       console.log(
//         `Customer ${currentServed.formDetails.fullName} marked as completed.`
//       );
//     }

//     queue.status = "in_service";
//     await queue.save();

//     const detail = {
//       email: queue.formDetails.email,
//       subject: "Queue Alert!!! Your Turn!",
//       html: `Hello ${queue.formDetails.fullName}, please proceed to your service point to be attended to.`,
//     };

//     await sendMail(detail

//     res.status(200).json({
//       message: "Next customer alerted successfully",
//       data: {
//         name: queue.formDetails.fullName,
//         email: queue.formDetails.email,
//       },
//     });
//   } catch (error) {
//     console.error("Error alerting customer:", error);
//     res
//       .status(500)
//       .json({ message: "Error alerting customer", error: error.message });
//   }
// };

exports.skipCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await adminQueueMgtModel.findByIdAndUpdate(id, { status: 'skipped' }, { new: true });
    res.status(200).json({ message: "Customer skipped", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Error skipping customer", error: error.message });
  }
};
exports.serveCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await CustomerInterface.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Handle first-time serving
    if (customer.status === "waiting") {
      customer.status = "completed";
      customer.servedAt = new Date();
      await customer.save();

      return res.status(200).json({
        message: "Customer served successfully.",
        data: {
          id: customer._id,
          status: customer.status,
          servedAt: customer.servedAt,
        },
      });
    }

    if (customer.status === "in_service") {
      customer.status = "completed";
      customer.completedAt = new Date();

      if (customer.servedAt && customer.joinedAt) {
        customer.waitTime = Math.round(
          (customer.servedAt - customer.joinedAt) / (1000 * 60)
        );
      }
      if (customer.completedAt && customer.servedAt) {
        customer.serviceTime = Math.round(
          (customer.completedAt - customer.servedAt) / (1000 * 60)
        );
      }

      await customer.save();

      return res.status(200).json({
        message: "Customer marked as completed",
        data: {
          id: customer._id,
          waitTime: `${customer.waitTime} min`,
          serviceTime: `${customer.serviceTime} min`,
          status: customer.status,
        },
      });
    }

    res.status(400).json({
      message: `Customer cannot be served. Current status: ${customer.status}`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error serving customer",
      error: error.message,
    });
  }
};


const adminQueueMgtModel = require("../models/adminQueueMgt");
const QueuePoint = require("../models/queueModel");
const CustomerInterface = require("../models/customerQueueModel");
const organizationModel = require("../models/organizationModel");
const branchModel = require("../models/branchModel");
const { sendMail } = require("../middleware/brevo");

exports.getAllQueues = async (req, res) => {
  try {
    const { id } = req.params;

    // Find business (organization or branch)
    let business = await organizationModel.findById(id);
    if (!business) business = await branchModel.findById(id);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Determine query scope
    const query =
      business.role === "multi"
        ? { branchId: id }
        : { individualId: id };

    // Get queue points + customers
    const queuePoints = await QueuePoint.find(query).populate("customers");

    if (!queuePoints.length) {
      return res.status(200).json({
        message: "No customers currently in queue",
        data: [],
      });
    }

    // Gather customers currently waiting or being served
    const customersInQueue = [];

    queuePoints.forEach((queue) => {
      queue.customers.forEach((c) => {
        if (["waiting", "in_service"].includes(c.status)) {
          const joinedAt = c.joinedAt ? new Date(c.joinedAt) : null;
          const waitTime =
            joinedAt
              ? Math.round((Date.now() - joinedAt.getTime()) / 60000) // in minutes
              : 0;

          customersInQueue.push({
            fullName: c.formDetails?.fullName || "Unknown",
            service: c.formDetails?.serviceNeeded || "N/A",
            phone: c.formDetails?.phone || "N/A",
            joinedAt: c.joinedAt || "N/A",
            waitTime: `${waitTime} min`,
          });
        }
      });
    });

    // Sort customers by join time (oldest first)
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
    const queue = await CustomerInterface.findById(id)
    if (!queue) return res.status(404).json({ message: "Customer not found in queue" });
//    const business =
//       await organizationModel.findById(queue.individualId) ||
//       await branchModel.findById(queue.branchId);

//     if (!business || !business.email) {
//       return res
//         .status(404)
//         .json({ message: "Business email not found for sender" });
//     }
    
   const detail = {
    //   sender: process.env.BREVO_USER,
      email: queue.formDetails.email,
      subject: "Queue Alert!!! Your Turn!",
      html: `Hello ${queue.formDetails.fullName}, please proceed to your service point to be attended to.`,
    }
    await sendMail(detail)

    res.status(200).json({ message: "Customer alerted successfully",
        data: {
         name: queue.formDetails.fullName,
         email: queue.formDetails.email
        }
     });
  } catch (error) {
    res.status(500).json({ message: "Error alerting customer", error: error.message });
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


exports.removeCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await adminQueueMgtModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Customer not found or already removed",
      });
    }

    res.status(200).json({
      message: "Customer removed successfully",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error removing customer",
      error: error.message,
    });
  }
};


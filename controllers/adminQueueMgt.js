
const adminQueueMgtModel = require("../models/adminQueueMgt");
const QueuePoint = require("../models/queueModel");
const CustomerInterface = require("../models/customerQueueModel");
const organizationModel = require("../models/organizationModel");
const branchModel = require("../models/branchModel");
const { sendMail } = require("../middleware/brevo");

exports.getAllQueues = async (req, res) => {
  try {
    const { id } = req.params;
    let business ;
     business = await organizationModel.findById(id) 

    if (!business) {
      business = await branchModel.findById(id)
    }
    let queuePoint;
    if (business.role === "multi"){
      queuePoint = await branchModel.findById(id)
    } else if(business.role === "individual"){
      queuePoint = await organizationModel.findById(id)
    } else if (business.role === "multi"){
      queuePoint = await organizationModel.findById(id)
    }
    const role = business.role === "multi" || "individual"
     queuePoint =
      role === "branch"
        ? await QueuePoint.find({ branchId: id }).populate("customers")
        : await QueuePoint.find({ individualId: id }).populate("customers");

    if (!queuePoint.length) {
      return res.status(200).json({
        message: "No queue points found for this business",
        data: [],
      });
    }

    let totalCustomers = 0;
    let totalWaiting = 0;
    let totalServedToday = 0;
    let totalWaitTime = 0;
    let totalServedWithTime = 0;

    const queuesData = queuePoint.map((queue) => {
      const total = queue.customers.length;
      const waiting = queue.customers.filter((c) => c.status === "waiting").length;
      const servedToday = queue.customers.filter((c) => c.status === "done").length;

      const avgWait =
        queue.averageWaitTime ||
        (Math.floor(Math.random() * 10) + 3);
      totalCustomers += total;
      totalWaiting += waiting;
      totalServedToday += servedToday;
      totalWaitTime += avgWait;
      totalServedWithTime++;

      return {
        name: queue.name,
        totalCustomers: total,
        waiting,
        servedToday,
        averageWaitTime: avgWait,
        customers: queue.customers.map((c) => ({
          fullName: c.formDetails?.fullName,
          serviceNeeded: c.formDetails?.serviceNeeded,
          queueNumber: c.queueNumber,
          joinedAt: c.joinedAt,
          phone: c.formDetails?.phone,
          status: c.status,
        })),
      };
    });

    const averageWaitTime =
      totalServedWithTime > 0
        ? (totalWaitTime / totalServedWithTime).toFixed(2)
        : 0;

    await adminQueueMgtModel.findOneAndUpdate(
      role === "branch" ? { branchId: id } : { individualId: id },
      {
        businessType: role === "branch" ? "branch" : "organization",
        queuePoints: queuePoint.map((q) => q.branchId) || queuePoint.map((q) => q.individualId),
        totalCustomers,
        totalWaiting,
        totalServedToday,
        averageWaitTime,
        lastUpdated: new Date(),
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "Queue management data fetched successfully",
      business: {
        name: business.businessName,
        type: role,
      },
      stats: {
        totalCustomers,
        totalWaiting,
        totalServedToday,
        averageWaitTime,
      },
      data: queuesData,
    });
  } catch (error) {
    console.error("Error fetching queue management data:", error);
    res.status(500).json({
      message: "Error fetching queue management data",
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


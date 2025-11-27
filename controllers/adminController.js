const customerModel = require("../models/customerQueueModel");
const branchModel = require("../models/branchModel");
const organizationModel = require("../models/organizationModel");
const adminQueueMgtModel = require("../models/adminQueueMgt");
const QueuePoint = require("../models/queueModel");
const { sendMail } = require("../middleware/brevo");
const {alertCustomerTemplate} = require("../utils/email");
const adminSettingsModel = require("../models/adminSettingsModel")
const queueConfigModel = require("../models/queueConfigModel");
const dayjs = require('dayjs');
const duration = require('dayjs/plugin/duration');


exports.updateCustomerStatus = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status } = req.body;

    const customer = await customerModel.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    customer.status = status;

    if (status === "completed") {
      customer.completedAt = new Date();

      if (customer.servedAt) {
        const serviceDuration = (Date.now() - customer.servedAt.getTime()) / 60000; // in minutes
        customer.serviceTime = serviceDuration;
      }

      if (customer.joinedAt) {
        const totalWait = (customer.servedAt
          ? customer.servedAt.getTime() - customer.joinedAt.getTime()
          : Date.now() - customer.joinedAt.getTime()) / 60000;
        customer.waitTime = totalWait;
      }
    }

    await customer.save();

    res.status(200).json({
      message: "Customer status updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Error updating customer status:", error);
    res.status(500).json({
      message: "Error updating customer status",
      error: error.message,
    });
  }
};




const calculateQueueMetrics = (queuePoints) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  let completedToday = 0;
  let totalWaitTime = 0;
  let totalCustomers = 0;
  let cancelledNoShow = 0;

  queuePoints.forEach((queue) => {
    queue.customers.forEach((c) => {
      const joinedAt = c.joinedAt ? new Date(c.joinedAt) : null;
      const completedAt = c.completedAt ? new Date(c.completedAt) : null;

      const waitTime = joinedAt
        ? Math.round((Date.now() - joinedAt.getTime()) / 60000)
        : 0;

      totalWaitTime += waitTime;
      totalCustomers++;

      if (
        c.status === "completed" &&
        completedAt &&
        completedAt >= startOfToday &&
        completedAt <= endOfToday
      ) {
        completedToday++;
      }

      if (["canceled", "no_show"].includes(c.status)) {
        cancelledNoShow++;
      }
    });
  });

  const avgWaitTime =
    totalCustomers > 0 ? Math.round(totalWaitTime / totalCustomers) : 0;

  return { avgWaitTime, completedToday, cancelledNoShow };
};


// Get dashboard details
exports.getDashboardMetrics = async (req, res) => {
  try {
    const id = req.user.id;
    const business =
      (await organizationModel.findById(id)) ||
      (await branchModel.findById(id));

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    let active, served;
    if (business.role === "individual") {
      active = await customerModel.find({
        individualId: business._id,
        status: "waiting",
      });

      served = await customerModel.find({
        individualId: business._id,
        status: "completed",
      });
    } else if (business.role === "multi") {
      active = await customerModel.find({
        branchId: business._id,
        status: "waiting",
      });

      served = await customerModel.find({
        branchId: business._id,
        status: "completed",
      });
    }

    const queuePoints = [
      { customers: [...active, ...served] }, // combine active and served customers
    ];

    const { avgWaitTime } = calculateQueueMetrics(queuePoints);

    res.status(200).json({
      message: "Dashboard metrics retrieved successfully",
      data: {
        activeInQueue: active.length,
        servedToday: served.length,
        avgWaitTime, 
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error getting dashboard metrics",
    });
  }
};


// Get recent activity
exports.getRecentActivity = async (req, res) => {
  try {
    const userId = req.user.id;

    let business =
      (await organizationModel.findById(userId)) ||
      (await branchModel.findById(userId));

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const query =
      business.role === "multi"
        ? { branchId: business._id }
        : { individualId: business._id };

    const recentCustomers = await customerModel
      .find(query)
      .sort({ updatedAt: -1 })
      .limit(10);

    const activities = recentCustomers.map((c) => {
      let action = "";

      if (c.status === "completed") {
        action = `Served`;
      } else if (c.status === "waiting") {
        action = `Joined queue`;
      } else if (c.status === "in_service") {
        action = `Being served`;
      } else if (c.status === "alerted") {
        action = `Alert sent`;
      }

      const minutesAgo = Math.max(
        Math.round((Date.now() - new Date(c.updatedAt)) / 60000),
        1
      );

      return {
        fullName: c.formDetails?.fullName || "N/A",   // ✅ ADDED HERE
        queueNumber: c.queueNumber || "N/A",
        action,
        timeAgo: `${minutesAgo}`,
      };
    });

    res.status(200).json({
      message: "Recent activity fetched successfully",
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching recent activity",
      error: error.message,
    });
  }
};

// Get notifications
    exports.getNotifications = async (req, res) => {
      try {
        const { id } = req.params;

        let business = await branchModel.findById(id);
        let filters = {};

        if (business) {
          filters.branchId = id;   // FIXED
        } else {
          business = await organizationModel.findById(id);
          if (business) {
            filters.individualId = id;  // FIXED
          } else {
            return res.status(404).json({ message: "Business not found" });
          }
        }

        const queueActivities = await customerModel.find(filters)
          .select("formDetails queueNumber joinedAt")
          .sort({ joinedAt: -1 });

        if (queueActivities.length === 0) {
          return res.status(200).json({
            message: "No notifications available yet",
            totalNotifications: 0,
            highPriorityCount: 0,
            data: [],
          });
        }

        const notifications = queueActivities
      .filter(item => item.formDetails) // ignore invalid records
      .map(item => {
        const { fullName, serviceNeeded, priorityStatus } = item.formDetails;

        return {
          message: `${fullName} joined the queue for ${serviceNeeded}`,
          queueNumber: item.queueNumber,
          createdAt: item.joinedAt,
          priority: priorityStatus === "high" ? "high" : "normal",
          isRead: false,
        };
      });


        res.status(200).json({
          message: "Notifications fetched successfully",
          totalNotifications: notifications.length,
          highPriorityCount: notifications.filter(n => n.priority === "high").length,
          data: notifications,
        });

      } catch (error) {
        res.status(500).json({
          message: "Error fetching notifications",
          error: error.message,
        });
      }
    };

// Get total queues
exports.getAllQueues = async (req, res) => {
  try {
    const { id } = req.params;

    let business = await organizationModel.findById(id);
    if (!business) business = await branchModel.findById(id);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const query =
      business.role === "branch"
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
            status: c.status || "N/A",
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

// Notify a customer
exports.alertCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const queue = await customerModel.findById(id);
    if (!queue)
      return res.status(404).json({ message: "Customer not found in queue" });

    if (queue.status === "in_service") {
      return res.status(400).json({
        message: "Customer is already being attended to. No alert sent.",
      });
    }

    if (
      queue.status === "completed" ||
      queue.status === "no_show" ||
      queue.status === "canceled"
    ) {
      return res.status(400).json({
        message: `Customer status is '${queue.status}', cannot alert.`,
      });
    }

    // Update status to in_service
    if (queue.status === "waiting") {
      queue.status = "in_service";
      queue.servedAt = new Date();
      queue.start = Date.now();
      await queue.save();
    }

    // Fetch business name
    let businessName = "Your Service Point"; // fallback
    if (queue.branchId) {
      const branch = await branchModel.findById(queue.branchId);
      if (branch) businessName = branch.fullName || branch.name;
    } else if (queue.individualId) {
      const org = await organizationModel.findById(queue.individualId);
      if (org) businessName = org.businessName || org.fullName;
    }

    const html = alertCustomerTemplate(
      queue.formDetails.fullName,
      businessName,
      queue.queueNumber
    );

 

await sendMail({
  email: queue.formDetails.email,
  subject: "Queue Alert! Your Turn",
  html,
});

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

// Skip a customer
exports.skipCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await adminQueueMgtModel.findByIdAndUpdate(id, { status: 'skipped' }, { new: true });
    res.status(200).json({ message: "Customer skipped", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Error skipping customer", error: error.message });
  }
};

// Serve a customer
exports.serveCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await customerModel.findById(id);
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
      customer.end = Date.now()
      customer.serviceTime = customer.end - customer.start;
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



// Admin settings page controllers
exports.getBusinessDetails = async(req, res)=>{
    try {
        const {id} = req.params
        const business = await organizationModel.findById(id) || await branchModel.findById(id)
        if(!business){
            return res.status(404).json({
                message: "Business not found"
            })
        }
        let details
        if(business.role === "individual"){
          details = await adminSettingsModel.findOne({
            individualId: business._id
          })
        } else if(business.role === "multi"){
          details = await adminSettingsModel.findOne({
            branchId: business._id
          })
        }
        const update = {
          name: details.businessName,
          email: business.email,
          address: details.businessAddress,
          phone: details.phoneNumber,
          time: details.timezone,
        }
    return res.status(200).json({
      message: "Business details fetched successfully.",
      data: update,
    });
  } catch (error) {
    console.error("Error getting organization details:", error);
    res.status(500).json({
      message: "Error getting organization details.",
      error: error.message,
    });
  }
};

exports.updateBusinessDetails = async (req, res) => {
  try {
    const { businessName, phoneNumber, businessAddress } = req.body;
    const { id } = req.params;

    const business =
      (await organizationModel.findById(id)) ||
      (await branchModel.findById(id));

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    let updated;

    if (business.role === "multi") {
      updated = await adminSettingsModel.findOneAndUpdate(
        { branchId: id },
        {
          businessName,
          phoneNumber,
          businessAddress,
        },
        { new: true, upsert: true } 
      );
    } else if (business.role === "individual") {
      updated = await adminSettingsModel.findOneAndUpdate(
        { individualId: id },
        {
          businessName,
          phoneNumber,
          businessAddress,
        },
        { new: true, upsert: true } 
      );
    }

    res.status(200).json({
      message: "Business updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating business details.",
      error: error.message,
    });
  }
};

exports.setWorkingDays = async(req,res)=>{
  try {
    const id = req.user.id
    const {openingTime, closingTime, workingDays, timezone} = req.body
    const business = await organizationModel.findById(id) || await branchModel.findById(id)
    if(!business){
      return res.status(404).json({
        message: "Business not found"
      })
    }
    let existing
    if(business.role === "individual"){
      existing = await adminSettingsModel.findOne({
        individualId: business._id
      })
    } else if (business.role === "multi"){
      existing = await adminSettingsModel.findOne({
        branchId: business._id
      })
    }
    if(existing){
       existing.openingTime = openingTime;
      existing.closingTime = closingTime;
      existing.workingDays = workingDays;
      existing.timezone = timezone || existing.timezone;
      existing.updatedAt = new Date();
      await existing.save();

      return res.status(200).json({
        message: "Operating hours updated successfully",
        data: existing,
      });
    }
    const newHours = await adminSettingsModel.create({
      businessId: req.user.id,
      openingTime,
      closingTime,
      workingDays,
      timezone,
    });

    res.status(201).json({
      message: "Operating hours created successfully",
      data: newHours,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating business details.",
      error: error.message,
    });
  }
}

exports.getOperatingHours = async (req, res) => {
  try {
    const id = req.user.id
    const business = await organizationModel.findById(id) || await branchModel.findById(id)
    if(!business){
      return res.status(404).json({
        message: "Business not found"
      })
    }
    let hours;
    if(business.role === "individual"){
      hours = await adminSettingsModel.findOne({individualId: business._id})
    } else if( business.role === "multi"){
      hours = await adminSettingsModel.findOne({branchId: business._id})
    }

    if (!hours) return res.status(404).json({ message: "Operating hours not set yet" });

    res.status(200).json({
      message: "Operating hours retrieved successfully",
      data: hours,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving operating hours",
      error: error.message,
    });
}
};


// Analytics page controllers
const calculateAverageWaitTime = (customers) => {
  if (!customers || customers.length === 0) return 0;

  const totalWaitTime = customers.reduce((acc, customer) => {
    if (!customer.joinTime || !customer.serviceEndTime) return acc;
    const waitTime =
      (new Date(customer.serviceEndTime) - new Date(customer.joinTime)) / 60000;
    return acc + (waitTime > 0 ? waitTime : 0);
  }, 0);

  return Math.round((totalWaitTime / customers.length) * 10) / 10;
};

exports.getBranchAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    
    const business =
      (await organizationModel.findById(id)) ||
      (await branchModel.findById(id));

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const end = new Date();
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

    let customers = [];

    if (business.role === "branch") {
      customers = await customerModel.find({
        branchId: id,
        joinedAt: { $gte: start, $lte: end }
      });
    } else {
      customers = await customerModel.find({
        individualId: id,
        joinedAt: { $gte: start, $lte: end }
      });
    }

    const totalCustomers = customers.length;

    const avgWaitTime = calculateAverageWaitTime(
      customers.map(c => ({
        joinTime: c.joinedAt,
        serviceEndTime: c.servedAt
      }))
    );

 
    // Weekly Customer Volume
    // -----------------------------
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyVolume = days.map(day => ({
      day,
      count: customers.filter(
        c => new Date(c.joinedAt).getDay() === days.indexOf(day)
      ).length
    }));


    const waitTrend = days.map(day => {
      const dayCustomers = customers.filter(
        c => new Date(c.joinedAt).getDay() === days.indexOf(day)
      );

      const trendValue = calculateAverageWaitTime(
        dayCustomers.map(dc => ({
          joinTime: dc.joinedAt,
          serviceEndTime: dc.servedAt
        }))
      );

      return { day, value: trendValue };
    });


    const peakHours = ["10AM", "12PM", "2PM", "4PM"];
    const peakHourValues = peakHours.map(hour => {
      const targetHour = parseInt(hour);
      const count = customers.filter(
        c => new Date(c.joinedAt).getHours() === targetHour
      ).length;

      return { hour, count };
    });

    const colors = [
  "#4F46E5", 
  "#10B981", 
  "#F59E0B", 
 "#EF4444", 
 "#3B82F6", 
  "#8B5CF6", 
  "#14B8A6", 
   "#F43F5E" 
 ]

let colorIndex = 0;
    const serviceBucket = {};
    customers.forEach(c => {
      const service = c.formDetails?.serviceNeeded;
      if (service) serviceBucket[service] = (serviceBucket[service] || 0) + 1;
    });

    const serviceDistribution = Object.entries(serviceBucket).map(
      ([name, value]) =>{
        const color = colors[colorIndex % colors.length];
  colorIndex++;
  return { name, value, color };
      }
    );

    res.status(200).json({
      message: "Analytics fetched successfully",
      data: {
        totalCustomers,
        avgWaitTime,
        weeklyCustomerVolume: weeklyVolume,
        averageWaitTimeTrend: waitTrend,
        peakHours: peakHourValues,
        serviceTypeDistribution: serviceDistribution
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching analytics",
      error: error.message
    });
  }
};

// queuepoints for business

exports.getQueuePoints = async (req, res) => {
  try {
    const { id } = req.params;

    const business =
      (await organizationModel.findById(id)) ||
      (await branchModel.findById(id));

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    let queuePoints;

    if (business.role === "branch") {
      queuePoints = await queuePointModel.find({ branchId: id }).lean();
    } else if (business.role === "individual") {
      queuePoints = await queuePointModel.find({ individualId: id }).lean();
    } else {
      return res.status(400).json({
        message: "Invalid business role",
      });
    }

    if (!queuePoints || queuePoints.length === 0) {
      return res.status(200).json({
        message: "No queue points found for this business",
        data: [],
      });
    }

    let totalWaiting = 0;
    const queuePointsWithCounts = [];

    for (const point of queuePoints) {
      const waitingCount = await CustomerInterface.countDocuments({
        _id: { $in: point.customers },
        status: "waiting",
      });

      totalWaiting += waitingCount;

      queuePointsWithCounts.push({
        _id: point._id,
        name: point.name,
        totalCustomers: point.customers?.length || 0,
        waitingCount,
      });
    }
    return res.status(200).json({
      message: "Queue points fetched successfully",
      totalWaiting,
      data: queuePointsWithCounts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching queue points",
      error: error.message,
    });
  }
};

// Config controller
exports.saveQueueConfig = async(req,res)=>{
    try {
        const {id} = req.params
        const {maxQueueSize, avgServiceTime} = req.body
        const business = await organizationModel.findById(id) ||  await branchModel.findById(id)
        if(!business){
            return res.status(400).json({
                message: "Business not found"
            })
        }
        if(typeof maxQueueSize !== "number" || typeof avgServiceTime !== "number"){
            return res.status(400).json({
                message: "Invalid input types, only numbers are allowed."
            })
        }
        let config;

        if(business.role === "individual"){
            config = await queueConfigModel.findOneAndUpdate({individualId: id},{
                maxQueueSize,
                avgServiceTime
            }, {
                new: true, upsert: true
            })
        }else if(business.role === "multi"){
            config = await queueConfigModel.findOneAndUpdate({branchId: id}, {
                maxQueueSize,
                avgServiceTime
            },{
                new: true, upsert: true
            })
        }
        res.status(200).json({
            message: "Config settings updated successfully",
            data: config
        })

    } catch (error) {
        res.status(500).json({
            message: "Error updating config settings",
            error: error.message
        })
    }
}
exports.getQueueConfig = async (req, res) => {
  try {
    const {id} = req.params

    const business = await organizationModel.findById(id) || await branchModel.findById(id)

    let config;

    if(business.role === "multi"){
        config = await queueConfigModel.findOne({branchId: id}).select("avgServiceTime maxQueueSize")
    } else if (business.role === "individual"){
        config = await queueConfigModel.findOne({individualId: id}).select("avgServiceTime maxQueueSize")
    }
    if(!config){
        return res.status(404).json({
            message: "No configuration found for this business"
        })
    }
    res.status(200).json({
      message: "Queue configuration fetched successfully",
      data: config,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching queue configuration",
      error: error.message,
    });
  }
};

// admin history controller 

const calculateQueue = (queuePoints) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  let completedToday = 0;
  let totalWaitTime = 0;
  let totalCustomers = 0;
  let cancelledNoShow = 0;
  let serviceTime;
  
  queuePoints.forEach((queue) => {
    queue.customers.forEach((c) => {
      const joinedAt = c.joinedAt ? new Date(c.joinedAt) : null;
      const servedAt = c.servedAt ? new Date(c.servedAt) : null;
      const completedAt = c.completedAt ? new Date(c.completedAt) : null;

      const waitTime = joinedAt
        ? Math.round((Date.now() - joinedAt.getTime()) / 60000)
        : 0;

      totalWaitTime += waitTime;
      totalCustomers++;

      if (
        c.status === "completed" &&
        completedAt &&
        completedAt >= startOfToday &&
        completedAt <= endOfToday
      ) {
        completedToday++;
      }

      if (["canceled", "no_show"].includes(c.status)) {
        cancelledNoShow++;
      }
    });
  });

  dayjs.extend(duration);
  queuePoints.forEach((e)=>{
    e.serviceTime = dayjs.duration(parseInt(e.serviceTime));
  })

  const avgWaitTime =
    totalCustomers > 0 ? Math.round(totalWaitTime / totalCustomers) : 0;

  return { avgWaitTime, cancelledNoShow };
};

exports.getQueueHistory = async (req, res) => {
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
        metrics: { completedToday: 0, avgWaitTime: 0, cancelledNoShow: 0 },
      });
    }

    const completed = await customerModel.find({
      $or: [
        { individualId: business._id, status: "completed" },
        { branchId: business._id, status: "completed" },
      ],
    });

    const customersInQueue = [];

    queuePoints.forEach((queue) => {
      queue.customers.forEach((c) => {
        const joinedAt = c.joinedAt ? new Date(c.joinedAt) : null;
        const waitTime = joinedAt
          ? Math.round((Date.now() - joinedAt.getTime()) / 60000)
          : 0;

        const servedAt = c.servedAt ? new Date(c.servedAt) : null;
        const completedAt = c.completedAt ? new Date(c.completedAt) : null;

        let serviceTime = 0;

        if (servedAt && !completedAt && c.status === "in_service") {
          serviceTime = Math.round((Date.now() - servedAt.getTime()) / 60000);
        }

        if (servedAt && completedAt && c.status === "completed") {
          serviceTime = Math.round((completedAt.getTime() - servedAt.getTime()) / 60000);
        }

        // Format join time
        const joinedAtFormatted = joinedAt
          ? joinedAt.toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
              timeZoneName: "short",
            })
          : "N/A";

        customersInQueue.push({
          queueNumber: c.queueNumber || "N/A",
          fullName: c.formDetails?.fullName || "Unknown",
          service: c.formDetails?.serviceNeeded || "N/A",
          serviceTime: `${serviceTime} min`,   // <-- CORRECT VALUE NOW
          status: c.status,
          phone: c.formDetails?.phone || "N/A",
          joinedAt: joinedAtFormatted, 
          waitTime: `${waitTime} min`,
        });
      });
    });

    customersInQueue.sort(
      (a, b) => new Date(a.joinedAt) - new Date(b.joinedAt)
    );

    const metrics = calculateQueue(queuePoints);

    res.status(200).json({
      message: "Queue history fetched successfully",
      metrics,
      completedToday: completed.length,
      data: customersInQueue,
      service: queuePoints
    });
  } catch (error) {
    console.error("Error fetching history data:", error);
    res.status(500).json({
      message: "Error fetching history data",
      error: error.message,
    });
  }
};

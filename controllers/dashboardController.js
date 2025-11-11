const customerModel = require("../models/customerQueueModel");
const branchModel = require("../models/branchModel");
const organizationModel = require("../models/organizationModel");
const dashboardModel = require("../models/dashboardModel");

exports.getDashboardMetrics = async (req, res) => {
  try {
    const business =
      await organizationModel.findById(req.user.id) ||
       branchModel.findById(req.user.id);

    if (!business) return res.status(404).json({ message: "Business not found" });

    const dashboard = await dashboardModel.findOne({
      $or: [{ individualId: business._id }, { branchId: business._id }],
    });

    if (!dashboard) return res.status(404).json({ message: "Dashboard not created" });

    let query = {};
    if (business.role === "individual") query = { individualId: business._id };
    else if (business.role === "multi") query = { branchId: business._id };
    else if (business.role === "branch")
      query = {
        branchId: business._id,
      };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const yesterdayEnd = new Date(todayStart);

    const [activeToday, activeYesterday, servedToday, servedYesterday] =
      await Promise.all([
        customerModel.countDocuments({
          ...query,
          status: { $in: ["waiting", "in_service"] },
        }),

        customerModel.countDocuments({
          ...query,
          createdAt: { $gte: yesterdayStart, $lt: yesterdayEnd },
          status: { $in: ["waiting", "in_service"] },
        }),

        customerModel.find({
          ...query,
          status: "completed",
          completedAt: { $gte: todayStart, $lt: tomorrowStart },
        }),

        customerModel.find({
          ...query,
          status: "completed",
          completedAt: { $gte: yesterdayStart, $lt: yesterdayEnd },
        }),
      ]);

    const avgWaitTimeToday =
      servedToday.length > 0
        ? servedToday.reduce((acc, c) => acc + (c.waitTime || 0), 0) /
          servedToday.length
        : 0;

    const avgWaitTimeYesterday =
      servedYesterday.length > 0
        ? servedYesterday.reduce((acc, c) => acc + (c.waitTime || 0), 0) /
          servedYesterday.length
        : 0;

    const activeChange =
      activeYesterday > 0
        ? ((activeToday - activeYesterday) / activeYesterday) * 100
        : 0;

    const servedChange =
      servedYesterday.length > 0
        ? ((servedToday.length - servedYesterday.length) /
            servedYesterday.length) *
          100
        : 0;

    const waitTimeChange =
      avgWaitTimeYesterday > 0
        ? ((avgWaitTimeToday - avgWaitTimeYesterday) / avgWaitTimeYesterday) *
          100
        : 0;
    res.status(200).json({
      message: "Dashboard metrics fetched successfully",
      data: {
        activeInQueue: {
          current: activeToday,
          percentageChange: Math.round(activeChange),
        },
        averageWaitTime: {
          current: Math.round(avgWaitTimeToday),
          percentageChange: Math.round(waitTimeChange),
        },
        servedToday: {
          current: servedToday.length,
          percentageChange: Math.round(servedChange),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    res.status(500).json({
      message: "Error getting dashboard metrics",
      error: error.message,
    });
  }
};

// Helper function to calculate percentage change
// const calculatePercentageChange = (current, previous) => {
//     if (previous === 0) {
//         return current > 0 ? 100 : 0;
//     }
//     return ((current - previous) / previous) * 100;
// };


// exports.getDashboardMetrics = async (req, res) => {
//     try {
//         // --- 1. Identify Business and Establish Query ---
//         const business = 
//             await organizationModel.findById(req.user.id) || 
//             await branchModel.findById(req.user.id);

//         if (!business) {
//             return res.status(404).json({ message: "Business not found" });
//         }

//         // Dashboard check (kept as is)
//         const dashboard = await dashboardModel.findOne({
//             $or: [{ individualId: business._id }, { branchId: business._id }],
//         });

//         if (!dashboard) {
//             return res.status(404).json({ message: "Dashboard not created" });
//         }

//         let query = {};
//         if (business.role === "individual") query = { individualId: business._id };
//         else if (business.role === "multi" || business.role === "branch")
//             query = { branchId: business._id };


//         // --- 2. Define Date Boundaries (Cleaner approach) ---
//         const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
//         const tomorrowStart = new Date(todayStart); tomorrowStart.setDate(tomorrowStart.getDate() + 1);
        
//         const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate() - 1);
//         const yesterdayEnd = todayStart; // yesterday ends exactly when today starts


//         // --- 3. Fetch Metrics (Using destructuring for clarity) ---
//         const [
//             activeTodayCount, 
//             servedTodayCustomers, 
//             servedYesterdayCustomers
//         ] = await Promise.all([
//             // A. Active In Queue TODAY (Status: waiting or in_service, regardless of creation date)
//             customerModel.countDocuments({
//                 ...query,
//                 status: { $in: ["waiting", "in_service"] },
//             }),
//             // B. Served Customers TODAY
//             customerModel.find({
//                 ...query,
//                 status: "completed",
//                 completedAt: { $gte: todayStart, $lt: tomorrowStart },
//             }),
//             // C. Served Customers YESTERDAY
//             customerModel.find({
//                 ...query,
//                 status: "completed",
//                 completedAt: { $gte: yesterdayStart, $lt: yesterdayEnd },
//             }),
//         ]);

//         // NOTE: The previous logic for activeYesterday was complex. It compared 'active' customers
//         // *created* yesterday. A more logical comparison for a real-time 'Active' metric (like 
//         // the UI shows) is usually the *served* customers or a different time window comparison.
//         // For simplicity and alignment with standard dashboard metrics, we'll keep the Served comparison.
//         // We'll calculate a baseline for active count change (activeYesterdayCount) 
//         // to make the percentage calculation possible. If you need the count from yesterday, you must 
//         // query a snapshot or use a different 'status' logic.

//         // Placeholder for activeYesterdayCount (using servedToday as a placeholder for comparison)
//         // If 'activeYesterday' refers to the total customers created and still active at the end 
//         // of yesterday, the existing query was incorrect. For this refactoring, we'll assume a value 
//         // for `activeYesterdayCount` is available for calculation.
//         // For demonstration, let's assume `activeYesterdayCount` is fetched from a simplified query 
//         // (This query is not a true opposite of activeToday, but serves the percentage calculation):
//         const activeYesterdayCount = await customerModel.countDocuments({
//             ...query,
//             status: { $in: ["waiting", "in_service"] },
//             // A different filtering logic might be needed here depending on business requirement. 
//             // We use the servedYesterday count as a proxy for the previous metric base:
//         });
        
//         // --- 4. Compute Averages and Counts ---
//         const servedTodayCount = servedTodayCustomers.length;
//         const servedYesterdayCount = servedYesterdayCustomers.length;

//         const avgWaitTimeToday = servedTodayCount
//             ? servedTodayCustomers.reduce((acc, c) => acc + (parseFloat(c.waitTime) || 0), 0) / servedTodayCount
//             : 0;

//         const avgWaitTimeYesterday = servedYesterdayCount
//             ? servedYesterdayCustomers.reduce((acc, c) => acc + (parseFloat(c.waitTime) || 0), 0) / servedYesterdayCount
//             : 0;


//         // --- 5. Compute Percentage Changes (using the helper) ---
        
//         // The original code calculated Active Change using a complex 'created yesterday and active' logic. 
//         // We use the simpler version based on a fetched activeYesterdayCount.
//         const activeChange = calculatePercentageChange(activeTodayCount, activeYesterdayCount);

//         const servedChange = calculatePercentageChange(servedTodayCount, servedYesterdayCount);

//         const waitTimeChange = calculatePercentageChange(avgWaitTimeToday, avgWaitTimeYesterday);


//         // --- 6. Response ---
//         res.status(200).json({
//             message: "Dashboard metrics fetched successfully",
//             data: {
//                 activeInQueue: {
//                     current: activeTodayCount,
//                     percentageChange: Math.round(activeChange),
//                 },
//                 averageWaitTime: {
//                     // Round to one decimal place, consistent with original logic
//                     current: Math.round(avgWaitTimeToday * 10) / 10, 
//                     percentageChange: Math.round(waitTimeChange),
//                 },
//                 servedToday: {
//                     current: servedTodayCount,
//                     percentageChange: Math.round(servedChange),
//                 },
//             },
//         });
//     } catch (error) {
//         console.error("Error fetching dashboard metrics:", error);
//         res.status(500).json({
//             message: "Error getting dashboard metrics",
//             error: error.message,
//         });
//     }
// };


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
        queueNumber: c.queueNumber || "N/A",
        action,
        timeAgo: `${minutesAgo} min ago`,
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

const SuperAdminDashboard = require('../models/superAdmin');
const Branch = require('../models/branchModel');
const Organization = require('../models/organizationModel');
const CustomerInterface = require('../models/customerQueueModel'); 
const Queue = require('../models/customerQueueModel');
// const queueModel = require('../models/queueModel');


exports.getBranchManagement = async (req, res) => {

  try {
    const organizationId = req.params.id
    const branches = await Branch.find({organizationId: organizationId});
    const totalBranches = branches.length

    const totalActiveQueues = await Branch.aggregate([
      { $group: { _id: null, total: { $sum: "$activeQueues" } } }
    ]);

    const avgWaitTime = await Branch.aggregate([
      { $group: { _id: null, avg: { $avg: "$avgWaitTime" } } }
    ]);

    const totalServedToday = await Branch.aggregate([
      { $group: { _id: null, total: { $sum: "$servedToday" } } }
    ]);

    return res.status(200).json({
      message: "Dashboard data fetched successfully",
      totalBranches,
      totalActiveQueues: totalActiveQueues[0]?.total || 0,
      avgWaitTime: avgWaitTime[0]?.avg?.toFixed(1) || 0,
      totalServedToday: totalServedToday[0]?.total || 0
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data", error: error.message });
  }
};


 
//    try {
//     const  organizationId  = req.params.id; 

//     const branchFilter = organizationId ? { organizationId } : {};

//     const branches = await Branch.find({organizationId:organizationId});
//     console.log(branches);
    

//     const totalBranches = branches.length
//     let stuff
//     let totalactiveQ = 0
//     let avgWaitTime
//     let Waittime 
//     let num = []
//     for (const x of branches) {
//   const stuff = await Queue.find({ branchId: x._id });
//   num.push(stuff);

//   if (stuff) {
//     totalactiveQ += stuff.length;
//   }
// }

// console.log(num, totalactiveQ);
    // avgWaitTime = Waittime / totalactiveQ


    // const branchId = branches.map((b) => b._id);

    // // 2️⃣ Total Active Queues
    // const totalActiveQueues = await Queue.find({
    //   branchId: { $in: branchId },
    //   status: "active",
    // });

    // // 3️⃣ Average Wait Time (all queues)
    // const avgWaitResult = await Queue.aggregate([
    //   { $match: { branchId: { $in: branchId }, waitTime: { $gt: 0 } } },
    //   { $group: { _id: null, avgWait: { $avg: "$waitTime" } } },
    // ]);
    // // const avgWaitTime = avgWaitResult.length > 0 ? Math.round(avgWaitResult[0].avgWait) : 0;

    // // 4️⃣ Total Served Today
    // const startOfDay = new Date();
    // startOfDay.setHours(0, 0, 0, 0);

    // const totalServedToday = await Queue.findOne({
    //   branchId: { $in: branchId },
    //   status: "served",
    //   servedAt: { $gte: startOfDay },
    // });

    // // ✅ Return final metrics
//     return res.status(200).json({
//       message: "Dashboard data fetched successfully",
//       branches,
//       num
//       // data: {
//       //   totalBranches,
//       //   totalActiveQueues,
//       //   avgWaitTime: `${avgWaitTime} min`,
//       //   totalServedToday,
//       // },
//     });
//   } catch (error) {
//     console.error("Error fetching dashboard metrics:", error);
//     return res.status(500).json({
//       message: "Error fetching dashboard metrics",
//       error: error.message,
//     });
//   }
// };

// Get all branches
exports.getBranches = async (req, res) => {
  try {
    const organizationId = req.params.id
    const branches = await Branch.find(organizationId);
    res.json(branches);
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).json({ message: "Failed to fetch branches", error: error.message });
  }
};



// Get all branches in one organization
exports.getAllBranches = async (req, res) => {
  try {
    const orgId = req.query;
    console.log(orgId)

    const branches = await Branch.find(orgId).select(
      "managerName status avgWaitTime servedToday activeQueue"
    );

    const formattedBranches = branches.map(branch => ({
     
      managerName: branch.managerName,
      status: branch.status,
      avgWaitTime: branch.avgWaitTime,
      servedToday: branch.servedToday,
      activeQueue: branch.activeQueue
    }));

    res.status(200).json(formattedBranches);
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).json({ message: "Failed to fetch branches", error: error.message });
  }
};


exports.getBranchById = async (req, res) => {
  try {
    const { Id } = req.user.Id; 
    const adminId = req.user.id; 

    const admin = await Organization.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found or unauthorized" });
    }

  
    const branch = await Branch.findOne({
      _id: Id,
      organizationId: admin._id,
    })
      .populate('organizationId', 'organizationName managerName managerEmail branchCode')
      .lean();

    if (!branch) {
      return res.status(404).json({ message: "Branch not found or not part of your organization" });
    }

    return res.status(200).json({
      message: "Branch fetched successfully",
      data: branch,
    });

  } catch (error) {
    console.error("Error fetching branch:", error);
    return res.status(500).json({
      message: "Error fetching branch",
      error: error.message,
    });
  }
};


exports.getAllBranchesWithStats = async (req, res) => {
  try {
    const { organizationId } = req.query;

    const branch = await Branch.find({organizationId:organizationId})
    console.log('BRANCH:', branch)

    return res.status(200).json({
      message: 'Branches with analytics fetched successfully',
      branch
      // totalBranches: enrichedBranches.length,
      // data: enrichedBranches,
    });
  } catch (error) {
    console.error('Error fetching branches with stats:', error);
    return res.status(500).json({
      message: 'Error fetching branches with stats',
      error: error.message,
    });
  }
};



// exports.viewBranchReports = async (req, res) => {
//  try {
//     const { organizationId } = req.params.id; // ✅ fixed destructuring
//     let branches = [];

//     if (organizationId) {
//       // ✅ Find branches belonging to one organization
//       branches = await Branch.find({ organizationId: organizationId })
//         .populate('organizationId', 'organizationName') // ✅ fixed populate path
//         .lean();

//       if (!branches.length) {
//         return res.status(404).json({ message: 'No branches found for this organization' });
//       }
//     } 
//     // else {
//     //   // ✅ Get all branches
//     //   branches = await Branch.find()
//     //     .populate('organizationId', 'organizationName')
//     //     .lean();
//     // }

//     // ✅ Build reports for each branch
//     const reports = await Promise.all(
//       branches.map(async (branch) => {
//         const totalCustomers = await CustomerInterface.countDocuments({
//           branch: branch._id,
//         });
//         const servedCustomers = await CustomerInterface.countDocuments({
//           branch: branch._id,
//           status: 'served',
//         });

//         return {
//           branchId: branch._id,
//           branchName: branch.branchName,
//           organizationName: branch.organizationId?.organizationName ,
//           totalCustomers,
//           servedCustomers,
//           pendingCustomers: totalCustomers - servedCustomers,
//           avgWaitTime: branch.avgWaitTime || 0,
//           queuesToday: branch.queuesToday || 0,
//           lastLogin: branch.lastLogin,
//           status: branch.status,
//         };
//       })
//     );

//     // ✅ Overall analytics if all branches requested
//     if (!organizationId) {
//       const totalBranches = reports.length;
//       const totalCustomers = reports.reduce((sum, r) => sum + r.totalCustomers, 0);
//       const totalServed = reports.reduce((sum, r) => sum + r.servedCustomers, 0);
//       const avgWaitTime =
//         totalBranches > 0
//           ? reports.reduce((sum, r) => sum + (r.avgWaitTime || 0), 0) / totalBranches
//           : 0;

//       // return res.status(200).json({
//       //   message: 'All branch reports fetched successfully',
//       //   overview: {
//       //     totalBranches,
//       //     totalCustomers,
//       //     totalServed,
//       //     avgWaitTime: Number(avgWaitTime.toFixed(2)),
//       //   },
    
//       // });
//     }

//     // ✅ Single organization response
//     res.status(200).json({
//       message: 'Branch reports fetched successfully',
//       reports,
//     });
//   } catch (error) {
//     console.error('Error in viewBranchReports:', error);
//     res.status(500).json({
//       message: 'Error fetching branch report(s)',
//       error: error.message,
//     });
//   }
// };
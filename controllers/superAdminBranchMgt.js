const SuperAdminDashboard = require('../models/superAdmin');
const Branch = require('../models/branchModel');
const Organization = require('../models/organizationModel');
const CustomerInterface = require('../models/customerQueueModel'); 
const Queue = require('../models/customerQueueModel');
// const queueModel = require('../models/queueModel');
const moment = require('moment');


exports.getBranchManagement = async (req, res) => {
try {
    const orgId = req.user?.id;
    if (!orgId) {
      return res.status(401).json({ message: 'Organization ID required' });
    }

    const today = moment().startOf('day').toDate();
    const yesterday = moment().subtract(1, 'day').startOf('day').toDate();
    const thisMonth = moment().startOf('month').toDate();

    const totalBranches = await Branch.countDocuments({ organizationId: orgId });
    const totalThisMonth = await Branch.countDocuments({
      organizationId: orgId,
      createdAt: { $gte: thisMonth },
    });

    const activeQueues = await Queue.countDocuments({
      branch: { $in: await Branch.find({ organizationId: orgId }).distinct('_id') },
      status: { $in: ['waiting', 'serving'] },
    });

    const completedToday = await Queue.find({
      branch: { $in: await Branch.find({ organizationId: orgId }).distinct('_id') },
      status: 'completed',
      completedAt: { $gte: today },
    }).select('waitStartTime serveStartTime completedAt');

    let avgWaitTimeMinutes = 0;
    if (completedToday.length > 0) {
      const totalWaitSeconds = completedToday.reduce((sum, q) => {
        const start = q.serveStartTime || q.waitStartTime;
        const end = q.completedAt;
        return sum + (end - start) / 1000;
      }, 0);
      avgWaitTimeMinutes = Math.round(totalWaitSeconds / 60 / completedToday.length);
    }

    const servedToday = await Queue.countDocuments({
      branch: { $in: await Branch.find({ organizationId: orgId }).distinct('_id') },
      status: 'completed',
      completedAt: { $gte: today },
    });

    const branchIds = await Branch.find({ organizationId: orgId }).distinct('_id');

    const servedYesterday = await Queue.countDocuments({
      branch: { $in: branchIds },
      status: 'completed',
      completedAt: { $gte: yesterday, $lt: today },
    });
    const servedChange = servedYesterday === 0
      ? servedToday > 0 ? '+∞%' : '0%'
      : `${Math.round((servedToday - servedYesterday) / servedYesterday * 100)}%`;

    const activeQueuesYesterday = await Queue.countDocuments({
      branch: { $in: branchIds },
      status: { $in: ['waiting', 'serving'] },
      createdAt: { $gte: yesterday, $lt: today },
    });
    const activeChange = activeQueuesYesterday === 0
      ? activeQueues > 0 ? '+∞%' : '0%'
      : `${Math.round((activeQueues - activeQueuesYesterday) / activeQueuesYesterday * 100)}%`;

    const branches = await Branch.find({ organizationId: orgId }).sort({ branchName: 1 });
    const branchStats = await Promise.all(
      branches.map(async (branch) => {
        const [active, served, avgWait] = await Promise.all([
          Queue.countDocuments({
            branch: branch._id,
            status: { $in: ['waiting', 'serving'] },
          }),
          Queue.countDocuments({
            branch: branch._id,
            status: 'completed',
            completedAt: { $gte: today },
          }),
          Queue.aggregate([
            {
              $match: {
                branch: branch._id,
                status: 'completed',
                completedAt: { $gte: today },
              },
            },
            {
              $project: {
                waitTime: {
                  $divide: [
                    { $subtract: ['$completedAt', { $ifNull: ['$serveStartTime', '$waitStartTime'] }] },
                    60000,
                  ],
                },
              },
            },
            { $group: { _id: null, avg: { $avg: '$waitTime' } } },
          ]),
        ]);

        return {
          _id: branch._id,
          branchName: branch.branchName,
          branchCode: branch.branchCode,
          city: branch.city,
          state: branch.state,
          address: branch.address,
          managerName: branch.managerName,
          status: branch.status,
          lastUpdated: branch.lastUpdated,
          activeQueue: active,
          servedToday: served,
          avgWaitTime: avgWait[0]?.avg ? Math.round(avgWait[0].avg) : 0,
        };
      })
    );

    res.status(201).json({
    message: "Branches Overview Successfully Fetched",
        summary: {
        totalBranches: totalBranches,
        totalBranchesChange: `+${totalThisMonth} this month`,

        activeQueues: activeQueues,
        activeQueuesChange: `${activeChange >= 0 ? '+' : ''}${activeChange} from yesterday`,

        avgWaitTime: `${avgWaitTimeMinutes} min`,

         servedToday: servedToday,
         servedTodayChange: `${servedChange >= 0 ? '+' : ''}${servedChange} from yesterday`
        },
      branches: branchStats,
      meta: {
        generatedAt: new Date(),
        organizationId: orgId,
        activeCount: branchStats.filter(b => b.status === 'Active').length,
        offlineCount: branchStats.filter(b => b.status === 'Offline').length,
      },
    });
  } catch (error) {
    console.error('Branch Management Error:', error);
    res.status(500).json({
      message: 'Error fetching branches Overview',
      error: err.message,
    });
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

    const branches = await Branch.find({ organizationId : organizationId});
   
    const enrichedBranches = await Promise.all(
      branches.map(async (branch) => {
        
        const activeQueue = await Queue.countDocuments({
          branchId: branch._id,
          status: 'waiting', // or whatever status means "in queue"
        });

        const servedToday = await Queue.countDocuments({
          branchId: branch._id,
          status: 'served',
          servedAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)), // start of today
            $lt: new Date(new Date().setHours(23, 59, 59, 999)), // end of today
          },
        });

        const avgWaitAgg = await Queue.aggregate([
          {
            $match: {
              branchId: branch._id,
              status: 'served',
              servedAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lt: new Date(new Date().setHours(23, 59, 59, 999)),
              },
            },
          },
          { $group: {_id: null, avgWait: { $avg: '$waitTime' }, // assuming you store wait time in minutes or seconds
            },
          },
        ]);

        const avgWait = avgWaitAgg.length > 0 ? avgWaitAgg[0].avgWait : 0;
        return {
          ...branch.toObject(),
          activeQueue,
          avgWait,
          servedToday,
        };
      })
    );

    return res.status(200).json({
      message: 'Branches with analytics fetched successfully',
      totalBranches: enrichedBranches.length,
      branches: enrichedBranches,
    });
  } catch (error) {
    console.error('Error fetching branches with stats:', error);
    return res.status(500).json({
      message: 'Error fetching branches with stats',
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
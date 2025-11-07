const customerModel = require("../models/customerQueueModel");
const branchModel = require("../models/branchModel");
const organizationModel = require("../models/organizationModel")
const queueManagement = require("../models/queueManagement");
exports.getDashboardMetrics = async (req, res) => {
    try {

        const {id} = req.params;
        const business = await organizationModel.findById(id) || branchModel.findById(id) 
        if(!business){
            return res.status(404).json({
                message: "Business not found"
            })
        }
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const org = branchId ? { branch: branchId }  : {}

        const [
            activeInQueue,
            activeYesterday,
            servedToday,
            servedYesterday
        ] = await Promise.all([
            customerModel.countDocuments({
                ...branchQuery,
                status: { $in: ["waiting", "serving"] }
            }),
            customerModel.countDocuments({
                ...branchQuery,
                createdAt: { $gte: yesterday, $lt: today },
                status: { $in: ["waiting", "serving"] }
            }),
            customerModel.find({
                ...branchQuery,
                status: "served",
                servedAt: { $gte: today }
            }),
            customerModel.find({
                ...branchQuery,
                status: "served",
                servedAt: { $gte: yesterday, $lt: today }
            })
        ]);

        const avgWaitTime = servedToday.length > 0
            ? servedToday.reduce((acc, c) => acc + c.waitTime, 0) / servedToday.length
            : 0;
        const avgWaitTimeYesterday = servedYesterday.length > 0
            ? servedYesterday.reduce((acc, c) => acc + c.waitTime, 0) / servedYesterday.length
            : 0;

        const active = activeYesterday
            ? ((activeInQueue - activeYesterday) / activeYesterday) * 100
            : 0;
        const waitTime = avgWaitTimeYesterday
            ? ((avgWaitTime - avgWaitTimeYesterday) / avgWaitTimeYesterday) * 100
            : 0;
        const served = servedYesterday.length
            ? ((servedToday.length - servedYesterday.length) / servedYesterday.length) * 100
            : 0;

        res.status(200).json({
            data: {
                activeInQueue: {
                    current: activeInQueue,
                    percentageChange: Math.round(active)
                },
                averageWaitTime: {
                    current: Math.round(avgWaitTime),
                    percentageChange: Math.round(waitTime)
                },
                servedToday: {
                    current: servedToday.length,
                    percentageChange: Math.round(served)
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            message: "Error getting dashboard metrics",
            error: error.message
        });
    }
};


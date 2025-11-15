const organizationModel = require("../models/organizationModel");
const branchModel = require("../models/branchModel");
const CustomerInterface = require("../models/customerQueueModel");
const queueModel = require("../models/queueModel")
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

        const queueActivities = await CustomerInterface.find(filters)
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

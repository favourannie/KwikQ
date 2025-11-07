const CustomerInterface = require("../models/customerQueueModel");
const QueuePoint = require("../models/queueModel");
const branchModel = require("../models/branchModel");
const organizationModel = require("../models/organizationModel");

exports.getQueueHistory = async (req, res) => {
  try {
    const { id } = req.params; 
    const { status, branch, date } = req.query;
    const business =
      await organizationModel.findById(id) ||
      await branchModel.findById(id);

    if (!business)
      return res.status(404).json({ message: "Business not found" });
    const queuePoints =
      await QueuePoint.find({ branchId: id }) ||
      await QueuePoint.find({ individualId: id });

    const queuePointIds = queuePoints.map((q) => q._id);

    const filter = { queuePoint: { $in: queuePointIds } };
    if (status) filter.status = status;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.joinedAt = { $gte: start, $lte: end };
    }

    const customers = await CustomerInterface.find(filter)
      .populate("queuePoint")
      .lean()

    const completedToday = customers.filter((c) => c.status === "done").length;
    const cancelledToday = customers.filter(
      (c) => c.status === "cancelled"
    ).length

    const waitTimes = customers
      .filter((c) => c.servedAt && c.joinedAt)
      .map(
        (c) =>
          (new Date(c.servedAt) - new Date(c.joinedAt)) / (1000 * 60) // ms → min
      );

    const avgWaitTime =
      waitTimes.length > 0
        ? (waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length).toFixed(2)
        : 0;

    const tableData = customers.map((c) => ({
      queueId: c.queueNumber,
      customer: c.formDetails?.fullName,
      service: c.formDetails?.serviceNeeded,
      dateTime: c.joinedAt,
      waitTime: c.servedAt
        ? `${Math.floor(
            (new Date(c.servedAt) - new Date(c.joinedAt)) / (1000 * 60)
          )} min`
        : "-",
      serviceTime: c.completedAt
        ? `${Math.floor(
            (new Date(c.completedAt) - new Date(c.servedAt)) / (1000 * 60)
          )} min`
        : "-",
      status: c.status,
    }));

    res.status(200).json({
      message: "Queue history fetched successfully",
      summary: {
        completedToday,
        avgWaitTime,
        cancelledToday,
      },
      data: tableData,
    });
  } catch (error) {
    console.error("Error fetching queue history:", error);
    res
      .status(500)
      .json({ message: "Error fetching queue history", error: error.message });
  }
};

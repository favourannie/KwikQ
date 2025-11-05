const queueConfigModel = require("../models/queueConfigModel");
const organizationModel = require("../models/organizationModel");
const branchModel = require("../models/branchModel");

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

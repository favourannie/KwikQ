const organizationModel = require("../models/organizationModel")
const jwt = require('jsonwebtoken');
const Branch = require('../models/branchModel');


exports.authenticate = async (req,res, next) =>{
    const token = req.headers.authorization?.split(" ")[1]
        
        // console.log('token',token)
        if(!token){
            return res.status(401).json({
                message: "Invalid token provided"
            })
        }
        console.log('SECERT', process.env.JWT_SECRET)
    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        console.log(decoded)

        // // console.log('Decoded', decoded)

        const org = await organizationModel.findById(decoded.id)
        if(org == null){
            return res.status(404).json({
                message: "Authenticatioon failed: Organization not found"
            })
        }
        console.log('decoded:',decoded)
        req.user = decoded
        
        // console.log("i am authenticate user", req.user)
        next()
    } catch (error) {
        if(error instanceof jwt.TokenExpiredError){
           return res.status(401).json({
                message: "Session expired, Please login again to continue"
            })
        }
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }
}

exports.adminAuth = async(req,res,next)=>{
    if(req.user.isAdmin !== true){
        return res.status(403).json({
            message: "You are not authorized to perform this action"
        })
    }else{
       next() 
    }
}

exports.Login = async(req, res, next) =>{
    try {
        const token = req.headers.authorization?.split(" ")[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const branch = await Branch.findById(decoded.id)

        if (!branch){
            return res.status(404).json({
                message: 'Branch not found'
            })
        }else{
            next()
        }
        
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
        
    }

}
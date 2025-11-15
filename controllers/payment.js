// const userModel = require('../models/user');
const organizationModel = require('../models/organizationModel');
const subscriptionModel = require('../models/superAdmin');
const branchModel = require('../models/branchModel');
const paymentModel = require('../models/paymentModel');
const axios = require('axios');
const otpGen = require('otp-generator');

exports.initializePayment = async (req, res) => {
  try {
    console.log("beans cooker")
    const { individualId, planType, billingCycle } = req.body;
    
    // ✅ Automatically get organizationId from authenticated user
    const id = req.user?.id || req.user?._id

    if (!id) {
      return res.status(401).json({ message: "Unauthorized: id not found in token" });
    }

    // ✅ Fetch organization details
    const business = await organizationModel.findById(id) || await branchModel.findById(id);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    let amount;

    if (!billingCycle) {
      return res.status(400).json({ message: "billingCycle is required (monthly or annual)" });
    }
    
    if (!planType) {
      return res.status(400).json({ message: "planType is required" });
    }


    // // ✅ Fetch organization details here
    // const organization = await organizationModel.findById(org);
    // if (!organization) {
    //   return res.status(404).json({ message: "Organization not found" });
    // }

    const cycle = billingCycle.toLowerCase();
    const plan = planType.toLowerCase();

    if (cycle !== "monthly" && cycle !== "annual") {
      return res.status(400).json({ message: "billingCycle must be 'monthly' or 'annual'" });
    }

    // Pricing based on plan & cycle
    if (plan === "starter") {
      amount = cycle === "monthly" ? 15000 : 144000;
    } else if (plan === "professional") {
      amount = cycle === "monthly" ? 35000 : 336000;
    } else if (plan === "enterprise") {
      return res.status(400).json({
        message: "Enterprise plan requires custom pricing, please contact sales."
      });
    } else {
      return res.status(400).json({ message: "Invalid plan type selected" });
    }
 
    // Generate unique payment reference
    const reference = `KWIKQ_${Date.now()}_${Math.floor(Math.random() * 1000)}`;console.log("my ammunt:",reference)

console.log("plannner  ",plan)  
    const paymentData = {
       amount,
        currency: "NGN",
        reference,
        // narration: `Payment for ${plan} plan (${cycle})`,
        // channels: ["card"],
        redirect_url: `https://kwik-q.vercel.app/#/payment_succesful/${reference}`,
        customer: {
          name: business.businessName || "Customer Name",
          email: business.email || "customer@email.com",
    }
  }
  console.log(  "Authorization", `Bearer ${process.env.KORAPAY_SECRET_KEY}`) 
   const { data } = await axios.post('https://api.korapay.com/merchant/api/v1/charges/initialize', paymentData,{
    headers: {
      Authorization: `Bearer ${process.env.KORAPAY_SECRET_KEY}`}}
  );
    let pay;
    if(business.type === 'individual'){
      pay = await paymentModel.create({
        individualId: business._id,
        org: 'individual',
        amount,
        reference,
        status: "Pending",
        planType: plan,
        billingCycle: cycle,
      });
    }else{
      pay = await paymentModel.create({
        individualId: business._id,
        org: 'multi',
        amount,
        reference,
        status: "Pending",
        planType: plan,
        billingCycle: cycle,
      });
    }
  
    if (data?.status === true) {
      await pay.save();
    }
    // res.redirect(data?.data?.checkout_url)

    res.status(201).json({
      message: "Payment initialized successfully",
       data: {
        reference: data?.data?.reference,
        url: data?.data?.checkout_url
      }
    });
  } catch (error) {
    console.error("Error initializing payment:"+ error.message);
    res.status(500).json({
      message: "Error initializing payment",
      error: error.response?.data,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const verifyResponse = await axios.get(`https://api.korapay.com/merchant/api/v1/charges/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.KORAPAY_SECRET_KEY}`,
        },
      }
    );

    const status = verifyResponse.data?.data?.status;

    await paymentModel.findOneAndUpdate(
      { reference },
      { status },
      { new: true }
    );

    res.status(200).json({
      message: "Payment verification completed",
      status,
      data: verifyResponse.data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error verifying payment",
      error: error.response?.data || error.message,
    });
  }
};


exports.verifyPaymentWebhook = async (req,res)=>{
  try {
    const { event, data } = req.body;
    const payment = await paymentModel.findOne({ reference: data?.reference });

    if (payment === null) {
      return res.status(404).json({
        message: 'Payment not found'
      })
    };
    if(event === "charge.success"){
      payment.status = "Successful"
      await payment.save();
      const user = await organizationModel.findById(payment.individualId);
      user.subscriptionType = payment.planType;
      user.subscriptionDuration = payment.billingCycle;
      await user.save();
     return res.status(200).json({
        message: 'Payment successful'
      })
    } else if(event === "charge.failed"){
      payment.status = "Failed"
      await payment.save();
     return res.status(200).json({
        message: 'Payment failed'
      })
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error verifying payment webhook: ' + error.message
    })
}
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.status(200).json({
      message: "Payments fetched successfully",
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching payments",
      error: error.message,
    });
  }
};

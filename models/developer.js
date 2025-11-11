
const mongoose = require('mongoose');

const developerSchema = new mongoose.Schema({
    
    overview: {
      totalOrganizations: { type: Number, default: 0 },
      totalActiveCustomers: { type: Number, default: 0 },
      totalActiveSubscriptions: { type: Number, default: 0 },
      MonthlyRevenue: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now },
      metrics: { type: mongoose.Schema.Types.Mixed, default: {} },
    },

    organizationId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organizations',
      },
    ],

    allCustomers: [
      {
        totalCustomers: { type: Number, default: 0},
        active: { type: Number, default: 0},
        onTrial: { type: Number, default: 0},
        mrr: { type: Number, default: 0},
        organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'organizations', required: true },
        joinedAt: { type: Date, default: Date.now },
      },
    ],

    
    userAccounts: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        totalUsers: { type: Number, default: 0},
        activeUsers: { type: Number, default: 0},
        admins: { type: Number, default: 0 },
        suspended: { type: Number , default: 0},
        role: { type: String, enum: ['owner', 'admin', 'manager', 'support', 'dev'], default: 'admin' },
        organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'organizations' },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    subscriptions: [
      {
        subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
        organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'organizations' },
        activeSubscriptions: { type: Number, default: 0},
        pastDue: { type: Number, default: 0},
        mmr: { type: Number, default: 0},
        status: { type: String, enum: ['active', 'trial', 'canceled', 'past_due', 'expired'], default: 'active' },
        startedAt: { type: Date },
        endedAt: { type: Date },
        plan: { type: String }, // optional plan name/slug snapshot
      },
    ],

    pendingPayments: [
      {
        paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
        organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'organizations' },
        customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'NGN' },
        overDuePayment: {type: String, default: 0},
        totalEndingSoon: {type: Number, default:0},
        upcomingPayments:{ type: String, default: 0},

        actionType: {
      type: String,
      enum: ["subscription_reminder", "payment_reminder"],
      default: "subscription_reminder",
    },

    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Developer",
      required: true,
    },

    totalOrganizations: {
      type: Number,
      default: 0,
    },

    successCount: {
      type: Number,
      default: 0,
    },

    failedCount: {
      type: Number,
      default: 0,
    },

    reminderMessage: {
      subject: { type: String, default: "Subscription Reminder" },
      bodyTemplate: {
        type: String,
        default: `
Dear {{organizationName}},

This is a friendly reminder from Queueless Management System.

Your subscription is currently:
- Overdue Payments: {{overDuePayment}}
- Ending Soon: {{totalEndingSoon}}
- Upcoming Payments: {{upcomingPayments}}

Please log in to your dashboard to renew or clear your pending payments.

Thank you for using Queueless!

Best Regards,  
Queueless Management System Support Team
        `,
      },
    },

    reminderLogs: [
      {
        organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
        organizationName: { type: String },
        email: { type: String },
        status: { type: String, enum: ["sent", "failed"], default: "sent" },
        message: { type: String },
        sentAt: { type: Date, default: Date.now },
        error: { type: String },
      },
    ],

    executedAt: {
      type: Date,
      default: Date.now,
    },

    nextScheduledRun: {
      type: Date, // optional, if you use a cron job to automate reminders
    },
        reason: { type: String },
        addedAt: { type: Date, default: Date.now },
        metadata: { type: mongoose.Schema.Types.Mixed }, // gateway raw response, note, etc.
      },
      
    ],
    notes: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
    type: String,
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    
  },
    password: {
    type: String,
    required: true, 
    select: false
  },
   isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String
  },
  otpExpiredAt: {
    type: Number
  },
   isAdmin: {
    type: Boolean,
    default: false
  },
    createdAt: {
    type: Date,
    default: Date.now
  },

    role: {
      type: String,
      default: "developer",
    },
  },
);


const developerModel = mongoose.model('Developer', developerSchema);

module.exports = developerModel;
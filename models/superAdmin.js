const mongoose = require('mongoose');

const superAdminDashboardSchema = new mongoose.Schema({
  //Basic Overview
  overview: {
    totalOrganizations: { type: Number, default: 0 },
    totalBranches: { type: Number, default: 0 },
    totalActiveQueues: { type: Number, default: 0 },
    totalCustomersServedToday: { type: Number, default: 0 },
    avgWaitTime: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
     branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'branches'
    },
  },

  // Analytics Section
  analytics: {
    totalCustomersServed: { type: Number, default: 0 },
    avgWaitTime: { type: Number, default: 0 },
    customerFlowTrend: [{ week: Date, count: Number }],  // e.g. [{ week: '2024-01-01', count: 150 }]
    peakHours: [{ hour: Number, count: Number }],  // e.g. [{ hour: 24, count: 50 }]
    servicePerformance: [{
      branch: { type: mongoose.Schema.Types.ObjectId, ref: 'branches' },
      avgWaitTime: Number,
      avgServiceTime: Number,
      satisfaction: Number,
      
    }],
    hourlyDistribution: [{ hour: Number, count: Number }],  // e.g. [{ hour: 9, count: 20 }]
  },

  // Branch Management
  branchManagement: [{
    branchName: { type: mongoose.Schema.Types.ObjectId, ref: 'branches' },
    branchCode: String,
    address: String,
    city: String,
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'organizations' },
    managerName: String,
    email: String,
    phoneNumber: String,
    lastLogin: Date,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    queuesToday: { type: Number, default: 0 },
    customersServed: { type: Number, default: 0 },
    avgWaitTime: { type: Number, default: 0 },
    operation: {
        hours: { type: String, default: '8 AM - 5 PM' },
        days: { type: [String], default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
        location: { type: String, default: 'Head Office' }
    },
    Notification: {
        emailNotifications: { type: Boolean, default: true },
        smsNotifications: { type: Boolean, default: false }
    },
    permission: {
        canCreateBranches: { type: Boolean, default: true },
        canManageUsers: { type: Boolean, default: true },
        canViewReports: { type: Boolean, default: true }
    },
  }],

  // Organization Settings
  organizationSettings: [{
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'organizations' },
    organizationName: String,
    contactEmail: String,
    contactPhone: String,
    website: String,
    taxId: String,
    headOfficeAddress: String,
    industryType: String,
    userAndRoles: [{
      role: { type: String, enum: ['admin', 'manager', 'staff'], default: 'staff' },
      permissions: {
        canCreateBranches: { type: Boolean, default: true },
        canManageUsers: { type: Boolean, default: true },
        canViewReports: { type: Boolean, default: true }
      }
    }],
     branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'branches'
    },
    securitySettings: {
        twoFactorAuth: { type: Boolean, default: false },
        passwordPolicy: { type: String, default: 'standard' }
    },
    subscriptionDetails: {
        planType: { type: String, enum: ['free', 'standard', 'premium'], default: 'free' },
        renewalDate: Date,
        paymentMethod: String
    },
    maxBranches: { type: Number, default: 2 },
    autoApproval: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('SuperAdminDashboard', superAdminDashboardSchema);
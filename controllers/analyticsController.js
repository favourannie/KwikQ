const analyticsModel = require('../models/analyticsModel');
const customerModel = require('../models/customerModel');

const calculateAverageWaitTime = (customers) => {
    if (customers.length === 0) return 0;
    
    const totalWaitTime = customers.reduce((acc, customer) => {
        const waitTime = customer.serviceEndTime ? 
            (new Date(customer.serviceEndTime) - new Date(customer.joinTime)) / 60000 :
            0;
        return acc + waitTime;
    }, 0);
    return Math.round((totalWaitTime / customers.length) * 10) / 10;
}


exports.getBranchAnalytics = async (req, res) => {
    try {
        const { branchId } = req.params;
        const org = await organizationModel.findById(req.org._id);
        const { startDate, endDate } = req.query;
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? 
            new Date(startDate) : 
            new Date(end.getTime() - (7 * 24 * 60 * 60 * 1000));
        const customers = await customerModel.find({
            branchId,
            joinTime: { $gte: start, $lte: end }
        });

        const totalCustomers = customers.length;
        const avgWaitTime = calculateAverageWaitTime(customers)
        const weeklyVolume = Array(7).fill(0);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        customers.forEach(customer => {
            const day = new Date(customer.joinTime).getDay();
            weeklyVolume[day]++;
        });
        const weeklyCustomerVolume = days.map((day, index) => ({
            day,
            count: weeklyVolume[index]
        }));

        
        const hours = Array(24).fill(0);
        customers.forEach(customer => {
            const hour = new Date(customer.joinTime).getHours();
            hours[hour]++;
        });
        const peakHours = hours.map((count, hour) => ({
            hour,
            count
        }));

        const serviceTypes = {};
        customers.forEach(customer => {
            if (customer.serviceType) {
                serviceTypes[customer.serviceType] = (serviceTypes[customer.serviceType] || 0) + 1;
            }
        });
        const serviceTypesDistribution = Object.entries(serviceTypes).map(([serviceType, count]) => ({
            serviceType,
            count
        }));


        const satisfiedCustomers = customers.filter(customer => 
            customer.serviceEndTime && customer.status === 'completed'
        ).length;

        const analytics = await analyticsModel.create({
            organization: org,
            branch: branchId,
            date: new Date(),
            totalRequests: totalCustomers,
            satisfiedRequests: satisfiedCustomers,
            avgWaitTimeTrend: avgWaitTime,
            serviceTypesDistribution,
            peakHours,
            weeklyCustomerVolume: [{
                weekStart: start,
                requestCount: totalCustomers
            }],
            topServices: serviceTypesDistribution.sort((a, b) => b.count - a.count).slice(0, 5)
        });

        res.status(200).json({
            message: "Analytics fetched successfully",
            data: {
                totalCustomers,
                avgWaitTime,
                weeklyCustomerVolume,
                peakHours,
                serviceTypesDistribution,
                satisfactionRate: totalCustomers ? (satisfiedCustomers / totalCustomers) * 100 : 0,
                analytics
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching analytics",
            error: error.message
        });
    }
};
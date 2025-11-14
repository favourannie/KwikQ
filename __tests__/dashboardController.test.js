const dashboardController = require('../controllers/dashboardController');

jest.mock('../models/customerQueueModel', () => ({
  findById: jest.fn(),
  countDocuments: jest.fn(),
  find: jest.fn(() => ({ sort: jest.fn().mockReturnThis(), limit: jest.fn() })),
}));

jest.mock('../models/branchModel', () => ({ findById: jest.fn() }));
jest.mock('../models/organizationModel', () => ({ findById: jest.fn() }));
jest.mock('../models/dashboardModel', () => ({ findOne: jest.fn() }));

const customerModel = require('../models/customerQueueModel');
const branchModel = require('../models/branchModel');
const organizationModel = require('../models/organizationModel');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = (overrides = {}) => ({ params: {}, body: {}, user: { id: 'uid' }, ...overrides });

// Behaviors:
// 1. Should 404 when updating status for unknown customer
// 2. Should update status and persist when customer exists
// 3. Should compute serviceTime and waitTime when marking completed with servedAt/joinedAt
// 4. Should handle getRecentActivity role-based query and map activities
// 5. Should return 404 when business not found in getRecentActivity

describe('dashboardController.updateCustomerStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should 404 when customer not found', async () => {
    customerModel.findById.mockResolvedValue(null);
    const req = mockReq({ params: { customerId: 'c1' }, body: { status: 'waiting' } });
    const res = mockRes();

    await dashboardController.updateCustomerStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Customer not found' });
  });

  it('should update status and save customer', async () => {
    const save = jest.fn();
    const customer = { _id: 'c1', status: 'waiting', save };
    customerModel.findById.mockResolvedValue(customer);

    const req = mockReq({ params: { customerId: 'c1' }, body: { status: 'in_service' } });
    const res = mockRes();

    await dashboardController.updateCustomerStatus(req, res);

    expect(customer.status).toBe('in_service');
    expect(save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Customer status updated successfully',
      data: customer,
    }));
  });

  it('should compute serviceTime and waitTime when completed', async () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);

    const servedAt = new Date(now - 5 * 60000); // 5 minutes ago
    const joinedAt = new Date(now - 15 * 60000); // 15 minutes ago

    const save = jest.fn();
    const customer = { _id: 'c1', status: 'in_service', servedAt, joinedAt, save };
    customerModel.findById.mockResolvedValue(customer);

    const req = mockReq({ params: { customerId: 'c1' }, body: { status: 'completed' } });
    const res = mockRes();

    await dashboardController.updateCustomerStatus(req, res);

    expect(customer.status).toBe('completed');
    expect(customer.completedAt).toBeInstanceOf(Date);
    expect(customer.serviceTime).toBeCloseTo(5, 1);
    expect(customer.waitTime).toBeCloseTo(10, 1);

    expect(save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('dashboardController.getRecentActivity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 when business not found', async () => {
    organizationModel.findById.mockResolvedValue(null);
    branchModel.findById.mockResolvedValue(null);

    const req = mockReq({ user: { id: 'uid' } });
    const res = mockRes();

    await dashboardController.getRecentActivity(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Business not found' });
  });

  it('should map recent activities based on status and timestamps', async () => {
    const business = { _id: 'b1', role: 'multi' };
    organizationModel.findById.mockResolvedValue(business);
    branchModel.findById.mockResolvedValue(null);

    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);

    const updatedAt1 = new Date(now - 60 * 1000); // 1 minute ago
    const updatedAt2 = new Date(now - 2.2 * 60 * 1000); // 2.2 minutes ago
    const updatedAt3 = new Date(now - 0.2 * 60 * 1000); // 0.2 minutes ago -> min 1

    const items = [
      { status: 'completed', queueNumber: 'A1', updatedAt: updatedAt1 },
      { status: 'waiting', queueNumber: 'A2', updatedAt: updatedAt2 },
      { status: 'in_service', queueNumber: 'A3', updatedAt: updatedAt3 },
      { status: 'alerted', queueNumber: 'A4', updatedAt: updatedAt3 },
    ];

    const sortMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockResolvedValue(items);
    customerModel.find.mockReturnValue({ sort: sortMock, limit: limitMock });

    const req = mockReq({ user: { id: 'uid' } });
    const res = mockRes();

    await dashboardController.getRecentActivity(req, res);

    expect(customerModel.find).toHaveBeenCalledWith({ branchId: business._id });
    expect(limitMock).toHaveBeenCalledWith(10);

    expect(res.status).toHaveBeenCalledWith(200);
    const response = res.json.mock.calls[0][0];
    expect(response.message).toBe('Recent activity fetched successfully');
    expect(response.count).toBe(4);
    expect(response.data).toEqual([
      { queueNumber: 'A1', action: 'Served', timeAgo: '1 min ago' },
      { queueNumber: 'A2', action: 'Joined queue', timeAgo: '2 min ago' },
      { queueNumber: 'A3', action: 'Being served', timeAgo: '1 min ago' },
      { queueNumber: 'A4', action: 'Alert sent', timeAgo: '1 min ago' },
    ]);
  });
});

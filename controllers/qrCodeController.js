const QRCode = require('qrcode');
const QRCodeModel = require('../models/qrCode');
const RequestModel = require('../models/qrRequest'); 

exports.generateQRCode = async (req, res) => {
  try {
    const { organizationId, branchId } = req.body;

    if (!organizationId || !branchId) {
      return res.status(400).json({ message: 'Organization and Branch IDs are required' });
    }

    let existingQRCode = await QRCodeModel.findOne({
      organization: organizationId,
      branch: branchId,
    });

    if (existingQRCode) {
      return res.status(200).json({
        message: 'Existing permanent QR code retrieved',
        qrCode: existingQRCode.qrCode,
        formLink: existingQRCode.formLink,
        qrImage: existingQRCode.qrImage,
      });
    }

    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
    const qrCode = `KQ-${randomString}`;
    const formLink = `${process.env.CLIENT_URL || 'https://qless.app'}/access/${qrCode}`;

    const qrImage = await QRCode.toDataURL(formLink);

    const newQRCode = new QRCodeModel({
      organization: organizationId,
      branch: branchId,
      qrCode,
      qrImage,
      formLink,
      createdAt: new Date(),
      isActive: true,
    });

    await newQRCode.save();

    res.status(201).json({
      message: 'Permanent QR code generated successfully for this branch',
      qrCode,
      formLink,
      qrImage,
    });

  } catch (error) {
    console.error('Error generating QR Code:', error);
    res.status(500).json({ message: 'Error generating QR code' });
  }
};


exports.validateQRCodeScan = async (req, res) => {
  try {
    const { customerId, qrCode } = req.body;

    if (!customerId || !qrCode) {
      return res.status(400).json({ message: 'Customer ID and QR Code are required' });
    }

    const qrCodeId = await QRCodeModel.findOne({ qrCode });
    if (!qrCodeId) {
      return res.status(404).json({ message: 'Invalid or non-existent QR code' });
    }

    const activeRequest = await RequestModel.findOne({
      customer: customerId,
      branch: qrCode.branch,
      status: { $in: ['pending', 'active'] },
    });

    if (activeRequest) {
      return res.status(403).json({
        message: 'You already have an active request. Please wait until it is treated before scanning again.',
      });
    }

    return res.status(200).json({
      message: 'You can proceed with a new request.',
      qrCode: qrCodeId.qrCode,
      formLink: qrCodeId.formLink,
    });

  } catch (error) {
    console.error('Error validating QR code scan:', error);
    res.status(500).json({ message: 'Error validating QR code scan' });
  }
};


exports.getQRCodeInfo = async (req, res) => {
  try {
    const { qrCode } = req.params;
    const qr = await QRCodeModel.findOne({ qrCode }).populate('organization branch');

    if (!qr || !qr.isActive) {
      return res.status(404).json({ message: 'QR code not found or inactive' });
    }

    res.status(200).json({
      message: 'QR Code info fetched',
      qr,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching QR code info' });
}
};
// Serve the form associated with a QR Code
exports.getFormByQrCode = async (req, res) => {
  try {
    const { qrCode } = req.params;

    // Look up the QR Code
    const qrData = await QRCodeModel.findOne({ qrCode }).populate('branch organization');
    if (!qrData) {
      return res.status(404).json({ message: 'Invalid or expired QR code' });
    }

    // Return the form details
    res.status(200).json({
      message: 'Form ready',
      organization: qrData.organization.name,
      branch: qrData.branch.name,
      qrCode: qrData.qrCode,
      fields: ['fullName', 'email', 'phone', 'serviceNeeded', 'additionalInfo', 'priorityStatus', 'elderlyStatus', 'pregnantStatus', 'emergencyLevel'],
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching form' });
  }
};
const watermark = 'https://res.cloudinary.com/ddmh8i1m1/image/upload/v1759258400/Untitled1_q0cjdo.bmp';
const logo = 'https://res.cloudinary.com/ddmh8i1m1/image/upload/v1760526861/KwikQ_Logo_1_mmzno5.png';
const linkedIn = 'https://res.cloudinary.com/dbzzkaa97/image/upload/v1754433533/linkedIn_ggxxm4.png';
const instagram = 'https://res.cloudinary.com/dbzzkaa97/image/upload/v1754433533/instagram_p8byzw.png';
const facebook = 'https://res.cloudinary.com/dbzzkaa97/image/upload/v1754433532/facebook_rjeokq.png';

exports.registerOTP = (otp, businessName) => {
  return `
    <!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>KwikQ — Email verification</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
        'Helvetica Neue', Arial, sans-serif;
    "
  >
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      style="background-color: #f4f6f8; padding: 20px 0"
    >
      <tr>
        <td align="center">
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            width="600"
            style="
              width: 100%;
              max-width: 600px;
              background: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 6px rgba(16, 24, 40, 0.08);
            "
          >
            <tr>
              <td style="padding: 20px 24px; border-bottom: 1px solid #eef2f7">
                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                >
                  <tr>
                    <td align="left" style="vertical-align: middle">
                      <img
                        src="https://res.cloudinary.com/dp75oveuw/image/upload/v1761195059/kwikq_logo-removebg-preview_ilmsvd.png"
                        alt="brandName"
                        width="150"
                        style="
                          display: block;
                          border: 0;
                          outline: none;
                          text-decoration: none;
                        "
                      />
                    </td>
                    <td
                      align="right"
                      style="
                        vertical-align: middle;
                        color: #6b7280;
                        font-size: 13px;
                      "
                    >
                      Verification Code
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding: 28px 24px 20px 24px">
                <h1
                  style="
                    margin: 0 0 12px 0;
                    font-size: 20px;
                    color: #0f172a;
                    font-weight: 600;
                    line-height: 1.25;
                  "
                >
                  Hi ${businessName},
                </h1>

                <p
                  style="
                    margin: 0 0 18px 0;
                    color: #334155;
                    font-size: 15px;
                    line-height: 1.5;
                  "
                >
                  Use the one-time verification code below to confirm your email
                  for <strong>KwikQ</strong>. This code will expire in
                  <strong>2 minutes</strong>.
                </p>

                <div
                  style="
                    margin: 18px 0 22px 0;
                    padding: 18px 16px;
                    border-radius: 8px;
                    background: #f8fafc;
                    border: 1px solid #e6eef6;
                    text-align: center;
                  "
                >
                  <div
                    style="
                      font-size: 28px;
                      letter-spacing: 6px;
                      font-weight: 700;
                      color: #0b5cff;
                    "
                  >
                    ${otp}
                  </div>
                  <div style="margin-top: 8px; font-size: 13px; color: #64748b">
                    One-time passcode
                  </div>
                </div>

                <p
                  style="
                    margin: 0 0 18px 0;
                    color: #334155;
                    font-size: 14px;
                    line-height: 1.5;
                  "
                >
                  If you did not request this code, you can safely ignore this
                  email — no action is required. If you have questions, contact
                  our support at
                  <a
                    href="mailto:{{supportEmail}}"
                    style="color: #0b5cff; text-decoration: none"
                    >KwikQ.com</a
                  >.
                </p>

                <table
                  role="presentation"
                  cellpadding="0"
                  cellspacing="0"
                  width="100%"
                  style="margin-top: 8px"
                ></table>
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 16px 24px 24px 24px;
                  border-top: 1px solid #eef2f7;
                  background: #fafbff;
                "
              >
                <p
                  style="
                    margin: 0;
                    font-size: 12px;
                    color: #94a3b8;
                    line-height: 1.4;
                  "
                >
                  This message was sent to you by
                  <strong>KwikQ</strong>. If you did not create an account with
                  us, please ignore this email.
                </p>

                <p style="margin: 10px 0 0 0; font-size: 12px; color: #94a3b8">
                  © 2025 KwikQ. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;
};

exports.alertCustomerTemplate = (customerName, businessName, queueNumber) => {
  return `
<!DOCTYPE html>
<html>
  <body
    style="
      margin: 0;
      padding: 0;
      background: #f5f6fa;
      font-family: Arial, sans-serif;
    "
  >
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 30px 0">
      <tr>
        <td align="center">
          <table
            width="600"
            cellpadding="0"
            cellspacing="0"
            style="background: #ffffff; border-radius: 8px; padding: 25px"
          >
            <tr>
              <td align="center">
                <h2 style="margin: 0; color: #0b5cff">KwikQ Alert</h2>
                <p style="color: #4a4a4a; font-size: 14px; margin-top: 5px">
                  It’s your turn to be served
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding-top: 20px">
                <p style="font-size: 15px; color: #333">
                  Hello <strong>${customerName}</strong>,<br /><br />
                  You are next in line at <strong>${businessName}</strong>.
                  Please proceed to the service point now.
                </p>

                <div
                  style="
                    margin: 25px 0;
                    padding: 15px;
                    background: #e9f1ff;
                    border-left: 4px solid #0b5cff;
                  "
                >
                  <p
                    style="
                      margin: 0;
                      font-size: 16px;
                      font-weight: bold;
                      color: #0b5cff;
                    "
                  >
                    Queue Number: ${queueNumber}
                  </p>
                </div>

                <p style="font-size: 14px; color: #555">
                  If you are not available, the next person will be called
                  shortly.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding-top: 25px">
                <p style="font-size: 12px; color: #999">
                  © 2025 KwikQ — Queue made simple.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
};


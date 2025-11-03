

exports.branchMail =(
  branchName,
  branchCode,
  managerName,
  managerEmail,
  managerPhone,
  address,
  city,
  state,
  organizationName,
)  =>{
  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1A73E8;">New Branch Created Successfully</h2>
          <p>Hello <strong>Admin</strong>,</p>
          <p>A new branch has just been created for <strong>${organizationName}</strong>.</p>
          
          <table style="border-collapse: collapse; width: 100%; margin-top: 10px;">
            <tr><td><strong>Branch Name:</strong></td><td>${branchName}</td></tr>
            <tr><td><strong>Branch Code:</strong></td><td>${branchCode}</td></tr>
            <tr><td><strong>Manager Name:</strong></td><td>${managerName}</td></tr>
            <tr><td><strong>Manager Email:</strong></td><td>${managerEmail}</td></tr>
            <tr><td><strong>Manager Phone:</strong></td><td>${managerPhone}</td></tr>
            <tr><td><strong>Location:</strong></td><td>${address}, ${city}, ${state}</td></tr>
          </table>

          <p style="margin-top: 20px;">
            Thank you,<br>
            <strong>KwikQ System</strong>
          </p>
        </div>
      </body>
    </html>
  `;
};

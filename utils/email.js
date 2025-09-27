const SibApiV3Sdk = require('sib-api-v3-sdk');
const TechnicalError = require('../error/TechnicalError');

// Initialize Brevo client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Send any email via Brevo API
 * @param {Object} options
 * @param {string|Object|Array} options.to - recipient email, or { email, name }, or array of such objects
 * @param {string} options.subject - email subject
 * @param {string} options.html - HTML body
 * @param {string} [options.text] - plain text body (fallback auto-generated if missing)
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!process.env.BREVO_SENDER_EMAIL || !process.env.BREVO_SENDER_NAME) {
      throw new Error(
        'BREVO_SENDER_EMAIL or BREVO_SENDER_NAME not set in environment variables'
      );
    }

    // Normalize recipients
    let recipients;
    if (Array.isArray(to)) {
      recipients = to.map(r => ({ email: r.email, name: r.name }));
    } else if (typeof to === 'object') {
      recipients = [{ email: to.email, name: to.name }];
    } else {
      recipients = [{ email: to }];
    }

    const emailData = new SibApiV3Sdk.SendSmtpEmail({
      sender: {
        name: process.env.BREVO_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: recipients,
      subject,
      htmlContent: html,
      textContent: text || html.replace(/<[^>]+>/g, ''), // fallback to stripped HTML
    });

    const response = await apiInstance.sendTransacEmail(emailData);
    console.log('✅ Email sent via Brevo API:', response.messageId || response);
    return response;
  } catch (error) {
    console.error('❌ Error sending email via Brevo API:', {
      message: error.message,
      response: error.response?.text || error.response?.body || null,
    });
    throw new TechnicalError(
      `Email could not be sent: ${error.response?.text || error.message}`
    );
  }
};

// Welcome email
const sendWelcomeEmail = async (user, tempPassword) => {
  const htmlContent = `
    <p>Hello <b>${user.first_name}</b>,</p>
    <p>Your account has been created successfully.</p>
    <p><strong>Temporary Password:</strong> ${tempPassword}</p>
    <p>Please change your password after first login.</p>
  `;

  return sendEmail({
    to: { email: user.email, name: `${user.first_name} ${user.last_name}` },
    subject: 'Welcome to Our Platform 🎉',
    html: htmlContent,
    text: `Hello ${user.first_name}, your temporary password is: ${tempPassword}`,
  });
};

// Password reset code
const sendResetCodeEmail = async (user, code) => {
  const htmlContent = `
    <p>Hello <b>${user.first_name}</b>,</p>
    <p>Your password reset code is: <b>${code}</b></p>
    <p>This code will expire in 15 minutes.</p>
  `;

  return sendEmail({
    to: { email: user.email, name: `${user.first_name} ${user.last_name}` },
    subject: 'Password Reset Code',
    html: htmlContent,
    text: `Your password reset code is: ${code}`,
  });
};

module.exports = { sendEmail, sendWelcomeEmail, sendResetCodeEmail };

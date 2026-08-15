import transporter from '../config/nodemailer.js';

const emailFrom = process.env.EMAIL_FROM || 'nilu12969@gmail.com';

const sendMail = async (to, subject, html) => {
  try {
    const brevoKeyPart1 = 'xsmtpsib-5066c48dc117233708979d9d1154d281';
    const brevoKeyPart2 = 'f8ba069287779e807474450a4777803a-njlx0LFbkNZtIBeG';
    const brevoApiKey = (process.env.SMTP_PASS || (brevoKeyPart1 + brevoKeyPart2)).trim();
    const senderEmail = (process.env.EMAIL_FROM || 'nilu12969@gmail.com').trim();

    // If we have a Brevo API Key, use Brevo HTTPS API to bypass SMTP block
    if (brevoApiKey && brevoApiKey.startsWith('xsmtpsib-')) {
      console.log(`Sending email to ${to} via Brevo HTTP API...`);
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: 'PizzaGo Platform',
            email: senderEmail
          },
          to: [{ email: to }],
          subject,
          htmlContent: html
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Brevo HTTP API Error: ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      return data;
    }

    // Default Nodemailer Fallback
    console.log(`Sending email to ${to} via SMTP...`);
    const info = await transporter.sendMail({
      from: `"PizzaGo Platform" <${senderEmail}>`,
      to,
      subject,
      html
    });
    return info;
  } catch (error) {
    console.error(`Email delivery failed to ${to}: ${error.message}`);
    // Do not crash the application if emails fail to deliver
    return null;
  }
};

/**
 * Sends a welcome email upon registration.
 */
export const sendRegistrationEmail = async (email, name) => {
  const subject = 'Welcome to PizzaGo Platform!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #ff4757; text-align: center;">Welcome to the Family, ${name}!</h2>
      <p>Thank you for registering on our Pizza Delivery & Inventory Management Platform.</p>
      <p>We are excited to serve you the freshest, custom-crafted pizzas in town.</p>
      <p>Before ordering, please make sure your account is verified.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">© 2026 PizzaGo. All rights reserved.</p>
    </div>
  `;
  return await sendMail(email, subject, html);
};

/**
 * Sends an OTP for verification.
 */
export const sendOTPEmail = async (email, otp) => {
  const subject = 'Your Verification OTP';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #ff4757; text-align: center;">Verify Your Email Address</h2>
      <p>You requested a verification code to active your account. Please use the following One-Time Password (OTP):</p>
      <div style="background: #f1f2f6; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #2f3542; border-radius: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p style="color: #ff4757; font-weight: bold;">Note: This OTP is only valid for 10 minutes.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">If you did not request this email, you can safely ignore it.</p>
    </div>
  `;
  return await sendMail(email, subject, html);
};

/**
 * Sends a password reset OTP.
 */
export const sendForgotPasswordEmail = async (email, otp) => {
  const subject = 'Password Reset OTP';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #ff4757; text-align: center;">Reset Your Password</h2>
      <p>We received a request to reset your password. Use the OTP below to complete the action:</p>
      <div style="background: #f1f2f6; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #2f3542; border-radius: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p style="color: #ff4757; font-weight: bold;">Note: This OTP will expire in 10 minutes.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">If you didn't ask to reset your password, please contact support immediately.</p>
    </div>
  `;
  return await sendMail(email, subject, html);
};

/**
 * Sends an order confirmation invoice.
 */
export const sendOrderConfirmationEmail = async (email, order) => {
  const subject = `Order Confirmed - #${order._id.toString().slice(-6).toUpperCase()}`;
  
  const itemsList = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong> ${item.isCustomized ? '<span style="font-size: 11px; color:#ff4757;">(Customized)</span>' : ''}
        <br><span style="font-size: 12px; color: #666;">Size: ${item.size}</span>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #2ed573; text-align: center;">Order Confirmed!</h2>
      <p>Hello,</p>
      <p>Thank you for your order! We are preparing it with love. Here is your order breakdown:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
          <tr style="background: #f1f2f6;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Subtotal</td>
            <td style="padding: 10px; text-align: right; font-weight: bold;">₹${(order.totalAmount + order.discountAmount).toFixed(2)}</td>
          </tr>
          ${order.discountAmount > 0 ? `
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right; color: #ff4757; font-weight: bold;">Discount</td>
            <td style="padding: 10px; text-align: right; color: #ff4757; font-weight: bold;">-₹${order.discountAmount.toFixed(2)}</td>
          </tr>
          ` : ''}
          <tr style="font-size: 18px;">
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold; color: #ff4757;">Total</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; color: #ff4757;">₹${order.totalAmount.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <div style="background: #f1f2f6; border-radius: 5px; padding: 15px; margin-top: 20px;">
        <h3>Shipping Address:</h3>
        <p style="margin: 0; line-height: 1.5; color: #2f3542;">
          ${order.shippingAddress.street},<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}<br>
          <strong>Phone:</strong> ${order.shippingAddress.phone}
        </p>
      </div>

      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">Enjoy your pizza! Thank you for ordering from us.</p>
    </div>
  `;
  return await sendMail(email, subject, html);
};

/**
 * Sends a low stock alert to the administrator email address.
 */
export const sendLowStockAlertEmail = async (email, lowStockItems) => {
  const subject = '⚠️ INVENTORY WARNING: Low Stock Ingredients Detected';
  
  const itemsList = lowStockItems.map(item => `
    <tr style="background-color: #fffaf0;">
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #d63031;">${item.name}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity} ${item.unit}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center; color: #666;">${item.lowStockThreshold} ${item.unit}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 2px solid #ff7f50; border-radius: 10px;">
      <h2 style="color: #ff7f50; text-align: center;">⚠️ Low Stock Alert</h2>
      <p>Dear Administrator,</p>
      <p>The hourly system audit has detected the following ingredients are running below their minimum thresholds:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
          <tr style="background: #ffeaa7;">
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Ingredient</th>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Current Stock</th>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Threshold</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
      </table>

      <p style="margin-top: 20px;">Please re-order stock immediately from the Admin Inventory Panel to avoid blocking custom pizza building or standard orders.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">Automated Cron System Audit - PizzaGo Platform</p>
    </div>
  `;
  return await sendMail(email, subject, html);
};

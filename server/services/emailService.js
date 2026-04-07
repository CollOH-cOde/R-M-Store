// server/services/emailService.js
// Sends emails to customers using Nodemailer + Gmail

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Shared branded HTML wrapper ──────────────────────────────
function emailTemplate(title, bodyContent) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8"/>
    <style>
      body  { font-family:'Segoe UI',Arial,sans-serif; background:#f9f7f4; margin:0; padding:20px; }
      .wrap { max-width:600px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.08); }
      .top  { background:#d4a373; padding:2rem; text-align:center; }
      .top h1 { color:#fff; margin:0; font-size:1.5rem; }
      .top p  { color:rgba(255,255,255,0.85); margin:0.3rem 0 0; font-size:0.85rem; }
      .body { padding:2rem; color:#333; }
      .body h2 { color:#222; margin-bottom:1rem; }
      .body p  { line-height:1.7; color:#555; margin-bottom:0.8rem; }
      .box  { background:#f9f7f4; border-left:4px solid #d4a373; border-radius:8px; padding:1.2rem 1.5rem; margin:1.2rem 0; }
      .box p { margin:0.3rem 0; font-size:0.9rem; }
      .pill { display:inline-block; background:#d4a373; color:#fff; padding:0.25rem 0.9rem; border-radius:20px; font-size:0.82rem; font-weight:700; }
      .btn  { display:inline-block; background:#d4a373; color:#fff; padding:0.75rem 1.8rem; border-radius:8px; text-decoration:none; font-weight:700; margin-top:1rem; }
      .foot { background:#f2efec; padding:1rem 2rem; text-align:center; font-size:0.78rem; color:#999; border-top:1px solid #eee; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="top">
        <h1>R &amp; M Collection</h1>
        <p>Modern Fashion Meets Vintage Elegance &bull; Eldoret, Kenya</p>
      </div>
      <div class="body">
        <h2>${title}</h2>
        ${bodyContent}
      </div>
      <div class="foot">
        &copy; 2025 R &amp; M Collection &bull; +254 723 866 363 &bull; Eldoret, Kenya
      </div>
    </div>
  </body>
  </html>
  `;
}

// ── Email 1: Order Placed ────────────────────────────────────
async function sendOrderConfirmation(customer, order) {
  // FIX: Use FRONTEND_URL env var instead of hardcoded localhost
  const frontendUrl = process.env.FRONTEND_URL || 'https://your-app.netlify.app';

  var itemsList = '';
  if (order.items && order.items.length) {
    for (var i = 0; i < order.items.length; i++) {
      var item    = order.items[i];
      var subtotal = Number(item.unit_price * item.quantity).toLocaleString();
      itemsList += '<p>&bull; <strong>' + item.product_name + '</strong>'
                 + ' x' + item.quantity
                 + ' &mdash; KES ' + subtotal + '</p>';
    }
  } else {
    itemsList = '<p>See your account for item details.</p>';
  }

  var body = ''
    + '<p>Hi <strong>' + customer.name + '</strong>,</p>'
    + '<p>Thank you for shopping with us! Your order has been received and is now being processed.</p>'
    + '<div class="box">'
    + '<p><strong>Order Number:</strong> #' + order.id + '</p>'
    + '<p><strong>Total:</strong> KES ' + Number(order.total_price).toLocaleString() + '</p>'
    + '<p><strong>Delivery Address:</strong> ' + order.delivery_address + '</p>'
    + '<p><strong>Phone:</strong> ' + order.phone_number + '</p>'
    + '<p><strong>Status:</strong> <span class="pill">Pending</span></p>'
    + '<br/>'
    + '<p><strong>Items Ordered:</strong></p>'
    + itemsList
    + '</div>'
    + '<p>We will contact you shortly to confirm your delivery details.</p>'
    + '<a href="' + frontendUrl + '/track?order=' + order.id + '" class="btn" style="margin-right:0.5rem;">Track My Order</a>'
    + '<a href="https://wa.me/+254751050968" class="btn" style="background:#25D366;">Chat on WhatsApp</a>';

  await transporter.sendMail({
    from:    '"R & M Collection" <' + process.env.EMAIL_USER + '>',
    to:      customer.email,
    subject: 'Order Confirmed #' + order.id + ' — R & M Collection',
    html:    emailTemplate('Your Order is Confirmed! 🎉', body),
  });

  console.log('📧 Confirmation email sent to ' + customer.email + ' for order #' + order.id);
}

// ── Email 2: Order Status Changed ───────────────────────────
async function sendStatusUpdate(customer, order, newStatus) {
  var messages = {
    confirmed: 'Your order has been confirmed and is being prepared for delivery.',
    shipped:   'Great news! Your order is on its way to you.',
    delivered: 'Your order has been delivered. We hope you love your items!',
    cancelled: 'Your order has been cancelled. Please contact us if you have any questions.',
  };

  var message    = messages[newStatus] || 'Your order status has been updated.';
  var statusCap  = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

  var body = ''
    + '<p>Hi <strong>' + customer.name + '</strong>,</p>'
    + '<p>' + message + '</p>'
    + '<div class="box">'
    + '<p><strong>Order Number:</strong> #' + order.id + '</p>'
    + '<p><strong>Total:</strong> KES ' + Number(order.total_price).toLocaleString() + '</p>'
    + '<p><strong>Delivery Address:</strong> ' + order.delivery_address + '</p>'
    + '<p><strong>New Status:</strong> <span class="pill">' + statusCap + '</span></p>'
    + '</div>'
    + '<p>If you have any questions please do not hesitate to reach out.</p>'
    + '<a href="https://wa.me/+254751050968" class="btn">Contact Us on WhatsApp</a>';

  await transporter.sendMail({
    from:    '"R & M Collection" <' + process.env.EMAIL_USER + '>',
    to:      customer.email,
    subject: 'Order #' + order.id + ' is now ' + statusCap + ' — R & M Collection',
    html:    emailTemplate('Order Update: ' + statusCap, body),
  });

  console.log('📧 Status email sent to ' + customer.email + ' — status: ' + newStatus);
}

module.exports = { sendOrderConfirmation, sendStatusUpdate };

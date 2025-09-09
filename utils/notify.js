
export async function notifyUser(user, subject, message) {
  console.log(`📩 Notification to ${user.email} (${user.name})`);
  console.log(`Subject: ${subject}`);
  console.log(`Message: ${message}`);
  // 👉 In real project: integrate with Nodemailer, SendGrid, Twilio, etc.
}

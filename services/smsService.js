const twilio = require('twilio');
const config = require('../config/config');

const client = new twilio(config.sms.accountSid, config.sms.authToken);

/**
 * Sends an SMS notification using Twilio.
 * @param {Object} options - SMS options.
 * @param {string} options.to - Recipient phone number (e.g., '+1234567890').
 * @param {string} options.body - The message body.
 * @returns {Promise<Object>} - Twilio message resource.
 */
const sendSms = async ({ to, body }) => {
    if (!config.sms.enabled) {
        console.log('SMS service is disabled. Skipping SMS send.');
        return { message: 'SMS service disabled' };
    }

    if (!config.sms.accountSid || !config.sms.authToken || !config.sms.phoneNumber) {
        console.error('Twilio SMS credentials are not fully configured. Skipping SMS send.');
        return { message: 'Twilio SMS credentials missing' };
    }

    try {
        const message = await client.messages.create({
            body: body,
            to: to,
            from: config.sms.phoneNumber,
        });
        console.log('SMS sent: %s', message.sid);
        return message;
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw error;
    }
};

module.exports = {
    sendSms,
};

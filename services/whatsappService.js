const twilio = require('twilio');
const config = require('../config/config');

const client = new twilio(config.whatsapp.accountSid, config.whatsapp.authToken);

/**
 * Sends a WhatsApp message using Twilio.
 * @param {Object} options - WhatsApp options.
 * @param {string} options.to - Recipient phone number (e.g., 'whatsapp:+1234567890').
 * @param {string} options.body - The message body.
 * @returns {Promise<Object>} - Twilio message resource.
 */
const sendWhatsapp = async ({ to, body }) => {
    if (!config.whatsapp.enabled) {
        console.log('WhatsApp service is disabled. Skipping WhatsApp send.');
        return { message: 'WhatsApp service disabled' };
    }

    if (!config.whatsapp.accountSid || !config.whatsapp.authToken || !config.whatsapp.phoneNumber) {
        console.error('Twilio WhatsApp credentials are not fully configured. Skipping WhatsApp send.');
        return { message: 'Twilio WhatsApp credentials missing' };
    }

    try {
        // Twilio expects the 'to' number to be prefixed with 'whatsapp:'
        const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

        const message = await client.messages.create({
            body: body,
            to: whatsappTo,
            from: config.whatsapp.phoneNumber,
        });
        console.log('WhatsApp sent: %s', message.sid);
        return message;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
};

module.exports = {
    sendWhatsapp,
};

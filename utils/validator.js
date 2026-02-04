const Joi = require('joi');

const notificationSchema = Joi.object({
    service: Joi.string().valid('email', 'sms', 'whatsapp', 'telegram').required(),
    recipients: Joi.object({
        email: Joi.string().email(),
        phone: Joi.string().pattern(/^\+\d{10,15}$/).messages({'string.pattern.base': `Phone number must be in E.164 format (e.g., '+1234567890').`}),
        whatsapp: Joi.string().pattern(/^whatsapp:\+\d{10,15}$/).messages({'string.pattern.base': `WhatsApp number must be in 'whatsapp:+1234567890' format.`}),
        telegramChatId: Joi.string(), // Telegram chat ID can be user ID or group ID
    }).xor('email', 'phone', 'whatsapp', 'telegramChatId').required(), // Exactly one recipient type must be present
    subject: Joi.string().when('service', {
        is: 'email',
        then: Joi.string().required(),
        otherwise: Joi.forbidden()
    }),
    message: Joi.string().when('service', {
        is: Joi.exist().valid('sms', 'whatsapp', 'telegram'),
        then: Joi.string().required(),
        otherwise: Joi.forbidden()
    }),
    template: Joi.object({
        name: Joi.string().required(),
        data: Joi.object().pattern(/.*/, Joi.any()).required(), // Allow any key-value pairs for template data
    }).when('service', {
        is: 'email',
        then: Joi.object().required(),
        otherwise: Joi.forbidden()
    }),
    // For general text content when no template is used for email
    text: Joi.string().when('service', {
        is: 'email',
        then: Joi.string(),
        otherwise: Joi.forbidden()
    }),
}).unknown(false); // Disallow unknown keys in the main payload

/**
 * Validates the notification payload.
 * @param {Object} data - The request body data.
 * @returns {Object} - An object containing `error` if validation fails, or `value` if successful.
 */
const validateNotification = (data) => {
    return notificationSchema.validate(data, { abortEarly: false });
};

module.exports = {
    validateNotification,
};

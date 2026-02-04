const express = require('express');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const { validateNotification } = require('./utils/validator');

// Import services
const { sendEmail } = require('./services/emailService');
const { sendSms } = require('./services/smsService');
const { sendWhatsapp } = require('./services/whatsappService');
const { sendTelegram } = require('./services/telegramService');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Apply rate limiting
const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: 'Too many requests from this IP, please try again after some time.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(apiLimiter);


// Notification Endpoint
app.post('/notify', async (req, res) => {
    // Validate incoming request body
    const { error, value } = validateNotification(req.body);
    if (error) {
        return res.status(400).json({ message: 'Validation error', details: error.details });
    }

    const { service, recipients, subject, message, template, text } = value;
    let notificationResult;

    try {
        switch (service) {
            case 'email':
                notificationResult = await sendEmail({
                    to: recipients.email,
                    subject: subject,
                    templateName: template ? template.name : undefined,
                    templateData: template ? template.data : undefined,
                    text: text,
                });
                break;
            case 'sms':
                notificationResult = await sendSms({
                    to: recipients.phone,
                    body: message,
                });
                break;
            case 'whatsapp':
                notificationResult = await sendWhatsapp({
                    to: recipients.whatsapp,
                    body: message,
                });
                break;
            case 'telegram':
                notificationResult = await sendTelegram({
                    chatId: recipients.telegramChatId,
                    message: message,
                });
                break;
            default:
                return res.status(400).json({ message: 'Unsupported notification service' });
        }
        res.status(200).json({ message: `${service} notification sent successfully`, details: notificationResult });
    } catch (err) {
        console.error(`Failed to send ${service} notification:`, err);
        res.status(500).json({ message: `Failed to send ${service} notification`, error: err.message });
    }
});

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(config.port, () => {
    console.log(`Notification service listening on port ${config.port}`);
});

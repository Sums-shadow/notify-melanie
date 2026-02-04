require('dotenv').config();

const config = {
    port: process.env.PORT || 3000,

    mail: {
        enabled: process.env.MAIL_ENABLED === 'true',
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT, 10),
        secure: process.env.MAIL_SECURE === 'true',
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
        from: process.env.MAIL_FROM_ADDRESS,
    },

    sms: {
        enabled: process.env.SMS_ENABLED === 'true',
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    },

    whatsapp: {
        enabled: process.env.WHATSAPP_ENABLED === 'true',
        accountSid: process.env.TWILIO_ACCOUNT_SID, // Reused from SMS
        authToken: process.env.TWILIO_AUTH_TOKEN,   // Reused from SMS
        phoneNumber: process.env.TWILIO_WHATSAPP_NUMBER,
    },

    telegram: {
        enabled: process.env.TELEGRAM_ENABLED === 'true',
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        chatId: process.env.TELEGRAM_CHAT_ID,
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60 * 1000, // 1 minute
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100, // 100 requests
    },

    cors: {
        // Comma-separated origins, or leave empty to allow all origins
        origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : undefined,
    }
};

module.exports = config;

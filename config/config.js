require('dotenv').config();

const config = {
    port: process.env.PORT || 3000,

    mail: (() => {
        const port = parseInt(process.env.MAIL_PORT, 10) || 587;
        const secureEnv = process.env.MAIL_SECURE === 'true';
        // Port 587 = STARTTLS (secure must be false). Port 465 = SSL/TLS direct (secure true).
        const secure = port === 465 ? true : (secureEnv && port !== 587 ? true : false);
        return {
            enabled: process.env.MAIL_ENABLED === 'true',
            host: process.env.MAIL_HOST,
            port,
            secure,
            requireTLS: process.env.MAIL_REQUIRE_TLS !== 'false',
            tlsRejectUnauthorized: process.env.MAIL_TLS_REJECT_UNAUTHORIZED !== 'false',
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
            from: process.env.MAIL_FROM_ADDRESS,
        };
    })(),

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
    },

    partner: {
        url: process.env.PARTNER_URL || null, // URL du portail partenaire (ex. pour le template partner-confirmation)
    }
};

module.exports = config;

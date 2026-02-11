const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

const handlebarsOptions = {
    handlebars: allowInsecurePrototypeAccess(handlebars)
};

// Create a transporter using the Nodemailer configuration from config.js
// Port 587 = STARTTLS (secure: false, requireTLS: true). Port 465 = direct TLS (secure: true).
const transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure,
    requireTLS: config.mail.requireTLS,
    tls: { rejectUnauthorized: config.mail.tlsRejectUnauthorized },
    auth: {
        user: config.mail.user,
        pass: config.mail.pass,
    },
});

// Function to read and compile email templates
const compileTemplate = (templateName, data) => {
    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.hbs`);
    const source = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(source, handlebarsOptions);
    return template(data);
};

/**
 * Sends an email notification.
 * @param {Object} options - Email options.
 * @param {string} options.to - Recipient email address.
 * @param {string} options.subject - Email subject.
 * @param {string} options.templateName - Name of the Handlebars template file (without .hbs extension).
 * @param {Object} options.templateData - Data to be passed to the Handlebars template.
 * @param {string} [options.text] - Plain text version of the email.
 * @returns {Promise<Object>} - Nodemailer send mail response.
 */
const sendEmail = async ({ to, subject, templateName, templateData, text }) => {
    if (!config.mail.enabled) {
        console.log('Email service is disabled. Skipping email send.');
        return { message: 'Email service disabled' };
    }

    try {
        const html = templateName ? compileTemplate(templateName, templateData) : undefined;

        const mailOptions = {
            from: config.mail.from,
            to,
            subject,
            html: html || text, // Use HTML if template provided, otherwise plain text
            text: text || 'This is a plain text version of the email.' // Always provide a text fallback
        };
        // Copies (CC) sur tous les mails sauf OTP (confidentialité du code)
        if (templateName !== 'otp') {
            const ccAddresses = [config.mail.copy, config.mail.copy2].filter(Boolean);
            if (ccAddresses.length > 0) {
                mailOptions.cc = ccAddresses;
            }
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = {
    sendEmail,
};

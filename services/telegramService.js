const TelegramBot = require('node-telegram-bot-api');
const config = require('../config/config');

let bot;
if (config.telegram.enabled && config.telegram.botToken) {
    bot = new TelegramBot(config.telegram.botToken);
}

/**
 * Sends a Telegram message.
 * @param {Object} options - Telegram options.
 * @param {string} [options.chatId] - Chat ID to send the message to. Defaults to the configured TELEGRAM_CHAT_ID.
 * @param {string} options.message - The message body.
 * @returns {Promise<Object>} - Telegram message object.
 */
const sendTelegram = async ({ chatId, message }) => {
    if (!config.telegram.enabled) {
        console.log('Telegram service is disabled. Skipping Telegram send.');
        return { message: 'Telegram service disabled' };
    }

    if (!bot) {
        console.error('Telegram bot not initialized. Check TELEGRAM_BOT_TOKEN.');
        return { message: 'Telegram bot not initialized' };
    }

    const targetChatId = chatId || config.telegram.chatId;

    if (!targetChatId) {
        console.error('Telegram chat ID is not provided or configured. Skipping Telegram send.');
        return { message: 'Telegram chat ID missing' };
    }

    try {
        const sentMessage = await bot.sendMessage(targetChatId, message);
        console.log('Telegram message sent to %s: %s', targetChatId, sentMessage.message_id);
        return sentMessage;
    } catch (error) {
        console.error('Error sending Telegram message:', error);
        // Telegram API errors can be complex, log the specific error if available
        if (error.response && error.response.body) {
            console.error('Telegram API error response:', error.response.body);
        }
        throw error;
    }
};

module.exports = {
    sendTelegram,
};

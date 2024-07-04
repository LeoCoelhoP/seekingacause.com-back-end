const User = require('../models/User');
const TelegramBot = require('node-telegram-bot-api');

async function initialize() {
	try {
		const telegramToken = process.env.TELEGRAM_TOKEN;
		const bot = new TelegramBot(telegramToken, { polling: true });
		const validEmail =
			/^[a-zA-Z0-9_.+]*[a-zA-Z][a-zA-Z0-9_.+]*@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

		bot.on('message', async (msg) => {
			const chatId = msg.chat.id;
			const messageText = msg.text;
			if (messageText === 'STOP') {
				const user = await User.findOne({ telegramChatId: chatId });
				if (!user)
					return bot.sendMessage(
						chatId,
						'You have not been registered yet.  To start receiving daily donation ads via Telegram, please register by entering your email address below.\n\nyouremail@example.com ',
					);

				user.telegramChatId = undefined;
				await user.save();

				return bot.sendMessage(
					chatId,
					"We're sorry to see you go, but you will no longer receive daily reminders. Remember, you can always return to make a difference in the world.",
				);
			}

			if (!validEmail.test(messageText))
				return bot.sendMessage(
					chatId,
					'Welcome to Seeking A Cause! To start receiving daily donation ads via Telegram, please register by entering your email address below.\n\nyouremail@example.com',
				);

			const user = await User.findOne({
				email: messageText.toLocaleLowerCase(),
			});
			if (!user)
				return bot.sendMessage(
					chatId,
					'No user found with this email. Please enter the email address you used to register on our website.',
				);

			(user.telegramChatId = chatId), await user.save();

			return bot.sendMessage(
				chatId,
				`Hello ${user.fullName}, thank you for registering! You will now receive daily reminders to donate ads.\n\nTo stop receiving reminders, please type: "STOP".`,
			);
		});

		setInterval(async () => {
			const users = await User.find();
			users.forEach((user) => {
				bot.sendMessage(
					user.telegramChatId,
					`Hello ${user.fullName}, just remiding you to donate some of your time and watch some ads on our site.\n\nCheck ${process.env.BASE_URL} to make even more difference in our world.!`,
				);
			});
		}, 86400000); // 24 Hours

		console.log('Telegram Bot successfully initialized.');
	} catch (error) {
		console.error('An error occured while initializing telegram BOT.');
	}
}

module.exports = { initialize };

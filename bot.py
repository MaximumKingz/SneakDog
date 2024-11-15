import logging
import sys
import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Enable detailed logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO,
    handlers=[
        logging.FileHandler("bot.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

# Bot Configuration
TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
if not TOKEN:
    logger.error("No bot token found in environment variables!")
    sys.exit(1)

WEBAPP_URL = "https://maximumkingz.github.io/SneakDog/game.html"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /start is issued."""
    try:
        logger.info("Start command received")
        user = update.effective_user
        logger.info(f"Processing /start command for user {user.id} (@{user.username})")

        # Create Mini App button
        keyboard = [[
            InlineKeyboardButton(
                "🎮 Play SneakDog!",
                web_app=WebAppInfo(url=WEBAPP_URL)
            )
        ]]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        # Send welcome message
        message = await update.message.reply_text(
            "🐕 Welcome to SneakDog! 🎮\n\n"
            "Ready to catch that sneaky dog?\n"
            "Click the button below to start playing!",
            reply_markup=reply_markup
        )
        logger.info(f"Welcome message sent successfully. Message ID: {message.message_id}")
        
    except Exception as e:
        logger.error(f"Error in start command: {str(e)}", exc_info=True)
        if update.message:
            await update.message.reply_text("Sorry, something went wrong. Please try again!")

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle button callbacks."""
    try:
        query = update.callback_query
        logger.info(f"Button callback received from user {query.from_user.id}")
        await query.answer()
        logger.info(f"Button callback handled for user {query.from_user.id}")
    except Exception as e:
        logger.error(f"Error in button callback: {str(e)}", exc_info=True)

def main() -> None:
    """Start the bot."""
    try:
        logger.info("Starting bot with token: " + TOKEN[:10] + "...")
        
        # Create the Application
        application = Application.builder().token(TOKEN).build()
        logger.info("Application built successfully")

        # Add handlers
        application.add_handler(CommandHandler("start", start))
        application.add_handler(CallbackQueryHandler(button_callback))
        logger.info("Handlers registered successfully")

        # Start the Bot
        logger.info("Starting bot polling...")
        application.run_polling(allowed_updates=Update.ALL_TYPES, drop_pending_updates=True)
        
    except Exception as e:
        logger.error(f"Critical error in main: {str(e)}", exc_info=True)
        sys.exit(1)

if __name__ == '__main__':
    main()

import logging
import sys
import os
import signal
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Enable logging
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
TOKEN = "7719239069:AAGfskyBni2VejQMAxv_nX0BKZIxrkpcjPc"
WEBAPP_URL = "https://maximumkingz.github.io/SneakDog/"  # Point to index.html

def signal_handler(signum, frame):
    """Handle shutdown signals gracefully"""
    logger.info("Received shutdown signal. Cleaning up...")
    sys.exit(0)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /start is issued."""
    try:
        logger.info("Start command received")
        user = update.effective_user
        logger.info(f"Processing /start command for user {user.id} (@{user.username})")

        keyboard = [[
            InlineKeyboardButton(
                "🎮 Play SneakDog!",
                web_app=WebAppInfo(url=WEBAPP_URL)
            )
        ]]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
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

async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Log Errors caused by Updates."""
    logger.error("Exception while handling an update:", exc_info=context.error)

def main() -> None:
    """Start the bot."""
    try:
        # Set up signal handlers
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        logger.info("Starting bot with token: " + TOKEN[:10] + "...")
        
        # Create the Application
        application = Application.builder().token(TOKEN).build()
        
        # Add handlers
        application.add_handler(CommandHandler("start", start))
        application.add_handler(CallbackQueryHandler(button_callback))
        application.add_error_handler(error_handler)
        
        logger.info("Handlers registered successfully")
        
        # Start the Bot with webhook disabled
        logger.info("Starting bot polling...")
        application.run_polling(
            allowed_updates=Update.ALL_TYPES,
            drop_pending_updates=True,
            close_loop=False
        )
        
    except Exception as e:
        logger.error(f"Critical error in main: {str(e)}", exc_info=True)
        sys.exit(1)

if __name__ == '__main__':
    main()

# Sneak Dog - Telegram Mini Game

An exciting stealth game where you play as a sneaky dog collecting treasures and avoiding obstacles.

## Features

- Engaging gameplay mechanics with smooth controls
- Multiple progression systems:
  - Skill trees with various abilities
  - Daily rewards and streaks
  - Quest system with different types of missions
  - Character customization with items and effects
  - Power-ups with unique abilities
- Pet companions with special abilities
- Crafting system for items and power-ups
- Multiplayer challenges and leaderboards

## Installation

1. Host the game files on a secure HTTPS server
2. Create a Telegram Bot using [@BotFather](https://t.me/botfather)
3. Set up your Mini App:
   - Send /newapp to @BotFather
   - Choose your bot
   - Enter the app name and description
   - Upload the app icon
   - Enter your HTTPS URL where the game is hosted

## Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run the development server
python app.py
```

## Deployment

1. Ensure all files are properly hosted on an HTTPS server
2. Update the manifest.json with correct paths
3. Test the Mini App in Telegram's development environment
4. Submit for review in @BotFather

## Tech Stack

- Frontend: Vanilla JavaScript
- Storage: localStorage
- Platform: Telegram Mini App SDK
- No external dependencies required

## Security

- All game progress is saved client-side
- No sensitive data is stored
- HTTPS required for deployment

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this code for your own projects!

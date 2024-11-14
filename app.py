import os
from flask import Flask, render_template, jsonify, request
from dotenv import load_dotenv

app = Flask(__name__)
load_dotenv()

@app.route('/')
def index():
    # Log Telegram game parameters
    print("Received game parameters:", request.args)
    return render_template('game.html')

@app.route('/highscore', methods=['POST'])
def highscore():
    score = request.json.get('score', 0)
    user_id = request.json.get('user_id')
    print(f"Received highscore - User: {user_id}, Score: {score}")
    return jsonify({'success': True})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    print(f"Starting Flask server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)

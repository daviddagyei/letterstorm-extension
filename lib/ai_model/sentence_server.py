from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_generator import generate_sentences, get_fallback_sentences
import os

app = Flask(__name__)
CORS(app)

@app.route('/api/sentences', methods=['GET'])
def get_sentences():
    try:
        count = int(request.args.get('count', 10))
        difficulty = request.args.get('difficulty', 'medium')
        
        # Validate inputs
        count = min(max(count, 5), 20)
        if difficulty not in ['easy', 'medium', 'hard']:
            difficulty = 'medium'
            
        # Generate sentences
        sentences = generate_sentences(count, difficulty)
        return jsonify(sentences)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify(get_fallback_sentences()), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

import requests
import json
import random
import os
import time

MISTRAL_API_KEY = os.environ.get("MISTRAL_API_KEY", "")
API_URL = "https://api.mistral.ai/v1/chat/completions"

def generate_sentences(num_sentences=10, difficulty_level="medium"):
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer {MISTRAL_API_KEY}"
    }
    
    difficulty_prompts = {
        "easy": "short and simple sentences (3-5 words)",
        "medium": "moderate length sentences (6-12 words)",
        "hard": "more complex sentences (13-20 words)"
    }
    
    prompt = difficulty_prompts.get(difficulty_level, difficulty_prompts["medium"])
    
    data = {
        "model": "mistral-tiny",
        "messages": [
            {
                "role": "system",
                "content": f"Generate {num_sentences} unique, meaningful English {prompt} suitable for a typing game. Return only a JSON array of strings with no explanation."
            },
            {
                "role": "user",
                "content": f"Create {num_sentences} interesting, varied English sentences for typing practice."
            }
        ],
        "temperature": 0.7
    }
    
    try:
        response = requests.post(API_URL, headers=headers, data=json.dumps(data))
        response.raise_for_status()
        
        result = response.json()
        content = result["choices"][0]["message"]["content"]
        
        try:
            sentences_list = json.loads(content)
            return sentences_list
        except json.JSONDecodeError:
            content_lines = content.strip().split("\n")
            cleaned_lines = []
            for line in content_lines:
                line = line.strip()
                if line.startswith('"') and line.endswith('"'):
                    line = line.strip('"')
                elif line.startswith("'") and line.endswith("'"):
                    line = line.strip("'")
                if line.startswith("-"):
                    line = line[1:].strip()
                if line and len(line) > 2:
                    cleaned_lines.append(line)
            
            return cleaned_lines[:num_sentences]
    except Exception as e:
        print(f"Error generating sentences: {e}")
        return get_fallback_sentences()

def get_fallback_sentences():
    return [
        "The quick brown fox jumps over the lazy dog",
        "All that glitters is not gold",
        "Actions speak louder than words",
        "A picture is worth a thousand words",
        "The early bird catches the worm",
        "Don't count your chickens before they hatch",
        "Practice makes perfect",
        "Time flies when you're having fun", 
        "Better late than never",
        "Two wrongs don't make a right",
        "The pen is mightier than the sword",
        "When in Rome, do as the Romans do",
        "The grass is always greener on the other side",
        "Fortune favors the bold",
        "People who live in glass houses shouldn't throw stones"
    ]

if __name__ == "__main__":
    sentences = generate_sentences(15)
    for i, sentence in enumerate(sentences, 1):
        print(f"{i}. {sentence}")

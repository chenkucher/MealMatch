from flask import Flask, request, jsonify
import os
import openai

app = Flask(__name__)

# Set the OpenAI API key
openai.api_key = "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"

@app.route('/api/generate', methods=['POST'])
def generate():
    data = request.get_json()
    options = data['options']
    prompt = (f"built for me lunch plan for the next week, from the {options}, 700 kalories per mea")
    completions = openai.Completion.create(
        engine="text-davinci-002",
        prompt=prompt,
        max_tokens=1024,
        n=1,
        stop=None,
        temperature=0.5,
    )
    message = completions.choices[0].text.strip()
    return jsonify({'response': message})

if __name__ == '__main__':
    app.run(debug=True)

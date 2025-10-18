
import os
import requests
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai


load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
print(f"Loaded API key partial: {api_key[:10] if api_key else 'None'}")
if api_key:
    genai.configure(api_key=api_key)
else:
    print("Google API key not found")

app = Flask(__name__)
CORS(app)


basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'instance', 'skills.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
os.makedirs(os.path.join(basedir, 'instance'), exist_ok=True)


class Skill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    skill_name = db.Column(db.String(100), nullable=False)
    resource_type = db.Column(db.String(50))
    platform = db.Column(db.String(50))
    progress = db.Column(db.String(20), default='started')
    hours_spent = db.Column(db.Float, default=0)
    difficulty = db.Column(db.Integer, default=1)
    notes = db.Column(db.Text)

    def to_dict(self):
        return {key: getattr(self, key) for key in self.__table__.c.keys()}


@app.before_request
def create_all_tables():
    db.create_all()

@app.route('/skills', methods=['GET', 'POST'])
def handle_skills():
    """Handles getting all skills and adding a new one."""
    if request.method == 'POST':
        data = request.json
        new_skill = Skill(
            skill_name=data['skill_name'],
            resource_type=data['resource_type'],
            platform=data['platform'],
            notes=data.get('notes')
        )
        db.session.add(new_skill)
        db.session.commit()
        return jsonify(new_skill.to_dict()), 201
    
 
    skills = Skill.query.all()
    return jsonify([skill.to_dict() for skill in skills])


@app.route('/skills/<int:id>', methods=['PUT', 'DELETE'])
def handle_single_skill(id):
    """Handles updating or deleting a single skill."""
    skill = db.session.get(Skill, id)
    if not skill:
        return jsonify({"error": "Skill not found"}), 404

    if request.method == 'PUT':
        data = request.json
        for key, value in data.items():
            setattr(skill, key, value)
        db.session.commit()
        return jsonify(skill.to_dict())

    if request.method == 'DELETE':
        db.session.delete(skill)
        db.session.commit()
        return "", 204

@app.route('/progress-distribution', methods=['GET'])
def get_progress_distribution():
    """Returns the distribution of skills by progress status."""
    skills = Skill.query.all()
    progress_counts = {}
    for skill in skills:
        progress = skill.progress or 'unknown'  # Handle None values
        progress_counts[progress] = progress_counts.get(progress, 0) + 1

    return jsonify(progress_counts)

@app.route('/summarize-notes', methods=['POST'])
def summarize_skill_notes():
    """Uses the Google Gemini API for free summarization."""
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return jsonify({"error": "AI feature is not configured. Please set GOOGLE_API_KEY in .env"}), 500

    notes = request.json.get('notes', '')
    if not notes.strip():
        return jsonify({"summary": "No notes to summarize."})

    try:
        model = genai.GenerativeModel('models/gemini-flash-latest')
        prompt = f"Summarize the following learning notes in one concise sentence: {notes}"
        response = model.generate_content(prompt)
        summary = response.text if hasattr(response, 'text') else str(response)
        return jsonify({"summary": summary})
    except Exception as e:
        print(f"Google AI API error: {e}")
        print(f"API Key partial: {api_key[:10] if api_key else 'None'}")
        return jsonify({"error": f"Failed to generate summary from AI: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)

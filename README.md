# SkillStack - Tracker

SkillStack is a straightforward and intuitive app created to manage and monitor your skill development journey, helping you stay focused, motivated, and consistent throughout.

---

## What It Does (The Feature List)

* **Add Learning Goal**: Easily add courses, videos, or articles you’re currently working on.
* **Track Your Progress**: Stay on top of your learning by marking goals as started, in-progress, or completed.
* **Keep Notes & Details**: Save notes, log hours spent, and rate the difficulty of each skill
* **Genarate Summary**: Use Google Gemini AI to generate quick, one-sentence summaries of your notes.
* **Delete**: Remove skills you’re no longer pursuing with a simple delete button.
* **Dashboard**: Visualize skill growth with interactive insight,including progress tracking,hours spent and category-wise breakdown.

---

## Tech Requirements

 **Frontend**: ReactJS – for a fast, modern, and responsive user interface.
 
 **Backend**: Python with Flask – lightweight yet powerful for building APIs.
 **Database**: SQLite – simple, efficient, and ideal for a project of this scale.
 **AI Integration**: Google Gemini API – the brain behind smart note summaries.

---

## Getting It Running (Setup Steps)

Here's how to get this running locally.

### Dependencies:
* Node.js & npm – for running the frontend
* Python 3 & pip – for running the backend
* Google AI API Key – to enable AI-powered note summaries


## Getting the Backend and Frontend Running
```bash
# First, navigate into the backend folder
cd backend

# Install all the Python tools it needs
pip install -r requirements.txt

# You'll need to create a .env file in this folder
# and add your Google API key inside it like this:
# GOOGLE_API_KEY='your_key_here'

# Now, start the server!
flask run
**

**
```bash
# Second, navigate into the frontend folder (in a split new terminal)
cd frontend

# Install the necessary dependencies
npm install

# Now, start the server!
npm start

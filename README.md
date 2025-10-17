# SkillStack - Learning Tracker

SkillStack is a simple and clean application designed to organize and track skill-building journeys, making it easier to stay focused, motivated, and consistent over time.

It's a full-stack application, with an AI helper to summarize notes.

---

## What It Does (The Feature List)

* **Add Any Learning Goal**: You can add any course, video, or article you're working on.
* **Track Your Progress**: Keep yourself honest by marking things as `started`, `in-progress`, or that `completed` status.
* **Keep Notes & Details**: Store notes, track hours spent, and rate difficulty.
* **Get AI Summaries**: Send notes to Google Gemini AI for a quick one-sentence summary.
* **Clean Up**: A simple delete button to remove skills you're no longer pursuing.

---

## Tech Stack

* **Frontend**: ReactJS (To make the UI feel fast and modern)
* **Backend**: Python with Flask (Lightweight and powerful for the API)
* **Database**: SQLite (Simple and perfect for a project of this size)
* **The AI Brain**: Google's Gemini API

---

## Getting It Running (Setup Steps)

Here's how to get this running locally.

### Prerequisites:
* Node.js & npm
* Python 3 & pip
* A free Google AI API Key

## Getting the Backend and Frontend Running
```bash
# First, navigate into the backend folder
cd backend

# Install all the Python tools it needs
pip install -r requirements.txt

# You'll need to create a .env file in this folder
# and add your Google API key inside it like this:
# GOOGLE_API_KEY='your_key_goes_here'

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

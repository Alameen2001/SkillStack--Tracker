import os
basedir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'instance'))
db_path = os.path.join(basedir, 'skills.db')
print(f"DB path: {db_path}")

from app import db, Skill, app

with app.app_context():
    skills = Skill.query.all()
    print(f"Total skills: {len(skills)}")
    for skill in skills:
        print(f"ID: {skill.id}, Name: {skill.skill_name}, Progress: {skill.progress}")

    # Also check the progress distribution
    from collections import Counter
    progresses = [s.progress for s in skills]
    distribution = Counter(progresses)
    print("Progress distribution:", dict(distribution))

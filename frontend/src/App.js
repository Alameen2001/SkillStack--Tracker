import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

const API_URL = 'http://127.0.0.1:5000';

const cleanNotes = (notes) => {
  if (!notes) return '';
  // Remove code block formatting from AI summaries
  return notes.replace(/```/g, '');
};

function App() {
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState({ skill_name: '', resource_type: '', platform: '', notes: '' });
  const [editingNotes, setEditingNotes] = useState({});

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    const response = await axios.get(`${API_URL}/skills`);
    setSkills(response.data);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`${API_URL}/skills`, form);
    setForm({ skill_name: '', resource_type: '', platform: '', notes: '' });
    fetchSkills();
  };

  const handleUpdate = async (id, field, value) => {
    const skill = skills.find(s => s.id === id);
    await axios.put(`${API_URL}/skills/${id}`, { ...skill, [field]: value });
    fetchSkills();
  };

  const handleSummarize = async (notes) => {
    if (!notes || !notes.trim()) return alert("No notes to summarize.");
    try {
      const response = await axios.post(`${API_URL}/summarize-notes`, { notes });
      if (response.data.error) {
        alert(`Error: ${response.data.error}`);
      } else {
        // Find the skill with the matching notes and update it
        const skillToUpdate = skills.find(skill => skill.notes === notes);
        if (skillToUpdate) {
          const updatedNotes = notes ? `${notes}\n\nAI Summary:\n${response.data.summary}` : `AI Summary:\n${response.data.summary}`;
          handleUpdate(skillToUpdate.id, 'notes', updatedNotes);
        } else {
          alert(`AI Summary:\n\n${response.data.summary}`);
        }
      }
    } catch (error) {
      alert("Failed to summarize notes. Please try again later.");
    }
  };


  const handleDelete = async (id) => {
    // Show a confirmation dialog to prevent accidental deletion
    if (window.confirm("Are you sure you want to delete this skill?")) {
      try {
        await axios.delete(`${API_URL}/skills/${id}`);
        fetchSkills(); // Refresh the list to remove the skill
      } catch (error) {
        console.error("Failed to delete skill:", error);
      }
    }
  };

  const totalHours = skills.reduce((sum, s) => sum + (s.hours_spent || 0), 0);

  const progressData = [
    { name: 'Started', value: skills.filter(s => s.progress === 'started').length },
    { name: 'In-Progress', value: skills.filter(s => s.progress === 'in-progress').length },
    { name: 'Completed', value: skills.filter(s => s.progress === 'completed').length },
  ];

  const platformMap = skills.reduce((acc, s) => { acc[s.platform] = (acc[s.platform] || 0) + 1; return acc; }, {});
  const platformData = Object.entries(platformMap).map(([platform, count]) => ({ platform, count }));

  const resourceTypeMap = skills.reduce((acc, s) => { acc[s.resource_type] = (acc[s.resource_type] || 0) + 1; return acc; }, {});
  const resourceTypeData = Object.entries(resourceTypeMap).map(([resource_type, count]) => ({ resource_type, count }));

  const difficultyMap = skills.reduce((acc, s) => { acc[s.difficulty] = (acc[s.difficulty] || 0) + 1; return acc; }, {});
  const difficultyData = Object.entries(difficultyMap).map(([difficulty, count]) => ({ difficulty: `${difficulty}/5`, count }));

  const hoursData = [...skills].filter(s => s.hours_spent > 0).sort((a, b) => b.hours_spent - a.hours_spent).slice(0, 5).map(s => ({
    skill: s.skill_name.length > 15 ? s.skill_name.substring(0, 15) + '...' : s.skill_name,
    hours: s.hours_spent
  }));

  const COLORS = ['#1abc9c', '#f39c12', '#e74c3c'];

  return (
      <div className="container">
        <header>
          <h1>SkillStack-Tracker</h1>
        </header>

      <div className="card">
        <h2>Add a New Learning Goal</h2>
        <form onSubmit={handleFormSubmit} className="skill-form">
          <div className="input-group full-width">
            <label htmlFor="skill_name">Skill / Course Name</label>
            <input id="skill_name" name="skill_name" value={form.skill_name} onChange={handleFormChange} required />
          </div>
          <div className="input-group">
            <label htmlFor="resource_type">Resource Type</label>
            <input id="resource_type" name="resource_type" value={form.resource_type} onChange={handleFormChange} placeholder="e.g., video, course, article" required />
          </div>
          <div className="input-group">
            <label htmlFor="platform">Platform</label>
            <input id="platform" name="platform" value={form.platform} onChange={handleFormChange} placeholder="e.g., Udemy, Youtube, Coursera" required />
          </div>
          <div className="input-group full-width">
            <label htmlFor="notes">Concept Notes</label>
            <textarea id="notes" name="notes" value={form.notes} onChange={handleFormChange} placeholder="Add your notes here..."></textarea>
          </div>
          <button type="submit" className="btn-primary">Add Skill</button>
        </form>
      </div>

      <div className="card">
        <h2>Current Learning Activities</h2>
        <div className="skills-cards">
          {skills.map(skill => (
            <div className="skill-card" key={skill.id}>
              <div className="skill-header">
                <h3>{skill.skill_name}</h3>
                <small>{skill.platform}</small>
              </div>
              <div className="skill-details">
                <div className="detail-item">
                  <label>Progress:</label>
                  <select defaultValue={skill.progress} onChange={(e) => handleUpdate(skill.id, 'progress', e.target.value)}>
                    <option>started</option>
                    <option>in-progress</option>
                    <option>completed</option>
                  </select>
                </div>
                <div className="detail-item">
                  <label>Hours:</label>
                  <input type="number" min="1" max="24" defaultValue={skill.hours_spent} onBlur={(e) => handleUpdate(skill.id, 'hours_spent', parseFloat(e.target.value) || 0)} className="hours-input" />
                </div>
                <div className="detail-item">
                  <label>Difficulty:</label>
                  <div className="difficulty-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        onClick={() => handleUpdate(skill.id, 'difficulty', star)}
                        style={{
                          color: star <= skill.difficulty ? '#ffd700' : '#ccc',
                          cursor: 'pointer',
                          fontSize: '20px',
                          marginRight: '4px'
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div className="detail-item">
                  <label>Resource Type:</label>
                  <span>{skill.resource_type}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Notes:</label>
                  <textarea placeholder="Add notes..." value={(editingNotes[skill.id] ?? cleanNotes(skill.notes)) || ''} onChange={(e) => setEditingNotes({...editingNotes, [skill.id]: e.target.value})} onBlur={(e) => { handleUpdate(skill.id, 'notes', e.target.value); setEditingNotes({...editingNotes, [skill.id]: undefined}); }} />
                </div>
                <div className="skill-actions">
                  <button onClick={() => handleSummarize((editingNotes[skill.id] ?? skill.notes) || '')} className="btn-secondary">Summarize</button>
                  <button onClick={() => handleDelete(skill.id)} className="btn-danger">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Skill Growth Insights</h2>
        <div className="insight-stats">
          <div className="stat-card">
            <h4>Total Learning Hours</h4>
            <span className="stat-value">{totalHours}</span>
          </div>
          <div className="stat-card">
            <h4>Total Skills</h4>
            <span className="stat-value">{skills.length}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginTop: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h3>Progress Distribution</h3>
            <ResponsiveContainer width={300} height={250}>
              <PieChart>
                <Pie data={progressData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {progressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3>Skills by Platform (Category-wise)</h3>
            <ResponsiveContainer width={300} height={250}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#34495e" />
                <XAxis dataKey="platform" stroke="#34495e" />
                <YAxis stroke="#34495e" />
                <Tooltip contentStyle={{ backgroundColor: '#34495e', color: '#ecf0f1', border: 'none' }} />
                <Bar dataKey="count" fill={COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3>Top 5 Skills by Hours Invested</h3>
            <ResponsiveContainer width={300} height={250}>
              <BarChart data={hoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#34495e" />
                <XAxis dataKey="skill" stroke="#34495e" />
                <YAxis stroke="#34495e" />
                <Tooltip contentStyle={{ backgroundColor: '#34495e', color: '#ecf0f1', border: 'none' }} />
                <Bar dataKey="hours" fill={COLORS[1]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3>Skills by Resource Type</h3>
            <ResponsiveContainer width={300} height={250}>
              <BarChart data={resourceTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#34495e" />
                <XAxis dataKey="resource_type" stroke="#34495e" />
                <YAxis stroke="#34495e" />
                <Tooltip contentStyle={{ backgroundColor: '#34495e', color: '#ecf0f1', border: 'none' }} />
                <Bar dataKey="count" fill={COLORS[2]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3>Skills by Difficulty Rating</h3>
            <ResponsiveContainer width={300} height={250}>
              <BarChart data={difficultyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#34495e" />
                <XAxis dataKey="difficulty" stroke="#34495e" />
                <YAxis stroke="#34495e" />
                <Tooltip contentStyle={{ backgroundColor: '#34495e', color: '#ecf0f1', border: 'none' }} />
                <Bar dataKey="count" fill="#9b59b6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

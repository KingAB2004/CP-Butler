import React from 'react';
import './settings.css';
type props={
  setPage:React.Dispatch<React.SetStateAction<string>>;
}
const Settings = ({setPage}:props) => {
    const [lead, setLead] = React.useState(15);
    React.useEffect(() => {
        chrome.storage.local.get(['reminderLead'], (result) => {
            if (result.reminderLead) setLead(result.reminderLead);
        });
    }, []);
    const changeLead = (minutes: number) => {
        setLead(minutes);
        chrome.storage.local.set({ reminderLead: minutes });
    };
    const handleLogout = () => {
        chrome.storage.local.remove(['CFhandle', 'Leethandle', 'cfHistory', 'lcHistory', 'cfToday', 'lcToday', 'standingsCache']);
        setPage('front')
    };
    const GoBack =() =>{
      setPage('content')
    }
    
  return (
    <div className="settings-container">
      <div className="settings-card">
        <div className="new">
        <button className="btn_tertiary" id="refreshData" onClick={GoBack}>⬅</button>
        <h1 className="settings-title">Settings</h1>
        </div>

        
        <div className="settings-section">
          <h2 className="section-title">Account</h2>
          <p className="section-description">
            Manage your account settings and preferences
          </p>
          
          <button 
            onClick={handleLogout}
            className="logout-button"
          >
            🚪 Logout
          </button>
        </div>
        
        <div className="settings-section">
          <h2 className="section-title">Contest Reminders</h2>
          <p className="section-description">
            Get notified before a contest you marked with 🔔 starts
          </p>
          <select className="settings-select" value={lead} onChange={(e) => changeLead(Number(e.target.value))}>
            {[5, 10, 15, 30, 60].map((minutes) => (
              <option key={minutes} value={minutes}>{minutes} minutes before</option>
            ))}
          </select>
        </div>

        <div className="settings-section">
          <h2 className="section-title">About</h2>
          <p className="section-description">
            CP Butler v1.1 - Helps you Track your Daily competitive programming progress
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
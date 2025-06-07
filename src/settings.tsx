import React from 'react';
import './settings.css';
type props={
  setPage:React.Dispatch<React.SetStateAction<string>>;
}
const Settings = ({setPage}:props) => {
    const handleLogout = () => {
        chrome.storage.local.remove('CFhandle');
        chrome.storage.local.remove('Leethandle');
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
          <h2 className="section-title">About</h2>
          <p className="section-description">
            CP Butler v1.0 - Helps you Track your Daily competitive programming progress
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
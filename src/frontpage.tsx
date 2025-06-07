import React, { useState } from 'react';
import './frontpage.css';
type props={
  setPage:React.Dispatch<React.SetStateAction<string>>;
}
const FrontPage= ({setPage}:props) => {
  const [handle, setHandle] = useState('');
  const [Lhandle, setLHandle] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    chrome.storage.local.set({CFhandle: handle})
    chrome.storage.local.set({Leethandle: Lhandle})
    setPage('content')
    setIsLoading(true);
  }
  return (
    <div className="codeforces-container">
      <div className="codeforces-form-card">
          <img src='/icon.png' className='logo'></img>
        <h1 className="codeforces-title">
          CP Butler
        </h1>
        <p className="codeforces-subtitle">
          Manage Your Daily CP Info From Today
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="handle" className="form-label">
              Codeforces Handle
            </label>
            
            <input
              id="handle"
              type="text"
              placeholder="e.g., tourist"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="handle" className="form-label">
              Leetcode Handle(Optional)
            </label>
            
            <input
              id="handle"
              type="text"
              placeholder="e.g., tourist"
              value={Lhandle}
              onChange={(e) => setLHandle(e.target.value)}
              className="form-input"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="submit-button"
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Connecting...
              </>
            ) : (
              <>
                🏆 Connect Handle
              </>
            )}
          </button>
        </form>

        <p className="form-footer">
          This extension helps you track your CP Daily progress
        </p>
      </div>
    </div>
  );
};

export default FrontPage;

import React from 'react';
import './contests.css';
type props={
  setPage:React.Dispatch<React.SetStateAction<string>>;
}
const UpcomingContests = ({setPage}:props) => {

    const [contest  ,setContest] = React.useState<any[]>([]);
    const [failed ,setFailed] =React.useState<string[]>([]);
    const [Loading ,setLoading] =React.useState(true);
    const [reminders ,setReminders] =React.useState<Record<string, object>>({});
    const [now ,setNow] =React.useState(Date.now());
    // const [Lcontest ,setLcontest] =React.useState<any[]>([]);

    function formatContestInfo(contest:any) {
    const startDate = new Date(contest.start);
    const durationInMinutes = contest.duration / 60;
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;

    const timeDiffSeconds = Math.floor((contest.start - now) / 1000);
    let timeRemaining;
    if (timeDiffSeconds > 0) {
        const diffHours = Math.floor(timeDiffSeconds / 3600);
        const diffMinutes = Math.floor((timeDiffSeconds % 3600) / 60);
        const diffSeconds = timeDiffSeconds % 60;
        timeRemaining = `${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
    } else {
        timeRemaining = "Running now";
    }

    return {
        Date: startDate.toLocaleString(),
        TR: timeRemaining,
        Name: contest.name,
        Duration: `${hours}h ${minutes}m`,
        Platform: contest.platform,
        Url: contest.url,
        Started: timeDiffSeconds <= 0,
        contest
    };
}

    const getContest =async() =>{
        const data = await chrome.runtime.sendMessage({ type: 'getContests' });
        setContest(data?.contests ?? []);
        setFailed(data?.failed ?? []);
        setLoading(false);
    }

    const toggleReminder =(contest:{id:string}) =>{
        const next = { ...reminders };
        if (next[contest.id]) delete next[contest.id];
        else next[contest.id] = contest;
        setReminders(next);
        chrome.storage.local.set({ reminders: next });
    }

    React.useEffect(() => {
        getContest();
        chrome.storage.local.get(['reminders', 'contestCache'], (result) => {
            setReminders(result.reminders ?? {});
            if (result.contestCache) {
                setContest(prev => prev.length ? prev : result.contestCache);
                setLoading(false);
            }
        });
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

  return (
    <div className="contests-container">
      <div className="contests-content">
        <div className="contests-header">
          <div>
            <h1 className="contests-title">
              Upcoming Contests
            </h1>
            <p className="contests-subtitle">
              Codeforces, LeetCode, CodeChef and AtCoder contests
            </p>
          </div>
          <div className="contests-nav">
            <a onClick={()=>{setPage('content')}} className="nav-button">🏠 Home</a>
            <a onClick={()=>{setPage('settings')}} className="nav-button">⚙️ Settings</a>
          </div>
        </div>

        <div className="contests-list">
          {Loading && <p className="footer-text">Loading contests...</p>}
          {failed.length > 0 && <p className="footer-text">Could not load {failed.join(', ')} contests</p>}
          {contest.filter(c => c.start + c.duration * 1000 > now).map(formatContestInfo).map((contest) => (
            <div className="contest-card" key={contest.contest.id}>
              <div className="contest-header">
                <a className="contest-name" href={contest.Url} target="_blank" rel="noopener noreferrer">
                  {contest.Name}
                </a>
                <span className="contest-countdown">
                  {contest.Platform}
                  <button
                    className="reminder-button"
                    disabled={contest.Started}
                    onClick={() => toggleReminder(contest.contest)}
                    title="Remind me before it starts"
                  >
                    {reminders[contest.contest.id] ? '🔔' : '🔕'}
                  </button>
                </span>
              </div>
              
              <div className="contest-details">
                <div className="contest-detail">
                  <span>📅</span>
                  <div>
                    <div className="contest-detail-label">Start Time</div>
                    <div className="contest-detail-value">{contest.Date}</div>
                  </div>
                </div>
                
                <div className="contest-detail">
                  <span>⏱️</span>
                  <div>
                    <div className="contest-detail-label">Duration</div>
                    <div className="contest-detail-value">{contest.Duration}</div>
                  </div>
                </div>

                <div className="contest-detail">
                  <span>⏳</span>
                  <div>
                    <div className="contest-detail-label">Starts In</div>
                    <div className="contest-detail-value">{contest.TR}</div>
                  </div>
                </div>
                
              </div>
              
            </div>
          ))}
        </div>

        <div className="contests-footer">
          <div className="footer-card">
            <p className="footer-text">
              Want to see more contests or get notifications?
            </p>
            <a 
              href="https://codeforces.com/contests" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-button"
            >
              Visit Codeforces
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingContests;
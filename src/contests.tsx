import React from 'react';
import './contests.css';
type props={
  setPage:React.Dispatch<React.SetStateAction<string>>;
}
const UpcomingContests = ({setPage}:props) => {

    const [contest  ,setContest] = React.useState<any[]>([]);
    const [Fcontest ,setFcontest] =React.useState<any[]>([]);
    // const [Lcontest ,setLcontest] =React.useState<any[]>([]);

    function formatContestInfo(contest:any) {
    const startDate = new Date(contest.startTimeSeconds * 1000);
    const durationInMinutes = contest.durationSeconds / 60;
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;

    const timeDiffSeconds = contest.startTimeSeconds - Math.floor(Date.now() / 1000);
    let timeRemaining;
    if (timeDiffSeconds > 0) {
        const diffHours = Math.floor(timeDiffSeconds / 3600);
        const diffMinutes = Math.floor((timeDiffSeconds % 3600) / 60);
        const diffSeconds = timeDiffSeconds % 60;
        timeRemaining = `${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
    } else {
        timeRemaining = "Already started or finished";
    }

    return {
        Date: startDate.toLocaleString(),
        TR: timeRemaining,
        Name: contest.name,
        Duration: `${hours}h ${minutes}m`
    };
}

    const getContest =async() =>{
        const response = await fetch("https://codeforces.com/api/contest.list");
        const data = await response.json();
    
        if (data.status === "OK") {
          const upcomingContests = data.result.filter(
            (contest:any) => contest.phase === "BEFORE"
          );
          setContest(upcomingContests);
          const func:any[]=[];
          contest.forEach((contest)=>{
            const num =formatContestInfo(contest);
            func.push(num);
          })
          // console.log(func)
          setFcontest(func);
        }
    }
    if(Fcontest.length==0)
        getContest()

  return (
    <div className="contests-container">
      <div className="contests-content">
        <div className="contests-header">
          <div>
            <h1 className="contests-title">
              Upcoming Contests
            </h1>
            <p className="contests-subtitle">
              Stay updated with the latest Codeforces programming contests
            </p>
          </div>
          <div className="contests-nav">
            <a onClick={()=>{setPage('content')}} className="nav-button">🏠 Home</a>
            <a onClick={()=>{setPage('settings')}} className="nav-button">⚙️ Settings</a>
          </div>
        </div>

        <div className="contests-list">
          {Fcontest.map((contest) => (
            <div className="contest-card">
              <div className="contest-header">
                <span className="contest-name">
                  {contest.Name}
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
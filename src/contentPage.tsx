import React from "react";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './content.css'
ChartJS.register(ArcElement, Tooltip, Legend);
type props={
  setPage:React.Dispatch<React.SetStateAction<string>>;
}
const ContentPage =({setPage}:props)=>{
  
const [UserData ,UpdateUserData] =React.useState({
      'Total':0,
      'Accepted':0,
      'Wrong':0
  }) 
  const [WQ ,SWQ] =React.useState<{name:String ; rating:number ; url:string}[]>([]);
  const [CQ ,SCQ] =React.useState<{name:String ; rating:any ; url:string}[]>([]);
  const [LQ , SLQ] =React.useState<number>(0);
  const [LCQ  ,SLCQ] =React.useState<{name:string ; rating:any ; url:string}[]>([]);
  const [CFDays ,SetCFDays] =React.useState<Record<string, string[]>>({});
  const [LCDays ,SetLCDays] =React.useState<Record<string, string[]>>({});
  const [CFStatus ,SetCFStatus] =React.useState<string>('Loading...');
  const [LCStatus ,SetLCStatus] =React.useState<string>('Loading...');
 function dayKey(unixTimestamp:number) {
  const date = new Date(unixTimestamp * 1000);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
 function addSolve(daily:Record<string, string[]>, day:string, problem:string) {
  daily[day] = daily[day] ?? [];
  if (!daily[day].includes(problem)) daily[day].push(problem);
}
 function problemUrl(problem:{contestId:number ; index:string}) {
  return problem.contestId >= 100000
    ? `https://codeforces.com/gym/${problem.contestId}/problem/${problem.index}`
    : `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`;
}
 function isToday(unixTimestamp:number) {
  const today = new Date();
  const date = new Date(unixTimestamp * 1000);

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}
  React.useEffect(() => {
    chrome.storage.local.get(["CFhandle", "cfHistory", "cfToday"], async(result) => {
      if (result.CFhandle) {

const hanle = result.CFhandle; 
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
    const endOfDay = startOfDay + 86400;
    const history = result.cfHistory?.handle === hanle ? result.cfHistory : { handle: hanle, daily: {}, syncedAt: 0 };
    SetCFDays(history.daily);
    if (result.cfToday?.handle === hanle && result.cfToday.day === dayKey(startOfDay)) {
      SCQ(result.cfToday.solved);
      SWQ(result.cfToday.wrong);
      UpdateUserData(result.cfToday.UserData);
      SetCFStatus('');
    }
    const submissions:any[] = [];
    let ok = true;

    for (let from = 1; ; from += 100) {
      const data = await fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(hanle)}&from=${from}${history.syncedAt ? '&count=100' : ''}`)
      .then(response => response.json())
      .catch(error => {
        console.error("Network or parsing error:", error);
      });
      if (data?.status !== "OK") {
        ok = false;
        break;
      }
      submissions.push(...data.result);
      const oldest = data.result[data.result.length - 1]?.creationTimeSeconds ?? 0;
      if (!history.syncedAt || data.result.length < 100 || oldest < Math.min(startOfDay, history.syncedAt - 86400)) break;
      await new Promise(resolve => setTimeout(resolve, 2100));
    }
    if (!ok) {
      SetCFStatus('Could not load Codeforces data');
      return;
    }

    submissions.forEach((sub) => {
      if (sub.verdict == "OK") addSolve(history.daily, dayKey(sub.creationTimeSeconds), problemUrl(sub.problem));
    });
    chrome.storage.local.set({ cfHistory: { ...history, syncedAt: Math.floor(Date.now() / 1000) } });
    SetCFDays({ ...history.daily });

        let Acc=0;
        let WA =0;
        const solved:typeof CQ = [];
        const wrong:typeof WQ = [];
        const todaySubmissions = submissions.filter((sub:any) => 
          sub.creationTimeSeconds >= startOfDay && sub.creationTimeSeconds < endOfDay
      );
      // console.log(todaySubmissions.length)
      todaySubmissions.forEach((submission:any) => {
        const problem = {name:submission.problem.name,rating:submission.problem.rating,url:problemUrl(submission.problem)};
        if(submission.verdict=="OK")
          {
            // console.log(submission)
            if (!solved.some(p => p.url == problem.url)) solved.push(problem);
            Acc++;
          }
          else if(submission.verdict && submission.verdict!="TESTING" && submission.verdict!="COMPILATION_ERROR")
          {
            WA++;
            if (!wrong.some(p => p.url == problem.url)) wrong.push(problem);
            // console.log(submission.problem.rating)
          }
        });
        SCQ(solved);
        SWQ(wrong);
        SetCFStatus('');
        UpdateUserData({
          Total:Acc+WA,
          Accepted:Acc,
          Wrong:WA
        });
        chrome.storage.local.set({ cfToday: { handle: hanle, day: dayKey(startOfDay), solved, wrong, UserData: { Total: Acc + WA, Accepted: Acc, Wrong: WA } } });

      }
    });


    chrome.storage.local.get(["Leethandle", "lcHistory", "lcToday"], async(result) => {
      if (!result.Leethandle) {
        SetLCStatus('No LeetCode handle connected');
      }
      else {
       const handle =result.Leethandle
      //  console.log(handle)
       if (result.lcHistory?.handle === handle) SetLCDays(result.lcHistory.daily);
       if (result.lcToday?.handle === handle && result.lcToday.day === dayKey(Date.now() / 1000)) {
         SLCQ(result.lcToday.solved);
         SLQ(result.lcToday.solved.length);
         SetLCStatus('');
       }
         chrome.runtime.sendMessage({ type: "fetchAC", username:handle }, (res) => {
      if (res?.acList) 
        {
          const maal:any[] =res.acList
          const daily = result.lcHistory?.handle === handle ? result.lcHistory.daily : {};
          const solved:typeof LCQ = [];

      // console.log(maal);

      maal.forEach((thing:any)=>{
        addSolve(daily, dayKey(Number(thing.timestamp)), thing.titleSlug);
        const url = `https://leetcode.com/problems/${thing.titleSlug}/`;
        if(isToday(Number(thing.timestamp)) && !solved.some(p => p.url == url))
        {
          solved.push({name:thing.title  ,rating:thing.difficulty ,url})
        }
        
      })
      chrome.storage.local.set({ lcHistory: { handle, daily }, lcToday: { handle, day: dayKey(Date.now() / 1000), solved } });
      SetLCDays({ ...daily });
      SLCQ(solved);
      SLQ(solved.length);
      SetLCStatus('');
      
          
        } 
     else {
      console.error("No response at all.");
      SetLCStatus('Could not load LeetCode data');
    }
      // console.log(LQ)
    });
        
      }
    });

  }, []);

let data = {
  labels: ['Accepted', 'WrongAnswer'],
  datasets: [
    {
      data:[(UserData.Accepted / UserData.Total) * 100,(UserData.Wrong / UserData.Total) * 100],
      backgroundColor:['#4CAF50', '#f44336'],
      borderWidth: 2,
    },
  ],
};
const options = {
  plugins: {
    legend: {
      labels: {
        color: '#000000',
      },
    },
  },
};

const Days: Record<string, number> = {};
[CFDays, LCDays].forEach(daily => Object.entries(daily).forEach(([day, problems]) => {
  Days[day] = (Days[day] ?? 0) + problems.length;
}));
const today = new Date();
const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
if (!Days[dayKey(cursor.getTime() / 1000)]) cursor.setDate(cursor.getDate() - 1);
let streak = 0;
while (Days[dayKey(cursor.getTime() / 1000)]) {
  streak++;
  cursor.setDate(cursor.getDate() - 1);
}
let longest = 0;
let run = 0;
let previous = '';
Object.keys(Days).sort().forEach(day => {
  const before = new Date(`${day}T00:00:00`);
  before.setDate(before.getDate() - 1);
  run = previous == dayKey(before.getTime() / 1000) ? run + 1 : 1;
  longest = Math.max(longest, run);
  previous = day;
});
const cells = Array.from({ length: 7 * 20 }, (_, i) =>
  new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7 * 19 - today.getDay() + i)
);

const openSettings =() =>{
  setPage('settings')
}
const openContests=()=>{
  setPage('contests')
}
const openStandings=()=>{
  setPage('standings')
}

    return(
        <div className="container">
      {/* Header */}
      <div className="header">
        <h1>🚀 Today's Progress</h1>
        <button className="btn_tertiary" id="refreshData" onClick={openSettings}>⚙️</button>
      </div>

      {/* Today's Stats */}
      <div className="stats-section">
        <div className="stat-card primary">
          <div className="stat-number" id="questionsToday">{CQ.length +LQ}</div>
          <div className="stat-label">Questions Solved Today</div>
        </div>
      </div>

      <div className="streak-section">
        <h3>🔥 {streak} Day Streak · Longest {longest}</h3>
        <div className="heatmap">
          {cells.map((day) => {
            const count = Days[dayKey(day.getTime() / 1000)] ?? 0;
            return (
              <div
                key={day.getTime()}
                className={`heat-cell level-${Math.min(count, 4)}`}
                title={`${count} solved on ${day.toDateString()}`}
                style={day > today ? { visibility: 'hidden' } : undefined}
              />
            );
          })}
        </div>
      </div>

      {/* Website Stats */}
      <div className="website-section">
        <h3>Questions by Website</h3>
        <div className="website-stats">
          <div className="website-item">
            <div className="website-info">
              <img src="https://leetcode.com/favicon.ico" alt="LeetCode" className="website-icon" />
              <span className="website-name">LeetCode</span>
            </div>
            <span className="website-count">{LQ}</span>
          </div>
          <div className="website-item">
            <div className="website-info">
              <img src="/Codeforces.png" alt="Codeforces" className="website-icon" />
              <span className="website-name">Codeforces</span>
            </div>
            <span className="website-count">{CQ.length}</span>
          </div>
        </div>
      </div>
      <div className="CFstats">
        <img src="/Codeforces.png" alt="Codeforces" className="website-icon" />
        <h2>Codeforces Stats</h2>
      </div>
      {/* Accuracy Chart Section */}
       <div style={{height:'300px'}}>
      {UserData.Total !== 0 ? (
<Pie data={data} options={options} style={{ height: '250px', width: '250px' }} />
) : (
  <div style={{ textAlign: 'center', padding: '2rem', fontSize: '1.2rem', color: '#000000' }}>
    {CFStatus || 'No Questions Done'}
  </div>
)}
  </div>


      <div className="problems-section">
        <h3>Recent Problems Solved</h3>
        <div className="problems-list">
        {CQ.map((WA, index) => (
          <div className="ques" key={index}>
            <div className="problem-info">
            <a className="problem-title problem-link" href={WA.url} target="_blank" rel="noopener noreferrer">{WA.name}</a>
            <div className="problem-meta">
              <span className="difficult">{WA.rating}</span>
            </div>
            </div>
            <div className="problem-status">✅</div>
            </div>
        ))}
        </div>
      </div>

      <div className="unsolved-section">
        <h3>Problems Submitted Wrong</h3>
        <div className="problems-list">
            {WQ.map((WA, index) => (
              <div className="ques" key={index}>
            <div className="problem-info">
            <a className="problem-title problem-link" href={WA.url} target="_blank" rel="noopener noreferrer">{WA.name}</a>
            <div className="problem-meta">
                <span className="difficult">{WA.rating}</span>
            </div>
            </div>
            <div className="problem-status">❌</div>
                </div>
        ))}
        </div>
      </div>
      <div className="LeetStats">
        <img src="https://leetcode.com/favicon.ico" alt="LeetCode" className="website-icon" />
        <h2>Leetcode Stats</h2>
      </div>
       <div className="problems-section">
        <h3>Recent Problems Solved</h3>
        <div className="problems-list">
        {LCStatus}
        {LCQ.map((WA, index) => (
          <div className="ques" key={index}>
            <div className="problem-info">
            <a className="problem-title problem-link" href={WA.url} target="_blank" rel="noopener noreferrer">{WA.name}</a>
            <div className="problem-meta">
              <span className="difficult">{WA.rating}</span>
           </div>
            </div>
            <div className="problem-status">✅</div>
            </div>
        ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="actions">
        <button className="btn primary" id="refreshData" onClick={openContests}>Upcoming CF Contests</button>
        <button className="btn primary" id="refreshData" onClick={openStandings}>Recent CF Standings</button>
      </div>
    </div>
  );
};
export default  ContentPage;
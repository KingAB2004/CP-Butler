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
  const [WQ ,SWQ] =React.useState<{name:String ; rating:number}[]>([]);
  const [CQ ,SCQ] =React.useState<{name:String ; rating:any}[]>([]);
  const [LQ , SLQ] =React.useState<number>(0);
  const [LCQ  ,SLCQ] =React.useState<{name:string ; rating:any}[]>([]);
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
    chrome.storage.local.get(["CFhandle"], async(result) => {
      if (result.CFhandle!='') {

const hanle = result.CFhandle; 
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
    const endOfDay = startOfDay + 86400;
    
    await fetch(`https://codeforces.com/api/user.status?handle=${hanle}&from=1&count=100`)
    .then(response => response.json())
    .then(data => {
      if (data.status === "OK") {
        const submissions = data.result;
        let Acc=0;
        let WA =0;
        const todaySubmissions = submissions.filter((sub:any) => 
          sub.creationTimeSeconds >= startOfDay && sub.creationTimeSeconds < endOfDay
      );
      // console.log(todaySubmissions.length)
      todaySubmissions.forEach((submission:any) => {
        if(submission.verdict=="OK")
          {
            // console.log(submission)
            SCQ(prev => [...prev ,{name:submission.problem.name,rating:submission.problem.rating}])
            Acc++;
          }
          else
          {
            WA++;
            SWQ(prev => [...prev ,{name:submission.problem.name,rating:submission.problem.rating}])
            // console.log(submission.problem.rating)
          }
        });
        UpdateUserData(prev=>({
          ...prev ,
          Total:todaySubmissions.length,
          Accepted:Acc,
          Wrong:WA
        }));
      }
    })
    .catch(error => {
      console.error("Network or parsing error:", error);
    });

      }
    });


    chrome.storage.local.get(["Leethandle"], async(result) => {
      if (result.Leethandle!='') {
       const handle =result.Leethandle
      //  console.log(handle)
         chrome.runtime.sendMessage({ type: "fetchAC", username:handle }, (res) => {
      if (res?.acList) 
        {
          const maal:any[] =res.acList

      // console.log(maal);

      maal.forEach((thing:any)=>{
        if(isToday(Number(thing.timestamp)))
        {
          SLCQ(prev =>[...prev  , {name:thing.title  ,rating:thing.difficulty}])
          SLQ(prev =>prev+1);
        }
        
      })
      
          
        } 
     else {
      console.error("No response at all.");
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
          <div className="stat-number" id="questionsToday">{UserData.Accepted +LQ}</div>
          <div className="stat-label">Questions Solved Today</div>
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
            <span className="website-count">{UserData.Accepted}</span>
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
    No Questions Done
  </div>
)}
  </div>


      <div className="problems-section">
        <h3>Recent Problems Solved</h3>
        <div className="problems-list">
        {CQ.map((WA, index) => (
          <div className="ques">
            <div className="problem-info" key={index}>
            <div className="problem-title">{WA.name}</div>
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
              <div className="ques">
            <div className="problem-info" key={index}>
            <div className="problem-title">{WA.name}</div>
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
        {LCQ.map((WA, index) => (
          <div className="ques">
            <div className="problem-info" key={index}>
            <div className="problem-title">{WA.name}</div>
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
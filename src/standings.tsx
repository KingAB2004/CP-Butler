import './standings.css'
import React, { useEffect } from 'react';
type props={
  setPage:React.Dispatch<React.SetStateAction<string>>;
}

const RecentStandings = ({setPage}:props) => {
    const [Stand ,SetStand] = React.useState<any[]>([])
    const [handle ,setHandle] =React.useState<string>('');
  const getRatingColor = (rating:any) => {
    if (rating < 1200) return '#808080';
    if (rating <= 1399) return '#008000';
    if (rating <= 1599) return '#03a89e';
    if (rating <= 1899) return '#0000ff';
    if (rating <= 2099) return '#aa00aa';
    if (rating <= 2399) return '#ff8c00';
    if (rating <= 3000) return '#ff8c00';
    if (rating > 3000) return '#ff0000';

  };
  const rever =(arr:any[])=>{
    let num =arr.length;
    // console.log(num)
    const limi =((num-5>=0) ? num-5 : 0)
    let resu:any[] =[]
    for(let i = num-1;i>=limi;i--)
    {
        const obje ={
            Name:arr[i].contestName,
            handle:arr[i].handle,
            rank:arr[i].rank,
            Previous_rating:arr[i].oldRating,
            New_rating :arr[i].newRating,
            Change:arr[i].newRating-arr[i].oldRating

        }
        resu.push(obje);

    }

        // console.log(resu);
    return resu;

  }
  const getStandings =async () =>{
       chrome.storage.local.get(["CFhandle"] ,async(hande)=>{
            setHandle(hande.CFhandle)
            const url = `https://codeforces.com/api/user.rating?handle=${hande.CFhandle}`;
            try {
                const response = await fetch(url);
                const data = await response.json();
                if (data.status === "OK") {
                     let ku:any[] =rever(data.result);
                     SetStand(ku);
                    } else {
                        throw new Error("API Error");
                    }
                } catch (error) {
                    console.error("Failed to fetch standings:", error);
                    return null;
                }
            })
            
        }
        // console.log(Stand)

      useEffect(()=>{
          
          getStandings();
        }
        ,[])

  const getRatingChangeColor = (change:any) => {
    return change >= 0 ? '#008000' : '#ff0000';
  };

  let url =`https://codeforces.com/contests/with/${handle}`

  return (
    <div className="standings-container">
      <div className="standings-content">
        <div className="standings-header">
          <div>
            <h1 className="standings-title">
              Recent CF Standings
            </h1>
            <p className="standings-subtitle">
              Latest contest results and rankings
            </p>
          </div>
          <div className="standings-nav">
            <button className="nav-button" onClick={()=>{setPage('content')}}>🏠 Home</button>
          </div>
        </div>

        <div className="standings-table-container">
          <table className="standings-table">
            <thead>
              <tr>
                <th>Contest</th>
                <th>Rank</th>
                <th>Handle</th>
                <th>Current Rating</th>
                <th>Previous Rating</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {Stand.map((standing) => (
                <tr className="standing-row">
                  <td className="contest-name-cell">
                    {standing.Name}
                  </td>
                  <td className="rank-cell">
                    #{standing.rank}
                  </td>
                  <td className="handle-cell">
                    <span 
                      className="handle-name"
                      style={{ color: getRatingColor(standing.New_rating) }}
                    >
                      {standing.handle}
                    </span>
                  </td>
                  <td className="rating-cell">
                    <span style={{ color: getRatingColor(standing.New_rating) }}>
                      {standing.New_rating}
                    </span>
                  </td>
                  <td className="rating-cell">
                    <span style={{ color: getRatingColor(standing.New_rating) }}>
                      {standing.Previous_rating}
                    </span>
                  </td>
                  <td className="change-cell">
                    <span 
                      className="rating-change"
                      style={{ color: getRatingChangeColor(standing.Change) }}
                    >
                      {standing.Change}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="standings-footer">
          <div className="footer-card">
            <p className="footer-text">
              Track your progress and compare with top performers
            </p>
            <a 
              href={url}
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-button"
            >
             View All Standings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentStandings;
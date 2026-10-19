import React from "react";
import FrontPage from "./frontpage";
import ContentPage from "./contentPage";
import Settings from "./settings";
import UpcomingContests from "./contests";
import RecentStandings from "./standings";
 const App:React.FC=()=>{
    const [Page ,setPage] = React.useState<string>('');

    React.useEffect(()=>{

        chrome.storage.local.get(['CFhandle'], (result)=>{
            setPage(result.CFhandle ? 'content' : 'front')
        });
    },[]);
    return (
        <>
           { Page=='front' &&<FrontPage setPage={setPage} />}
           { Page=='content' &&<ContentPage setPage={setPage} />}
           { Page=='settings' && <Settings setPage={setPage}/>}
            { Page=='contests' && <UpcomingContests setPage={setPage}/>}
            { Page=='standings' && <RecentStandings setPage={setPage}/>}

        </>
    );
};
export default App;
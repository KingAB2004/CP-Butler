chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "fetchAC") {
    fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query recentAcSubmissions($username: String!) {
            recentAcSubmissionList(username: $username) {
              id
              title
              titleSlug 
              timestamp
            }
          }
        `,
        variables: { username: msg.username }
      })
    })
      .then(res => res.json())
      .then(async data => {
        if (!data.data?.recentAcSubmissionList) {
          console.error("No submissions found");
          sendResponse({ acList: [] });
          return;
        }

        const subs = data.data.recentAcSubmissionList;
        // console.log(subs)
        const detailedSubs = await Promise.all(
          subs.map(async sub => {
            console.log("Fetching difficulty for:", sub.titleSlug);

            try {
              const detailRes = await fetch("https://leetcode.com/graphql", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  query: `
                    query getQuestionDetail($titleSlug: String!) {
                      question(titleSlug: $titleSlug) {
                        difficulty
                      }
                    }
                  `,
                  variables: { titleSlug: sub.titleSlug }
                })
              });

              const detailData = await detailRes.json();
              // console.log(detailData)
              return {
                ...sub,
                difficulty: detailData.data.question?.difficulty || "Unknown"
              };
            } catch (error) {
              // console.log(error)
              return { ...sub, difficulty: "Unknown" };
            }
          })
        );

        sendResponse({ acList: detailedSubs });
      })
      .catch(err => sendResponse({ error: err.message }));

    return true;
  }
});

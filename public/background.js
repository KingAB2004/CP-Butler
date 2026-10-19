chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "fetchAC") {
    fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query recentAcSubmissions($username: String!, $limit: Int!) {
            recentAcSubmissionList(username: $username, limit: $limit) {
              id
              title
              titleSlug 
              timestamp
            }
          }
        `,
        variables: { username: msg.username, limit: 20 }
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
        const { lcDifficulty = {} } = await chrome.storage.local.get("lcDifficulty");
        const detailedSubs = await Promise.all(
          subs.map(async sub => {
            if (lcDifficulty[sub.titleSlug]) {
              return { ...sub, difficulty: lcDifficulty[sub.titleSlug] };
            }
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
              if (detailData.data.question?.difficulty) {
                lcDifficulty[sub.titleSlug] = detailData.data.question.difficulty;
              }
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

        await chrome.storage.local.set({ lcDifficulty });
        sendResponse({ acList: detailedSubs });
      })
      .catch(err => sendResponse({ error: err.message }));

    return true;
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "validateLC") {
    fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query matchedUser($username: String!) {
            matchedUser(username: $username) {
              username
            }
          }
        `,
        variables: { username: msg.username }
      })
    })
      .then(res => res.json())
      .then(data => sendResponse({ username: data.data?.matchedUser?.username ?? null }))
      .catch(err => sendResponse({ error: err.message }));

    return true;
  }

  if (msg.type === "getContests") {
    getContests().then(sendResponse);
    return true;
  }
});

async function getCodeforcesContests() {
  const data = await fetch("https://codeforces.com/api/contest.list").then(res => res.json());
  return data.result
    .filter(contest => contest.phase === "BEFORE" || contest.phase === "CODING")
    .map(contest => ({
      id: `cf:${contest.id}`,
      platform: "Codeforces",
      name: contest.name,
      start: contest.startTimeSeconds * 1000,
      duration: contest.durationSeconds,
      url: `https://codeforces.com/contests/${contest.id}`
    }));
}

async function getLeetcodeContests() {
  const data = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query {
          upcomingContests {
            title
            titleSlug
            startTime
            duration
          }
        }
      `
    })
  }).then(res => res.json());
  return data.data.upcomingContests.map(contest => ({
    id: `lc:${contest.titleSlug}`,
    platform: "LeetCode",
    name: contest.title,
    start: contest.startTime * 1000,
    duration: contest.duration,
    url: `https://leetcode.com/contest/${contest.titleSlug}`
  }));
}

async function getCodechefContests() {
  const data = await fetch(
    "https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all"
  ).then(res => res.json());
  return [...data.present_contests, ...data.future_contests].map(contest => ({
    id: `cc:${contest.contest_code}`,
    platform: "CodeChef",
    name: contest.contest_name,
    start: Date.parse(contest.contest_start_date_iso),
    duration: Number(contest.contest_duration) * 60,
    url: `https://www.codechef.com/${contest.contest_code}`
  }));
}

async function getAtcoderContests() {
  const html = await fetch("https://atcoder.jp/contests/?lang=en").then(res => res.text());
  const row = /<time[^>]*>([^<]+)<\/time>[\s\S]*?<a href="\/contests\/([^"]+)">([^<]+)<\/a>[\s\S]*?<td class="text-center">(\d+):(\d+)<\/td>/g;
  const contests = [];
  for (const table of ["contest-table-action", "contest-table-upcoming"]) {
    const from = html.indexOf(`id="${table}"`);
    if (from === -1) continue;
    for (const [, time, code, name, hours, minutes] of html.slice(from, html.indexOf("</table>", from)).matchAll(row)) {
      contests.push({
        id: `ac:${code}`,
        platform: "AtCoder",
        name: name.replace(/&amp;/g, "&"),
        start: Date.parse(time.replace(" ", "T").replace(/(\d{2})(\d{2})$/, "$1:$2")),
        duration: (Number(hours) * 60 + Number(minutes)) * 60,
        url: `https://atcoder.jp/contests/${code}`
      });
    }
  }
  return contests;
}

async function getContests() {
  const platforms = ["Codeforces", "LeetCode", "CodeChef", "AtCoder"];
  const results = await Promise.allSettled([
    getCodeforcesContests(),
    getLeetcodeContests(),
    getCodechefContests(),
    getAtcoderContests()
  ]);
  const contests = results
    .flatMap(result => (result.status === "fulfilled" ? result.value : []))
    .filter(contest => contest.start + contest.duration * 1000 > Date.now())
    .sort((a, b) => a.start - b.start);
  const failed = platforms.filter((platform, i) => results[i].status === "rejected");
  await chrome.storage.local.set({ contestCache: contests });
  return { contests, failed };
}

async function scheduleReminders() {
  const { reminders = {}, reminderLead = 15 } = await chrome.storage.local.get(["reminders", "reminderLead"]);
  await chrome.alarms.clearAll();
  Object.values(reminders).forEach(contest => {
    chrome.alarms.create(contest.id, { when: Math.max(contest.start - reminderLead * 60000, Date.now() + 1000) });
  });
}

chrome.storage.onChanged.addListener(changes => {
  if (changes.reminders || changes.reminderLead) scheduleReminders();
});

chrome.alarms.onAlarm.addListener(async alarm => {
  const { reminders = {} } = await chrome.storage.local.get("reminders");
  const contest = reminders[alarm.name];
  if (!contest) return;
  delete reminders[alarm.name];
  await chrome.storage.local.set({ reminders });
  if (contest.start < Date.now()) return;
  chrome.notifications.create(contest.url, {
    type: "basic",
    iconUrl: "icon.png",
    title: `${contest.platform} contest in ${Math.round((contest.start - Date.now()) / 60000)} min`,
    message: contest.name,
    priority: 2
  });
});

chrome.notifications.onClicked.addListener(url => {
  chrome.tabs.create({ url });
  chrome.notifications.clear(url);
});

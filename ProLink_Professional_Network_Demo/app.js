(() => {
  const $ = (id) => document.getElementById(id);
  const DEMO = {
    email: "demo@prolink.test",
    password: "demopass",
    name: "Demo Creator",
  };
  const people = [
    {
      id: 1,
      name: "Jordan Miller",
      role: "Product Designer · UX",
      initials: "JM",
      color: "av-blue",
    },
    {
      id: 2,
      name: "Alex Lee",
      role: "Software Engineer",
      initials: "AL",
      color: "av-gold",
    },
    {
      id: 3,
      name: "Sam Kim",
      role: "Marketing Lead",
      initials: "SK",
      color: "av-purple",
    },
    {
      id: 4,
      name: "Taylor Santos",
      role: "People Operations",
      initials: "TS",
      color: "av-green",
    },
    {
      id: 5,
      name: "Morgan Reyes",
      role: "Data Analyst",
      initials: "MR",
      color: "av-pink",
    },
  ];
  const initialPosts = [
    {
      id: 101,
      name: "Jordan Miller",
      role: "Product Designer · UX",
      initials: "JM",
      color: "av-blue",
      time: "2h",
      text: "A reminder for anyone building digital products: the best design is not the one that looks the most impressive. It’s the one that makes someone’s day a little easier. ✨\n\nWhat’s one small detail in an app that you really appreciate?",
      likes: 24,
      comments: [
        {
          name: "Alex Lee",
          text: "Clear labels and thoughtful empty states make a huge difference.",
        },
      ],
      liked: false,
      saved: false,
    },
    {
      id: 102,
      name: "Alex Lee",
      role: "Software Engineer",
      initials: "AL",
      color: "av-gold",
      time: "4h",
      text: "This week’s learning goal: write code that the next person can understand without needing a meeting to explain it.\n\nReadable code is a kindness to your future self and your teammates. 💻",
      likes: 37,
      comments: [],
      liked: false,
      saved: false,
    },
    {
      id: 103,
      name: "Sam Kim",
      role: "Marketing Lead",
      initials: "SK",
      color: "av-purple",
      time: "6h",
      text: "Quick community poll! Which skill are you focusing on this month?",
      poll: {
        question: "What are you learning this month?",
        options: ["Communication", "Data & analytics"],
        votes: [12, 9],
        voted: null,
      },
      likes: 16,
      comments: [],
      liked: false,
      saved: false,
    },
    {
      id: 104,
      name: "Taylor Santos",
      role: "People Operations",
      initials: "TS",
      color: "av-green",
      time: "1d",
      text: "Interview tip: bring a thoughtful question about the team’s work. It shows curiosity, helps you assess the role, and makes the conversation feel more like a two-way exchange.",
      likes: 51,
      comments: [
        {
          name: "Morgan Reyes",
          text: "Great advice! I always ask how success is measured in the first 90 days.",
        },
      ],
      liked: false,
      saved: false,
    },
  ];
  let user = null,
    mode = "login",
    posts = [],
    connections = [],
    dismissed = [],
    currentView = "feed",
    showAllNews = false,
    toastTimer,
    searchQuery = "",
    sortNewest = false,
    tipIndex = 0;
  const tips = [
    "Share what you're learning. Small updates can start meaningful professional conversations.",
    "A specific headline helps people understand your strengths at a glance.",
    "When sending a connection request, include a friendly note about how you know someone.",
    "Comment thoughtfully on posts in your field to build genuine connections.",
  ];
  const news = [
    [
      "The power of practical digital skills",
      "Learning & development · 2,140 readers",
    ],
    [
      "Small teams are rethinking how they collaborate",
      "Workplace trends · 1,702 readers",
    ],
    [
      "Five ways to make your portfolio stand out",
      "Career advice · 987 readers",
    ],
    [
      "Why clear communication is a career superpower",
      "Professional growth · 764 readers",
    ],
    ["Community-led learning is gaining momentum", "Education · 641 readers"],
  ];
  function initials(name) {
    return (name || "User")
      .split(/\s+/)
      .slice(0, 2)
      .map((x) => x[0])
      .join("")
      .toUpperCase();
  }
  function esc(s) {
    return String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }
  function load() {
    try {
      posts =
        JSON.parse(localStorage.getItem("prolink_posts")) ||
        structuredClone(initialPosts);
      connections =
        JSON.parse(localStorage.getItem("prolink_connections")) || [];
      dismissed = JSON.parse(localStorage.getItem("prolink_dismissed")) || [];
    } catch (e) {
      posts = structuredClone(initialPosts);
      connections = [];
      dismissed = [];
    }
  }
  function save() {
    localStorage.setItem("prolink_posts", JSON.stringify(posts));
    localStorage.setItem("prolink_connections", JSON.stringify(connections));
    localStorage.setItem("prolink_dismissed", JSON.stringify(dismissed));
  }
  function toast(msg) {
    const el = $("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
  }
  function setMode(next) {
    mode = next;
    $("authTitle").textContent =
      mode === "login" ? "Welcome back" : "Create your account";
    $("authSubtitle").textContent =
      mode === "login"
        ? "Sign in to continue to your professional network."
        : "Build your profile and start growing your network.";
    $("authSubmit").textContent =
      mode === "login" ? "Sign in" : "Create account";
    $("nameField").classList.toggle("hidden", mode === "login");
    $("fullName").required = mode === "register";
    $("switchCopy").innerHTML =
      mode === "login"
        ? 'New to ProLink? <button class="text-btn" id="switchMode">Create an account</button>'
        : 'Already have an account? <button class="text-btn" id="switchMode">Sign in</button>';
    $("authError").textContent = "";
    $("switchMode").onclick = () =>
      setMode(mode === "login" ? "register" : "login");
  }
  function enter(name, email) {
    user = { name, email };
    $("authScreen").classList.add("hidden");
    $("appScreen").classList.remove("hidden");
    $("profileName").textContent = name;
    $("profileAvatar").textContent = initials(name);
    $("topAvatar").textContent = initials(name);
    $("composerAvatar").textContent = initials(name);
    $("modalAvatar").textContent = initials(name);
    $("modalName").textContent = name;
    renderAll();
    toast("Welcome to ProLink, " + name.split(" ")[0] + "!");
  }
  $("authForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("email").value.trim().toLowerCase(),
      pass = $("password").value;
    if (mode === "login") {
      if (email === DEMO.email && pass === DEMO.password) {
        enter("Demo Creator", email);
        return;
      }
      const saved = JSON.parse(localStorage.getItem("prolink_users") || "{}");
      if (saved[email] && saved[email].password === pass) {
        enter(saved[email].name, email);
        return;
      }
      $("authError").textContent =
        "We couldn't find that account. Try the demo account below or register.";
    } else {
      const name = $("fullName").value.trim();
      if (name.length < 2) {
        $("authError").textContent = "Please enter your full name.";
        return;
      }
      if (email === DEMO.email) {
        $("authError").textContent =
          "That email is reserved for the demo account.";
        return;
      }
      const saved = JSON.parse(localStorage.getItem("prolink_users") || "{}");
      if (saved[email]) {
        $("authError").textContent =
          "An account with this email already exists. Please sign in.";
        return;
      }
      saved[email] = { name, password: pass };
      localStorage.setItem("prolink_users", JSON.stringify(saved));
      enter(name, email);
      toast("Account created on this device.");
    }
  });
  $("demoLogin").onclick = () => enter("Demo Creator", DEMO.email);
  $("showLoginTop").onclick = () => setMode("login");
  $("switchMode").onclick = () => setMode("register");
  function avatar(p, large = false) {
    return `<span class="avatar ${p.color || "av-blue"} ${large ? "avatar-large" : ""}">${esc(p.initials || initials(p.name))}</span>`;
  }
  function renderAll() {
    renderFeed();
    renderSuggestions();
    renderNews();
    updateCounts();
    renderViewTitle();
    $("profileHeadline").textContent =
      user.email === DEMO.email
        ? "Building things. Connecting people."
        : "Professional community member";
    $("viewerCount").textContent = 128 + connections.length * 7;
    $("impressions").textContent = (
      842 +
      posts.filter((p) => p.name === user.name).length * 31
    ).toLocaleString();
  }
  function updateCounts() {
    $("savedCount").textContent = posts.filter((p) => p.saved).length;
    $("networkBadge").textContent = Math.max(0, 3 - connections.length);
    $("notificationBadge").textContent = "2";
  }
  function renderFeed() {
    const list = $("feedList");
    let arr = posts.filter((p) =>
      (p.text + " " + p.name + " " + p.role)
        .toLowerCase()
        .includes(searchQuery),
    );
    if (currentView === "saved") arr = arr.filter((p) => p.saved);
    if (sortNewest) arr = [...arr].reverse();
    if (!arr.length) {
      list.innerHTML = `<section class="panel empty-state"><div class="empty-icon">⌕</div><h3>${currentView === "saved" ? "No saved posts yet" : "No posts found"}</h3><p>${currentView === "saved" ? "Save a post from your feed to keep it handy." : "Try a different search phrase."}</p><button class="primary-btn" onclick="document.getElementById('globalSearch').value='';document.getElementById('globalSearch').dispatchEvent(new Event('input'))">Back to feed</button></section>`;
      return;
    }
    list.innerHTML = arr.map(postHTML).join("");
  }
  function postHTML(p) {
    const comments = p.comments || [];
    return `<article class="panel post" data-post="${p.id}"><div class="post-head">${avatar(p)}<div class="post-author"><b>${esc(p.name)} ${p.name === user.name ? '<span class="muted">(You)</span>' : ""}</b><small>${esc(p.role || "Professional community member")}</small><small>${esc(p.time || "Just now")} · ◉</small></div><button class="post-menu" data-post-action="menu" data-id="${p.id}" aria-label="Post options">···</button></div><p class="post-text">${esc(p.text)}</p>${p.image ? '<div class="post-image">✦</div>' : ""}${p.poll ? `<div class="poll-box"><b>${esc(p.poll.question)}</b>${p.poll.options.map((o, i) => `<button class="poll-option ${p.poll.voted === i ? "voted" : ""}" data-post-action="vote" data-id="${p.id}" data-option="${i}">${esc(o)} <span style="float:right">${p.poll.votes[i]} votes</span></button>`).join("")}<div class="poll-note">${p.poll.voted === null ? "Choose an option to vote" : "Your vote has been recorded"} · ${p.poll.votes.reduce((a, b) => a + b, 0)} votes</div></div>` : ""}<div class="post-stats"><span>👍 ${p.likes} reactions</span><span>${comments.length} comments · 0 reposts</span></div><div class="post-actions"><button class="${p.liked ? "liked" : ""}" data-post-action="like" data-id="${p.id}">${p.liked ? "♥" : "♡"} Like</button><button data-post-action="comment" data-id="${p.id}">▢ Comment</button><button data-post-action="repost" data-id="${p.id}">⟳ Repost</button><button class="${p.saved ? "saved" : ""}" data-post-action="save" data-id="${p.id}">${p.saved ? "▣" : "▤"} Save</button></div>${comments.length ? `<div class="comment-area">${comments.map((c) => `<div class="comment"><b>${esc(c.name)}</b>${esc(c.text)}</div>`).join("")}</div>` : ""}<div class="comment-area hidden" id="commentArea${p.id}"><form class="comment-row" data-comment-form="${p.id}"><input aria-label="Write a comment" placeholder="Add a thoughtful comment..." required maxlength="400"><button type="submit">Send</button></form></div></article>`;
  }
  function renderSuggestions() {
    const wrap = $("suggestions");
    const available = people
      .filter((p) => !connections.includes(p.id) && !dismissed.includes(p.id))
      .slice(0, 3);
    wrap.innerHTML = available.length
      ? available
          .map(
            (p) =>
              `<div class="person-row">${avatar(p)}<div class="person-info"><b>${esc(p.name)}</b><small>${esc(p.role)}</small></div><button class="connect-btn" data-person-action="connect" data-id="${p.id}">＋ Connect</button></div>`,
          )
          .join("")
      : `<p class="muted" style="padding:10px 14px;font-size:11px">You're all caught up. Check back later!</p>`;
  }
  function renderNews() {
    const list = $("newsList");
    list.innerHTML = news
      .slice(0, showAllNews ? news.length : 3)
      .map(
        (n, i) =>
          `<div class="news-item" data-news="${i}" tabindex="0"><b>${esc(n[0])}</b><small>${esc(n[1])}</small></div>`,
      )
      .join("");
    $("refreshNews").textContent = showAllNews
      ? "Show fewer stories ↑"
      : "Show more stories →";
  }
  function renderViewTitle() {
    const titles = {
      feed: "Home",
      network: "My Network",
      jobs: "Explore Jobs",
      messages: "Messaging",
      notifications: "Notifications",
      saved: "Saved Posts",
      events: "Community Events",
      profile: "My Profile",
      settings: "Settings",
    };
    $("pageTitle").textContent = titles[currentView] || "Home";
    document
      .querySelectorAll(".nav-item")
      .forEach((n) =>
        n.classList.toggle("active", n.dataset.view === currentView),
      );
  }
  function view(view) {
    currentView = view;
    renderViewTitle();
    const main = $("viewContent");
    if (["feed", "saved"].includes(view)) {
      main.classList.remove("view-special");
      main.innerHTML = `${view === "feed" ? `<section class="panel composer"><div class="composer-row"><span id="composerAvatar" class="avatar av-blue">${initials(user.name)}</span><button id="composerOpen" class="composer-input">Start a post, share an idea...</button></div><div class="composer-actions"><button id="photoPost">▧ <span>Photo</span></button><button id="writeArticle">▤ <span>Write an article</span></button><button id="pollPost">▥ <span>Create a poll</span></button></div></section>` : ""}<div class="feed-sort"><span>${view === "saved" ? "Posts you've saved" : "Recommended for you"}</span><span class="sort-line"></span><button id="sortButton">${sortNewest ? "Newest" : "Top"} ▾</button></div><div id="feedList"></div>`;
      bindComposer();
      renderFeed();
      return;
    }
    main.innerHTML = specialViewHTML(view);
    bindSpecialView();
    if (view === "network") renderNetwork();
    if (view === "jobs") renderJobs();
    if (view === "messages") renderMessages();
    if (view === "notifications") renderNotifications();
  }
  function specialViewHTML(v) {
    if (v === "network")
      return `<section class="panel"><div class="section-head"><h2>Grow your network</h2><p class="muted">Connect with people who share your interests.</p></div><div id="networkList"></div></section>`;
    if (v === "jobs")
      return `<section class="panel"><div class="section-head"><h2>Find your next opportunity</h2><p class="muted">Sample listings for this front-end demo.</p><label class="searchbox job-search">⌕ <input id="jobSearch" placeholder="Search roles or companies"></label></div><div id="jobList"></div></section>`;
    if (v === "messages")
      return `<section class="panel"><div class="section-head"><h2>Messaging</h2><p class="muted">Start a conversation with a connection.</p></div><div id="messageList"></div><div id="chatPanel" class="chat-panel hidden"></div></section>`;
    if (v === "notifications")
      return `<section class="panel"><div class="section-head"><h2>Notifications</h2><p class="muted">You're up to date with your community.</p></div><div id="notificationList"></div></section>`;
    if (v === "events")
      return `<section class="panel section-head"><h2>Community events</h2><p class="muted">Meet, learn, and share ideas.</p><div id="eventList"></div></section>`;
    if (v === "profile")
      return `<section class="panel profile-page"><div class="cover"></div>${avatar({ name: user.name, initials: initials(user.name), color: "av-blue" }, true)}<h2>${esc(user.name)}</h2><p>${user.email === DEMO.email ? "Building things. Connecting people." : "Professional community member"}</p><p class="muted">Manila, Philippines · Demo profile</p><button class="primary-btn" id="editProfile">Edit profile</button><div class="profile-about"><h3>About</h3><p>Curious professional who enjoys learning, sharing ideas, and meeting people across disciplines.</p><h3>Activity</h3><p>${posts.filter((p) => p.name === user.name).length} posts · ${connections.length} connections</p></div></section>`;
    if (v === "settings")
      return `<section class="panel section-head"><h2>Settings</h2><p class="muted">Manage your local demo experience.</p><div class="setting-row"><div><b>Profile visibility</b><p class="muted">Your demo profile is visible in this browser session.</p></div><button id="visibilityToggle" class="connect-btn">Public</button></div><div class="setting-row"><div><b>Reset demo data</b><p class="muted">Restore sample posts and clear local changes.</p></div><button id="resetData" class="connect-btn">Reset</button></div><div class="setting-row"><div><b>Account</b><p class="muted">${esc(user.email)}</p></div><button id="signOutSettings" class="connect-btn">Sign out</button></div></section>`;
    return `<section class="panel section-head"><h2>Coming up in your community</h2><p class="muted">Events are sample content; RSVP actions work locally.</p><div id="eventList"></div></section>`;
  }
  function renderNetwork() {
    const list = $("networkList");
    list.innerHTML = people
      .map(
        (p) =>
          `<div class="person-row network-person">${avatar(p)}<div class="person-info"><b>${esc(p.name)}</b><small>${esc(p.role)} · Manila, Philippines</small></div>${connections.includes(p.id) ? `<button class="connect-btn connected" data-person-action="disconnect" data-id="${p.id}">✓ Connected</button>` : `<button class="connect-btn" data-person-action="connect" data-id="${p.id}">＋ Connect</button>`}</div>`,
      )
      .join("");
  }
  function renderJobs() {
    const jobs = [
      [
        "Junior UI/UX Designer",
        "Northstar Studio",
        "Remote · Full-time",
        "Design",
      ],
      [
        "Frontend Developer",
        "Brightloop Digital",
        "Makati · Hybrid",
        "Engineering",
      ],
      [
        "Marketing Associate",
        "Goodday Creative",
        "Remote · Full-time",
        "Marketing",
      ],
      [
        "Data Analyst Intern",
        "Insight Works",
        "Quezon City · Internship",
        "Data",
      ],
      ["People & Culture Assistant", "Kindred Co.", "BGC · Hybrid", "People"],
    ];
    const q = ($("jobSearch")?.value || "").toLowerCase();
    $("jobList").innerHTML =
      jobs
        .filter((j) => j.join(" ").toLowerCase().includes(q))
        .map(
          (j, i) =>
            `<div class="job-row"><div class="job-logo">${j[0][0]}</div><div class="job-info"><b>${esc(j[0])}</b><small>${esc(j[1])}</small><small>${esc(j[2])} · ${esc(j[3])}</small></div><button class="connect-btn" data-job="${i}">${localStorage.getItem("prolink_job_" + i) ? "✓ Saved" : "☆ Save"}</button></div>`,
        )
        .join("") ||
      '<p class="muted" style="padding:20px">No matching jobs. Try another search.</p>';
  }
  function renderMessages() {
    const list = $("messageList"),
      contacts = people.filter((p) => connections.includes(p.id));
    list.innerHTML = contacts.length
      ? contacts
          .map(
            (p) =>
              `<button class="message-person" data-chat="${p.id}">${avatar(p)}<span><b>${esc(p.name)}</b><small>Tap to open conversation</small></span><span>›</span></button>`,
          )
          .join("")
      : `<div class="empty-state"><div class="empty-icon">✉</div><h3>Your inbox starts here</h3><p>Connect with someone first, then start a conversation.</p><button class="primary-btn" data-view="network">Find people</button></div>`;
  }
  function renderNotifications() {
    const list = $("notificationList");
    list.innerHTML = `<div class="notification-row">${avatar(people[0])}<div><b>Jordan Miller</b> shared a new post with the community.<small>2 hours ago</small></div><button class="connect-btn" data-view="feed">View</button></div><div class="notification-row">${avatar(people[2])}<div><b>Sam Kim</b> created a poll you might like.<small>6 hours ago</small></div><button class="connect-btn" data-view="feed">View</button></div><div class="notification-row">${avatar(people[1])}<div><b>ProLink</b> Welcome! Complete your profile and connect with people.</div><button class="connect-btn" data-action="profile">Profile</button></div>`;
  }
  function bindComposer() {
    ["composerOpen", "newPostTop"].forEach((id) => {
      const b = $(id);
      if (b) b.onclick = () => openPost("post");
    });
    const photo = $("photoPost");
    if (photo) photo.onclick = () => openPost("photo");
    const article = $("writeArticle");
    if (article) article.onclick = () => openPost("article");
    const poll = $("pollPost");
    if (poll) poll.onclick = () => openPost("poll");
    const sort = $("sortButton");
    if (sort)
      sort.onclick = () => {
        sortNewest = !sortNewest;
        renderFeed();
        $("sortButton").textContent = (sortNewest ? "Newest" : "Top") + " ▾";
      };
  }
  function openPost(type) {
    $("postForm").reset();
    $("pollFields").classList.toggle("hidden", type !== "poll");
    $("postModalTitle").textContent =
      type === "poll"
        ? "Create a poll"
        : type === "article"
          ? "Write an article"
          : type === "photo"
            ? "Share a photo"
            : "Create a post";
    $("postText").placeholder =
      type === "article"
        ? "Write your article introduction..."
        : type === "photo"
          ? "Add a caption for your photo..."
          : "What would you like to share?";
    $("postDialog").dataset.type = type;
    $("postDialog").showModal();
    $("postText").focus();
  }
  $("closePost").onclick = () => $("postDialog").close();
  $("postForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const type = $("postDialog").dataset.type || "post",
      text = $("postText").value.trim();
    let poll = null;
    if (type === "poll") {
      const q = $("pollQuestion").value.trim(),
        a = $("pollOne").value.trim(),
        b = $("pollTwo").value.trim();
      if (!q || !a || !b) {
        toast("Add a question and two options for your poll.");
        return;
      }
      poll = { question: q, options: [a, b], votes: [0, 0], voted: null };
    }
    if (!text && !poll) {
      toast("Write something before posting.");
      return;
    }
    posts.unshift({
      id: Date.now(),
      name: user.name,
      role: "Professional community member",
      initials: initials(user.name),
      color: "av-blue",
      time: "Just now",
      text: text || poll.question,
      likes: 0,
      comments: [],
      liked: false,
      saved: false,
      poll,
      image: type === "photo",
    });
    save();
    $("postDialog").close();
    currentView = "feed";
    renderViewTitle();
    view("feed");
    toast(
      type === "poll"
        ? "Your poll is live!"
        : type === "article"
          ? "Your article has been published!"
          : "Your post has been published!",
    );
  });
  $("feedList").addEventListener("click", handlePostAction);
  $("viewContent").addEventListener("click", (e) => {
    if (e.target.closest("[data-post-action]")) handlePostAction(e);
  });
  function handlePostAction(e) {
    const b = e.target.closest("[data-post-action]");
    if (!b) return;
    const p = posts.find((x) => String(x.id) === b.dataset.id);
    if (!p) return;
    const action = b.dataset.postAction;
    if (action === "like") {
      p.liked = !p.liked;
      p.likes += p.liked ? 1 : -1;
      save();
      renderFeed();
    }
    if (action === "save") {
      p.saved = !p.saved;
      save();
      renderFeed();
      updateCounts();
      toast(p.saved ? "Post saved." : "Removed from saved posts.");
    }
    if (action === "comment") {
      const area = $("commentArea" + p.id);
      if (area) {
        area.classList.toggle("hidden");
        area.querySelector("input")?.focus();
      }
    }
    if (action === "repost") {
      if (p.name === user.name) {
        toast("This is already your post.");
        return;
      }
      posts.unshift({
        ...p,
        id: Date.now(),
        name: user.name,
        initials: initials(user.name),
        color: "av-blue",
        time: "Just now",
        text: "Reposted from " + p.name + ":\n\n" + p.text,
        likes: 0,
        comments: [],
        liked: false,
        saved: false,
        poll: null,
      });
      save();
      renderFeed();
      toast("Reposted to your feed.");
    }
    if (action === "vote") {
      if (!p.poll || p.poll.voted !== null) {
        toast("You've already voted in this poll.");
        return;
      }
      p.poll.voted = Number(b.dataset.option);
      p.poll.votes[p.poll.voted]++;
      save();
      renderFeed();
      toast("Your vote has been counted.");
    }
    if (action === "menu") {
      showInfo(
        "Post options",
        "Choose Like, Comment, Save, or Repost below the post. This demo keeps your changes in this browser.",
      );
    }
  }
  $("feedList").addEventListener("submit", submitComment);
  $("viewContent").addEventListener("submit", submitComment);
  function submitComment(e) {
    const form = e.target.closest("[data-comment-form]");
    if (!form) return;
    e.preventDefault();
    const p = posts.find((x) => String(x.id) === form.dataset.commentForm),
      input = form.querySelector("input"),
      text = input.value.trim();
    if (!text) return;
    p.comments.push({ name: user.name, text });
    save();
    renderFeed();
    toast("Comment added.");
  }

  document.addEventListener("click", (e) => {
    const v = e.target.closest("[data-view]");
    if (v) {
      e.preventDefault();
      view(v.dataset.view);
      $("profileDropdown").classList.add("hidden");
      return;
    }
    const p = e.target.closest("[data-person-action]");
    if (p) {
      const id = Number(p.dataset.id);
      if (p.dataset.personAction === "connect") {
        if (!connections.includes(id)) connections.push(id);
        toast(
          "Connection request sent to " +
            people.find((x) => x.id === id).name +
            ".",
        );
      } else {
        connections = connections.filter((x) => x !== id);
        toast("Connection removed.");
      }
      save();
      renderSuggestions();
      updateCounts();
      if (currentView === "network") renderNetwork();
      if (currentView === "messages") renderMessages();
      return;
    }
    const job = e.target.closest("[data-job]");
    if (job) {
      const key = "prolink_job_" + job.dataset.job;
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        toast("Job removed from saved list.");
      } else {
        localStorage.setItem(key, "1");
        toast("Job saved.");
      }
      renderJobs();
      return;
    }
    const chat = e.target.closest("[data-chat]");
    if (chat) {
      const person = people.find((p) => p.id === Number(chat.dataset.chat));
      openChat(person);
      return;
    }
    const act = e.target.closest("[data-action]");
    if (act) {
      const a = act.dataset.action;
      if (a === "logout") {
        logout();
      } else if (a === "profile" || a === "settings") {
        view(a);
      } else
        showInfo(
          act.dataset.info || "ProLink",
          `${act.dataset.info || "ProLink"} is represented as a demo page in this front-end prototype.`,
        );
      $("profileDropdown").classList.add("hidden");
      return;
    }
    const n = e.target.closest("[data-news]");
    if (n) {
      showInfo(
        news[n.dataset.news][0],
        news[n.dataset.news][1] +
          ". This is sample briefing content included for the demo.",
      );
      return;
    }
    const event = e.target.closest("[data-event]");
    if (event) {
      const key = "prolink_event_" + event.dataset.event;
      localStorage.setItem(key, "1");
      event.textContent = "✓ You're attending";
      event.disabled = true;
      toast("You're on the attendee list!");
      return;
    }
  });
  function bindSpecialView() {
    if (currentView === "jobs") {
      $("jobSearch").addEventListener("input", renderJobs);
    }
    if (currentView === "events") renderEvents();
    if (currentView === "profile")
      $("editProfile").onclick = () => {
        const name = prompt("What name would you like to show?", user.name);
        if (name && name.trim().length > 1) {
          user.name = name.trim();
          if (user.email !== DEMO.email) {
            const u = JSON.parse(localStorage.getItem("prolink_users") || "{}");
            if (u[user.email]) {
              u[user.email].name = user.name;
              localStorage.setItem("prolink_users", JSON.stringify(u));
            }
          }
          $("profileName").textContent = user.name;
          $("profileAvatar").textContent = initials(user.name);
          $("topAvatar").textContent = initials(user.name);
          $("composerAvatar") &&
            ($("composerAvatar").textContent = initials(user.name));
          renderAll();
          view("profile");
          toast("Profile updated.");
        }
      };
    if (currentView === "settings") {
      $("visibilityToggle").onclick = (e) => {
        const b = e.currentTarget;
        b.textContent = b.textContent === "Public" ? "Private" : "Public";
        toast("Profile visibility set to " + b.textContent.toLowerCase() + ".");
      };
      $("resetData").onclick = () => {
        if (
          confirm("Reset all local posts, connections, and saved demo changes?")
        ) {
          localStorage.removeItem("prolink_posts");
          localStorage.removeItem("prolink_connections");
          localStorage.removeItem("prolink_dismissed");
          for (let i = 0; i < 5; i++)
            localStorage.removeItem("prolink_job_" + i);
          load();
          renderAll();
          view("settings");
          toast("Demo data reset.");
        }
      };
      $("signOutSettings").onclick = logout;
    }
  }
  function renderEvents() {
    const events = [
      [
        "Portfolio Feedback Circle",
        "Oct 15 · Online",
        "Bring a project and get constructive feedback.",
      ],
      [
        "Designing Better Teamwork",
        "Oct 18 · Manila",
        "A casual community conversation about collaboration.",
      ],
      [
        "Career Switchers Coffee Chat",
        "Oct 22 · Online",
        "Meet people navigating a new professional chapter.",
      ],
    ];
    $("eventList").innerHTML = events
      .map(
        (e, i) =>
          `<div class="job-row"><div class="job-logo">✦</div><div class="job-info"><b>${e[0]}</b><small>${e[1]}</small><small>${e[2]}</small></div><button class="connect-btn" data-event="${i}" ${localStorage.getItem("prolink_event_" + i) ? "disabled" : ""}>${localStorage.getItem("prolink_event_" + i) ? "✓ You're attending" : "RSVP"}</button></div>`,
      )
      .join("");
  }
  function openChat(person) {
    const panel = $("chatPanel");
    panel.classList.remove("hidden");
    const key = "prolink_chat_" + person.id;
    let msgs = JSON.parse(localStorage.getItem(key) || "[]");
    panel.innerHTML = `<div class="chat-head">${avatar(person)}<div><b>${esc(person.name)}</b><small>${esc(person.role)}</small></div><button class="icon-btn" id="closeChat">✕</button></div><div id="chatMessages" class="chat-messages">${msgs.map((m) => `<div class="chat-bubble ${m.mine ? "mine" : ""}">${esc(m.text)}</div>`).join("") || '<p class="muted tiny">Say hello to start the conversation.</p>'}</div><form id="chatForm" class="chat-compose"><input placeholder="Write a message..." required maxlength="500"><button class="primary-btn">Send</button></form>`;
    $("closeChat").onclick = () => panel.classList.add("hidden");
    $("chatForm").onsubmit = (e) => {
      e.preventDefault();
      const input = e.target.querySelector("input");
      msgs.push({ mine: true, text: input.value.trim() });
      localStorage.setItem(key, JSON.stringify(msgs));
      openChat(person);
      $("chatMessages").scrollTop = $("chatMessages").scrollHeight;
      toast("Message sent locally.");
    };
  }
  function showInfo(title, body) {
    $("infoTitle").textContent = title;
    $("infoBody").textContent = body;
    $("infoDialog").showModal();
  }
  $("closeInfo").onclick = $("infoOk").onclick = () => $("infoDialog").close();
  $("profileMenu").onclick = () =>
    $("profileDropdown").classList.toggle("hidden");
  $("homeBtn").onclick = () => view("feed");
  $("peopleRefresh").onclick = () => {
    dismissed = [];
    renderSuggestions();
    toast("Suggestions refreshed.");
  };
  $("refreshNews").onclick = () => {
    showAllNews = !showAllNews;
    renderNews();
  };
  $("tipButton").onclick = () => {
    tipIndex = (tipIndex + 1) % tips.length;
    document.querySelector(".mini-panel p").textContent = tips[tipIndex];
  };
  $("globalSearch").addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase();
    if (!["feed", "saved"].includes(currentView)) view("feed");
    else renderFeed();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") $("profileDropdown").classList.add("hidden");
  });
  function logout() {
    user = null;
    $("appScreen").classList.add("hidden");
    $("authScreen").classList.remove("hidden");
    $("password").value = "";
    $("email").value = "";
    setMode("login");
    toast("Signed out successfully.");
  }
  document.querySelectorAll("[data-info]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      showInfo(
        a.dataset.info,
        `${a.dataset.info} is a placeholder page in this front-end-only demo. No information is sent to a server.`,
      );
    }),
  );
  load();
  setMode("login");
  bindComposer();
  renderNews();
})();

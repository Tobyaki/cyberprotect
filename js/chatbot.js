/* ------------------------------------------------------------------
   CyberProtect front end
   - Chat answers stream over SignalR (WebSocket) token by token.
   - Lessons and quiz still use the REST API.
------------------------------------------------------------------- */

// const SERVER = "https://cyberprotect-app-ghfgdnh3f2abevaa.austriaeast-01.azurewebsites.net";
const SERVER = "https://localhost:7249";
const API = `${SERVER}/api/chat`;
const HUB_URL = `${SERVER}/hubs/chat`;

const chatBody = document.getElementById("chatBody");
const chatForm = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const statusEl = document.getElementById("connectionStatus");
const statusText = document.getElementById("statusText");

let quizSession = null;
let lessons = [];
let current = null; // the answer that is currently streaming, if any

/* ---------------- Small DOM helpers ---------------- */

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function scrollToBottom() {
  chatBody.scrollTop = chatBody.scrollHeight;
}

function clearChat() {
  chatBody.innerHTML = "";
}

function addUserMessage(text) {
  const node = el("div", "message user", text);
  chatBody.appendChild(node);
  scrollToBottom();
}

// Only for trusted, hard-coded HTML (never for model or user text).
function addBotHtml(html) {
  const node = el("div", "message bot");
  node.innerHTML = html;
  chatBody.appendChild(node);
  scrollToBottom();
  return node;
}

function addBotText(text, extraClass = "") {
  const node = el("div", `message bot ${extraClass}`.trim(), text);
  chatBody.appendChild(node);
  scrollToBottom();
  return node;
}

function createButton(text, callback, className = "menu-button") {
  const button = el("button", className, text);
  button.type = "button";
  button.addEventListener("click", callback);
  return button;
}

function addMenu(items) {
  const menu = el("div", "menu");
  items.forEach(item => {
    menu.appendChild(createButton(item.label, item.onClick, item.className || "menu-button"));
  });
  chatBody.appendChild(menu);
  scrollToBottom();
  return menu;
}

function formatMarkdown(text) {
  // If the markdown libraries failed to load (for example, no internet), show plain text.
  if (typeof marked === "undefined" || typeof DOMPurify === "undefined") {
    const safe = document.createElement("div");
    safe.textContent = text;
    return safe.innerHTML.replace(/\n/g, "<br>");
  }

  return DOMPurify.sanitize(marked.parse(text, { breaks: true }));
}

if (typeof DOMPurify !== "undefined") {
  DOMPurify.addHook("afterSanitizeAttributes", node => {
    if (node.tagName === "A") {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });
}

/* ---------------- SignalR connection ---------------- */

// null when the SignalR script could not be loaded; the rest of the page still works.
const connection = typeof signalR !== "undefined"
  ? new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect([0, 1000, 3000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build()
  : null;

function setStatus(state, label) {
  statusEl.dataset.state = state;
  statusText.textContent = label;
}

if (connection) {
  connection.onreconnecting(() => setStatus("reconnecting", "Reconnecting…"));
  connection.onreconnected(() => setStatus("online", "Online"));
  connection.onclose(() => setStatus("offline", "Offline"));
}

let startPromise = null;

function startConnection() {
  if (!connection) {
    setStatus("offline", "Offline");
    return Promise.resolve(false);
  }

  if (!startPromise) {
    setStatus("connecting", "Connecting…");

    startPromise = connection
      .start()
      .then(() => {
        setStatus("online", "Online");
        return true;
      })
      .catch(error => {
        console.error("SignalR connection failed:", error);
        setStatus("offline", "Offline");
        return false;
      })
      .finally(() => {
        startPromise = null;
      });
  }

  return startPromise;
}

async function ensureConnected() {
  if (!connection) return false;

  const state = connection.state;

  if (state === signalR.HubConnectionState.Connected) return true;
  if (state === signalR.HubConnectionState.Disconnected) return startConnection();
  if (startPromise) return startPromise;

  return false; // reconnecting; automatic reconnect is already working on it
}

/* ---------------- Streaming answers ---------------- */

function setBusy(busy) {
  sendBtn.textContent = busy ? "Stop" : "Send";
  sendBtn.classList.toggle("stop", busy);
}

function streamAnswer(question, afterDone) {
  if (current) return;

  setBusy(true);

  const bubble = el("div", "message bot");
  bubble.innerHTML = '<span class="dots"><span></span><span></span><span></span></span>';
  chatBody.appendChild(bubble);
  scrollToBottom();

  const state = { text: "", subscription: null, finished: false, renderQueued: false };

  const render = () => {
    state.renderQueued = false;
    bubble.innerHTML = formatMarkdown(state.text);
    scrollToBottom();
  };

  const finish = (errorMessage) => {
    if (state.finished) return;
    state.finished = true;

    bubble.classList.remove("streaming");

    if (state.text) {
      render();
    } else {
      bubble.textContent = "";
    }

    if (errorMessage) {
      if (state.text) {
        bubble.appendChild(el("p", "", errorMessage));
      } else {
        bubble.textContent = errorMessage;
      }
      bubble.classList.add("error");
    } else if (!state.text) {
      bubble.remove();
    }

    current = null;
    setBusy(false);

    if (afterDone) afterDone();
    scrollToBottom();
  };

  current = {
    stop: () => {
      if (state.subscription) state.subscription.dispose();
      finish();
    }
  };

  ensureConnected().then(connected => {
    if (state.finished) return;

    if (!connected) {
      finish(connection
        ? "I can't reach the server right now. Please try again in a moment."
        : "The chat scripts could not load. Check your internet connection and refresh the page.");
      return;
    }

    state.subscription = connection.stream("Stream", question).subscribe({
      next: chunk => {
        if (!state.text) bubble.textContent = "";
        state.text += chunk;
        bubble.classList.add("streaming");

        if (!state.renderQueued) {
          state.renderQueued = true;
          requestAnimationFrame(render);
        }
      },
      complete: () => finish(),
      error: error => {
        console.error("Stream error:", error);
        const match = /HubException: (.*)$/.exec(error && error.message ? error.message : "");
        finish(match ? match[1] : "Sorry, I couldn't contact the cybersecurity assistant.");
      }
    });
  });
}

function stopStreaming() {
  if (current) current.stop();
}

/* ---------------- Welcome and menus ---------------- */

function showWelcome() {
  clearChat();

  addBotHtml(
    "<strong>Hello! Welcome to CyberProtect.</strong><br><br>" +
    "I'm your cybersecurity awareness assistant. I can help you learn cybersecurity threat basics, " +
    "explore topics, and test your knowledge using real world scenarios.<br><br>What would you like to do?"
  );

  addMenu([
    { label: "Basic threats for beginners", onClick: showBeginnerLessons, className: "menu-button primary" },
    { label: "Know more about threats", onClick: showMoreCybersecurity },
    { label: "Test your knowledge", onClick: startQuiz }
  ]);
}

function mainMenu() {
  stopStreaming();
  showWelcome();
}

/* ---------------- Lessons ---------------- */

async function loadLessons() {
  if (lessons.length) return lessons;

  const response = await fetch(`${API}/lessons`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  lessons = await response.json();
  return lessons;
}

async function showBeginnerLessons() {
  stopStreaming();
  clearChat();

  addBotHtml("<strong>Basic threats for beginners</strong><br><br>Let's learn them step by step.");

  try {
    const all = await loadLessons();

    const items = all.map(lesson => ({
      label: `${lesson.id}. ${lesson.title}`,
      onClick: () => showLesson(lesson.id),
      className: "option-button"
    }));

    items.push({ label: "Main menu", onClick: mainMenu, className: "menu-button quiet" });

    addMenu(items);
  } catch (error) {
    console.error("Lessons error:", error);
    addBotText("Unable to load the lessons.", "error");
  }
}

function lessonSection(title, content, extraClass = "") {
  const section = el("div", `lesson-section ${extraClass}`.trim());
  section.appendChild(el("h3", "", title));
  section.appendChild(content);
  return section;
}

function renderLesson(lesson) {
  const card = el("article", "message bot lesson-card");

  card.appendChild(el("div", "lesson-kicker", `Lesson ${lesson.id} of ${lessons.length}`));
  card.appendChild(el("h2", "lesson-title", lesson.title));
  card.appendChild(el("p", "", lesson.explanation));

  card.appendChild(lessonSection("Example", el("p", "", lesson.example)));

  const tips = el("ul");
  lesson.tips.forEach(tip => tips.appendChild(el("li", "", tip)));
  card.appendChild(lessonSection("Safety tips", tips));

  card.appendChild(lessonSection("Recap", el("p", "", lesson.recap), "recap"));

  if (lesson.sources && lesson.sources.length) {
    const sources = el("div", "lesson-sources");

    lesson.sources.forEach((source, index) => {
      const link = el("a", "", source.name);
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      if (index > 0) sources.appendChild(document.createElement("br"));
      sources.appendChild(link);
    });

    card.appendChild(lessonSection("Sources", sources));
  }

  return card;
}

async function showLesson(id) {
  try {
    const all = await loadLessons();
    const lesson = all.find(item => item.id === id);

    if (!lesson) throw new Error("Lesson not found");

    clearChat();
    chatBody.appendChild(renderLesson(lesson));

    const items = [];

    if (all.some(item => item.id === id + 1)) {
      items.push({ label: "Next lesson", onClick: () => showLesson(id + 1), className: "menu-button primary" });
    }

    items.push({ label: "All lessons", onClick: showBeginnerLessons });
    items.push({ label: "Main menu", onClick: mainMenu, className: "menu-button quiet" });

    addMenu(items);
    chatBody.scrollTop = 0;
  } catch (error) {
    console.error("Lesson error:", error);
    addBotText("Sorry, this lesson couldn't be loaded.", "error");
  }
}

/* ---------------- Topics and questions ---------------- */

function showMoreCybersecurity() {
  stopStreaming();
  clearChat();

  addBotHtml("<strong>Know more about threats</strong><br><br>Would you like to choose a topic or ask your own question?");

  addMenu([
    { label: "Choose a topic", onClick: showTopics },
    { label: "Ask a question", onClick: enableQuestionMode },
    { label: "Main menu", onClick: mainMenu, className: "menu-button quiet" }
  ]);
}

function showTopics() {
  stopStreaming();
  clearChat();

  addBotHtml("<strong>Choose a topic:</strong>");

  const topics = ["Ransomware", "Social Engineering", "Password attacks", "Identity theft", "Data breaches", "Network security"];

  const items = topics.map(topic => ({
    label: topic,
    onClick: () => askAboutTopic(topic),
    className: "option-button"
  }));

  items.push({ label: "Main menu", onClick: mainMenu, className: "menu-button quiet" });

  addMenu(items);
}

function askAboutTopic(topic) {
  clearChat();

  addUserMessage(`Tell me about ${topic}`);

  streamAnswer(
    `Explain ${topic} to an internet user who is a beginner in cybersecurity. Include what it is, why it matters, a realistic example and practical defensive tips.`,
    () => addMenu([
      { label: "Choose another topic", onClick: showTopics },
      { label: "Main menu", onClick: mainMenu, className: "menu-button quiet" }
    ])
  );
}

function enableQuestionMode() {
  stopStreaming();
  clearChat();

  addBotHtml(
    "<strong>Ask a cybersecurity question</strong><br><br>" +
    "Ask me anything related to cybersecurity threats. For example:"
  );

  const examples = [
    "What is phishing?",
    "How can I protect my password?",
    "What should I do if I clicked a suspicious link?"
  ];

  const items = examples.map(question => ({
    label: question,
    onClick: () => sendText(question),
    className: "option-button"
  }));

  items.push({ label: "Main menu", onClick: mainMenu, className: "menu-button quiet" });

  addMenu(items);
  input.focus();
}

function sendText(text) {
  const message = text.trim();

  if (!message || current) return;

  addUserMessage(message);
  streamAnswer(message);
}

/* ---------------- Quiz ---------------- */

async function startQuiz() {
  stopStreaming();
  clearChat();

  addBotHtml("<strong>Knowledge test</strong><br><br>Choose the answer you think is safest.");

  try {
    const response = await fetch(`${API}/quiz/start`, { method: "POST" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    quizSession = data.sessionId;
    showQuizQuestion(data.question);
  } catch (error) {
    console.error("Quiz start error:", error);
    addBotText("Unable to start the quiz.", "error");
  }
}

function showQuizQuestion(question) {
  if (!question) {
    addBotText("Unable to display the next question.", "error");
    return;
  }

  const card = el("div", "message bot quiz-card");

  card.appendChild(el("div", "quiz-kicker", `Question ${question.id}`));
  card.appendChild(el("p", "", question.scenario));

  const buttons = [];

  question.options.forEach((option, index) => {
    const label = `${String.fromCharCode(65 + index)}. ${option}`;
    const button = createButton(label, () => answerQuiz(index, button, buttons), "option-button");

    buttons.push(button);
    card.appendChild(button);
  });

  chatBody.appendChild(card);
  scrollToBottom();
}

async function answerQuiz(answer, chosenButton, buttons) {
  buttons.forEach(button => (button.disabled = true));

  try {
    const response = await fetch(`${API}/quiz/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: quizSession, answer })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    chosenButton.classList.add(data.correct ? "is-correct" : "is-wrong");

    const feedback = el("div", "message bot");
    const verdict = el("span", `verdict ${data.correct ? "correct" : "incorrect"}`, data.correct ? "Correct" : "Not correct");

    feedback.appendChild(verdict);
    feedback.appendChild(el("p", "", data.explanation));

    chatBody.appendChild(feedback);
    scrollToBottom();

    if (data.finished) {
      showQuizResult(data);
    } else {
      setTimeout(() => showQuizQuestion(data.question), 500);
    }
  } catch (error) {
    console.error("Quiz error:", error);
    buttons.forEach(button => (button.disabled = false));
    addBotText("Unable to process your answer.", "error");
  }
}

function showQuizResult(result) {
  let feedback;

  if (result.percentage >= 80) {
    feedback = "Excellent! You demonstrated solid knowledge on cybersecurity.";
  } else if (result.percentage >= 60) {
    feedback = "Good job! You have a solid foundation, but you still need improvement.";
  } else {
    feedback = "Nice effort. Use beginner lessons to strengthen your cybersecurity knowledge and try again.";
  }

  const card = el("div", "message bot");
  card.appendChild(el("strong", "", "Quiz complete!"));

  const grid = el("div", "score-grid");
  [
    ["Score", `${result.score}/${result.totalQuestions}`],
    ["Percentage", `${result.percentage}%`],
    ["Correct", String(result.correctAnswers)],
    ["Incorrect", String(result.incorrectAnswers)]
  ].forEach(([label, value]) => {
    const cell = el("div");
    cell.appendChild(el("span", "", label));
    cell.appendChild(el("strong", "", value));
    grid.appendChild(cell);
  });

  card.appendChild(grid);
  card.appendChild(el("p", "", feedback));
  chatBody.appendChild(card);

  addMenu([
    { label: "Try again", onClick: startQuiz, className: "menu-button primary" },
    { label: "Learn about cybersecurity threats", onClick: showBeginnerLessons },
    { label: "Main menu", onClick: mainMenu, className: "menu-button quiet" }
  ]);
}

/* ---------------- Input handling ---------------- */

sendBtn.addEventListener("click", event => {
  if (current) {
    event.preventDefault(); // stop the form from submitting; this click means "Stop"
    stopStreaming();
  }
});

chatForm.addEventListener("submit", event => {
  event.preventDefault();

  if (current) return;

  const message = input.value;
  input.value = "";
  sendText(message);
});

/* ---------------- Start ---------------- */

showWelcome();
startConnection(); // connect early so the first question does not pay the handshake cost

const chatBody = document.getElementById("chatBody");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const API = "https://cyberprotect-app-ghfgdnh3f2abevaa.austriaeast-01.azurewebsites.net/api/chat";

let currentLesson = 1;
let quizSession = null;

function addMessage(text, type = "bot") {
  const div = document.createElement("div");

  div.className = `message ${type}`;
  div.innerHTML = text;
  chatBody.appendChild(div);

  chatBody.scrollTop = chatBody.scrollHeight;
}

function createButton(text, callback, className = "menu-button") {
  const button = document.createElement("button");

  button.className = className;
  // button.innerHTML = text;
  button.textContent = text;
  button.addEventListener("click", callback);

  return button;
}

function showWelcome() {
  chatBody.innerHTML = "";

  addMessage(`<strong>Hello! Welcome to CyberProtect.</strong><br><br>I'm your Cybersecurity awareness assistant. I can help you learn cybersecurity basics, explore cybersecurity topics, and test your knowledge using real world scenarios.<br><br>What would you like to do?`)

  const menu = document.createElement("div");

  menu.className = "message bot";

  const beginner = createButton("Cybersecurity for beginners", showBeginnerLessons);
  const topics = createButton("Know more about cybersecurity", showMoreCybersecurity);
  const quiz = createButton("Test your knowledge", startQuiz);

  menu.appendChild(beginner);
  menu.appendChild(topics);
  menu.appendChild(quiz);

  chatBody.appendChild(menu);
}

function mainMenu() {
  showWelcome();
}

async function showBeginnerLessons() {
  chatBody.innerHTML = "";

  addMessage("<strong>Cybersecurity for beginners</strong><br><br>" + "Let's learn cybersecurity step by step.");

  try {
    const response = await fetch(`${API}/lessons`);

    const lessons = await response.json();

    const menu = document.createElement("div");

    menu.className = "message bot";

    lessons.forEach(lesson => {
      const button = createButton(`${lesson.id}. ${lesson.title}`, () => showLesson(lesson.id), "option-button");

      menu.appendChild(button);
    });

    const home = createButton("Main Menu", mainMenu);

    menu.appendChild(home);

    chatBody.appendChild(menu);
  }
  catch(error) {
    addMessage("Unable to load the lessons.");
  }
}

async function showLesson(id) {
  try {
    const response = await fetch(`${API}/lessons/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const lesson = await response.json();

    chatBody.innerHTML = "";

    addMessage(`${lesson.title}`);
    addMessage(lesson.explanation);
    addMessage(`Example: ${lesson.example}`);
    addMessage("Safety Tips:");

    lesson.tips.forEach(tip => {
      addMessage(`- ${tip}`);
    });

    addMessage(`Recap: ${lesson.recap}`);

    const menu = document.createElement("div");
    menu.className = "message bot";

    if (id < 17) {
      menu.appendChild(createButton("Nest Lesson", () => showLesson(id + 1)));
    }

    menu.appendChild(createButton("All Lessons", showBeginnerLessons));
    menu.appendChild(createButton("Main menu", mainMenu));

    chatBody.appendChild(menu);
  } catch (error) {
    console.error("Lesson error:", error);
    addMessage("Sorry, this lesson couldn't be loaded.");
  }
}

function showMoreCybersecurity() {
  chatBody.innerHTML = "";

  addMessage(`<strong>Know more about Cybersecurity</strong><br><br>Would you like to choose a topic or ask your own question?`);

  const menu = document.createElement("div");

  menu.className = "message bot";

  menu.appendChild(createButton("Choose a topic", showTopics));

  menu.appendChild(createButton("Ask a question", enableQuestionMode));

  menu.appendChild(createButton("Main Menu", mainMenu));

  chatBody.appendChild(menu);
}

function showTopics() {
  chatBody.innerHTML = "";

  addMessage("<strong>Choose a cybersecurity topic:</strong>");

  const topics = ["Phishing", "Malware", "Ransomware", "Social Engineering", "Password attacks", "Identity theft", "Data breaches", "Network security"];

  const menu = document.createElement("div");

  menu.className = "message bot";

  topics.forEach(topic => {
    const button = createButton(topic, () => askGeminiAboutTopic(topic), "option-button");

    menu.appendChild(button);
    // menu.appendChild(createButton(topic, () => askGeminiAboutTopic(topic), "option-button"));
  });

  menu.appendChild(createButton("Main Menu", mainMenu));

  chatBody.appendChild(menu);

  chatBody.scrollTop = chatBody.scrollHeight;
}

async function askGeminiAboutTopic(topic) {
  chatBody.innerHTML = ""

  addMessage(`You selected: ${topic}`, "user");

  addMessage("CyberProtect is preparing an explanation...")

  // const typing = document.createElement("div");

  // typing.className = "message bot";

  // typing.innerText = "CyberProtect is preparing an explanation...";

  // chatBody.appendChild(typing);

  try {
    const response = await fetch(`${API}/ask`, {
      method: "POST", headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Explain ${topic} to a university student who is a beginner in cybersecurity. Include what it is, why it matters, a realistic example and practical defensive tips.`
      })
    });

    const data = await response.json();

    console.log("Gemini response:", data);

    if (!response.ok) {
      throw new Error (data.message || data.response || `HTTP ${response.status}`);
    }

    // const data = await response.json();

    // typing.remove();

    addMessage(formatGeminiResponse(data.response), true);

    const menu = document.createElement("div");

    menu.className = "message-bot";

    menu.appendChild(createButton("Choose another topic", showTopics));

    menu.appendChild(createButton("Main menu", mainMenu));

    chatBody.appendChild(menu);
  }
  catch(error) {
    // typing.remove();
    console.error("Gemini request failed:", error);

    addMessage("Sorry, I couldn't contact the cybersecurity assistant");
  }
}

function formatGeminiResponse(text) {
  const html = marked.parse(text, {
    breaks: true
  });

  return DOMPurify.sanitize(html);
}

function addMessage(message, allowHtml = false) {
  const element = document.createElement("div");

  element.className = "message bot";

  if (allowHtml) {
    element.innerHTML = message;
  } else {
    element.textContent = message;
  }

  chatBody.appendChild(element);
}

function enableQuestionMode() {
  chatBody.innerHTML = "";

  addMessage(`<strong>Ask a cybersecurity question</strong><br><br>Ask ne anything related to cybersecurity. For example:<br><br>- What is phishing?<br>- How can I protect my passord?<br>- What should I do if I clicked a suspicious link?`);

  input.focus();

  const menu = document.createElement("div");

  menu.className = "message bot";

  menu.appendChild(createButton("Main menu", mainMenu));

  chatBody.appendChild(menu);
}

async function sendMessage() {
  const message = input.value.trim();

  if (!message) return;

  addMessage(message, "user");

  input.value = "";

  const typing = document.createElement("div");
  typing.className = "message bot";
  typing.innerText = "Typing...";
  typing.style.color = "white";
  chatBody.appendChild(typing);

    try {
      const response = await fetch(`${API}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message
        })
      });

      // chatBody.removeChild(typing);

      const data = await response.json();

      typing.remove();

      addMessage(data.response);
    } catch (error) {
      typing.remove();

      // chatBody.removeChild(typing);

      addMessage("Unable to contact CyberProtect.");
    }
}

async function startQuiz() {
  chatBody.innerHTML = "";

  addMessage("<strong>Cybersecurity knowledge test</strong><br><br>" + "Choose the answer you think is safest.");

  try {
    const response = await fetch(`${API}/quiz/start`, {
      method: "POST"
    });

    const data = await response.json();

    quizSession = data.sessionId;

    showQuizQuestion(data.question);
  }
  catch(error) {
    addMessage("Unable to start the quiz.");
  }
}

function showQuizQuestion(question) {
  if (!question) {
    console.error("showQuizQuestion received Undefined.");
    addMessage("Unable to display the next question.");
    return;
  }

  const message = document.createElement("div");

  message.className = "message bot";

  message.innerHTML = `<strong>Question ${question.id}</strong><br><br>${question.scenario}`;

  question.options.forEach((option, index) => {
    const button = createButton(`${String.fromCharCode(65 + index)}.${option}`, () => answerQuiz(index), "option-button");

    message.appendChild(button);
  });

  chatBody.appendChild(message);

  chatBody.scrollTop = chatBody.scrollHeight;
}

async function answerQuiz(answer) {
  try {
    const response = await fetch(`${API}/quiz/answer`, {
      method: "POST", headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sessionId: quizSession,
        answer: answer
      })
    });

    console.log("Request URL:", response.url);
    console.log("HTTP Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Backend error:", errorText);

      throw new Error (`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    console.log("Quiz answer response:", data);

    if (data.correct) {
      addMessage(`<span class="correct">Correct</span><br><br>${data.explanation}`);
    } else {
      addMessage(`<span class="incorrect">Not correct</span><br><br>${data.explanation}`);
    }

    if (data.finished) {
      showQuizResult(data);
    } else {
      setTimeout(() => {
        showQuizQuestion(data.question);
      }, 500);
    }
  }
  catch(error) {
    console.error("Quiz error:", error);
    console.error("Error stack:", error.stack);

    addMessage("Unable to process your answer");
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

  addMessage(`<strong>Quiz complete!</strong><br><br><strong>Score:</strong>${result.score}/${result.totalQuestions}<br><strong>Correct:</strong>${result.correctAnswers}<br><strong>Incorrect:</strong>${result.incorrectAnswers}<br><strong>Percentage:</strong>${result.percentage}%<br><br>${feedback}`);

  const menu = document.createElement("div");

  menu.className = "message bot";

  menu.appendChild(createButton("Try again", startQuiz));

  menu.appendChild(createButton("Learn Cybersecurity", showBeginnerLessons));

  menu.appendChild(createButton("Main menu", mainMenu));

  chatBody.appendChild(menu);
}

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});

showWelcome();

// let botBubble = null;

// function updateBotBubble(text) {
//   if (!botBubble) {
//     botBubble = document.createElement("div");

//     botBubble.className = "message-bot";

//     document.getElementById("chatBody").appendChild(botBubble);
//   }

//   botBubble.textContent = text;
// }

// async function streamChat(message) {
//   const response = await fetch("https://localhost:7249/api/chat/stream", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       message: message,
//     }),
//   });

//   const reader = response.body.getReader();

//   const decoder = new TextDecoder();

//   let botMessage = "";

//   while (true) {
//     const { done, value } = await reader.read();

//     if (done) break;

//     const chunk = decoder.decode(value);

//     botMessage += chunk;

//     updateBotBubble(message);
//   }
// }

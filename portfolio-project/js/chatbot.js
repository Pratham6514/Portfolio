(function () {
  const STARTERS = [
    "What projects have you completed?",
    "What was corrected in the buggy code project?",
    "Explain your Python programs.",
  ];
  const WELCOME =
    "Hi — I can answer questions about Pratham's projects, skills, and coursework. Try a starter prompt or ask your own.";
  const ERROR_TEXT = "I couldn't reach the assistant just now. Please try again in a moment.";
  const MAX_CHARS = 500;
  const HISTORY_TURNS = 6;

  const launcher = document.getElementById("chat-launcher");
  const panel = document.getElementById("chat-panel");
  const closeBtn = document.getElementById("chat-close");
  const body = document.getElementById("chat-body");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send");
  const heroOpen = document.getElementById("open-chatbot");

  let history = [];
  let waiting = false;

  function appendBubble(role, text) {
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble " + role;
    bubble.textContent = text;
    body.appendChild(bubble);
    body.scrollTop = body.scrollHeight;
    return bubble;
  }

  function showTyping() {
    const indicator = document.createElement("div");
    indicator.className = "chat-bubble assistant typing";
    indicator.setAttribute("aria-label", "Assistant is typing");
    for (let i = 0; i < 3; i += 1) {
      indicator.appendChild(document.createElement("span"));
    }
    body.appendChild(indicator);
    body.scrollTop = body.scrollHeight;
    return indicator;
  }

  function setWaiting(isWaiting) {
    waiting = isWaiting;
    input.disabled = isWaiting;
    sendBtn.disabled = isWaiting;
  }

  function renderWelcome() {
    body.replaceChildren();
    appendBubble("assistant", WELCOME);
    const wrap = document.createElement("div");
    wrap.className = "starter-prompts";
    STARTERS.forEach(function (prompt) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = prompt;
      button.addEventListener("click", function () {
        sendMessage(prompt);
      });
      wrap.appendChild(button);
    });
    body.appendChild(wrap);
  }

  function openPanel() {
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    input.focus();
  }

  function closePanel() {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus();
  }

  function togglePanel() {
    if (panel.hidden) openPanel();
    else closePanel();
  }

  async function sendMessage(raw) {
    const message = (raw || "").trim();
    if (!message || waiting) return;
    if (message.length > MAX_CHARS) {
      appendBubble("error", "Please keep messages under 500 characters.");
      return;
    }

    appendBubble("user", message);
    const prompts = body.querySelector(".starter-prompts");
    if (prompts) prompts.remove();

    setWaiting(true);
    const typing = showTyping();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message, history: history }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (parseError) {
        data = {};
      }

      typing.remove();

      if (!response.ok || !data.reply) {
        appendBubble("error", data.error || ERROR_TEXT);
        return;
      }

      appendBubble("assistant", data.reply);
      history = history.concat(
        { role: "user", content: message },
        { role: "assistant", content: data.reply }
      ).slice(-HISTORY_TURNS);
    } catch (error) {
      typing.remove();
      appendBubble("error", ERROR_TEXT);
    } finally {
      setWaiting(false);
      input.focus();
    }
  }

  if (!launcher || !panel || !body || !form || !input) return;

  renderWelcome();

  launcher.addEventListener("click", togglePanel);
  closeBtn.addEventListener("click", closePanel);
  if (heroOpen) heroOpen.addEventListener("click", openPanel);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !panel.hidden) {
      closePanel();
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const value = input.value;
    input.value = "";
    sendMessage(value);
  });
})();

// Sidebar Toggle
const leftMenuBtn = document.getElementById("leftMenuBtn");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

leftMenuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  sidebarOverlay.classList.toggle("active");
});

sidebarOverlay.addEventListener("click", () => {
  sidebar.classList.remove("active");
  sidebarOverlay.classList.remove("active");
});

// Chat Functionality
const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const clearChatBtn = document.getElementById("clearChatBtn");

let messages = [];
let isLoading = false;
let loadingMessageId = null;

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

clearChatBtn.addEventListener("click", clearChat);

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || isLoading) return;

  appendMessage("user", text, "You", "https://cdn-icons-png.flaticon.com/512/1077/1077114.png");
  chatInput.value = "";
  chatInput.disabled = true;
  isLoading = true;

  messages.push({ role: "user", content: text });
  saveMessagesToStorage();

  loadingMessageId = appendLoadingMessage();

  fetch("https://api.paxsenix.biz.id/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer YOUR_API_KEY_HERE", // Add your API key if required
    },
    body: JSON.stringify({
      messages: messages,
      model: "gpt-4",
      temperature: 0.7,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const reply = data.choices?.[0]?.message?.content?.trim() || "AI didn't provide a response.";
      removeLoadingMessage();
      appendMessage("bot", reply, "AI Digging", "https://cdn-icons-png.flaticon.com/512/4128/4128606.png");
      messages.push({ role: "assistant", content: reply });
      saveMessagesToStorage();
    })
    .catch((err) => {
      console.error("API error:", err);
      removeLoadingMessage();
      appendMessage("bot", "Sorry, there was an error connecting to the API.", "AI Digging", "https://cdn-icons-png.flaticon.com/512/4128/4128606.png");
    })
    .finally(() => {
      isLoading = false;
      chatInput.disabled = false;
      chatInput.focus();
    });
}

function appendLoadingMessage() {
  const messageContainer = document.createElement("div");
  messageContainer.id = "loading-message";
  messageContainer.className = "message-container";

  const profileImg = document.createElement("img");
  profileImg.src = "https://cdn-icons-png.flaticon.com/512/4128/4128606.png";
  profileImg.className = "profile-image";

  const contentContainer = document.createElement("div");
  contentContainer.className = "message-content";

  const nameEl = document.createElement("div");
  nameEl.className = "username";
  nameEl.textContent = "AI Digging";

  const loadingDots = document.createElement("div");
  loadingDots.className = "message loading-animation";
  loadingDots.innerHTML = `<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>`;

  contentContainer.appendChild(nameEl);
  contentContainer.appendChild(loadingDots);
  messageContainer.appendChild(profileImg);
  messageContainer.appendChild(contentContainer);
  chatBox.appendChild(messageContainer);
  chatBox.scrollTop = chatBox.scrollHeight;

  return "loading-message";
}

function removeLoadingMessage() {
  const el = document.getElementById("loading-message");
  if (el) el.remove();
}

function appendMessage(sender, text, username, profileUrl) {
  const messageContainer = document.createElement("div");
  messageContainer.className = `message-container ${sender}`;

  const profileImg = document.createElement("img");
  profileImg.src = profileUrl;
  profileImg.className = "profile-image";

  const contentContainer = document.createElement("div");
  contentContainer.className = "message-content";

  const nameEl = document.createElement("div");
  nameEl.className = "username";
  nameEl.textContent = username;

  const textEl = document.createElement("div");
  textEl.className = "message";
  textEl.innerHTML = parseMarkdown(text);

  contentContainer.appendChild(nameEl);
  contentContainer.appendChild(textEl);
  messageContainer.appendChild(profileImg);
  messageContainer.appendChild(contentContainer);
  chatBox.appendChild(messageContainer);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function parseMarkdown(text) {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const [fullMatch, lang, code] = match;
    const index = match.index;

    if (index > lastIndex) {
      segments.push({
        type: "text",
        content: text.slice(lastIndex, index),
      });
    }

    segments.push({
      type: "code",
      content: code,
      language: lang || "plaintext",
    });

    lastIndex = index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  return segments
    .map((segment) => {
      if (segment.type === "text") {
        let html = segment.content
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")
          .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
          .replace(/\n/g, "<br>");

        return `<div class="text-segment">${html}</div>`;
      } else {
        const highlightedCode = highlightSyntax(segment.content, segment.language);
        const withLineNumbers = addLineNumbers(highlightedCode);

        return `
        <div class="code-block">
          <div class="code-header">
            <span class="language">${segment.language || "code"}</span>
            <button class="copy-btn" onclick="copyCode(this)">Copy</button>
          </div>
          <pre class="language-${segment.language || "plaintext"}"><code>${withLineNumbers}</code></pre>
        </div>
      `;
      }
    })
    .join("");
}

function addLineNumbers(code) {
  const lines = code.split("\n");
  if (lines.length <= 1) return code;

  return lines
    .map((line, i) => {
      return `<span class="line-number">${i + 1}</span>${line}`;
    })
    .join("\n");
}

function highlightSyntax(code, language = "plaintext") {
  // Enhanced highlighting patterns
  const patterns = {
    javascript: [
      { regex: /(\/\/.*|\/\*[\s\S]*?\*\/)/g, class: "comment" },
      {
        regex:
          /(\b(?:function|const|let|var|if|else|for|while|return|class|import|export|new|this|true|false|null|undefined|typeof|instanceof|await|async|yield|break|case|catch|continue|default|delete|do|finally|in|of|switch|throw|try|with)\b)/g,
        class: "keyword",
      },
      { regex: /(=>|\|\||&&|[+\-*/%&|^~=!<>?])=?|\+\+|--|\.{3}/g, class: "operator" },
      { regex: /(".*?"|'.*?'|`[\s\S]*?`)/g, class: "string" },
      { regex: /(\b\d+(\.\d+)?\b)/g, class: "number" },
      { regex: /(\bfunction\b)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)/g, replace: '<span class="keyword">$1</span> <span class="function">$2</span>' },
      { regex: /(\bclass\b)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)/g, replace: '<span class="keyword">$1</span> <span class="class-name">$2</span>' },
      { regex: /(\.)([a-zA-Z_$][0-9a-zA-Z_$]*)/g, replace: '<span class="punctuation">$1</span><span class="property">$2</span>' },
    ],
    html: [
      { regex: /(&lt;\/?[a-zA-Z][a-zA-Z0-9-]*)/g, class: "tag" },
      { regex: /([a-zA-Z-]+)=/g, class: "attr" },
      { regex: /(".*?"|'.*?')/g, class: "string" },
      { regex: /(&[a-zA-Z]+;)/g, class: "entity" },
    ],
    css: [
      { regex: /([a-zA-Z-]+)\s*:/g, class: "property" },
      { regex: /(#([a-fA-F0-9]{3}){1,2}\b)/g, class: "value hex" },
      { regex: /(\b\d+(\.\d+)?(px|em|rem|%|s|ms|deg|rad|turn)\b)/g, class: "value number" },
      { regex: /(\b(?:@media|@keyframes|@import|@font-face|@supports|@charset)\b)/g, class: "keyword" },
      { regex: /(\b(?:url|var|rgb|rgba|hsl|hsla|calc|clamp|min|max)\b)(\()/g, replace: '<span class="function">$1</span><span class="punctuation">$2</span>' },
    ],
  };

  let highlighted = code;
  const langPatterns = patterns[language] || [];

  langPatterns.forEach((pattern) => {
    if (pattern.replace) {
      highlighted = highlighted.replace(pattern.regex, pattern.replace);
    } else {
      highlighted = highlighted.replace(pattern.regex, `<span class="${pattern.class}">$&</span>`);
    }
  });

  return highlighted;
}

// Add this to your existing JavaScript
function copyCode(button) {
  const codeBlock = button.closest(".code-block");
  const code = codeBlock.querySelector("code").textContent;

  navigator.clipboard.writeText(code).then(() => {
    button.textContent = "Copied!";
    setTimeout(() => {
      button.textContent = "Copy";
    }, 2000);
  });
}

function saveMessagesToStorage() {
  localStorage.setItem("chatHistory", JSON.stringify(messages));
}

function loadMessagesFromStorage() {
  const stored = localStorage.getItem("chatHistory");
  if (stored) {
    messages = JSON.parse(stored);
    messages.forEach((msg) => {
      if (msg.role === "user") {
        appendMessage("user", msg.content, "You", "https://cdn-icons-png.flaticon.com/512/1077/1077114.png");
      } else {
        appendMessage("bot", msg.content, "AI Digging", "https://cdn-icons-png.flaticon.com/512/4128/4128606.png");
      }
    });
  }
}

function clearChat() {
  if (confirm("Are you sure you want to clear all chat history?")) {
    localStorage.removeItem("chatHistory");
    messages = [];
    chatBox.innerHTML = "";
  }
}

// Load chat when page opens
document.addEventListener("DOMContentLoaded", loadMessagesFromStorage);

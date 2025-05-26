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
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

let messages = [];
let isLoading = false;
let loadingMessageId = null;

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !isLoading) {
    sendMessage();
  }
});

function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isLoading) return;

  appendMessage("user", text, "You", "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_230320.jpg?alt=media&token=1fc7e7e0-ad4f-4363-8fcf-221b6582b6ec");
  userInput.value = "";
  userInput.disabled = true;
  isLoading = true;

  messages.push({ role: "user", content: text });
  saveMessagesToStorage();

  loadingMessageId = appendLoadingMessage();

  fetch("https://api.paxsenix.biz.id/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages,
      model: "gpt-4",
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      const reply = data.choices?.[0]?.message?.content?.trim() || "AI tidak memberikan balasan.";
      removeLoadingMessage();
      appendMessage("bot", reply, "AI Digging", "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_232210.png?alt=media&token=dc5a0b3a-f869-432a-82a2-c27b32eca77f");
      messages.push({ role: "assistant", content: reply });
      saveMessagesToStorage();
    })
    .catch((err) => {
      console.error("API error:", err);
      removeLoadingMessage();
      appendMessage("bot", "Terjadi kesalahan saat menghubungi API.", "GPT Bot", "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_232210.png?alt=media&token=dc5a0b3a-f869-432a-82a2-c27b32eca77f");
    })
    .finally(() => {
      isLoading = false;
      userInput.disabled = false;
      userInput.focus();
    });
}

function appendLoadingMessage() {
  const messageContainer = document.createElement("div");
  messageContainer.id = "loading-message";
  messageContainer.style.display = "flex";
  messageContainer.style.marginBottom = "15px";
  messageContainer.style.alignItems = "flex-start";

  const profileImg = document.createElement("img");
  profileImg.src = "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_232210.png?alt=media&token=dc5a0b3a-f869-432a-82a2-c27b32eca77f";
  profileImg.style.width = "40px";
  profileImg.style.height = "40px";
  profileImg.style.borderRadius = "50%";
  profileImg.style.marginRight = "10px";

  const contentContainer = document.createElement("div");
  contentContainer.style.maxWidth = "75%";

  const nameEl = document.createElement("div");
  nameEl.textContent = "AI Digging";
  nameEl.style.fontWeight = "bold";
  nameEl.style.marginBottom = "4px";

  const loadingDots = document.createElement("div");
  loadingDots.innerHTML = `<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>`;
  loadingDots.classList.add("loading-animation");
  loadingDots.style.fontSize = "20px";
  loadingDots.style.padding = "10px";
  loadingDots.style.backgroundColor = "#e2e2e2";
  loadingDots.style.borderRadius = "10px";

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
  messageContainer.style.display = "flex";
  messageContainer.style.marginBottom = "15px";
  messageContainer.style.alignItems = "flex-start";
  messageContainer.style.flexDirection = sender === "user" ? "row-reverse" : "row";

  const profileImg = document.createElement("img");
  profileImg.src = profileUrl;
  profileImg.style.width = "40px";
  profileImg.style.height = "40px";
  profileImg.style.borderRadius = "50%";
  profileImg.style.objectFit = "cover";
  profileImg.style.margin = sender === "user" ? "0 0 0 10px" : "0 10px 0 0";

  const contentContainer = document.createElement("div");
  contentContainer.style.maxWidth = "75%";

  const nameEl = document.createElement("div");
  nameEl.textContent = username;
  nameEl.style.fontWeight = "bold";
  nameEl.style.marginBottom = "4px";
  nameEl.style.textAlign = sender === "user" ? "right" : "left";

  const textEl = document.createElement("div");
  textEl.innerHTML = parseMarkdown(text);
  textEl.style.padding = "10px";
  textEl.style.borderRadius = "10px";
  textEl.style.backgroundColor = sender === "user" ? "#d1f0ff" : "#e2e2e2";
  textEl.style.color = "#333";
  textEl.style.fontFamily = "'Inter', 'Helvetica', 'Arial', sans-serif";
  textEl.style.fontSize = "15px";
  textEl.style.lineHeight = "1.6";

  contentContainer.appendChild(nameEl);
  contentContainer.appendChild(textEl);
  messageContainer.appendChild(profileImg);
  messageContainer.appendChild(contentContainer);
  chatBox.appendChild(messageContainer);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function parseMarkdown(text) {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let segments = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const [fullMatch, lang, code] = match;
    const index = match.index;
    if (index > lastIndex) {
      segments.push({ type: "text", content: text.slice(lastIndex, index) });
    }
    segments.push({ type: "code", content: code, language: lang || "plaintext" });
    lastIndex = index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }

  return segments
    .map((segment) => {
      if (segment.type === "text") {
        let html = segment.content;
        html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
        html = html.replace(/`(.*?)`/g, "<code style='background:#f4f4f4;padding:2px 4px;border-radius:4px;'>$1</code>");
        html = html.replace(/\[(.*?)\]\((https?:\/\/.*?)\)/g, "<a href='$2' target='_blank'>$1</a>");
        html = html.replace(/\n/g, "<br>");
        return `<div style="margin:2px 0;">${html}</div>`;
      } else {
        return `<pre style="background:#2d2d2d;color:#ccc;padding:10px;border-radius:6px;overflow-x:auto;font-size:14px;margin:2px 0;"><code>${highlightCode(segment.content)}</code></pre>`;
      }
    })
    .join("");
}

function highlightCode(code) {
  return code
    .replace(/(\/\/.*)/g, `<span style="color:#6a9955;">$1</span>`)
    .replace(/("(.*?)")/g, `<span style="color:#ce9178;">$1</span>`)
    .replace(/\b(class|public|static|void|return|if|else|new|String|int|float|boolean|const|let|var|function)\b/g, `<span style="color:#569cd6;">$1</span>`)
    .replace(/\b(true|false|null)\b/g, `<span style="color:#569cd6;">$1</span>`);
}

// Simpan & Muat Pesan
function saveMessagesToStorage() {
  localStorage.setItem("chatHistory", JSON.stringify(messages));
}

function loadMessagesFromStorage() {
  const stored = localStorage.getItem("chatHistory");
  if (stored) {
    messages = JSON.parse(stored);
    messages.forEach((msg) => {
      if (msg.role === "user") {
        appendMessage("user", msg.content, "You", "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_230320.jpg?alt=media&token=1fc7e7e0-ad4f-4363-8fcf-221b6582b6ec");
      } else {
        appendMessage("bot", msg.content, "AI Digging", "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_232210.png?alt=media&token=dc5a0b3a-f869-432a-82a2-c27b32eca77f");
      }
    });
  }
}

// Hapus semua chat
function clearChat() {
  localStorage.removeItem("chatHistory");
  messages = [];
  chatBox.innerHTML = "";
}

// Muat chat saat halaman dibuka
loadMessagesFromStorage();

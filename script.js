const leftMenuBtn = document.getElementById("leftMenuBtn");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

leftMenuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  sidebarOverlay.classList.toggle("active");
});

// Tutup sidebar jika klik overlay
sidebarOverlay.addEventListener("click", () => {
  sidebar.classList.remove("active");
  sidebarOverlay.classList.remove("active");
});

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
      appendMessage("bot", reply, "AI Digging", "https://firebasestorage.googleapis.com/v0/b/usersai.appspot.com/o/20240519_093138.png?alt=media&token=dc442bde-1105-4704-9dc5-a053a112ea9a");
      messages.push({ role: "assistant", content: reply });
      saveMessagesToStorage();
    })
    .catch((err) => {
      console.error("API error:", err);
      removeLoadingMessage();
      appendMessage("bot", "Terjadi kesalahan saat menghubungi API.", "GPT Bot", "https://firebasestorage.googleapis.com/v0/b/usersai.appspot.com/o/20240519_093138.png?alt=media&token=dc442bde-1105-4704-9dc5-a053a112ea9a");
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
  profileImg.src = "https://firebasestorage.googleapis.com/v0/b/usersai.appspot.com/o/20240519_093138.png?alt=media&token=dc442bde-1105-4704-9dc5-a053a112ea9a";
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

  const profileImg = document.createElement("img");
  profileImg.src = profileUrl;
  profileImg.style.width = "40px";
  profileImg.style.height = "40px";
  profileImg.style.borderRadius = "50%";
  profileImg.style.objectFit = "cover";
  profileImg.style.marginRight = sender === "user" ? "0" : "10px";
  profileImg.style.marginLeft = sender === "user" ? "10px" : "0";

  const contentContainer = document.createElement("div");
  contentContainer.style.maxWidth = "75%";

  const nameEl = document.createElement("div");
  nameEl.textContent = username;
  nameEl.style.fontWeight = "bold";
  nameEl.style.marginBottom = "4px";
  nameEl.style.textAlign = sender === "user" ? "right" : "left";

  const textEl = document.createElement("div");
  textEl.innerHTML = parseMarkdown(text);
  textEl.style.padding = "8px";
  textEl.style.borderRadius = "10px";
  textEl.style.backgroundColor = sender === "user" ? "#d1f0ff" : "#e2e2e2";
  textEl.style.color = "#333";

  contentContainer.appendChild(nameEl);
  contentContainer.appendChild(textEl);

  if (sender === "user") {
    messageContainer.style.flexDirection = "row-reverse";
  }

  messageContainer.appendChild(profileImg);
  messageContainer.appendChild(contentContainer);
  chatBox.appendChild(messageContainer);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function parseMarkdown(text) {
  let html = text
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank'>$1</a>")
    .replace(/\n/g, "<br>");
  return `<div>${html}</div>`;
}

// ========================
// Penyimpanan dengan localStorage
// ========================
function saveMessagesToStorage() {
  localStorage.setItem("chatHistory", JSON.stringify(messages));
}

function loadMessagesFromStorage() {
  const stored = localStorage.getItem("chatHistory");
  if (stored) {
    try {
      messages = JSON.parse(stored);
      messages.forEach((msg) => {
        if (msg.role === "user") {
          appendMessage("user", msg.content, "You", "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_230320.jpg?alt=media&token=1fc7e7e0-ad4f-4363-8fcf-221b6582b6ec");
        } else if (msg.role === "assistant") {
          appendMessage("bot", msg.content, "AI Digging", "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250316_191334.jpg?alt=media&token=afb5c73d-872f-4e27-ad76-13f4c2b4481a");
        }
      });
    } catch (e) {
      console.error("Gagal memuat chat:", e);
    }
  }
}

function clearChat() {
  localStorage.removeItem("chatHistory");
  messages = [];
  chatBox.innerHTML = "";
}

// Load chat saat halaman dibuka
loadMessagesFromStorage();

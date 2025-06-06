const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const clearChatBtn = document.getElementById("clearChatBtn");
const clearChatBtnn = document.getElementById("clearChatBtnn");
const leftMenuBtn = document.getElementById("leftMenuBtn");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const emptyMessage = document.getElementById("emptyMessage");

let messages = [];
let isLoading = false;
let autoScrollEnabled = true;
let teksgambar1 = ""; // Menyimpan hasil teks dari OCR
let previewImageURL = "";

// Pastikan elemen sudah dideklarasikan
const menufitur1 = document.getElementById("menufitur1");
const menufiturawal = document.getElementById("menufiturawal");
const menufiturkedua = document.getElementById("menufiturkedua");

menufiturawal.style.display = "none";
menufiturkedua.style.display = "none";

const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const chatContainer = document.querySelector("section.chat-container");
const uploadBtn = document.getElementById("uploadbtn");

function showPreview(file) {
  preview.innerHTML = ""; // Reset preview

  const fileType = file.type;
  const fileName = file.name;

  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.display = "inline-block";
  wrapper.style.marginBottom = "5px";

  // Tombol hapus (ikon silang)
  const closeBtn = document.createElement("img");
  closeBtn.src = "images/close.png"; // Ganti path sesuai asetmu
  closeBtn.alt = "Hapus";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "-5px";
  closeBtn.style.right = "-5px";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.backgroundColor = "#fff";
  closeBtn.style.border = "1px solid #ccc";
  closeBtn.style.borderRadius = "50%";
  closeBtn.style.width = "16px";
  closeBtn.style.height = "16px";
  closeBtn.style.padding = "2px";

  closeBtn.addEventListener("click", () => {
    preview.innerHTML = "";
    fileInput.value = "";
    teksgambar1 = ""; // Reset hasil OCR
  });

  if (fileType.startsWith("image/")) {
    const objectURL = URL.createObjectURL(file);
    const img = document.createElement("img");
    img.src = objectURL;
    img.style.maxWidth = "150px";
    img.style.borderRadius = "10px";
    img.style.display = "block";
    img.style.marginBottom = "5px";
    wrapper.appendChild(img);

    // Proses OCR tapi hasilnya tidak ditampilkan di UI
    Tesseract.recognize(objectURL, "eng", {
      logger: (m) => console.log(m), // opsional: log progress
    })
      .then(({ data: { text } }) => {
        teksgambar1 = text.trim(); // Simpan ke variabel global tanpa tampilkan
      })
      .catch((err) => {
        console.error("OCR gagal:", err);
      });
  } else {
    // Untuk file non-gambar
    const fileText = document.createElement("div");
    fileText.textContent = "📄 " + fileName;
    fileText.style.padding = "8px";
    fileText.style.backgroundColor = "#f0f0f0";
    fileText.style.borderRadius = "5px";
    fileText.style.display = "inline-block";
    wrapper.appendChild(fileText);
  }

  wrapper.appendChild(closeBtn);
  preview.appendChild(wrapper);
}

// Klik ikon upload untuk buka dialog file
uploadBtn.addEventListener("click", () => {
  fileInput.click();
});

// Saat file dipilih dari dialog
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  showPreview(file);
});

// Drag & Drop di seluruh section.chat-container
chatContainer.addEventListener("dragover", (e) => {
  e.preventDefault();
  chatContainer.style.border = "2px dashed #007bff";
  chatContainer.style.backgroundColor = "#e9f5ff";
});

chatContainer.addEventListener("dragleave", (e) => {
  e.preventDefault();
  chatContainer.style.border = "";
  chatContainer.style.backgroundColor = "";
});

chatContainer.addEventListener("drop", (e) => {
  e.preventDefault();
  chatContainer.style.border = "";
  chatContainer.style.backgroundColor = "";

  if (e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0];
    fileInput.files = e.dataTransfer.files;
    showPreview(file);
  }
});

if (window.visualViewport) {
  const inputContainer = document.querySelector(".input-container");

  function adjustInputContainer() {
    // visualViewport.height = tinggi viewport visible (tidak termasuk keyboard)
    // window.innerHeight = tinggi viewport total (termasuk area keyboard)
    // Kita set jarak bottom sesuai tinggi keyboard
    const keyboardHeight = window.innerHeight - window.visualViewport.height;

    if (keyboardHeight > 100) {
      // Keyboard muncul
      inputContainer.style.bottom = keyboardHeight + "px";
    } else {
      // Keyboard hilang
      inputContainer.style.bottom = "0px";
    }
  }

  window.visualViewport.addEventListener("resize", adjustInputContainer);
  window.visualViewport.addEventListener("scroll", adjustInputContainer);

  // Panggil sekali saat load
  adjustInputContainer();
} else {
  // Fallback jika visualViewport tidak ada (lama atau desktop)
  // Cukup set fixed di bawah viewport saja
  // Bisa ditambahkan event resize untuk lebih canggih
}

const text = "Apakah ada yang bisa saya bantu?";
let index = 0;

function typeWriter() {
  if (index === 0) {
    // Tampilkan menufitur1 sekali saat mulai ketik
    menufitur1.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      height: 100%;
    `;
  }

  if (index < text.length) {
    emptyMessage.textContent += text.charAt(index);
    index++;
    setTimeout(typeWriter, 100);
  } else {
    menufiturawal.style.display = "block";
    menufiturkedua.style.display = "block";
    menufiturawal.style.cssText = `
      margin-top: 20px;
      bottom: 1rem;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
      justify-content: center;
      padding: 0 1rem;
      max-width: 100%;
      box-sizing: border-box;
    `;
    menufiturkedua.style.cssText = menufiturawal.style.cssText;
  }
}

typeWriter();

leftMenuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  sidebarOverlay.classList.toggle("active");
});

sidebarOverlay.addEventListener("click", () => {
  sidebar.classList.remove("active");
  sidebarOverlay.classList.remove("active");
});

// Auto resize textarea
chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  const maxHeight = 120;
  chatInput.style.height = Math.min(chatInput.scrollHeight, maxHeight) + "px";
});

// Submit pesan dengan enter tanpa shift
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chatForm.requestSubmit();
  }
});

// Load pesan dari localStorage saat halaman dibuka
window.addEventListener("DOMContentLoaded", () => {
  loadMessagesFromStorage();
});

chatBox.addEventListener("scroll", () => {
  const threshold = 40;
  const distanceFromBottom = chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight;
  autoScrollEnabled = distanceFromBottom < threshold;
});

// Submit form chat
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userText = chatInput.value.trim();
  if ((!userText && !teksgambar1) || isLoading) return;

  let combinedText = userText;

  if (teksgambar1.trim() !== "") {
    combinedText += `\n\n[📷 Teks dari gambar]:\n${teksgambar1.trim()}`;
  }

  appendMessage("user", combinedText, "You", "https://cdn-icons-png.flaticon.com/512/1077/1077114.png");
  messages.push({ role: "user", content: combinedText });
  saveMessagesToStorage();

  // Reset input dan status
  chatInput.value = "";
  chatInput.style.height = "auto";

  // **Reset teks hasil OCR dan hilangkan preview gambar**
  teksgambar1 = "";
  preview.innerHTML = ""; // Hilangkan preview gambar
  fileInput.value = ""; // Reset file input supaya bisa upload ulang file yang sama

  // Reset input dan status
  chatInput.value = "";
  chatInput.style.height = "auto";
  chatInput.blur(); // 👉 Mencegah keyboard muncul saat AI merespons

  appendLoadingMessage();

  try {
    const response = await fetch("https://api.paxsenix.biz.id/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer YOUR_API_KEY_HERE",
      },
      body: JSON.stringify({
        model: "gpt-4",
        temperature: 0.7,
        messages: messages,
      }),
    });

    const data = await response.json();
    const botReply = data.choices?.[0]?.message?.content?.trim() || "No response";

    removeLoadingMessage();

    appendMessage("bot", botReply, "AI Digging", "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_232210.png?alt=media&token=dc5a0b3a-f869-432a-82a2-c27b32eca77f");
    messages.push({ role: "assistant", content: botReply });
    saveMessagesToStorage();
  } catch (err) {
    removeLoadingMessage();
    appendMessage("bot", "Terjadi kesalahan saat menghubungi server.", "AI Digging", "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_232210.png?alt=media&token=dc5a0b3a-f869-432a-82a2-c27b32eca77f");
  } finally {
    isLoading = false;
    chatInput.disabled = false;
  }
});

// Simpan ke localStorage
function saveMessagesToStorage() {
  try {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  } catch (e) {
    console.error("Gagal menyimpan ke localStorage", e);
  }
}

// Load pesan dari localStorage dan tampilkan
function loadMessagesFromStorage() {
  try {
    const stored = localStorage.getItem("chatHistory");
    if (!stored) return;

    messages = JSON.parse(stored);

    messages.forEach((msg) => {
      const role = msg.role === "user" ? "user" : "bot";
      const username = role === "user" ? "You" : "AI Digging";
      const profileUrl =
        role === "user" ? "https://cdn-icons-png.flaticon.com/512/1077/1077114.png" : "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_232210.png?alt=media&token=dc5a0b3a-f869-432a-82a2-c27b32eca77f";

      appendMessage(role, msg.content, username, profileUrl, true);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
    checkChatEmpty(); // ⬅ Tambahkan ini
  } catch (e) {
    console.error("Gagal load pesan dari localStorage", e);
  }
}

// Clear chat dan localStorage
clearChatBtn.addEventListener("click", clearChat);
clearChatBtnn.addEventListener("click", clearChat);

function clearChat() {
  if (confirm("Hapus semua chat?")) {
    messages = [];
    localStorage.removeItem("chatHistory");
    chatBox.innerHTML = "";
    chatInput.value = "";
    chatInput.style.height = "auto";
    checkChatEmpty(); // Tambahkan pengecekan chat kosong

    // Refresh halaman setelah menghapus
    location.reload();
  }
}

function checkChatEmpty() {
  const messageEls = chatBox.querySelectorAll(".message-container");

  // Cek apakah ada pesan user/bot yang tampil
  const hasMessages = messageEls.length > 0;

  if (hasMessages) {
    menufitur1.style.display = "none";
  } else {
    menufitur1.style.display = "flex"; // Atau "block" sesuai kebutuhan
  }
}

// Fungsi tambah pesan ke UI
function appendMessage(sender, text, username, profileUrl, isHistory = false) {
  const container = document.createElement("div");
  container.className = `message-container ${sender} message-fade-in`;

  const img = document.createElement("img");
  img.className = "profile-image";
  img.src = profileUrl;
  img.alt = username;

  const content = document.createElement("div");
  content.className = "message-content";

  const nameEl = document.createElement("div");
  nameEl.className = "username";
  nameEl.textContent = username;

  const messageEl = document.createElement("div");
  messageEl.className = "message";

  content.appendChild(nameEl);
  content.appendChild(messageEl);

  // Tambahkan tombol salin untuk pesan bot/assistant
  if (sender === "bot" || sender === "assistant") {
    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn left";
    copyBtn.title = "Copy message";
    copyBtn.innerHTML = `<img src="images/copy.png" alt="Copy" width="16" height="16" />`;
    copyBtn.onclick = function () {
      copyTextFromButton(this);
    };
    content.appendChild(copyBtn);
  }

  container.appendChild(img);
  container.appendChild(content);
  chatBox.appendChild(container);

  if (sender === "bot" && !isHistory) {
    typeText(messageEl, text).then(() => {
      addCopyButtonsToCodeBlocks(messageEl, username);
      if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight;
      checkChatEmpty(); // ⬅ Tambahkan ini setelah typing selesai
    });
  } else {
    messageEl.innerHTML = parseMarkdown(text);
    if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight;
    checkChatEmpty(); // ⬅ Tambahkan ini di sini
  }
}

// Efek ketik pesan bot
async function typeText(element, text, delay = 20) {
  element.innerHTML = "";
  const html = parseMarkdown(text);
  const temp = document.createElement("div");
  temp.innerHTML = html;

  const characters = [];
  temp.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.split("").forEach((char) => {
        const span = document.createElement("span");
        span.textContent = char;
        characters.push(span);
      });
    } else {
      characters.push(node);
    }
  });

  for (const char of characters) {
    element.appendChild(char.cloneNode(true));
    if (autoScrollEnabled) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
    await new Promise((r) => setTimeout(r, delay));
  }
  addCopyButtonsToCodeBlocks(element);
}

function appendLoadingMessage() {
  const messageContainer = document.createElement("div");
  messageContainer.id = "loading-message";
  messageContainer.className = "message-container bot";

  const profileImg = document.createElement("img");
  profileImg.src = "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_232210.png?alt=media&token=dc5a0b3a-f869-432a-82a2-c27b32eca77f";
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
}

function removeLoadingMessage() {
  const el = document.getElementById("loading-message");
  if (el) el.remove();
}
// Parser markdown sederhana
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function parseMarkdown(text) {
  return text
    .replace(/```filename:(.+?)\n([\s\S]*?)```/g, (match, filename, code) => {
      const escapedCode = escapeHtml(code);
      // Bungkus dengan div.code-wrapper (untuk styling dan toolbar nanti)
      return `<div class="code-wrapper" data-filename="${filename.trim()}"><pre><code>${escapedCode}</code></pre></div>`;
    })
    .replace(/```([\s\S]*?)```/g, (match, code) => {
      const escapedCode = escapeHtml(code);
      return `<div class="code-wrapper"><pre><code>${escapedCode}</code></pre></div>`;
    })
    .replace(/### (.*?)(\n|$)/g, '<strong style="font-size:18px;display:block;">$1</strong>\n')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, (m, inlineCode) => `<code class="inline-code">${escapeHtml(inlineCode)}</code>`)
    .replace(/\n/g, "<br>");
}

// Fungsi copy teks pesan saat klik tombol copy
function copyTextFromButton(button) {
  // Cari elemen pesan (div.message) yang ada sebelum tombol copy
  const messageEl = button.previousElementSibling;
  if (!messageEl) return;
  const text = messageEl.textContent;
  navigator.clipboard.writeText(text).then(() => {
    button.innerHTML = `<img src="images/tick.png" alt="Copied" width="16" height="16" />`;
    setTimeout(() => {
      button.innerHTML = `<img src="images/copy.png" alt="Copy" width="16" height="16" />`;
    }, 1500);
  });
}

// Fungsi tambahkan tombol copy + label di atas tiap blok kode (hanya untuk bot)
function addCopyButtonsToCodeBlocks(container, username = "AI Digging") {
  if (username === "You") return; // Jangan toolbar di pesan user

  const wrappers = container.querySelectorAll(".code-wrapper");

  wrappers.forEach((wrapper) => {
    // Cegah duplikasi toolbar
    if (wrapper.querySelector(".code-toolbar")) return;

    const pre = wrapper.querySelector("pre");
    const code = pre.querySelector("code");

    // Toolbar/header
    const toolbar = document.createElement("div");
    toolbar.className = "code-toolbar";
    toolbar.style.display = "flex";
    toolbar.style.justifyContent = "space-between";
    toolbar.style.alignItems = "center";
    toolbar.style.padding = "6px 12px";
    toolbar.style.backgroundColor = "#f3f4f6";
    toolbar.style.fontSize = "13px";
    toolbar.style.fontWeight = "500";
    toolbar.style.fontFamily = "sans-serif";
    toolbar.style.borderBottom = "1px solid #ddd";

    // Label nama file (ambil dari data-filename)
    const filename = wrapper.getAttribute("data-filename") || "code";
    const label = document.createElement("span");
    label.textContent = filename;
    label.style.color = "#374151";

    // Tombol copy kode
    const copyBtn = document.createElement("button");
    copyBtn.title = "Salin kode";
    copyBtn.style.background = "none";
    copyBtn.style.border = "none";
    copyBtn.style.cursor = "pointer";
    copyBtn.style.padding = "2px";
    copyBtn.style.display = "flex";
    copyBtn.style.alignItems = "center";
    copyBtn.style.gap = "4px";

    copyBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#4B5563" stroke-width="2" viewBox="0 0 24 24" width="18" height="18">
        <path d="M16 4H8a2 2 0 0 0-2 2v12m2-2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
      </svg>
      Copy
    `;

    copyBtn.onclick = () => {
      navigator.clipboard.writeText(code.textContent).then(() => {
        copyBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#10B981" stroke-width="2" viewBox="0 0 24 24" width="18" height="18">
            <path d="M5 13l4 4L19 7"/>
          </svg>
          Copied
        `;
        setTimeout(() => {
          copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#4B5563" stroke-width="2" viewBox="0 0 24 24" width="18" height="18">
              <path d="M16 4H8a2 2 0 0 0-2 2v12m2-2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
            </svg>
            Copy
          `;
        }, 1500);
      });
    };

    toolbar.appendChild(label);
    toolbar.appendChild(copyBtn);

    // Masukkan toolbar di atas pre
    wrapper.insertBefore(toolbar, pre);
  });
}

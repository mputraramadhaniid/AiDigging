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

window.addEventListener("resize", () => {
  document.querySelector(".chat-box")?.scrollTo(0, document.querySelector(".chat-box").scrollHeight);
});

function showPreview(file) {
  preview.innerHTML = ""; // Reset preview

  const fileType = file.type;
  const fileName = file.name;

  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.display = "inline-block";
  wrapper.style.marginBottom = "5px";

  const closeBtn = document.createElement("img");
  closeBtn.src = "images/close.png";
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
    teksgambar1 = "";
    previewImageURL = "";
    localStorage.removeItem("previewImage");
    localStorage.removeItem("ocrText");
  });

  if (fileType.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const dataURL = e.target.result;

      const img = document.createElement("img");
      img.src = dataURL;
      img.style.maxWidth = "150px";
      img.style.borderRadius = "10px";
      img.style.display = "block";
      img.style.marginBottom = "5px";
      wrapper.appendChild(img);

      preview.appendChild(wrapper);
      wrapper.appendChild(closeBtn);

      previewImageURL = dataURL; // Simpan untuk penggunaan selanjutnya

      // Simpan gambar di localStorage
      localStorage.setItem("previewImage", dataURL);

      // Proses OCR dengan Tesseract menggunakan dataURL
      Tesseract.recognize(dataURL, "eng", {
        logger: (m) => console.log(m),
      })
        .then(({ data: { text } }) => {
          teksgambar1 = text.trim();
          localStorage.setItem("ocrText", teksgambar1); // Simpan OCR ke localStorage
        })
        .catch((err) => {
          console.error("OCR gagal:", err);
          teksgambar1 = "";
          localStorage.removeItem("ocrText");
        });
    };
    reader.readAsDataURL(file);
  } else {
    const fileText = document.createElement("div");
    fileText.textContent = "📄 " + fileName;
    fileText.style.padding = "8px";
    fileText.style.backgroundColor = "#f0f0f0";
    fileText.style.borderRadius = "5px";
    fileText.style.display = "inline-block";
    wrapper.appendChild(fileText);
    wrapper.appendChild(closeBtn);
    preview.appendChild(wrapper);
  }
}

document.getElementById("menu4").addEventListener("click", function () {
  // Ganti URL berikut dengan halaman tujuanmu
  window.location.href = "voice.html";
});

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

// Fungsi untuk mendeteksi apakah perangkat adalah mobile
function isMobileDevice() {
  return window.innerWidth <= 768; // Anda dapat menyesuaikan lebar ini sesuai kebutuhan
}

// Submit pesan dengan enter tanpa shift di laptop, dan tambah baris di mobile
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    if (isMobileDevice()) {
      // Di perangkat mobile, tekan Enter untuk menambah baris baru
      // Tidak ada tindakan lain, biarkan textarea menambah baris baru
    } else {
      // Di laptop, jika tidak ada shift, kirim pesan
      if (!e.shiftKey) {
        e.preventDefault(); // Mencegah penambahan baris baru
        chatForm.requestSubmit(); // Kirim form
      }
    }
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

// Modifikasi pada event listener submit form chat
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userText = chatInput.value.trim();
  if ((!userText && !teksgambar1) || isLoading) return;

  // Gabungkan teks untuk dikirim ke server
  let combinedTextForServer = userText;
  if (teksgambar1.trim() !== "") {
    combinedTextForServer += `\n\n[📷 Teks dari gambar]:\n${teksgambar1.trim()}`;
  }

  let imageURL = "";
  const imgElem = preview.querySelector("img");
  if (imgElem) {
    imageURL = imgElem.src;
  }

  // Tampilkan di UI hanya userText + gambar, tanpa teksgambar1
  appendMessage("user", userText, "You", "https://cdn-icons-png.flaticon.com/512/1077/1077114.png", imageURL);

  // Simpan ke messages dengan properti ocrText, nanti dikirim gabungan
  messages.push({
    role: "user",
    content: combinedTextForServer,
    ocrText: teksgambar1.trim(),
    imageURL: imageURL,
  });
  saveMessagesToStorage();

  // Reset UI input dan preview
  chatInput.value = "";
  chatInput.style.height = "auto";
  chatInput.blur();
  teksgambar1 = "";
  preview.innerHTML = "";
  fileInput.value = "";

  // Hentikan animasi loading sebelumnya jika ada
  removeLoadingMessage(); // Hapus pesan loading sebelumnya
  isLoading = true; // Set isLoading ke true
  appendLoadingMessage(); // Tampilkan pesan loading

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
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      }),
    });

    const data = await response.json();
    const botReply = data.choices?.[0]?.message?.content?.trim() || "No response";

    removeLoadingMessage(); // Hapus pesan loading setelah mendapatkan respons

    appendMessage("bot", botReply, "AI Digging", "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_232210.png?alt=media&token=dc5a0b3a-f869-432a-82a2-c27b32eca77f");

    messages.push({ role: "assistant", content: botReply });
    saveMessagesToStorage();
  } catch (err) {
    removeLoadingMessage(); // Hapus pesan loading jika terjadi kesalahan
    appendMessage("bot", "Terjadi kesalahan saat menghubungi server.", "AI Digging", "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_232210.png?alt=media&token=dc5a0b3a-f869-432a-82a2-c27b32eca77f");
  } finally {
    isLoading = false; // Set isLoading ke false
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

      // ✂️ Hapus bagian teks OCR saat menampilkan ulang pesan user
      let displayContent = msg.content;

      if (role === "user") {
        // Jika ada teks OCR, hapus dari tampilan (hanya hapus untuk tampilan, bukan data aslinya)
        const ocrMarker = "\n\n[📷 Teks dari gambar]:";
        if (displayContent.includes(ocrMarker)) {
          displayContent = displayContent.split(ocrMarker)[0];
        }
      }

      appendMessage(role, displayContent, username, profileUrl, true, msg.imageURL || "");
    });

    chatBox.scrollTop = chatBox.scrollHeight;
    checkChatEmpty();
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

function appendMessage(sender, text, username, profileUrl, isHistory = false) {
  const container = document.createElement("div");
  container.className = `message-container ${sender} message-fade-in`;

  const content = document.createElement("div");
  content.className = "message-content";

  const messageEl = document.createElement("div");
  messageEl.className = "message";
  messageEl.style.position = "relative";

  // Beda padding dan class tergantung sender
  if (sender === "bot") {
    messageEl.style.paddingBottom = "28px";
    messageEl.classList.add("bot-message");
  } else {
    messageEl.style.paddingBottom = "8px";
    messageEl.classList.add("user-message");
  }

  content.appendChild(messageEl);

  if (sender === "bot") {
    const codeRegex = /```(.*?)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = text.substring(lastIndex, match.index);
        const textDivBefore = document.createElement("div");
        textDivBefore.innerHTML = parseMarkdown(textBefore);
        messageEl.appendChild(textDivBefore);
      }

      const filename = match[1].trim();
      const code = match[2];
      lastIndex = codeRegex.lastIndex;

      const codeWrapper = document.createElement("div");
      codeWrapper.className = "code-wrapper";
      Object.assign(codeWrapper.style, {
        backgroundColor: "#1e1e1e",
        fontFamily: "'Source Code Pro', monospace",
        fontSize: "0.9em",
        color: "#d4d4d4",
        position: "relative",
      });

      const codeHeader = document.createElement("div");
      Object.assign(codeHeader.style, {
        display: "flex",
        alignItems: "center",
        padding: "8px",
        gap: "2px",
        paddingBottom: "8px",
        borderBottom: "1px solid #333",
        backgroundColor: "#1e1e1e",
      });

      const codeLabel = document.createElement("span");
      codeLabel.textContent = filename;
      Object.assign(codeLabel.style, {
        color: "#ccc",
        fontWeight: "600",
        userSelect: "none",
      });

      const copyBtn = document.createElement("button");
      copyBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" viewBox="0 0 24 24">
          <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>`;
      Object.assign(copyBtn.style, {
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: "#ccc",
        padding: "0",
        userSelect: "none",
        height: "24px",
        width: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: "auto",
        transition: "color 0.3s",
      });
      copyBtn.onmouseenter = () => (copyBtn.style.color = "#fff");
      copyBtn.onmouseleave = () => (copyBtn.style.color = "#ccc");
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(code).then(() => {
          copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" viewBox="0 0 24 24">
              <path d="M9 16.17l-3.88-3.88-1.41 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>`;
          setTimeout(() => {
            copyBtn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" viewBox="0 0 24 24">
                <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>`;
          }, 1500);
        });
      };

      codeHeader.appendChild(codeLabel);
      codeHeader.appendChild(copyBtn);

      const pre = document.createElement("pre");
      Object.assign(pre.style, {
        backgroundColor: "transparent",
        margin: "0",
        paddingTop: "8px",
        overflowX: "auto",
        color: "#d4d4d4",
        fontFamily: "'Source Code Pro', monospace",
        fontSize: "0.9em",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
      });

      const codeElement = document.createElement("code");
      codeElement.textContent = code;

      pre.appendChild(codeElement);
      codeWrapper.appendChild(codeHeader);
      codeWrapper.appendChild(pre);
      messageEl.appendChild(codeWrapper);
    }

    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      const textDiv = document.createElement("div");
      textDiv.innerHTML = parseMarkdown(remainingText);
      messageEl.appendChild(textDiv);
    }

    const copyAllBtn = document.createElement("button");
    copyAllBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" viewBox="0 0 24 24">
        <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>`;
    Object.assign(copyAllBtn.style, {
      position: "absolute",
      bottom: "4px",
      left: "-12px",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      color: "#fff",
      padding: "0",
      margin: "0",
      userSelect: "none",
    });
    copyAllBtn.onclick = () => {
      // Beda padding dan class tergantung sender
      navigator.clipboard.writeText(text).then(() => {
        copyAllBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" viewBox="0 0 24 24">
            <path d="M9 16.17l-3.88-3.88-1.41 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>`;
        setTimeout(() => {
          copyAllBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" viewBox="0 0 24 24">
              <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>`;
        }, 1500);
      });
    };
    messageEl.appendChild(copyAllBtn);
  } else {
    const textDiv = document.createElement("div");
    textDiv.innerHTML = parseMarkdown(text);
    messageEl.appendChild(textDiv);
  }

  container.appendChild(content);
  chatBox.appendChild(container);

  if (sender === "bot" && !isHistory) {
    messageEl.innerHTML = "";
    typeText(messageEl, text).then(() => {
      if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight;
      chatInput.disabled = false;
      checkChatEmpty();
    });
  } else {
    if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight;
    checkChatEmpty();
  }
}

async function typeText(element, text, delay = 20, onFinish = () => {}) {
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
    if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight;
    await new Promise((r) => setTimeout(r, delay));
  }

  addCopyButtonsToCodeBlocks(element);

  chatInput.disabled = false;
  chatInput.focus();

  onFinish();
}

// Fungsi untuk menambahkan pesan loading
function appendLoadingMessage() {
  removeLoadingMessage(); // Hapus pesan loading sebelumnya jika ada

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
    .replace(/\n/g, "<br>")
    .replace(/---/g, '<hr style="border: 1px solid #ccc;"/>');
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

function addCopyButtonsToCodeBlocks(container, username = "AI Digging") {
  if (username === "You") return; // Jangan toolbar di pesan user

  const wrappers = container.querySelectorAll(".code-wrapper");

  wrappers.forEach((wrapper) => {
    if (wrapper.querySelector(".code-toolbar")) return; // Cegah duplikat

    const pre = wrapper.querySelector("pre");
    if (!pre) return;
    const code = pre.querySelector("code");
    if (!code) return;

    // Buat elemen toolbar
    const toolbar = document.createElement("div");
    toolbar.className = "code-toolbar";

    // Label nama file
    const filename = wrapper.getAttribute("data-filename") || "code";
    const label = document.createElement("span");
    label.className = "code-label";
    label.textContent = filename;

    // Tombol copy
    const copyBtn = document.createElement("button");
    copyBtn.className = "code-copy-btn";
    copyBtn.type = "button";
    copyBtn.title = "Salin kode";
    copyBtn.setAttribute("aria-label", `Salin kode di ${filename}`);

    copyBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path d="M16 4H8a2 2 0 0 0-2 2v12m2-2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
      </svg>
      <span>Copy</span>
    `;

    copyBtn.onclick = () => {
      navigator.clipboard.writeText(code.textContent).then(() => {
        copyBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#10B981" stroke-width="2" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M5 13l4 4L19 7"/>
          </svg>
          <span>Copied</span>
        `;
        setTimeout(() => {
          copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M16 4H8a2 2 0 0 0-2 2v12m2-2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
            </svg>
            <span>Copy</span>
          `;
        }, 1500);
      });
    };

    // ✅ Tambahkan gambar jika ada (dan belum masuk ke content)
    if (imageURL && !content.includes(imageURL)) {
      html += `<img src="${imageURL}" style="max-width: 200px; border-radius: 10px; margin-top: 10px;" />`;
    }

    // ✅ Render ulang hanya untuk message baru
    renderMathInElement(messageElement, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false },
      ],
    });

    toolbar.appendChild(label);
    toolbar.appendChild(copyBtn);

    // Masukkan toolbar di atas pre
    wrapper.insertBefore(toolbar, pre);
  });
}

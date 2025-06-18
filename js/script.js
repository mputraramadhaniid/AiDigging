const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const clearChatBtn = document.getElementById("clearChatBtn");
const clearChatBtnn = document.getElementById("clearChatBtnn");
const clearChatBtnnn = document.getElementById("clearChatBtnnn");
const leftMenuBtn = document.getElementById("leftMenuBtn");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const emptyMessage = document.getElementById("emptyMessage");
const pusatbantuan = document.getElementById("pusatbantuan");
const inputContainer = document.querySelector(".input-container");
const menufitur1 = document.getElementById("menufitur1");
const menufiturawal = document.getElementById("menufiturawal");
const menufiturkedua = document.getElementById("menufiturkedua");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const chatContainer = document.querySelector("section.chat-container");
const uploadBtn = document.getElementById("uploadbtn");
const sidebarToggleBtn = document.getElementById("sidebarToggle");
const openSidebarBtn = document.getElementById("openSidebarBtn");

let messages = [];
let isLoading = false;
let autoScrollEnabled = true;
let teksgambar1 = "";
let previewImageURL = "";

function updateChatBoxPadding() {
  if (!chatBox || !inputContainer) return;
  const inputHeight = inputContainer.offsetHeight;
  const extraMargin = 15;
  chatBox.style.paddingBottom = `${inputHeight + extraMargin}px`;
}

if (inputContainer) {
  const observer = new ResizeObserver(updateChatBoxPadding);
  observer.observe(inputContainer);
}

menufiturawal.style.display = "none";
menufiturkedua.style.display = "none";

pusatbantuan.addEventListener("click", () => {
  showToast("Fitur ini segera hadir");
});

leftMenuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  sidebarOverlay.classList.toggle("active");
});

sidebarOverlay.addEventListener("click", () => {
  sidebar.classList.remove("active");
  sidebarOverlay.classList.remove("active");
});

window.addEventListener("resize", () => {
  const chatBoxElement = document.querySelector(".chat-box");
  if (chatBoxElement) {
    chatBoxElement.scrollTo(0, chatBoxElement.scrollHeight);
  }
});

// Ganti fungsi showPreview lama Anda dengan yang ini.
function showPreview(file) {
  const previewContainer = document.getElementById("preview");
  const fileInput = document.getElementById("fileInput");

  // 1. Kosongkan preview yang sudah ada sebelumnya
  previewContainer.innerHTML = "";

  // Jika tidak ada file yang dipilih, hentikan fungsi
  if (!file) {
    return;
  }

  // 2. Hanya proses jika file adalah gambar
  if (file.type.startsWith("image/")) {
    const reader = new FileReader();

    // 3. Saat file berhasil dibaca
    reader.onload = function (e) {
      // Buat elemen-elemen yang diperlukan
      const wrapper = document.createElement("div");
      wrapper.className = "preview-item";

      const img = document.createElement("img");
      img.src = e.target.result; // e.target.result berisi data URL gambar

      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "preview-remove-btn";
      closeBtn.setAttribute("aria-label", "Hapus gambar");
      closeBtn.innerHTML = "&times;"; // Simbol '×' untuk silang

      // 4. Tambahkan aksi saat tombol silang diklik
      closeBtn.addEventListener("click", () => {
        previewContainer.innerHTML = ""; // Hapus preview dari tampilan
        fileInput.value = ""; // Reset input file agar bisa memilih file yang sama lagi

        // (Opsional) Reset juga variabel global jika Anda menggunakannya
        teksgambar1 = "";
        previewImageURL = "";
      });

      // 5. Gabungkan dan tampilkan ke halaman
      wrapper.appendChild(img);
      wrapper.appendChild(closeBtn);
      previewContainer.appendChild(wrapper);
    };

    // 6. Baca file gambar. Ini akan memicu reader.onload di atas.
    reader.readAsDataURL(file);
  } else {
    // (Opsional) Tampilkan nama file jika bukan gambar
    previewContainer.innerHTML = `<div class="preview-item">${file.name}</div>`;
  }
}
document.getElementById("menu4").addEventListener("click", function () {
  window.location.href = "voice.html";
});

uploadBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) showPreview(file);
});

chatContainer.addEventListener("dragover", (e) => {
  e.preventDefault();
  chatContainer.classList.add("drag-over");
});

chatContainer.addEventListener("dragleave", (e) => {
  e.preventDefault();
  chatContainer.classList.remove("drag-over");
});

chatContainer.addEventListener("drop", (e) => {
  e.preventDefault();
  chatContainer.classList.remove("drag-over");
  if (e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0];
    fileInput.files = e.dataTransfer.files;
    showPreview(file);
  }
});

if (window.visualViewport) {
  const adjustLayout = () => {
    if (!chatContainer) return;
    chatContainer.style.height = `${window.visualViewport.height}px`;
    if (chatBox) {
      setTimeout(() => {
        chatBox.scrollTo(0, chatBox.scrollHeight);
      }, 50);
    }
  };
  window.visualViewport.addEventListener("resize", adjustLayout);
  adjustLayout();
}

const text = "Apakah ada yang bisa saya bantu?";
let index = 0;

function typeWriter() {
  if (index === 0) {
    menufitur1.style.display = "flex";
  }
  if (index < text.length) {
    emptyMessage.textContent += text.charAt(index);
    index++;
    setTimeout(typeWriter, 100);
  } else {
    menufiturawal.style.display = "flex";
    menufiturkedua.style.display = "flex";
  }
}

typeWriter();

chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  const maxHeight = 120;
  chatInput.style.height = `${Math.min(chatInput.scrollHeight, maxHeight)}px`;
});

function isMobileDevice() {
  return window.innerWidth <= 768;
}

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !isMobileDevice() && !e.shiftKey) {
    e.preventDefault();
    chatForm.requestSubmit();
  }
});

window.addEventListener("DOMContentLoaded", () => {
  updateChatBoxPadding();
  loadMessagesFromStorage();
});

chatBox.addEventListener("scroll", () => {
  const threshold = 40;
  const distanceFromBottom = chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight;
  autoScrollEnabled = distanceFromBottom < threshold;
});
// Modifikasi pada event listener submit form chat
// GANTI SELURUH BLOK INI DI KODE ANDA
// GANTI SELURUH BLOK FUNGSI ANDA DENGAN YANG INI
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userText = chatInput.value.trim();
  const imgElem = preview.querySelector("img");
  const imageSrc = imgElem ? imgElem.src : "";

  // Validasi: Pastikan ada teks atau gambar sebelum mengirim
  if ((!userText && !imageSrc) || isLoading) return;

  // Tampilkan pesan pengguna di UI
  // Parameter untuk appendMessage disesuaikan dengan fungsi yang Anda miliki
  appendMessage("user", userText, "You", "https://cdn-icons-png.flaticon.com/512/1077/1077114.png", imageSrc, false);

  // Simpan pesan saat ini ke array messages untuk riwayat
  messages.push({
    role: "user",
    content: userText,
    imageURL: imageSrc,
  });
  saveMessagesToStorage();

  // Reset UI
  chatInput.value = "";
  chatInput.style.height = "auto";
  chatInput.blur();
  preview.innerHTML = "";
  fileInput.value = "";

  removeLoadingMessage();
  isLoading = true;
  appendLoadingMessage();

  try {
    // --- PERUBAHAN UTAMA 1: RIWAYAT PERCAKAPAN MENJADI MULTIMODAL ---
    // Kini, riwayat tidak hanya mengirim teks, tapi juga gambar dari percakapan sebelumnya.
    const historyContents = messages.slice(0, -1).map((msg) => {
      const historyParts = [];
      // Tambahkan bagian teks dari riwayat jika ada
      if (msg.content) {
        historyParts.push({ text: msg.content });
      }
      // Tambahkan bagian gambar dari riwayat jika ada
      if (msg.imageURL && msg.imageURL.startsWith("data:image")) {
        const mimeType = msg.imageURL.substring(msg.imageURL.indexOf(":") + 1, msg.imageURL.indexOf(";"));
        const base64Data = msg.imageURL.substring(msg.imageURL.indexOf(",") + 1);
        historyParts.push({
          inline_data: {
            mime_type: mimeType,
            data: base64Data,
          },
        });
      }
      return {
        role: msg.role === "assistant" ? "model" : "user",
        parts: historyParts,
      };
    });

    // Siapkan 'parts' untuk pesan yang sedang dikirim saat ini
    const currentUserParts = [];
    if (userText) {
      currentUserParts.push({ text: userText });
    }
    if (imageSrc && imageSrc.startsWith("data:image")) {
      const mimeType = imageSrc.substring(imageSrc.indexOf(":") + 1, imageSrc.indexOf(";"));
      const base64Data = imageSrc.substring(imageSrc.indexOf(",") + 1);
      currentUserParts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Data,
        },
      });
    }

    // Gabungkan riwayat dengan pesan baru
    const finalContents = [
      ...historyContents,
      {
        role: "user",
        parts: currentUserParts,
      },
    ];

    // --- PERUBAHAN UTAMA 2: MENAMBAHKAN SYSTEM INSTRUCTION ---
    const requestBody = {
      contents: finalContents,
      systemInstruction: {
        parts: [
          {
            text: "You are AI Digging. A helpful and smart assistant. Your answers should be informative and well-structured.",
          },
        ],
      },
      // Anda juga bisa menambahkan safetySettings jika perlu
      // safetySettings: [ ... ]
    };

    const apiKey = "AIzaSyAppIpLXqeL2fyeFkIr3_ERCK1PR5aws3k"; // Ganti dengan API key Anda
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || "Request failed");
    }

    const data = await response.json();
    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Maaf, saya tidak bisa memberikan respons saat ini.";

    removeLoadingMessage();

    // Tampilkan balasan bot
    // Parameter disesuaikan dengan fungsi appendMessage yang Anda miliki
    appendMessage("bot", botReply, "AI Digging", "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_232210.png?alt=media&token=dc5a0b3a-f869-432a-82a2-c27b32eca77f");

    // Simpan balasan bot ke riwayat
    messages.push({ role: "assistant", content: botReply, imageURL: "" });
    saveMessagesToStorage();
  } catch (err) {
    console.error("API Error:", err);
    removeLoadingMessage();
    const errorMessage = err.message || "Terjadi kesalahan saat menghubungi server.";
    appendMessage("bot", errorMessage, "AI Digging", "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_232210.png?alt=media&token=dc5a0b3a-f869-432a-82a2-c27b32eca77f");
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

      appendMessage(role, displayContent, username, profileUrl, msg.imageURL || "", true);
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
clearChatBtnnn.addEventListener("click", clearChat);

// GANTI FUNGSI clearChat() LAMA ANDA DENGAN YANG INI:
async function clearChat() {
  try {
    // Panggil dialog kustom dan 'tunggu' hasilnya
    await showConfirmationDialog(
      "Hapus Semua Chat?", // Judul
      "Tindakan ini tidak dapat diurungkan. Seluruh riwayat percakapan akan dihapus secara permanen." // Pesan
    );

    // Jika user menekan "Hapus", kode di bawah ini akan dieksekusi
    console.log("Konfirmasi diterima. Menghapus chat...");
    messages = [];
    localStorage.removeItem("chatHistory");
    chatBox.innerHTML = "";
    chatInput.value = "";
    chatInput.style.height = "auto";
    checkChatEmpty();
    location.reload();
  } catch (error) {
    // Jika user menekan "Batal", promise akan di-reject dan kode di blok ini akan berjalan
    console.log("Penghapusan dibatalkan oleh pengguna.");
  }
}

// TAMBAHKAN FUNGSI BARU INI DI MANA SAJA DALAM FILE JS ANDA
/**
 * Menampilkan dialog konfirmasi kustom.
 * @param {string} title - Judul dialog.
 * @param {string} message - Pesan di dalam dialog.
 * @returns {Promise<void>} - Resolve jika dikonfirmasi, reject jika dibatalkan.
 */
function showConfirmationDialog(title, message) {
  const dialogOverlay = document.getElementById("customDialogOverlay");
  const dialogTitle = document.getElementById("dialogTitle");
  const dialogMessage = document.getElementById("dialogMessage");
  const confirmBtn = document.getElementById("dialogConfirmBtn");
  const cancelBtn = document.getElementById("dialogCancelBtn");

  // Atur konten dialog
  dialogTitle.textContent = title;
  dialogMessage.textContent = message;

  // Tampilkan dialog
  dialogOverlay.classList.remove("hidden");

  return new Promise((resolve, reject) => {
    // Buat event listener yang hanya berjalan sekali
    const onConfirm = () => {
      dialogOverlay.classList.add("hidden");
      removeListeners();
      resolve(); // Konfirmasi berhasil
    };

    const onCancel = () => {
      dialogOverlay.classList.add("hidden");
      removeListeners();
      reject(); // Dibatalkan
    };

    // Fungsi untuk menghapus listener agar tidak menumpuk
    const removeListeners = () => {
      confirmBtn.removeEventListener("click", onConfirm);
      cancelBtn.removeEventListener("click", onCancel);
    };

    confirmBtn.addEventListener("click", onConfirm);
    cancelBtn.addEventListener("click", onCancel);
  });
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

// GANTI SELURUH FUNGSI appendMessage ANDA DENGAN VERSI FINAL INI
function appendMessage(sender, text, username, profileUrl, imageURL = "", isHistory = false) {
  // 1. Buat elemen dasar pesan
  const container = document.createElement("div");
  container.className = `message-container ${sender} message-fade-in`;

  const content = document.createElement("div");
  content.className = "message-content";

  const messageEl = document.createElement("div");
  messageEl.className = "message";
  messageEl.style.position = "relative";

  if (sender === "bot") {
    messageEl.style.paddingBottom = "32px";
    messageEl.classList.add("bot-message");
  } else {
    messageEl.style.paddingBottom = text || imageURL ? "8px" : "0px";
    messageEl.classList.add("user-message");
  }

  // 2. Tambahkan gambar jika ada
  if (imageURL) {
    const imgElement = document.createElement("img");
    imgElement.src = imageURL;
    Object.assign(imgElement.style, {
      maxWidth: "250px",
      borderRadius: "8px",
      display: "block",
      marginBottom: text ? "8px" : "0",
    });
    messageEl.appendChild(imgElement);
  }

  // 3. Proses konten teks
  const isNewBotMessage = sender === "bot" && !isHistory;

  if (isNewBotMessage) {
    // --- KASUS A: Pesan BOT BARU (Animasi) ---
    const textAnimationContainer = document.createElement("div");
    messageEl.appendChild(textAnimationContainer);

    typeText(textAnimationContainer, text).then(() => {
      const copyAllBtn = document.createElement("button");
      const copyIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" viewBox="0 0 24 24"><path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
      const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#4ade80" viewBox="0 0 24 24"><path d="M9 16.17l-3.88-3.88-1.41 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
      copyAllBtn.innerHTML = copyIcon;
      Object.assign(copyAllBtn.style, { position: "absolute", bottom: "4px", left: "0px", marginTop: "4px", background: "transparent", border: "none", cursor: "pointer", color: "#fff", padding: "0", userSelect: "none" });
      copyAllBtn.onmouseenter = () => {
        copyAllBtn.style.opacity = "1";
      };
      copyAllBtn.onmouseleave = () => {
        copyAllBtn.style.opacity = "0.7";
      };
      copyAllBtn.onclick = () => {
        navigator.clipboard.writeText(text).then(() => {
          copyAllBtn.innerHTML = checkIcon;
          setTimeout(() => {
            copyAllBtn.innerHTML = copyIcon;
          }, 1500);
          showToast("Tersalin ke papan klip");
        });
      };
      messageEl.appendChild(copyAllBtn);

      if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight;
      chatInput.disabled = false;
      checkChatEmpty();
    });
  } else {
    // --- KASUS B: Pesan USER atau BOT dari RIWAYAT (Statis) ---
    if (text) {
      if (sender === "bot") {
        const codeRegex = /```(.*?)\n([\s\S]*?)```/g;
        let lastIndex = 0;
        let match;
        const appendContent = (html) => {
          const temp = document.createElement("div");
          temp.innerHTML = html;
          while (temp.firstChild) messageEl.appendChild(temp.firstChild);
        };
        while ((match = codeRegex.exec(text)) !== null) {
          if (match.index > lastIndex) appendContent(parseMarkdown(text.substring(lastIndex, match.index)));
          const [fullMatch, filename, code] = match;
          lastIndex = match.index + fullMatch.length;

          const codeWrapper = document.createElement("div");
          codeWrapper.className = "code-wrapper";
          Object.assign(codeWrapper.style, { backgroundColor: "#1e1e1e", fontFamily: "'Source Code Pro', monospace", fontSize: "0.9em", color: "#d4d4d4", position: "relative", margin: "8px 0", borderRadius: "8px", overflow: "hidden" });
          const codeHeader = document.createElement("div");
          Object.assign(codeHeader.style, { display: "flex", alignItems: "center", padding: "8px", borderBottom: "1px solid #333", backgroundColor: "#252526" });
          const codeLabel = document.createElement("span");
          codeLabel.textContent = filename.trim() || "code";
          Object.assign(codeLabel.style, { color: "#ccc", fontWeight: "600" });

          const copyBtn = document.createElement("button");
          const copyIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" viewBox="0 0 24 24"><path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
          const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#4ade80" viewBox="0 0 24 24"><path d="M9 16.17l-3.88-3.88-1.41 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
          copyBtn.innerHTML = copyIcon;
          Object.assign(copyBtn.style, { background: "transparent", border: "none", cursor: "pointer", marginLeft: "auto", padding: "4px" });
          copyBtn.onclick = () => {
            navigator.clipboard.writeText(code).then(() => {
              copyBtn.innerHTML = checkIcon;
              setTimeout(() => {
                copyBtn.innerHTML = copyIcon;
              }, 1500);
            });
          };

          codeHeader.appendChild(codeLabel);
          codeHeader.appendChild(copyBtn);
          const pre = document.createElement("pre");
          Object.assign(pre.style, { margin: "0", padding: "12px", overflowX: "auto" });
          const codeElement = document.createElement("code");
          codeElement.textContent = code;
          pre.appendChild(codeElement);
          codeWrapper.appendChild(codeHeader);
          codeWrapper.appendChild(pre);
          messageEl.appendChild(codeWrapper);
        }
        if (lastIndex < text.length) appendContent(parseMarkdown(text.substring(lastIndex)));

        // Tombol Copy All untuk bot dari history
        const copyAllBtn = document.createElement("button");

        copyAllBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" viewBox="0 0 24 24"><path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;

        Object.assign(copyAllBtn.style, { position: "absolute", bottom: "4px", left: "0px", marginTop: "4px", background: "transparent", border: "none", cursor: "pointer", color: "#fff", padding: "0", userSelect: "none" });
        copyAllBtn.onmouseenter = () => {
          copyAllBtn.style.opacity = "1";
        };
        copyAllBtn.onmouseleave = () => {
          copyAllBtn.style.opacity = "0.7";
        };
        copyAllBtn.onclick = () => {
          navigator.clipboard.writeText(text).then(() => {
            copyAllBtn.innerHTML = checkAllIcon;
            setTimeout(() => {
              copyAllBtn.innerHTML = copyAllIcon;
            }, 1500);
            showToast("Tersalin ke papan klip");
          });
        };
        messageEl.appendChild(copyAllBtn);
      } else {
        // Pesan user
        if (text) {
          const textDiv = document.createElement("div");
          textDiv.innerHTML = parseMarkdown(text);
          messageEl.appendChild(textDiv);
        }
      }
    }
  }

  // 4. Gabungkan semua elemen dan tampilkan di chat
  content.appendChild(messageEl);
  container.appendChild(content);
  chatBox.appendChild(container);

  if (!isNewBotMessage) {
    if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight;
    checkChatEmpty();
  }
}

function highlightCode(code) {
  // Fungsi ini diubah untuk hanya menampilkan kode sebagai teks biasa (plain text)
  // dengan aman di dalam halaman HTML, tanpa menambahkan warna atau tag span.
  // Proses ini disebut HTML escaping, yang sangat penting untuk keamanan.

  // Mengganti karakter spesial HTML dengan entitasnya agar tidak dieksekusi oleh browser.
  return code
    .replace(/&/g, "&amp;") // Karakter &
    .replace(/</g, "&lt;") // Karakter <
    .replace(/>/g, "&gt;"); // Karakter >
}

async function typeText(element, rawText, delay = 10, onFinish = () => {}) {
  element.innerHTML = ""; // Kosongkan elemen target

  // Regex untuk menemukan blok kode
  const codeRegex = /```(.*?)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  const parts = []; // Array untuk menyimpan bagian teks dan kode

  // 1. Pisahkan teks mentah menjadi bagian teks biasa dan blok kode
  let match;
  while ((match = codeRegex.exec(rawText)) !== null) {
    // Ambil teks sebelum blok kode
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: rawText.slice(lastIndex, match.index) });
    }
    // Ambil blok kode
    parts.push({
      type: "code",
      filename: match[1].trim() || "code", // Ambil nama file atau default "code"
      code: match[2],
    });
    lastIndex = codeRegex.lastIndex;
  }
  // Ambil sisa teks setelah blok kode terakhir
  if (lastIndex < rawText.length) {
    parts.push({ type: "text", content: rawText.slice(lastIndex) });
  }

  // 2. Proses setiap bagian dengan animasi
  for (const part of parts) {
    if (part.type === "text") {
      // Untuk teks biasa, gunakan logika yang ada (sudah benar)
      const parsedHtml = parseMarkdown(part.content);
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = parsedHtml;

      // Fungsi untuk mengetik node
      const typeNode = async (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          for (const char of node.textContent) {
            element.innerHTML += char;
            if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight;
            await new Promise((r) => setTimeout(r, delay));
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // Untuk tag HTML seperti <strong>, <em>, dll, buat tagnya dulu lalu isi dalamnya
          const newElem = document.createElement(node.tagName);
          // Salin atribut jika ada
          for (let i = 0; i < node.attributes.length; i++) {
            const attr = node.attributes[i];
            newElem.setAttribute(attr.name, attr.value);
          }
          element.appendChild(newElem);
          // Rekursif untuk mengetik konten di dalam elemen ini
          for (const childNode of Array.from(node.childNodes)) {
            await typeNodeInElement(childNode, newElem);
          }
        }
      };

      const typeNodeInElement = async (node, parentElement) => {
        if (node.nodeType === Node.TEXT_NODE) {
          for (const char of node.textContent) {
            parentElement.innerHTML += char;
            if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight;
            await new Promise((r) => setTimeout(r, delay));
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const newElem = document.createElement(node.tagName);
          for (let i = 0; i < node.attributes.length; i++) {
            const attr = node.attributes[i];
            newElem.setAttribute(attr.name, attr.value);
          }
          parentElement.appendChild(newElem);
          for (const childNode of Array.from(node.childNodes)) {
            await typeNodeInElement(childNode, newElem);
          }
        }
      };

      for (const node of Array.from(tempDiv.childNodes)) {
        await typeNodeInElement(node, element);
      }
    } else if (part.type === "code") {
      // <<< INI BAGIAN YANG DIUBAH >>>
      // Untuk blok kode, buat kerangkanya dulu, lalu ketik isinya.

      // Buat struktur wrapper, header, dan pre untuk blok kode
      const wrapper = document.createElement("div");
      wrapper.className = "code-wrapper";
      Object.assign(wrapper.style, {
        backgroundColor: "#1e1e1e",
        fontFamily: "'Source Code Pro', monospace",
        fontSize: "0.9em",
        color: "#d4d4d4",
        position: "relative",
      });

      const header = document.createElement("div");
      Object.assign(header.style, {
        display: "flex",
        alignItems: "center",
        padding: "8px",
        gap: "2px",
        paddingBottom: "8px",
        borderBottom: "1px solid #333",
        backgroundColor: "#1e1e1e",
      });

      const label = document.createElement("span");
      label.textContent = part.filename;
      Object.assign(label.style, { color: "#ccc", fontWeight: "600", userSelect: "none" });

      const copyBtn = document.createElement("button");
      copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" viewBox="0 0 24 24"><path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
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
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(part.code).then(() => showToast("Kode tersalin!"));
      };

      header.appendChild(label);
      header.appendChild(copyBtn);

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

      const codeEl = document.createElement("code");
      pre.appendChild(codeEl);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);

      // Tambahkan kerangka kosong ke DOM
      element.appendChild(wrapper);

      // Sekarang, ketik isi kode karakter per karakter ke dalam elemen <code>
      for (const char of part.code) {
        // Gunakan textContent untuk keamanan (mencegah eksekusi HTML dalam kode)
        codeEl.textContent += char;
        if (autoScrollEnabled) {
          chatBox.scrollTop = chatBox.scrollHeight;
        }
        // Gunakan delay yang lebih cepat untuk kode agar tidak terlalu lama
        await new Promise((r) => setTimeout(r, 5));
      }
      // <<< AKHIR PERUBAHAN >>>
    }
  }

  chatInput.disabled = false;
  onFinish();
}

// Fungsi untuk menampilkan notifikasi toast
function showToast(message) {
  // Hapus toast lama jika ada, untuk mencegah tumpukan
  const existingToast = document.querySelector(".toast-notification");
  if (existingToast) {
    existingToast.remove();
  }

  // Buat elemen toast baru
  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.textContent = message;

  // Tambahkan ke body
  document.body.appendChild(toast);

  // Tambahkan class 'show' untuk memicu animasi tampil
  // Diberi sedikit timeout agar transisi berjalan
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  // Atur waktu untuk menyembunyikan dan menghapus toast
  setTimeout(() => {
    toast.classList.remove("show");

    // Hapus elemen dari DOM setelah animasi hilang selesai
    toast.addEventListener("transitionend", () => {
      toast.remove();
    });
  }, 2500); // Toast akan terlihat selama 2.5 detik
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
    .replace(/`([^`]+)`/g, (m, inlineCode) => `<code class="md-inline-code">${escapeHtml(inlineCode)}</code>`)
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

const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const clearChatBtn = document.getElementById("clearChatBtn");
const clearChatBtnn = document.getElementById("clearChatBtnn");
const clearChatBtnnn = document.getElementById("clearChatBtnnn");
const leftMenuBtn = document.getElementById("leftMenuBtn");
const sidebar = document.getElementById("sidebar");
const sidebars = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const emptyMessage = document.getElementById("emptyMessage");
const pusatbantuan = document.getElementById("pusatbantuan");

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

// Ambil elemen-elemen yang diperlukan dari DOM
const sidebarToggleBtn = document.getElementById("sidebarToggle");
const openSidebarBtn = document.getElementById("openSidebarBtn");

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

// [KODE JS INI SUDAH SESUAI]

if (window.visualViewport) {
  const chatContainer = document.querySelector(".chat-container");

  const adjustLayout = () => {
    if (!chatContainer) return;

    // Atur tinggi .chat-container agar sama persis dengan area yang terlihat.
    chatContainer.style.height = `${window.visualViewport.height}px`;
    
    // Scroll ke pesan terakhir
    const chatBox = document.getElementById("chatBox");
    if (chatBox) {
        chatBox.scrollTo(0, chatBox.scrollHeight);
    }
  };

  window.visualViewport.addEventListener("resize", adjustLayout);
  adjustLayout(); // Panggil sekali untuk set layout awal
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
    // Struktur payload untuk Gemini API
    const contents = messages.map((msg) => {
      return {
        // Ubah 'assistant' menjadi 'model' untuk Gemini API
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      };
    });

    const requestBody = {
      contents: contents,
      // Anda bisa menambahkan generationConfig jika perlu
      // generationConfig: {
      //   temperature: 0.7,
      //   topK: 1,
      //   topP: 1,
      //   maxOutputTokens: 2048,
      // },
    };

    // Ganti YOUR_API_KEY_HERE dengan kunci API Anda yang sebenarnya
    const apiKey = "AIzaSyAppIpLXqeL2fyeFkIr3_ERCK1PR5aws3k"; // <-- GANTI DENGAN API KEY ANDA
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || "Request failed");
    }

    const data = await response.json();

    // Ekstrak balasan dari struktur respons Gemini
    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Maaf, saya tidak bisa memberikan respons saat ini.";

    removeLoadingMessage(); // Hapus pesan loading setelah mendapatkan respons

    appendMessage("bot", botReply, "AI Digging", "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_232210.png?alt=media&token=dc5a0b3a-f869-432a-82a2-c27b32eca77f");

    messages.push({ role: "assistant", content: botReply });
    saveMessagesToStorage();
  } catch (err) {
    console.error("API Error:", err);
    removeLoadingMessage(); // Hapus pesan loading jika terjadi kesalahan
    const errorMessage = err.message || "Terjadi kesalahan saat menghubungi server.";
    appendMessage("bot", errorMessage, "AI Digging", "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_232210.png?alt=media&token=dc5a0b3a-f869-432a-82a2-c27b32eca77f");
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

function appendMessage(sender, text, username, profileUrl, isHistory = false) {
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
    messageEl.style.paddingBottom = "8px";
    messageEl.classList.add("user-message");
  }

  content.appendChild(messageEl);

  if (sender === "bot") {
    const codeRegex = /```(.*?)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    // Fungsi helper untuk menempelkan konten tanpa div wrapper
    const appendContentWithoutWrapper = (htmlContent) => {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlContent;
      while (tempDiv.firstChild) {
        messageEl.appendChild(tempDiv.firstChild);
      }
    };

    while ((match = codeRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = text.substring(lastIndex, match.index);
        // <<< PERUBAHAN LOGIKA DI SINI >>>
        // Tidak lagi menggunakan div wrapper, agar struktur sama dengan typeText
        appendContentWithoutWrapper(parseMarkdown(textBefore));
        // <<< AKHIR PERUBAHAN >>>
      }

      const filename = match[1].trim();
      const code = match[2];
      lastIndex = codeRegex.lastIndex;

      // ... (Kode untuk membuat code-wrapper tetap sama)
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
      // <<< PERUBAHAN LOGIKA DI SINI >>>
      // Menggunakan helper yang sama untuk sisa teks
      appendContentWithoutWrapper(parseMarkdown(remainingText));
      // <<< AKHIR PERUBAHAN >>>
    }

    const copyAllBtn = document.createElement("button");
    copyAllBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" viewBox="0 0 24 24">
        <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>`;

    Object.assign(copyAllBtn.style, {
      position: "absolute",
      bottom: "4px",
      left: "0px",
      marginTop: "4px",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      color: "#fff",
      padding: "0",
      userSelect: "none",
    });

    // GANTI BLOK onclick LAMA DENGAN INI:
    copyAllBtn.onclick = () => {
      // rawText atau text, tergantung konteks fungsi (appendMessage atau typeText)
      const textToCopy = typeof rawText !== "undefined" ? rawText : text;

      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast("Tersalin ke papan klip");
        const iconCopy = copyAllBtn.querySelector(".icon-copy");
        const iconCheck = copyAllBtn.querySelector(".icon-check");

        // Pastikan elemen ditemukan sebelum mengubah style
        if (iconCopy && iconCheck) {
          iconCopy.style.display = "none";
          iconCheck.style.display = "inline-block";
        }

        setTimeout(() => {
          if (iconCopy && iconCheck) {
            iconCopy.style.display = "inline-block";
            iconCheck.style.display = "none";
          }
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

function highlightCode(code) {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/(\/\/.*)/g, '<span class="comment">$1</span>')
    .replace(/\b(const|let|var|function|return|if|else|for|while|await|async|try|catch|throw|new|class|this)\b/g, '<span class="keyword">$1</span>')
    .replace(/(["'`].*?["'`])/g, '<span class="string">$1</span>')
    .replace(/\b\d+(\.\d+)?\b/g, '<span class="number">$&</span>')
    .replace(/\b(console|log|document|window|alert|prompt)\b/g, '<span class="function">$1</span>');
}

async function typeText(element, rawText, delay = 10, onFinish = () => {}) {
  element.innerHTML = "";

  const escapeHtml = (str) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

  const codeRegex = /```(.*?)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  const parts = [];

  let match;
  while ((match = codeRegex.exec(rawText)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: rawText.slice(lastIndex, match.index) });
    }

    parts.push({
      type: "code",
      filename: match[1].trim() || "code",
      code: match[2],
    });

    lastIndex = codeRegex.lastIndex;
  }

  if (lastIndex < rawText.length) {
    parts.push({ type: "text", content: rawText.slice(lastIndex) });
  }

  for (const part of parts) {
    if (part.type === "text") {
      const temp = document.createElement("div");
      temp.innerHTML = part.content
        .replace(/### (.*?)(\n|$)/g, `<span class="md-heading">$1</span>\n`)
        .replace(/\*\*(.*?)\*\*/g, '<span class="md-bold">$1</span>')
        .replace(/_(.*?)_/g, '<span class="md-italic">$1</span>')
        .replace(/`([^`]+)`/g, (m, inlineCode) => `<code class="md-inline-code">${escapeHtml(inlineCode)}</code>`)
        .replace(/---/g, '<hr class="md-hr" />')
        .replace(/\n/g, "<br>");

      for (const node of temp.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          for (const char of node.textContent) {
            const span = document.createElement("span");
            span.textContent = char;
            element.appendChild(span);
            if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight;
            await new Promise((r) => setTimeout(r, delay));
          }
        } else {
          element.appendChild(node.cloneNode(true));
        }
      }
    } else if (part.type === "code") {
      const wrapper = document.createElement("div");
      wrapper.className = "code-wrapper";
      wrapper.style.backgroundColor = "#1e1e1e";
      wrapper.style.color = "#d4d4d4";
      wrapper.style.fontFamily = "'Source Code Pro', monospace";
      wrapper.style.marginTop = "12px";
      wrapper.style.position = "relative";

      const header = document.createElement("div");
      header.style.display = "flex";
      header.style.alignItems = "center";
      header.style.justifyContent = "space-between";
      header.style.padding = "8px";
      header.style.borderBottom = "1px solid #333";

      const label = document.createElement("span");
      label.textContent = part.filename;
      label.style.color = "#ccc";
      label.style.fontWeight = "600";

      const copyBtn = document.createElement("button");
      copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" viewBox="0 0 24 24">
        <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
      copyBtn.style.background = "transparent";
      copyBtn.style.border = "none";
      copyBtn.style.cursor = "pointer";
      copyBtn.style.color = "#ccc";

      copyBtn.onclick = () => {
        navigator.clipboard.writeText(part.code).then(() => {
          copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#10B981" viewBox="0 0 24 24">
            <path d="M9 16.17l-3.88-3.88-1.41 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
          setTimeout(() => {
            copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" viewBox="0 0 24 24">
              <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
          }, 1500);
        });
      };

      header.appendChild(label);
      header.appendChild(copyBtn);

      const pre = document.createElement("pre");
      pre.style.margin = "0";
      pre.style.padding = "8px";
      pre.style.overflowX = "auto";
      pre.style.whiteSpace = "pre-wrap";

      const codeEl = document.createElement("code");
      codeEl.innerHTML = highlightCode(part.code);

      pre.appendChild(codeEl);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);
      element.appendChild(wrapper);
    }
  }

  const copyAllBtn = document.createElement("button");
  copyAllBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" viewBox="0 0 24 24">
      <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
    </svg>`;

  // <<< PERUBAHAN DI SINI >>>
  // Saya juga memperbaiki typo 'copyAllTtn' menjadi 'copyAllBtn'
  Object.assign(copyAllBtn.style, {
    position: "absolute",
    bottom: "4px",
    left: "6px", // 1. Sejajar dengan teks kiri
    marginTop: "4px", // 2. Tambah margin atas
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#fff",
    padding: "0",
    userSelect: "none",
  });
  // <<< AKHIR PERUBAHAN >>>

  // GANTI BLOK onclick LAMA DENGAN INI:
  copyAllBtn.onclick = () => {
    // rawText atau text, tergantung konteks fungsi (appendMessage atau typeText)
    const textToCopy = typeof rawText !== "undefined" ? rawText : text;

    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast("Tersalin ke papan klip");
      const iconCopy = copyAllBtn.querySelector(".icon-copy");
      const iconCheck = copyAllBtn.querySelector(".icon-check");

      // Pastikan elemen ditemukan sebelum mengubah style
      if (iconCopy && iconCheck) {
        iconCopy.style.display = "none";
        iconCheck.style.display = "inline-block";
      }

      setTimeout(() => {
        if (iconCopy && iconCheck) {
          iconCopy.style.display = "inline-block";
          iconCheck.style.display = "none";
        }
      }, 1500);
    });
  };

  element.appendChild(copyAllBtn);

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

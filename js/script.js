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

// [PERUBAHAN]: Variabel lama untuk satu gambar dihapus, diganti dengan array untuk banyak file.
// selectedFiles sekarang menyimpan objek { id, file, type, name, dataURL, extractedText }
let selectedFiles = [];

// Inisialisasi worker untuk pdf.js jika library-nya ada
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js`;
}

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

// [MODIFIKASI DIMULAI]: Logika Pratinjau untuk Multi-Jenis File (termasuk PDF dan DOCX)
function showFilePreview(files) {
  const maxFiles = 10;
  for (const file of files) {
    if (selectedFiles.length >= maxFiles) {
      showToast(`Maksimal ${maxFiles} file tercapai.`);
      break;
    }

    const fileId = "file-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
    const fileObject = {
      id: fileId,
      file: file,
      type: file.type,
      name: file.name,
      dataURL: null, // Hanya untuk gambar
      extractedText: null, // Untuk PDF/DOCX
    };

    createPreviewElement(fileObject);
    // Hanya ekstrak konten untuk non-gambar (PDF, DOCX)
    if (!fileObject.type.startsWith("image/")) {
      extractFileContent(fileObject);
    } else {
      // Untuk gambar, baca sebagai data URL untuk ditampilkan
      const reader = new FileReader();
      reader.onload = (e) => {
        fileObject.dataURL = e.target.result;
        // Perbarui elemen pratinjau yang sudah ada jika perlu
        const existingImg = preview.querySelector(`[data-file-id="${fileObject.id}"] img`);
        if (existingImg) {
          existingImg.src = e.target.result;
        }
      };
      reader.readAsDataURL(fileObject.file);
    }

    selectedFiles.push(fileObject);
  }
  updateFileInput();
}

function createPreviewElement(fileObject) {
  const wrapper = document.createElement("div");
  wrapper.className = "preview-item";
  wrapper.setAttribute("data-file-id", fileObject.id);
  wrapper.title = fileObject.name;

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "preview-remove-btn";
  closeBtn.innerHTML = "&times;";
  closeBtn.onclick = () => {
    wrapper.remove();
    selectedFiles = selectedFiles.filter((f) => f.id !== fileObject.id);
    updateFileInput();
  };

  if (fileObject.type.startsWith("image/")) {
    const img = document.createElement("img");
    // img.src akan diatur setelah FileReader selesai di showFilePreview
    wrapper.appendChild(img);
  } else {
    wrapper.classList.add("preview-item-doc");
    const icon = document.createElement("span");
    icon.className = "material-icons";
    if (fileObject.type === "application/pdf") {
      icon.textContent = "picture_as_pdf";
      wrapper.style.backgroundColor = "#D32F2F";
    } else {
      // Ini akan mencakup DOCX, DOC, dan jenis dokumen lainnya
      icon.textContent = "article";
      wrapper.style.backgroundColor = "#1976D2";
    }
    const fileNameSpan = document.createElement("span");
    fileNameSpan.className = "preview-file-name";
    fileNameSpan.textContent = fileObject.name.length > 15 ? fileObject.name.substring(0, 12) + "..." : fileObject.name;

    wrapper.appendChild(icon);
    wrapper.appendChild(fileNameSpan);
  }

  wrapper.appendChild(closeBtn);
  preview.appendChild(wrapper);
}

async function extractFileContent(fileObject) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const arrayBuffer = e.target.result;
    let text = "";
    try {
      if (fileObject.type === "application/pdf" && window.pdfjsLib) {
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => item.str).join(" ") + "\n";
        }
      } else if ((fileObject.name.endsWith(".docx") || fileObject.name.endsWith(".doc")) && window.mammoth) {
        // Mammoth.js harus diimpor di HTML
        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
        text = result.value;
      }
      fileObject.extractedText = text.trim();
      if (text) showToast(`Teks dari ${fileObject.name} berhasil diekstrak.`);
    } catch (error) {
      console.error("Gagal mengekstrak teks:", error);
      showToast(`Gagal memproses file ${fileObject.name}.`);
      fileObject.extractedText = `[Error: Gagal membaca isi file ${fileObject.name}]`;
    }
  };
  // Baca sebagai ArrayBuffer untuk PDF/DOCX
  if (!fileObject.type.startsWith("image/")) {
    reader.readAsArrayBuffer(fileObject.file);
  }
}

/**
 * Fungsi helper baru untuk memperbarui daftar file di dalam <input type="file">.
 */
function updateFileInput() {
  const dataTransfer = new DataTransfer();
  selectedFiles.forEach((item) => dataTransfer.items.add(item.file));
  fileInput.files = dataTransfer.files;
  updateChatBoxPadding();
}

// [MODIFIKASI SELESAI]: Logika Pratinjau Multi-Jenis File

document.getElementById("menu4").addEventListener("click", function () {
  window.location.href = "voice.html";
});

// [PERUBAHAN]: Event listener disesuaikan untuk memanggil fungsi pratinjau yang baru.
uploadBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (event) => {
  if (event.target.files.length > 0) {
    showFilePreview(event.target.files);
  }
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
    showFilePreview(e.dataTransfer.files);
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

// Memeriksa sebelum menjalankan typewriter
if (!localStorage.getItem("chatHistory")) {
  typeWriter();
}

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

// [MODIFIKASI DIMULAI]: Logika Pengiriman Form untuk Multi-Jenis File
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  let userText = chatInput.value.trim();

  if ((!userText && selectedFiles.length === 0) || isLoading) return;

  let combinedText = userText;
  selectedFiles.forEach((file) => {
    if (file.extractedText) {
      combinedText += `\n\n--- Isi dari file: ${file.name} ---\n${file.extractedText}\n--- Akhir dari file: ${file.name} ---`;
    }
  });

  const imageFiles = selectedFiles.filter((f) => f.type.startsWith("image/"));
  const docAndPdfFiles = selectedFiles.filter((f) => !f.type.startsWith("image/"));

  const filesForDisplay = selectedFiles.map((f) => ({
    name: f.name,
    type: f.type,
    dataURL: f.dataURL, // Akan null untuk non-gambar
  }));

  appendMessage("user", userText, "You", "https://cdn-icons-png.flaticon.com/512/1077/1077114.png", filesForDisplay, false);

  messages.push({
    role: "user",
    content: userText,
    files: filesForDisplay, // Menyimpan semua metadata file untuk riwayat
  });
  saveMessagesToStorage();

  chatInput.value = "";
  chatInput.style.height = "auto";
  chatInput.blur();
  preview.innerHTML = "";
  selectedFiles = [];
  updateFileInput();

  removeLoadingMessage();
  isLoading = true;
  appendLoadingMessage();

  try {
    const historyContents = messages.slice(0, -1).map((msg) => {
      const historyParts = [];
      if (msg.content) {
        historyParts.push({ text: msg.content });
      }
      if (msg.files && msg.files.length > 0) {
        msg.files
          .filter((f) => f.dataURL && f.type.startsWith("image/"))
          .forEach((file) => {
            const mimeType = file.type;
            const base64Data = file.dataURL.substring(file.dataURL.indexOf(",") + 1);
            historyParts.push({
              inline_data: { mime_type: mimeType, data: base64Data },
            });
          });
        // Tambahkan teks yang diekstrak dari file dokumen sebelumnya ke history
        msg.files
          .filter((f) => f.extractedText)
          .forEach((file) => {
            historyParts.push({ text: `--- Isi dari file: ${file.name} ---\n${file.extractedText}\n--- Akhir dari file: ${file.name} ---` });
          });
      }
      return {
        role: msg.role === "user" ? "user" : "model",
        parts: historyParts,
      };
    });

    const currentUserParts = [];
    if (combinedText) {
      currentUserParts.push({ text: combinedText });
    }

    imageFiles.forEach((file) => {
      if (file.dataURL) {
        const mimeType = file.type;
        const base64Data = file.dataURL.substring(file.dataURL.indexOf(",") + 1);
        currentUserParts.push({
          inline_data: { mime_type: mimeType, data: base64Data },
        });
      }
    });

    const finalContents = [...historyContents, { role: "user", parts: currentUserParts }];

    const requestBody = {
      contents: finalContents,
      systemInstruction: {
        parts: [{ text: "You are AI Digging. A helpful and smart assistant. Your answers should be informative and well-structured." }],
      },
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
    appendMessage("bot", botReply, "AI Digging", "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_232210.png?alt=media&token=dc5a0b3a-f869-432a-82a2-c27b32eca77f");

    messages.push({ role: "assistant", content: botReply, files: [] }); // Bot tidak mengirim file
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
// [MODIFIKASI SELESAI]

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

      // Gunakan msg.content apa adanya, tidak perlu OCR marker parsing di sini
      let displayContent = msg.content;

      // Pastikan msg.files (imageURLs lama) ada dan dalam format yang benar untuk appendMessage
      const filesToDisplay = msg.files || [];

      appendMessage(role, displayContent, username, profileUrl, filesToDisplay, true);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
    checkChatEmpty();
  } catch (e) {
    console.error("Gagal load pesan dari localStorage", e);
  }
}

clearChatBtn.addEventListener("click", clearChat);
clearChatBtnn.addEventListener("click", clearChat);
clearChatBtnnn.addEventListener("click", clearChat);

async function clearChat() {
  try {
    await showConfirmationDialog("Hapus Semua Chat?", "Tindakan ini tidak dapat diurungkan. Seluruh riwayat percakapan akan dihapus secara permanen.");
    messages = [];
    localStorage.removeItem("chatHistory");
    chatBox.innerHTML = "";
    chatInput.value = "";
    chatInput.style.height = "auto";
    // [PERUBAHAN]: Pastikan pratinjau juga dibersihkan saat hapus chat
    preview.innerHTML = "";
    selectedFiles = [];
    updateFileInput();
    checkChatEmpty();
    location.reload();
  } catch (error) {
    console.log("Penghapusan dibatalkan oleh pengguna.");
  }
}

function showConfirmationDialog(title, message) {
  const dialogOverlay = document.getElementById("customDialogOverlay");
  const dialogTitle = document.getElementById("dialogTitle");
  const dialogMessage = document.getElementById("dialogMessage");
  const confirmBtn = document.getElementById("dialogConfirmBtn");
  const cancelBtn = document.getElementById("dialogCancelBtn");

  dialogTitle.textContent = title;
  dialogMessage.textContent = message;
  dialogOverlay.classList.remove("hidden");

  return new Promise((resolve, reject) => {
    const onConfirm = () => {
      dialogOverlay.classList.add("hidden");
      removeListeners();
      resolve();
    };
    const onCancel = () => {
      dialogOverlay.classList.add("hidden");
      removeListeners();
      reject();
    };
    const removeListeners = () => {
      confirmBtn.removeEventListener("click", onConfirm);
      cancelBtn.removeEventListener("click", onCancel);
    };
    confirmBtn.addEventListener("click", onConfirm, { once: true });
    cancelBtn.addEventListener("click", onCancel, { once: true });
  });
}

function checkChatEmpty() {
  const messageEls = chatBox.querySelectorAll(".message-container");
  const hasMessages = messageEls.length > 0;
  if (hasMessages) {
    menufitur1.style.display = "none";
  } else {
    menufitur1.style.display = "flex";
  }
}

// [MODIFIKASI DIMULAI]: appendMessage dirombak untuk menampilkan file tag dan grid gambar
function appendMessage(sender, text, username, profileUrl, files = [], isHistory = false) {
  const container = document.createElement("div");
  container.className = `message-container ${sender} message-fade-in`;

  const profileEl = document.createElement("img");
  profileEl.src = profileUrl;
  profileEl.className = "profile-image";
  container.appendChild(profileEl);

  const content = document.createElement("div");
  content.className = "message-content";

  const nameEl = document.createElement("div");
  nameEl.className = "username";
  nameEl.textContent = username;
  content.appendChild(nameEl);

  const messageEl = document.createElement("div");
  messageEl.className = "message " + (sender === "bot" ? "bot-message" : "user-message");
  messageEl.style.position = "relative";

  // Padding bawah disesuaikan jika ada konten teks atau file
  if (sender === "bot") {
    messageEl.style.paddingBottom = "32px";
  } else {
    messageEl.style.paddingBottom = text || (files && files.length > 0) ? "8px" : "0px";
  }

  // Container untuk file (gambar dan dokumen)
  const filesContainer = document.createElement("div");
  filesContainer.className = "message-files-container";
  if (files && files.length > 0) {
    messageEl.appendChild(filesContainer);
  }

  const imageFiles = files ? files.filter((f) => f.type && f.type.startsWith("image/")) : [];
  const docFiles = files ? files.filter((f) => f.type && !f.type.startsWith("image/")) : [];

  // Tampilkan tag dokumen (PDF, DOCX)
  if (docFiles.length > 0) {
    const docGrid = document.createElement("div");
    docGrid.className = "message-doc-grid";
    docFiles.forEach((file) => {
      const docTag = document.createElement("div");
      docTag.className = "message-doc-tag";
      const icon = document.createElement("span");
      icon.className = "material-icons";
      icon.textContent = file.type === "application/pdf" ? "picture_as_pdf" : "article";
      docTag.appendChild(icon);
      docTag.append(file.name);
      docGrid.appendChild(docTag);
    });
    filesContainer.appendChild(docGrid);
  }

  // Tampilkan grid gambar
  if (imageFiles.length > 0) {
    const imageGrid = document.createElement("div");
    imageGrid.className = "message-image-grid";
    imageFiles.forEach((file) => {
      if (file.dataURL) {
        const img = document.createElement("img");
        img.src = file.dataURL;
        imageGrid.appendChild(img);
      }
    });
    filesContainer.appendChild(imageGrid);
  }

  // Logika rendering teks
  const textContentDiv = document.createElement("div");
  if (text) {
    messageEl.appendChild(textContentDiv);
  }

  const isNewBotMessage = sender === "bot" && !isHistory;

  if (isNewBotMessage) {
    typeText(textContentDiv, text).then(() => {
      if (text) {
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
      }
      if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight;
      chatInput.disabled = false;
      checkChatEmpty();
    });
  } else {
    // --- KASUS B: Pesan USER atau BOT dari RIWAYAT (Statis) ---
    if (text) {
      const codeRegex = /```(.*?)\n([\s\S]*?)```/g;
      let lastIndex = 0;
      let match;
      const appendContent = (html) => {
        const temp = document.createElement("div");
        temp.innerHTML = html;
        while (temp.firstChild) textContentDiv.appendChild(temp.firstChild);
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
        textContentDiv.appendChild(codeWrapper);
      }
      if (lastIndex < text.length) appendContent(parseMarkdown(text.substring(lastIndex)));

      // HANYA tambahkan tombol "copy all" jika pengirimnya adalah bot (atau pesan riwayat bot)
      if (sender === "bot") {
        // Kunci perubahannya ada di sini!
        const copyAllBtn = document.createElement("button");
        const copyAllIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" viewBox="0 0 24 24"><path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
        const checkAllIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#4ade80" viewBox="0 0 24 24"><path d="M9 16.17l-3.88-3.88-1.41 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
        copyAllBtn.innerHTML = copyAllIcon;
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
      }
    }
  }

  content.appendChild(messageEl);
  container.appendChild(content);
  chatBox.appendChild(container);

  if (!isNewBotMessage) {
    if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight;
    checkChatEmpty();
  }
}
// [MODIFIKASI SELESAI]

function highlightCode(code) {
  return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function typeText(element, rawText, delay = 10, onFinish = () => {}) {
  element.innerHTML = "";
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
      const parsedHtml = parseMarkdown(part.content);
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = parsedHtml;

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
      const wrapper = document.createElement("div");
      wrapper.className = "code-wrapper";
      Object.assign(wrapper.style, {
        backgroundColor: "#1e1e1e",
        fontFamily: "'Source Code Pro', monospace",
        fontSize: "0.9em",
        color: "#d4d4d4",
        position: "relative",
        borderRadius: "8px", // Added border-radius for consistency
        margin: "8px 0", // Added margin for spacing
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
      element.appendChild(wrapper);

      for (const char of part.code) {
        codeEl.textContent += char;
        if (autoScrollEnabled) {
          chatBox.scrollTop = chatBox.scrollHeight;
        }
        await new Promise((r) => setTimeout(r, 5));
      }
    }
  }

  chatInput.disabled = false;
  onFinish();
}

function showToast(message) {
  const existingToast = document.querySelector(".toast-notification");
  if (existingToast) {
    existingToast.remove();
  }
  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);
  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => {
      toast.remove();
    });
  }, 2500);
}

function appendLoadingMessage() {
  removeLoadingMessage();
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

function escapeHtml(text) {
  if (!text) return "";
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function parseMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/```filename:(.+?)\n([\s\S]*?)```/g, (match, filename, code) => {
      const escapedCode = escapeHtml(code);
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

function copyTextFromButton(button) {
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
  if (username === "You") return;

  const wrappers = container.querySelectorAll(".code-wrapper");

  wrappers.forEach((wrapper) => {
    if (wrapper.querySelector(".code-toolbar")) return;

    const pre = wrapper.querySelector("pre");
    if (!pre) return;
    const code = pre.querySelector("code");
    if (!code) return;

    const toolbar = document.createElement("div");
    toolbar.className = "code-toolbar";

    const filename = wrapper.getAttribute("data-filename") || "code";
    const label = document.createElement("span");
    label.className = "code-label";
    label.textContent = filename;

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

    // NOTE: Kode di bawah ini dari file asli Anda memiliki variabel yang tidak terdefinisi (`imageURL`, `content`, `messageElement`).
    // Sesuai permintaan Anda, saya membiarkannya apa adanya. Jika menyebabkan error, Anda bisa menghapusnya.
    /*
        if (imageURL && !content.includes(imageURL)) {
          html += `<img src="${imageURL}" style="max-width: 200px; border-radius: 10px; margin-top: 10px;" />`;
        }

        renderMathInElement(messageElement, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "\\[", right: "\\]", display: true },
            { left: "\\(", right: "\\)", display: false },
          ],
        });
        */

    toolbar.appendChild(label);
    toolbar.appendChild(copyBtn);
    wrapper.insertBefore(toolbar, pre);
  });
}

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

let selectedFiles = [];

// --- PENTING: GANTI DENGAN URL SERVER PROXY NYATA ANDA! ---
// Contoh: 'https://your-proxy-server.herokuapp.com/proxy'
// Jika Anda belum punya, lihat bagian "Cara Membuat Server Proxy Sederhana" di respons sebelumnya.
const PROXY_SERVER_URL = "http://localhost:3000/proxy";

const OFFICIAL_WEBSITE_URL = "https://example.com/ai-digging"; // Ganti dengan URL website resmi Anda

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

// Logika Pratinjau untuk Multi-Jenis File (termasuk PDF dan DOCX)
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
      isUrl: false, // Menandai apakah ini dari URL
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

/**
 * Menambahkan URL ke daftar pratinjau dan mencoba mengambil serta mengekstrak kontennya.
 * @param {string} urlString - URL yang akan diproses.
 */
async function addUrlToPreview(urlString) {
  const maxFiles = 10;
  if (selectedFiles.length >= maxFiles) {
    showToast(`Maksimal ${maxFiles} file tercapai.`);
    return;
  }

  // [Perbaikan]: Validasi URL dasar
  try {
    new URL(urlString); // Akan melempar error jika URL tidak valid
  } catch (e) {
    showToast(`URL tidak valid: ${urlString}`);
    console.error("Invalid URL:", urlString, e);
    return;
  }

  // Pastikan URL belum ada di selectedFiles untuk menghindari duplikasi
  if (selectedFiles.some((f) => f.isUrl && f.originalUrl === urlString)) {
    showToast(`URL ini sudah ditambahkan: ${urlString}`);
    return;
  }

  const fileId = "file-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
  const fileName = urlString.substring(urlString.lastIndexOf("/") + 1) || "url_content";
  let fileType = "application/octet-stream"; // Default unknown type

  // Deteksi tipe file berdasarkan heuristik
  if (/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(urlString)) {
    fileType = "image/" + urlString.match(/\.(jpg|jpeg|png|gif|webp)/i)[1].replace("jpg", "jpeg");
  } else if (/\.pdf(\?.*)?$/i.test(urlString)) {
    fileType = "application/pdf";
  } else if (/\.(doc|docx)(\?.*)?$/i.test(urlString)) {
    fileType = "application/msword";
  } else if (urlString.includes("youtube.com/watch") || urlString.includes("youtu.be/")) {
    fileType = "video/youtube";
  } else {
    fileType = "text/html"; // Asumsi default untuk link web biasa
  }

  const fileObject = {
    id: fileId,
    file: null, // Tidak ada objek File sebenarnya untuk URL
    type: fileType,
    name: fileName,
    dataURL: null, // Untuk gambar dari URL
    extractedText: null, // Untuk teks dari URL
    isUrl: true, // Menandai ini dari URL
    originalUrl: urlString, // Menyimpan URL asli
  };

  createPreviewElement(fileObject);
  selectedFiles.push(fileObject);
  updateFileInput();

  // Lakukan fetching konten URL melalui proxy
  showToast(`Mencoba memproses URL: ${urlString}`);
  try {
    const response = await fetch(`${PROXY_SERVER_URL}?url=${encodeURIComponent(urlString)}`);
    if (!response.ok) {
      // Jika ada error dari proxy, coba parse sebagai JSON untuk detail error
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Gagal mengambil konten dari URL (${response.status}): ${errorData.message || response.statusText}`);
    }

    // Tentukan bagaimana memproses berdasarkan tipe yang terdeteksi
    if (fileObject.type.startsWith("image/")) {
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = (e) => {
        fileObject.dataURL = e.target.result;
        const existingImg = preview.querySelector(`[data-file-id="${fileObject.id}"] img`);
        if (existingImg) {
          existingImg.src = e.target.result;
        }
        showToast(`Gambar dari URL berhasil dimuat: ${fileObject.name}`);
      };
      reader.readAsDataURL(blob);
    } else if (fileObject.type === "application/pdf" && window.pdfjsLib) {
      const arrayBuffer = await response.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(" ") + "\n";
      }
      fileObject.extractedText = text.trim();
      showToast(`Teks dari PDF URL berhasil diekstrak.`);
    } else if (fileObject.type === "video/youtube") {
      // Untuk YouTube, kita hanya bisa mengirim URL atau ID video ke AI
      // AI bisa disuruh meringkas berdasarkan judul/deskripsi video
      fileObject.extractedText = `URL Video YouTube: ${urlString}`;
      showToast(`Mendeteksi URL YouTube. AI akan menerima URL video.`);
    } else if (fileObject.type === "text/html") {
      const textContent = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(textContent, "text/html");

      // [Perbaikan]: Ekstraksi teks yang lebih fokus dari elemen utama
      let mainContent = "";
      const articleElement = doc.querySelector("article, main, #main-content, .content, .post-content");
      if (articleElement) {
        mainContent = articleElement.textContent;
      } else {
        mainContent = doc.body.textContent || doc.documentElement.textContent;
      }

      // Hapus spasi ganda dan batasi ukuran teks untuk AI
      fileObject.extractedText = mainContent.replace(/\s+/g, " ").trim().substring(0, 5000);

      if (fileObject.extractedText) {
        showToast(`Teks dari URL web berhasil diekstrak (${fileObject.extractedText.length} karakter).`);
      } else {
        showToast(`Tidak ada teks yang jelas ditemukan dari URL web.`);
      }
    } else {
      // Jika tipe file tidak dikenal atau tidak bisa diekstrak teksnya
      fileObject.extractedText = `[Konten URL tidak dapat diproses: ${urlString}]`;
      showToast(`Tipe konten URL tidak didukung untuk ekstraksi teks: ${fileObject.type}. URL akan dikirim sebagai tautan.`);
    }
  } catch (error) {
    console.error("Gagal memproses URL:", error);
    showToast(`Gagal memproses URL ${urlString}: ${error.message}`);
    fileObject.extractedText = `[Error: Gagal memproses URL ${urlString}. ${error.message}]`;
    // Opsional: Hapus elemen pratinjau jika error yang tidak dapat diatasi
    // const wrapper = preview.querySelector(`[data-file-id="${fileObject.id}"]`);
    // if (wrapper) wrapper.remove();
    // selectedFiles = selectedFiles.filter((f) => f.id !== fileObject.id);
    // updateFileInput();
  }
}

function createPreviewElement(fileObject) {
  const wrapper = document.createElement("div");
  wrapper.className = "preview-item";
  wrapper.setAttribute("data-file-id", fileObject.id);
  wrapper.title = fileObject.name; // Judul untuk tooltip

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "preview-remove-btn";
  closeBtn.innerHTML = "×"; // Simbol 'x'
  closeBtn.onclick = () => {
    wrapper.remove();
    selectedFiles = selectedFiles.filter((f) => f.id !== fileObject.id);
    updateFileInput();
  };

  if (fileObject.type.startsWith("image/")) {
    const img = document.createElement("img");
    img.alt = fileObject.name;
    // img.src akan diatur setelah FileReader selesai di showFilePreview atau setelah fetch URL
    wrapper.appendChild(img);
  } else if (fileObject.type === "video/youtube") {
    wrapper.classList.add("preview-item-doc");
    const icon = document.createElement("span");
    icon.className = "material-icons";
    icon.textContent = "ondemand_video"; // Icon video
    wrapper.style.backgroundColor = "#FF0000"; // Warna merah YouTube
    const fileNameSpan = document.createElement("span");
    fileNameSpan.className = "preview-file-name";
    fileNameSpan.textContent = "YouTube Video";
    wrapper.appendChild(icon);
    wrapper.appendChild(fileNameSpan);
  } else {
    wrapper.classList.add("preview-item-doc");
    const icon = document.createElement("span");
    icon.className = "material-icons";
    if (fileObject.type === "application/pdf") {
      icon.textContent = "picture_as_pdf";
      wrapper.style.backgroundColor = "#D32F2F";
    } else if (fileObject.type === "text/html") {
      icon.textContent = "link"; // Icon untuk URL web
      wrapper.style.backgroundColor = "#0288D1";
    } else {
      icon.textContent = "article"; // Default untuk dokumen lain
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
  if (!fileObject.type.startsWith("image/")) {
    reader.readAsArrayBuffer(fileObject.file);
  }
}

/**
 * Memperbarui daftar file yang terlampir di input file (hanya untuk file lokal).
 */
function updateFileInput() {
  const localFiles = selectedFiles.filter((f) => !f.isUrl);
  const dataTransfer = new DataTransfer();
  localFiles.forEach((item) => dataTransfer.items.add(item.file));
  fileInput.files = dataTransfer.files;
  updateChatBoxPadding();
}

document.getElementById("menu4").addEventListener("click", function () {
  window.location.href = "voice.html";
});

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

// --- LOGIKA UTAMA PENGIRIMAN FORM ---
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  let userText = chatInput.value.trim();

  // Deteksi URL di dalam teks input
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const foundUrls = userText.match(urlRegex);

  // --- Perbaikan di sini: Pastikan ada konten sebelum melanjutkan ---
  if ((!userText && selectedFiles.length === 0 && !foundUrls) || isLoading) {
    showToast("Mohon masukkan pesan, URL, atau lampirkan file.");
    return; // Hentikan proses jika tidak ada konten yang valid
  }
  // --- Akhir perbaikan ---

  // Jika ada URL di input, tambahkan ke selectedFiles secara otomatis
  if (foundUrls && foundUrls.length > 0) {
    for (const url of foundUrls) {
      // Hapus URL dari userText agar tidak dikirim dua kali
      userText = userText.replace(url, "").trim();
      // Panggil fungsi untuk menambahkan URL ke preview dan memprosesnya
      await addUrlToPreview(url); // Tunggu sampai URL diproses
    }
  }

  let combinedText = userText;
  // Gabungkan extractedText dari semua file dan URL yang dipilih
  selectedFiles.forEach((file) => {
    if (file.extractedText) {
      combinedText += `\n\n--- Konten dari ${file.isUrl ? "URL" : "file"}: ${file.name || file.originalUrl} ---\n${file.extractedText}\n--- Akhir konten ${file.name || file.originalUrl} ---`;
    } else if (file.isUrl && !file.extractedText) {
      // Jika ini URL tapi teksnya gagal diekstrak, tetap kirim URLnya
      combinedText += `\n\n--- URL yang Dilampirkan: ${file.originalUrl} ---`;
    }
  });

  const imageFiles = selectedFiles.filter((f) => f.type.startsWith("image/"));
  const docAndPdfFiles = selectedFiles.filter((f) => !f.type.startsWith("image/") && f.type !== "video/youtube");
  const youtubeFiles = selectedFiles.filter((f) => f.type === "video/youtube");

  const filesForDisplay = selectedFiles.map((f) => ({
    name: f.name,
    type: f.type,
    dataURL: f.dataURL,
    originalUrl: f.originalUrl,
    isUrl: f.isUrl,
  }));

  // --- Perbaikan di sini: Tambahkan pemeriksaan lebih lanjut untuk currentUserParts ---
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

  youtubeFiles.forEach((file) => {
    if (file.originalUrl) {
      currentUserParts.push({ text: `Perhatikan URL video YouTube ini: ${file.originalUrl}. Bisakah Anda membahasnya?` });
    }
  });

  // Final check before sending to API
  if (currentUserParts.length === 0) {
    showToast("Tidak ada konten yang dapat dikirim ke AI. Pastikan pesan Anda tidak kosong atau konten file/URL berhasil diekstrak.");
    removeLoadingMessage();
    isLoading = false;
    chatInput.disabled = false;
    return; // Hentikan proses jika currentUserParts masih kosong
  }
  // --- Akhir perbaikan ---

  appendMessage("user", userText, "You", "https://cdn-icons-png.flaticon.com/512/1077/1077114.png", filesForDisplay, false);

  messages.push({
    role: "user",
    content: userText,
    files: filesForDisplay,
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
        msg.files
          .filter((f) => f.extractedText)
          .forEach((file) => {
            historyParts.push({ text: `--- Konten dari ${file.isUrl ? "URL" : "file"}: ${file.name || file.originalUrl} ---\n${file.extractedText}\n--- Akhir konten ${file.name || file.originalUrl} ---` });
          });
        msg.files
          .filter((f) => f.type === "video/youtube" && f.originalUrl)
          .forEach((file) => {
            historyParts.push({ text: `URL Video YouTube: ${file.originalUrl}` });
          });
      }
      return {
        role: msg.role === "user" ? "user" : "model",
        parts: historyParts,
      };
    });

    const finalContents = [...historyContents, { role: "user", parts: currentUserParts }];

    const requestBody = {
      contents: finalContents,
      systemInstruction: {
        parts: [{ text: "You are AI Digging. A helpful and smart assistant. Your answers should be informative and well-structured. When providing information from a website, cite the URL." }],
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

    messages.push({ role: "assistant", content: botReply, files: [] });
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

      let displayContent = msg.content;

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

// --- FUNGSI BARU UNTUK LIKE/UNLIKE ---
function getMessageLikeStatus(messageId) {
  const status = localStorage.getItem(`message_like_status_${messageId}`);
  return status ? JSON.parse(status) : { liked: false, disliked: false };
}

function saveMessageLikeStatus(messageId, status) {
  localStorage.setItem(`message_like_status_${messageId}`, JSON.stringify(status));
}
// --- AKHIR FUNGSI BARU UNTUK LIKE/UNLIKE ---

// MODIFIKASI: appendMessage dirombak untuk menampilkan file tag, grid gambar, dan URL
function appendMessage(sender, text, username, profileUrl, files = [], isHistory = false) {
  const container = document.createElement("div");
  // Generate a unique ID for each message for like/dislike tracking
  const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  container.className = `message-container ${sender} message-fade-in`;
  container.setAttribute("data-message-id", messageId); // Add unique ID to container

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

  // Adjust padding to make space for buttons at the bottom
  if (sender === "bot") {
    messageEl.style.paddingBottom = "36px"; // Increased padding for 4 buttons
  } else {
    messageEl.style.paddingBottom = text || (files && files.length > 0) ? "8px" : "0px";
  }

  const filesContainer = document.createElement("div");
  filesContainer.className = "message-files-container";
  if (files && files.length > 0) {
    messageEl.appendChild(filesContainer);
  }

  const imageFiles = files ? files.filter((f) => f.type && f.type.startsWith("image/")) : [];
  const docFiles = files ? files.filter((f) => f.type && !f.type.startsWith("image/") && f.type !== "video/youtube" && !f.isUrl) : [];
  const urlFiles = files ? files.filter((f) => f.isUrl) : [];

  // Tampilkan tag dokumen (PDF, DOCX) dan URL
  if (docFiles.length > 0 || urlFiles.length > 0) {
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

    urlFiles.forEach((file) => {
      if (file.type && file.type.startsWith("image/")) {
        return; // Gambar dari URL ditangani di imageGrid
      }
      const urlTag = document.createElement("div");
      urlTag.className = "message-doc-tag url-tag";
      const icon = document.createElement("span");
      icon.className = "material-icons";
      let tagName = file.name || file.originalUrl;
      if (tagName.length > 20) tagName = tagName.substring(0, 17) + "...";

      if (file.type === "application/pdf") {
        icon.textContent = "picture_as_pdf";
      } else if (file.type === "video/youtube") {
        icon.textContent = "ondemand_video";
        urlTag.style.backgroundColor = "#FF0000";
        tagName = "YouTube Video";
      } else if (file.type === "text/html") {
        icon.textContent = "link";
        urlTag.style.backgroundColor = "#0288D1";
        tagName = "Web Page";
      } else {
        icon.textContent = "cloud";
      }
      urlTag.appendChild(icon);
      const fileNameSpan = document.createElement("span");
      fileNameSpan.textContent = tagName;
      urlTag.appendChild(fileNameSpan);

      if (file.originalUrl) {
        urlTag.onclick = () => window.open(file.originalUrl, "_blank");
        urlTag.style.cursor = "pointer";
        urlTag.title = file.originalUrl;
      }

      docGrid.appendChild(urlTag);
    });
    filesContainer.appendChild(docGrid);
  }

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

  const textContentDiv = document.createElement("div");
  if (text) {
    messageEl.appendChild(textContentDiv);
  }

  const isNewBotMessage = sender === "bot" && !isHistory;

  if (isNewBotMessage) {
    typeText(textContentDiv, text).then(() => {
      if (text) {
        // Tombol Copy
        const copyAllBtn = document.createElement("button");
        const copyIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" viewBox="0 0 24 24"><path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
        const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#4ade80" viewBox="0 0 24 24"><path d="M9 16.17l-3.88-3.88-1.41 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
        copyAllBtn.innerHTML = copyIcon;
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
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        });
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

        // --- Penambahan Tombol Suara Teks ---
        const speakBtn = document.createElement("button");
        const speakIcon = `<img src="images/speaker.png" alt="Like" width="20" height="20" />`;
        const stopSpeakIcon = `<img src="images/aksispeaker.png" alt="Like" width="20" height="20" />`; 

        speakBtn.innerHTML = speakIcon;
        Object.assign(speakBtn.style, {
          position: "absolute",
          bottom: "4px",
          left: "28px",
          marginTop: "4px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#fff",
          padding: "0",
          userSelect: "none",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        });

        speakBtn.onmouseenter = () => {
          speakBtn.style.opacity = "1";
        };
        speakBtn.onmouseleave = () => {
          speakBtn.style.opacity = "0.7";
        };

        speakBtn.onclick = () => {
          if ("speechSynthesis" in window) {
            if (window.speechSynthesis.speaking) {
              window.speechSynthesis.cancel();
              speakBtn.innerHTML = speakIcon;
              showToast("Ucapan dihentikan.");
            } else {
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.lang = "id-ID";
              window.speechSynthesis.speak(utterance);
              speakBtn.innerHTML = stopSpeakIcon;
              showToast("Mulai berbicara...");

              utterance.onend = () => {
                speakBtn.innerHTML = speakIcon;
              };
              utterance.onerror = (event) => {
                console.error("SpeechSynthesisUtterance.onerror", event);
                speakBtn.innerHTML = speakIcon;
                showToast("Terjadi kesalahan saat berbicara.");
              };
            }
          } else {
            showToast("Web Speech API tidak didukung di browser ini.");
          }
        };
        messageEl.appendChild(speakBtn);
        // --- Akhir Penambahan Tombol Suara Teks ---

        // --- Penambahan Tombol Bagikan ---
        const shareBtn = document.createElement("button");
        const shareIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#fff" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.52.48 1.2.77 1.96.77 1.38 0 2.5-1.12 2.5-2.5S19.38 3 18 3s-2.5 1.12-2.5 2.5c0 .24.04.47.09.7L8.04 9.8c-.52-.48-1.2-.77-1.96-.77-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5c.76 0 1.44-.3 1.96-.77l7.05 4.11c-.05.23-.09.46-.09.7 0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z"/></svg>`;
        shareBtn.innerHTML = shareIcon;
        Object.assign(shareBtn.style, {
          position: "absolute",
          bottom: "4px",
          left: "56px",
          marginTop: "4px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#fff",
          padding: "0",
          userSelect: "none",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        });
        shareBtn.onmouseenter = () => {
          shareBtn.style.opacity = "1";
        };
        shareBtn.onmouseleave = () => {
          shareBtn.style.opacity = "0.7";
        };

        shareBtn.onclick = async () => {
          const shareText = `${text}\n\nAnda bisa dapatkan chat lain di AI Digging dengan website resmi kami ${OFFICIAL_WEBSITE_URL}`;
          if (navigator.share) {
            try {
              await navigator.share({
                title: "AI Digging Chat",
                text: shareText,
                url: OFFICIAL_WEBSITE_URL,
              });
              showToast("Pesan berhasil dibagikan!");
            } catch (error) {
              console.error("Error sharing:", error);
              showToast("Gagal membagikan pesan.");
            }
          } else {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard
              .writeText(shareText)
              .then(() => {
                showToast("Pesan disalin ke papan klip untuk dibagikan.");
              })
              .catch((err) => {
                console.error("Could not copy text: ", err);
                showToast("Gagal menyalin pesan.");
              });
          }
        };
        messageEl.appendChild(shareBtn);
        // --- Akhir Penambahan Tombol Bagikan ---

        // --- Penambahan Tombol Suka/Tidak Suka ---
        const likeBtn = document.createElement("button");
        const unlikeBtn = document.createElement("button");

        const thumbUpIcon = `<img src="images/like.png" alt="Like" width="20" height="20" />`;
        const thumbUpFilledIcon = `<img src="images/aksilike.png" alt="Liked" width="20" height="20" />`; // Perlu file ini
        const thumbDownIcon = `<img src="images/unlike.png" alt="Unlike" width="20" height="20" />`;
        const thumbDownFilledIcon = `<img src="images/aksiunlike.png" alt="Unliked" width="20" height="20" />`; // Perlu file ini

        Object.assign(likeBtn.style, {
          position: "absolute",
          bottom: "4px",
          left: "84px",
          marginTop: "4px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "0",
          userSelect: "none",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        });
        Object.assign(unlikeBtn.style, {
          position: "absolute",
          bottom: "4px",
          left: "112px",
          marginTop: "4px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "0",
          userSelect: "none",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        });

        // Load initial state
        const messageStatus = getMessageLikeStatus(messageId);
        if (messageStatus.liked) {
          likeBtn.innerHTML = thumbUpFilledIcon;
        } else {
          likeBtn.innerHTML = thumbUpIcon;
        }
        if (messageStatus.disliked) {
          unlikeBtn.innerHTML = thumbDownFilledIcon;
        } else {
          unlikeBtn.innerHTML = thumbDownIcon;
        }

        likeBtn.onclick = () => {
          const currentStatus = getMessageLikeStatus(messageId);
          if (currentStatus.liked) {
            // Unlike
            saveMessageLikeStatus(messageId, { liked: false, disliked: false });
            likeBtn.innerHTML = thumbUpIcon;
            showToast("Suka dibatalkan.");
          } else {
            // Like
            saveMessageLikeStatus(messageId, { liked: true, disliked: false });
            likeBtn.innerHTML = thumbUpFilledIcon;
            unlikeBtn.innerHTML = thumbDownIcon; // Ensure unlike is off
            showToast("Anda menyukai pesan ini!");
          }
        };

        unlikeBtn.onclick = () => {
          const currentStatus = getMessageLikeStatus(messageId);
          if (currentStatus.disliked) {
            // Un-dislike
            saveMessageLikeStatus(messageId, { liked: false, disliked: false });
            unlikeBtn.innerHTML = thumbDownIcon;
            showToast("Tidak suka dibatalkan.");
          } else {
            // Dislike
            saveMessageLikeStatus(messageId, { liked: false, disliked: true });
            unlikeBtn.innerHTML = thumbDownFilledIcon;
            likeBtn.innerHTML = thumbUpIcon; // Ensure like is off
            showToast("Anda tidak menyukai pesan ini.");
          }
        };

        messageEl.appendChild(likeBtn);
        messageEl.appendChild(unlikeBtn);
        // --- Akhir Penambahan Tombol Suka/Tidak Suka ---
      }
      if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight;
      chatInput.disabled = false;
      checkChatEmpty();
    });
  } else {
    // Logika untuk pesan yang sudah ada (dari history)
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

      if (sender === "bot") {
        const copyAllBtn = document.createElement("button");
        const copyAllIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" viewBox="0 0 24 24"><path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
        const checkAllIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#4ade80" viewBox="0 0 24 24"><path d="M9 16.17l-3.88-3.88-1.41 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
        copyAllBtn.innerHTML = copyAllIcon;
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
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        });
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

        // --- Penambahan Tombol Suara Teks untuk pesan yang sudah ada ---
        const speakBtn = document.createElement("button");
        const speakIcon = `<img src="images/speaker.png" alt="Like" width="20" height="20" />`;
        const stopSpeakIcon = `<img src="images/aksispeaker.png" alt="Like" width="20" height="20" />`; // Icon stop (merah)

        speakBtn.innerHTML = speakIcon;
        Object.assign(speakBtn.style, {
          position: "absolute",
          bottom: "4px",
          left: "28px",
          marginTop: "4px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#fff",
          padding: "0",
          userSelect: "none",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        });

        speakBtn.onmouseenter = () => {
          speakBtn.style.opacity = "1";
        };
        speakBtn.onmouseleave = () => {
          speakBtn.style.opacity = "0.7";
        };

        speakBtn.onclick = () => {
          if ("speechSynthesis" in window) {
            if (window.speechSynthesis.speaking) {
              window.speechSynthesis.cancel();
              speakBtn.innerHTML = speakIcon;
              showToast("Ucapan dihentikan.");
            } else {
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.lang = "id-ID";
              window.speechSynthesis.speak(utterance);
              speakBtn.innerHTML = stopSpeakIcon;
              showToast("Mulai berbicara...");

              utterance.onend = () => {
                speakBtn.innerHTML = speakIcon;
              };
              utterance.onerror = (event) => {
                console.error("SpeechSynthesisUtterance.onerror", event);
                speakBtn.innerHTML = speakIcon;
                showToast("Terjadi kesalahan saat berbicara.");
              };
            }
          } else {
            showToast("Web Speech API tidak didukung di browser ini.");
          }
        };
        messageEl.appendChild(speakBtn);
        // --- Akhir Penambahan Tombol Suara Teks ---

        // --- Penambahan Tombol Bagikan (untuk history) ---
        const shareBtn = document.createElement("button");
        const shareIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#fff" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.52.48 1.2.77 1.96.77 1.38 0 2.5-1.12 2.5-2.5S19.38 3 18 3s-2.5 1.12-2.5 2.5c0 .24.04.47.09.7L8.04 9.8c-.52-.48-1.2-.77-1.96-.77-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5c.76 0 1.44-.3 1.96-.77l7.05 4.11c-.05.23-.09.46-.09.7 0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z"/></svg>`;
        shareBtn.innerHTML = shareIcon;
        Object.assign(shareBtn.style, {
          position: "absolute",
          bottom: "4px",
          left: "56px",
          marginTop: "4px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#fff",
          padding: "0",
          userSelect: "none",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        });
        shareBtn.onmouseenter = () => {
          shareBtn.style.opacity = "1";
        };
        shareBtn.onmouseleave = () => {
          shareBtn.style.opacity = "0.7";
        };

        shareBtn.onclick = async () => {
          const shareText = `${text}\n\nAnda bisa dapatkan chat lain di AI Digging dengan website resmi kami ${OFFICIAL_WEBSITE_URL}`;
          if (navigator.share) {
            try {
              await navigator.share({
                title: "AI Digging Chat",
                text: shareText,
                url: OFFICIAL_WEBSITE_URL,
              });
              showToast("Pesan berhasil dibagikan!");
            } catch (error) {
              console.error("Error sharing:", error);
              showToast("Gagal membagikan pesan.");
            }
          } else {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard
              .writeText(shareText)
              .then(() => {
                showToast("Pesan disalin ke papan klip untuk dibagikan.");
              })
              .catch((err) => {
                console.error("Could not copy text: ", err);
                showToast("Gagal menyalin pesan.");
              });
          }
        };
        messageEl.appendChild(shareBtn);
        // --- Akhir Penambahan Tombol Bagikan ---

        // --- Penambahan Tombol Suka/Tidak Suka (untuk history) ---
        const likeBtn = document.createElement("button");
        const unlikeBtn = document.createElement("button");
        const thumbUpIcon = `<img src="images/like.png" alt="Like" width="20" height="20" />`;
        const thumbUpFilledIcon = `<img src="images/aksilike.png" alt="Liked" width="20" height="20" />`; // Perlu file ini
        const thumbDownIcon = `<img src="images/unlike.png" alt="Unlike" width="20" height="20" />`;
        const thumbDownFilledIcon = `<img src="images/aksiunlike.png" alt="Unliked" width="20" height="20" />`; // Perlu file ini

        Object.assign(likeBtn.style, {
          position: "absolute",
          bottom: "4px",
          left: "84px",
          marginTop: "4px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "0",
          userSelect: "none",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        });
        Object.assign(unlikeBtn.style, {
          position: "absolute",
          bottom: "4px",
          left: "112px",
          marginTop: "4px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "0",
          userSelect: "none",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        });

        // Load initial state for history messages
        const historyMessageId = container.getAttribute("data-message-id");
        const messageStatus = getMessageLikeStatus(historyMessageId);
        if (messageStatus.liked) {
          likeBtn.innerHTML = thumbUpFilledIcon;
        } else {
          likeBtn.innerHTML = thumbUpIcon;
        }
        if (messageStatus.disliked) {
          unlikeBtn.innerHTML = thumbDownFilledIcon;
        } else {
          unlikeBtn.innerHTML = thumbDownIcon;
        }

        likeBtn.onclick = () => {
          const currentStatus = getMessageLikeStatus(historyMessageId);
          if (currentStatus.liked) {
            saveMessageLikeStatus(historyMessageId, { liked: false, disliked: false });
            likeBtn.innerHTML = thumbUpIcon;
            showToast("Suka dibatalkan.");
          } else {
            saveMessageLikeStatus(historyMessageId, { liked: true, disliked: false });
            likeBtn.innerHTML = thumbUpFilledIcon;
            unlikeBtn.innerHTML = thumbDownIcon;
            showToast("Anda menyukai pesan ini!");
          }
        };

        unlikeBtn.onclick = () => {
          const currentStatus = getMessageLikeStatus(historyMessageId);
          if (currentStatus.disliked) {
            saveMessageLikeStatus(historyMessageId, { liked: false, disliked: false });
            unlikeBtn.innerHTML = thumbDownIcon;
            showToast("Tidak suka dibatalkan.");
          } else {
            saveMessageLikeStatus(historyMessageId, { liked: false, disliked: true });
            unlikeBtn.innerHTML = thumbDownFilledIcon;
            likeBtn.innerHTML = thumbUpIcon;
            showToast("Anda tidak menyukai pesan ini.");
          }
        };

        messageEl.appendChild(likeBtn);
        messageEl.appendChild(unlikeBtn);
        // --- Akhir Penambahan Tombol Suka/Tidak Suka ---
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

function highlightCode(code) {
  return code.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
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
        borderRadius: "8px",
        margin: "8px 0",
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
  return text.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, '"').replace(/'/g, "'");
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

    toolbar.appendChild(label);
    toolbar.appendChild(copyBtn);
    wrapper.insertBefore(toolbar, pre);
  });
}

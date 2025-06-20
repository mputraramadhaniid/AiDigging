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
const PROXY_SERVER_URL = "https://ai-digging.vercel.app/";

const OFFICIAL_WEBSITE_URL = "https://ai-digging.vercel.app/"; // Ganti dengan URL website resmi Anda

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
function appendMessage(sender, text, username, profileUrl, files = [], isHistory = false, messageIdentifier = null) {
  const container = document.createElement("div");
  // Gunakan messageIdentifier jika ada (untuk history), jika tidak, buat yang baru
  // CATATAN PENTING: Untuk persistensi like/unlike yang benar saat memuat history,
  // Anda harus menyimpan 'messageId' ini sebagai properti dalam objek pesan yang disimpan di localStorage.
  // Saat ini, setiap kali history dimuat, ID baru dibuat, yang akan mereset status like/unlike.
  const messageId = messageIdentifier || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

  // --- LOGIKA UTAMA RENDERING KONTEN (MIRIP DENGAN typeText) ---
  const rawText = text; // Gunakan 'text' yang masuk ke appendMessage
  const segments = [];

  // Regex yang sama untuk menangkap blok kode dan tabel Markdown
  const blockRegex = /(```[\s\S]*?```)|(^\|.+\|\s*\r?\n^\|[-:\| ]+\|\s*\r?\n(?:^\|.*\|\s*\r?\n)*)/gm;

  let lastIndex = 0;
  let match;

  // Tahap 1: Ekstrak semua blok kode dan tabel dari teks penuh (sama seperti di typeText)
  while ((match = blockRegex.exec(rawText)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: rawText.substring(lastIndex, match.index) });
    }

    if (match[1]) {
      // Ini adalah blok kode
      const codeMatch = match[1];
      const filenameMatch = codeMatch.match(/```(.*?)\n/);
      const filename = filenameMatch ? filenameMatch[1].trim() : "code";
      const codeContent = codeMatch
        .replace(/```(.*?)\n/, "")
        .replace(/```$/, "")
        .trim();
      segments.push({ type: "code", filename: filename, code: codeContent });
    } else if (match[2]) {
      // Ini adalah blok tabel
      segments.push({ type: "table", content: match[2] });
    }
    lastIndex = blockRegex.lastIndex;
  }

  if (lastIndex < rawText.length) {
    segments.push({ type: "text", content: rawText.substring(lastIndex) });
  }

  // Tahap 2: Render setiap segmen (tanpa animasi untuk history)
  for (const segment of segments) {
    if (segment.type === "text") {
      // Untuk teks biasa, langsung parse Markdown dan tambahkan
      const parsedHtml = parseMarkdown(segment.content);
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = parsedHtml;
      while (tempDiv.firstChild) {
        textContentDiv.appendChild(tempDiv.firstChild);
      }
    } else if (segment.type === "code") {
      // Untuk blok kode, render seluruh HTML-nya sekaligus
      const codeContent = escapeHtml(segment.content);
      const filename = escapeHtml(segment.filename);

      const codeHtml = `
                <div class="code-wrapper" style="background-color:#1e1e1e;font-family:'Source Code Pro',monospace;font-size:0.9em;color:#d4d4d4;position:relative;margin:8px 0;border-radius:8px;overflow:hidden;">
                    <div style="display:flex;align-items:center;padding:8px;border-bottom:1px solid #333;background-color:#252526;">
                        <span style="color:#ccc;font-weight:600;">${filename}</span>
                        <button style="background:transparent;border:none;cursor:pointer;color:#ccc;padding:0;user-select:none;height:24px;width:24px;display:flex;align-items:center;justify-content:center;margin-left:auto;" onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(
                          segment.content
                        )}')).then(() => showToast('Kode tersalin!'))">
                            <img src="images/copy.png" alt="Copy" width="16" height="16" />
                        </button>
                    </div>
                    <pre style="background-color:transparent;margin:0;padding-top:8px;overflow-x:auto;color:#d4d4d4;font-family:'Source Code Pro',monospace;font-size:0.9em;white-space:pre-wrap;word-wrap:break-word;"><code style="white-space:pre-wrap;word-wrap:break-word;">${codeContent}</code></pre>
                </div>
            `;
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = codeHtml;
      textContentDiv.appendChild(tempDiv.firstChild);
    } else if (segment.type === "table") {
      // Untuk blok tabel, render seluruh HTML-nya sekaligus
      const tableHtml = parseMarkdownTable(segment.content);
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = tableHtml;
      textContentDiv.appendChild(tempDiv.firstChild);
    }
  }
  // --- AKHIR LOGIKA UTAMA RENDERING KONTEN ---

  if (isNewBotMessage) {
    // Ini adalah blok untuk pesan bot BARU, yang akan dianimasikan oleh typeText
    // PENTING: Jika Anda sudah menggunakan `typeText` di sini, berarti ada sedikit redundansi.
    // Seharusnya `typeText` dipanggil di sini, dan `typeText` lah yang bertanggung jawab untuk
    // mengisi `textContentDiv` dengan animasi atau rendering langsung.
    // Saya akan mengasumsikan Anda ingin logika ini di `appendMessage` untuk history,
    // dan `typeText` tetap untuk animasi.
    // Jika `isNewBotMessage` TRUE, maka `typeText(textContentDiv, text)` akan mengisi konten,
    // sehingga logika di atas (segmentasi) akan terlewati atau tidak relevan.
    // Saya akan kembalikan ke kondisi sebelumnya untuk `isNewBotMessage` untuk menghindari konflik.

    // Bagian ini adalah kode lama Anda untuk pesan baru, yang memanggil typeText
    typeText(textContentDiv, text).then(() => {
      if (text) {
        // Tombol Copy (dengan ikon PNG)
        const copyAllBtn = document.createElement("button");
        const copyIcon = `<img src="images/copy.png" alt="Copy" width="16" height="16" />`;
        const checkIcon = `<img src="images/copied.png" alt="Copied" width="16" height="16" />`;
        copyAllBtn.innerHTML = copyIcon;
        Object.assign(copyAllBtn.style, {
          position: "absolute",
          bottom: "4px",
          left: "0px",
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

        // --- Penambahan Tombol Suara Teks (dengan ikon PNG) ---
        const speakBtn = document.createElement("button");
        const speakIcon = `<img src="images/speaker.png" alt="Speak" width="20" height="20" />`;
        const stopSpeakIcon = `<img src="images/aksispeaker.png" alt="Stop Speak" width="20" height="20" />`;

        speakBtn.innerHTML = speakIcon;
        Object.assign(speakBtn.style, {
          position: "absolute",
          bottom: "4px",
          left: "28px",
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
        const shareIcon = `<img src="images/share.png" alt="Share" width="20" height="20" />`;
        shareBtn.innerHTML = shareIcon;
        Object.assign(shareBtn.style, {
          position: "absolute",
          bottom: "4px",
          left: "56px",
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
        const thumbUpFilledIcon = `<img src="images/aksilike.png" alt="Liked" width="20" height="20" />`;
        const thumbDownIcon = `<img src="images/unlike.png" alt="Unlike" width="20" height="20" />`;
        const thumbDownFilledIcon = `<img src="images/aksiunlike.png" alt="Unliked" width="20" height="20" />`;

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
            saveMessageLikeStatus(messageId, { liked: false, disliked: false });
            likeBtn.innerHTML = thumbUpIcon;
            showToast("Suka dibatalkan.");
          } else {
            saveMessageLikeStatus(messageId, { liked: true, disliked: false });
            likeBtn.innerHTML = thumbUpFilledIcon;
            unlikeBtn.innerHTML = thumbDownIcon;
            showToast("Anda menyukai pesan ini!");
          }
        };

        unlikeBtn.onclick = () => {
          const currentStatus = getMessageLikeStatus(messageId);
          if (currentStatus.disliked) {
            saveMessageLikeStatus(messageId, { liked: false, disliked: false });
            unlikeBtn.innerHTML = thumbDownIcon;
            showToast("Tidak suka dibatalkan.");
          } else {
            saveMessageLikeStatus(messageId, { liked: false, disliked: true });
            unlikeBtn.innerHTML = thumbDownFilledIcon;
            likeBtn.innerHTML = thumbUpIcon;
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
    // Bagian ini yang sebelumnya kurang lengkap untuk tabel
    // Kini diselaraskan dengan logika segmentasi yang baru

    // --- LOGIKA UTAMA RENDERING KONTEN (MIRIP DENGAN typeText TAPI TANPA ANIMASI) ---
    const rawText = text; // Gunakan 'text' yang masuk ke appendMessage
    const segments = [];

    // Regex yang sama untuk menangkap blok kode dan tabel Markdown
    const blockRegex = /(```[\s\S]*?```)|(^\|.+\|\s*\r?\n^\|[-:\| ]+\|\s*\r?\n(?:^\|.*\|\s*\r?\n)*)/gm;

    let lastIndex = 0;
    let match;

    // Tahap 1: Ekstrak semua blok kode dan tabel dari teks penuh
    while ((match = blockRegex.exec(rawText)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: "text", content: rawText.substring(lastIndex, match.index) });
      }

      if (match[1]) {
        // Ini adalah blok kode
        const codeMatch = match[1];
        const filenameMatch = codeMatch.match(/```(.*?)\n/);
        const filename = filenameMatch ? filenameMatch[1].trim() : "code";
        const codeContent = codeMatch
          .replace(/```(.*?)\n/, "")
          .replace(/```$/, "")
          .trim();
        segments.push({ type: "code", filename: filename, code: codeContent });
      } else if (match[2]) {
        // Ini adalah blok tabel
        segments.push({ type: "table", content: match[2] });
      }
      lastIndex = blockRegex.lastIndex;
    }

    if (lastIndex < rawText.length) {
      segments.push({ type: "text", content: rawText.substring(lastIndex) });
    }

    // Tahap 2: Render setiap segmen (langsung, tanpa animasi)
    for (const segment of segments) {
      if (segment.type === "text") {
        const parsedHtml = parseMarkdown(segment.content); // Parse inline Markdown
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = parsedHtml;
        while (tempDiv.firstChild) {
          textContentDiv.appendChild(tempDiv.firstChild);
        }
      } else if (segment.type === "code") {
        const codeContent = escapeHtml(segment.content);
        const filename = escapeHtml(segment.filename);

        const codeHtml = `
                    <div class="code-wrapper" style="background-color:#1e1e1e;font-family:'Source Code Pro',monospace;font-size:0.9em;color:#d4d4d4;position:relative;margin:8px 0;border-radius:8px;overflow:hidden;">
                        <div style="display:flex;align-items:center;padding:8px;border-bottom:1px solid #333;background-color:#252526;">
                            <span style="color:#ccc;font-weight:600;">${filename}</span>
                            <button style="background:transparent;border:none;cursor:pointer;color:#ccc;padding:0;user-select:none;height:24px;width:24px;display:flex;align-items:center;justify-content:center;margin-left:auto;" onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(
                              segment.content
                            )}')).then(() => showToast('Kode tersalin!'))">
                                <img src="images/copy.png" alt="Copy" width="16" height="16" />
                            </button>
                        </div>
                        <pre style="background-color:transparent;margin:0;padding-top:8px;overflow-x:auto;color:#d4d4d4;font-family:'Source Code Pro',monospace;font-size:0.9em;white-space:pre-wrap;word-wrap:break-word;"><code style="white-space:pre-wrap;word-wrap:break-word;">${codeContent}</code></pre>
                    </div>
                `;
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = codeHtml;
        textContentDiv.appendChild(tempDiv.firstChild);
      } else if (segment.type === "table") {
        const tableHtml = parseMarkdownTable(segment.content); // Gunakan parseMarkdownTable
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = tableHtml;
        textContentDiv.appendChild(tempDiv.firstChild);
      }
    }
    // --- AKHIR LOGIKA UTAMA RENDERING KONTEN UNTUK HISTORY ---

    // Tombol-tombol di sini (sama seperti yang Anda berikan)
    // Ini perlu dipastikan berada di lingkup 'else' ini agar terpasang pada pesan history.
    if (sender === "bot") {
      const copyAllBtn = document.createElement("button");
      const copyIcon = `<img src="images/copy.png" alt="Copy" width="16" height="16" />`;
      const checkIcon = `<img src="images/copied.png" alt="Copied" width="16" height="16" />`;
      copyAllBtn.innerHTML = copyIcon;
      Object.assign(copyAllBtn.style, {
        position: "absolute",
        bottom: "4px",
        left: "0px",
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

      const speakBtn = document.createElement("button");
      const speakIcon = `<img src="images/speaker.png" alt="Speak" width="20" height="20" />`;
      const stopSpeakIcon = `<img src="images/aksispeaker.png" alt="Stop Speak" width="20" height="20" />`;

      speakBtn.innerHTML = speakIcon;
      Object.assign(speakBtn.style, {
        position: "absolute",
        bottom: "4px",
        left: "28px",
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

      const shareBtn = document.createElement("button");
      const shareIcon = `<img src="images/share.png" alt="Share" width="20" height="20" />`;
      shareBtn.innerHTML = shareIcon;
      Object.assign(shareBtn.style, {
        position: "absolute",
        bottom: "4px",
        left: "56px",
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

      const likeBtn = document.createElement("button");
      const unlikeBtn = document.createElement("button");
      const thumbUpIcon = `<img src="images/like.png" alt="Like" width="20" height="20" />`;
      const thumbUpFilledIcon = `<img src="images/aksilike.png" alt="Liked" width="20" height="20" />`;
      const thumbDownIcon = `<img src="images/unlike.png" alt="Unlike" width="20" height="20" />`;
      const thumbDownFilledIcon = `<img src="images/aksiunlike.png" alt="Unliked" width="20" height="20" />`;

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
          saveMessageLikeStatus(messageId, { liked: false, disliked: false });
          likeBtn.innerHTML = thumbUpIcon;
          showToast("Suka dibatalkan.");
        } else {
          saveMessageLikeStatus(messageId, { liked: true, disliked: false });
          likeBtn.innerHTML = thumbUpFilledIcon;
          unlikeBtn.innerHTML = thumbDownIcon;
          showToast("Anda menyukai pesan ini!");
        }
      };
      unlikeBtn.onclick = () => {
        const currentStatus = getMessageLikeStatus(messageId);
        if (currentStatus.disliked) {
          saveMessageLikeStatus(messageId, { liked: false, disliked: false });
          unlikeBtn.innerHTML = thumbDownIcon;
          showToast("Tidak suka dibatalkan.");
        } else {
          saveMessageLikeStatus(messageId, { liked: false, disliked: true });
          unlikeBtn.innerHTML = thumbDownFilledIcon;
          likeBtn.innerHTML = thumbUpIcon;
          showToast("Anda tidak menyukai pesan ini.");
        }
      };
      messageEl.appendChild(likeBtn);
      messageEl.appendChild(unlikeBtn);

      if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight;
      checkChatEmpty();
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
  element.innerHTML = ""; // Bersihkan konten awal

  let currentTextIndex = 0;
  const segments = []; // Akan menyimpan { type: 'text' | 'code' | 'table', content: '...' }

  // Regex untuk menangkap blok kode (```) dan blok tabel Markdown
  // Grup 1: Tangkapan penuh blok kode (```...```)
  // Grup 2: Tangkapan penuh blok tabel (|...|)
  const blockRegex = /(```[\s\S]*?```)|(^\|.+\|\s*\r?\n^\|[-:\| ]+\|\s*\r?\n(?:^\|.*\|\s*\r?\n)*)/gm;

  let lastIndex = 0;
  let match;

  // Tahap 1: Ekstrak semua blok kode dan tabel dari teks penuh
  // Loop ini akan mengidentifikasi semua blok kode atau tabel dalam `rawText`
  while ((match = blockRegex.exec(rawText)) !== null) {
    // Tambahkan teks biasa sebelum blok ini (jika ada)
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: rawText.substring(lastIndex, match.index) });
    }

    if (match[1]) {
      // Ini adalah blok kode (cocok dengan grup pertama dari blockRegex)
      const codeMatch = match[1];
      const filenameMatch = codeMatch.match(/```(.*?)\n/);
      const filename = filenameMatch ? filenameMatch[1].trim() : "code";
      const codeContent = codeMatch
        .replace(/```(.*?)\n/, "")
        .replace(/```$/, "")
        .trim();
      segments.push({ type: "code", filename: filename, code: codeContent });
    } else if (match[2]) {
      // Ini adalah blok tabel (cocok dengan grup kedua dari blockRegex)
      segments.push({ type: "table", content: match[2] });
    }
    lastIndex = blockRegex.lastIndex;
  }

  // Tambahkan sisa teks setelah blok terakhir
  if (lastIndex < rawText.length) {
    segments.push({ type: "text", content: rawText.substring(lastIndex) });
  }

  // Tahap 2: Animasikan atau tampilkan setiap segmen
  // Loop ini akan memproses setiap segmen yang sudah diidentifikasi
  for (const segment of segments) {
    if (segment.type === "text") {
      // Untuk teks biasa (non-blok), animasikan karakter per karakter.
      // Konten akan ditulis mentah terlebih dahulu, kemudian di-parse Markdown
      // setelah segmen selesai diketik. Ini akan membuat format inline
      // (bold, italic) muncul secara "tiba-tiba" setelah segmen teks selesai.

      const tempSpan = document.createElement("span");
      element.appendChild(tempSpan);
      for (const char of segment.content) {
        tempSpan.textContent += char; // Menggunakan textContent untuk mencegah penulisan HTML mentah
        if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight;
        await new Promise((r) => setTimeout(r, delay));
      }
      // Setelah semua karakter diketik untuk segmen ini, parse dan ganti kontennya.
      tempSpan.outerHTML = parseMarkdown(segment.content); // Ganti span dengan HTML yang sudah diparse
    } else if (segment.type === "code") {
      // Untuk blok kode, render seluruh HTML-nya sekaligus tanpa animasi karakter
      const codeContent = escapeHtml(segment.content); // Pastikan escapeHtml di sini
      const filename = escapeHtml(segment.filename); // Pastikan escapeHtml di sini

      const codeHtml = `
                <div class="code-wrapper" style="background-color:#1e1e1e;font-family:'Source Code Pro',monospace;font-size:0.9em;color:#d4d4d4;position:relative;margin:8px 0;border-radius:8px;overflow:hidden;">
                    <div style="display:flex;align-items:center;padding:8px;border-bottom:1px solid #333;background-color:#252526;">
                        <span style="color:#ccc;font-weight:600;"><span class="math-inline">\{filename\}</span\>
<button style\="background\:transparent;border\:none;cursor\:pointer;color\:\#ccc;padding\:0;user\-select\:none;height\:24px;width\:24px;display\:flex;align\-items\:center;justify\-content\:center;margin\-left\:auto;" onclick\="navigator\.clipboard\.writeText\(decodeURIComponent\('</span>{encodeURIComponent(segment.content)}')).then(() => showToast('Kode tersalin!'))">
                            <img src="images/copy.png" alt="Copy" width="16" height="16" />
                        </button>
                    </div>
                    <pre style="background-color:transparent;margin:0;padding-top:8px;overflow-x:auto;color:#d4d4d4;font-family:'Source Code Pro',monospace;font-size:0.9em;white-space:pre-wrap;word-wrap:break-word;"><code style="white-space:pre-wrap;word-wrap:break-word;">${codeContent}</code></pre>
                </div>
            `;
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = codeHtml;
      element.appendChild(tempDiv.firstChild);
      if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight;
    } else if (segment.type === "table") {
      // Untuk blok tabel, render seluruh HTML-nya sekaligus tanpa animasi karakter
      const tableHtml = parseMarkdownTable(segment.content); // Memanggil fungsi khusus untuk tabel
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = tableHtml;
      element.appendChild(tempDiv.firstChild); // Tambahkan elemen tabel HTML
      if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight;
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

  // Escape HTML karakter sekali di awal untuk mencegah injeksi
  let html = escapeHtml(text);

  // 1. Tangani format teks inline (bold, italic, inline code) dan header
  // Header
  html = html.replace(/### (.*?)(\n|$)/g, '<strong style="font-size:18px;display:block;">$1</strong>\n');
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");
  // Italic
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");
  // Inline Code
  html = html.replace(/`([^`]+)`/g, (m, inlineCode) => `<code class="md-inline-code" style="background-color:#333;color:#66d9ef;padding:2px 4px;border-radius:4px;">${escapeHtml(inlineCode)}</code>`);
  // Horizontal rule
  html = html.replace(/---/g, '<hr style="border: 1px solid #ccc;"/>');
  // Newlines to <br> (harus terakhir untuk formatting inline)
  html = html.replace(/\n/g, "<br>");

  return html;
}
// --- AKHIR FUNGSI parseMarkdown yang fokus pada Inline Markdown ---

// --- FUNGSI BARU: parseMarkdownTable (khusus untuk konversi tabel) ---
function parseMarkdownTable(tableMarkdownText) {
  if (!tableMarkdownText) return "";

  const lines = tableMarkdownText
    .trim()
    .split("\n")
    .filter((line) => line.trim() !== ""); // Filter out empty lines

  if (lines.length < 2) return escapeHtml(tableMarkdownText); // Not a valid table (minimal header + separator)

  const headerLine = lines[0];
  const separatorLine = lines[1];
  const dataLines = lines.slice(2);

  // Parse header
  const headers = headerLine
    .split("|")
    .map((h) => h.trim())
    .filter((h) => h !== "");

  // Determine column alignment from separator line
  const alignments = separatorLine
    .split("|")
    .map((s) => {
      s = s.trim();
      if (s.startsWith(":") && s.endsWith(":")) return "center"; // :--:
      if (s.endsWith(":")) return "right"; // ---:
      if (s.startsWith(":")) return "left"; // :---
      return "left"; // default ---
    })
    .filter((s) => s !== ""); // Filter out empty strings from initial split

  let tableHtml = '<div style="overflow-x:auto; max-width: 100%;"><table style="width:100%;border-collapse:collapse;margin:10px 0;table-layout:fixed;"><thead><tr style="background-color:#3a3a3a;">';
  headers.forEach((header, i) => {
    const textAlign = alignments[i] || "left";
    // HTML escape header content directly
    tableHtml += `<th style="padding:8px;border:1px solid #555;text-align:${textAlign};color:#fff;box-sizing:border-box; word-break: break-word; overflow-wrap: break-word;">${escapeHtml(header)}</th>`;
  });
  tableHtml += "</tr></thead><tbody>";

  // Parse data rows
  dataLines.forEach((line) => {
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c !== "");
    if (cells.length === headers.length) {
      // Pastikan jumlah sel sesuai dengan jumlah header
      tableHtml += '<tr style="background-color:#2a2a2a;">';
      cells.forEach((cell, i) => {
        const textAlign = alignments[i] || "left";
        // HTML escape cell content directly
        tableHtml += `<td style="padding:8px;border:1px solid #555;color:#ddd;text-align:${textAlign};box-sizing:border-box; word-break: break-word; overflow-wrap: break-word;">${escapeHtml(cell)}</td>`;
      });
      tableHtml += "</tr>";
    }
  });

  tableHtml += "</tbody></table></div>";
  return tableHtml;
}
// --- AKHIR FUNGSI parseMarkdown BARU UNTUK TABEL YANG LEBIH BAIK ---

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

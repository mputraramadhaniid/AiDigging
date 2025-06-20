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

/**
 * FUNGSI BANTUAN BARU
 * Membuat dan menambahkan semua tombol aksi (Copy, Speak, Share, Like, Unlike)
 * ke elemen pesan bot.
 * @param {HTMLElement} messageEl - Elemen <div> pesan tempat tombol akan ditambahkan.
 * @param {string} text - Teks dari pesan untuk di-copy, dibicarakan, atau dibagikan.
 * @param {string} messageId - ID unik dari pesan untuk status Suka/Tidak Suka.
 */
function addBotActionButtons(messageEl, text, messageId) {
  if (!text) return; // Jangan tambahkan tombol jika pesan bot tidak memiliki teks

  // Definisikan semua ikon yang akan digunakan
  const icons = {
    copy: `<img src="images/copy.png" alt="Copy" width="16" height="16" />`,
    copied: `<img src="images/copy.png" alt="Copied" width="16" height="16" />`,
    speak: `<img src="images/speaker.png" alt="Speak" width="20" height="20" />`,
    speaking: `<img src="images/aksispeaker.png" alt="Speaking" width="20" height="20" />`,
    share: `<img src="images/share.png" alt="Share" width="20" height="20" />`,
    like: `<img src="images/like.png" alt="Like" width="20" height="20" />`,
    liked: `<img src="images/aksilike.png" alt="Liked" width="20" height="20" />`,
    unlike: `<img src="images/unlike.png" alt="Unlike" width="20" height="20" />`,
    unliked: `<img src="images/aksiunlike.png" alt="Unliked" width="20" height="20" />`,
  };

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "message-actions";
  Object.assign(buttonContainer.style, { position: "absolute", bottom: "4px", left: "0px", display: "flex", alignItems: "center", gap: "4px" });

  // --- Tombol Copy ---
  const copyBtn = document.createElement("button");
  copyBtn.title = "Salin Teks";
  copyBtn.innerHTML = icons.copy;
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.innerHTML = icons.copied;
      setTimeout(() => {
        copyBtn.innerHTML = icons.copy;
      }, 2000);
      showToast("Tersalin ke papan klip");
    });
  };
  buttonContainer.appendChild(copyBtn);

  // --- Tombol Speak ---
  const speakBtn = document.createElement("button");
  speakBtn.title = "Dengarkan";
  speakBtn.innerHTML = icons.speak;
  speakBtn.onclick = () => {
    if (!("speechSynthesis" in window)) {
      showToast("Fitur suara tidak didukung browser ini.");
      return;
    }
    // Jika sedang berbicara dan ini teks yang sama, hentikan.
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.onstart = () => (speakBtn.innerHTML = icons.speaking);
    utterance.onend = () => (speakBtn.innerHTML = icons.speak);
    utterance.onerror = () => {
      speakBtn.innerHTML = icons.speak;
      showToast("Gagal membacakan teks.");
    };
    window.speechSynthesis.speak(utterance);
  };
  buttonContainer.appendChild(speakBtn);

  // --- Tombol Share ---
  const shareBtn = document.createElement("button");
  shareBtn.title = "Bagikan";
  shareBtn.innerHTML = icons.share;
  shareBtn.onclick = async () => {
    const shareText = `${text}\n\nDibagikan dari AI Digging. Kunjungi kami di ${OFFICIAL_WEBSITE_URL}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Chat dari AI Digging", text: text, url: OFFICIAL_WEBSITE_URL });
      } catch (error) {
        if (error.name !== "AbortError") console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(shareText).then(() => showToast("Teks & link disalin untuk dibagikan."));
    }
  };
  buttonContainer.appendChild(shareBtn);

  // --- Tombol Like ---
  const likeBtn = document.createElement("button");
  likeBtn.title = "Suka";
  const messageStatus = getMessageLikeStatus(messageId);
  likeBtn.innerHTML = messageStatus.liked ? icons.liked : icons.like;
  likeBtn.onclick = () => {
    const currentStatus = getMessageLikeStatus(messageId);
    const isLiked = !currentStatus.liked;
    saveMessageLikeStatus(messageId, { liked: isLiked, disliked: false });
    likeBtn.innerHTML = isLiked ? icons.liked : icons.like;
    unlikeBtn.innerHTML = icons.unlike; // Selalu reset tombol unlike
  };
  buttonContainer.appendChild(likeBtn);

  // --- Tombol Unlike ---
  const unlikeBtn = document.createElement("button");
  unlikeBtn.title = "Tidak Suka";
  unlikeBtn.innerHTML = messageStatus.disliked ? icons.unliked : icons.unlike;
  unlikeBtn.onclick = () => {
    const currentStatus = getMessageLikeStatus(messageId);
    const isDisliked = !currentStatus.disliked;
    saveMessageLikeStatus(messageId, { liked: false, disliked: isDisliked });
    unlikeBtn.innerHTML = isDisliked ? icons.unliked : icons.unlike;
    likeBtn.innerHTML = icons.like; // Selalu reset tombol like
  };
  buttonContainer.appendChild(unlikeBtn);

  // Styling umum untuk semua tombol di dalam container
  buttonContainer.querySelectorAll("button").forEach((btn) => {
    Object.assign(btn.style, { background: "transparent", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center", opacity: "0.7" });
    btn.onmouseenter = () => (btn.style.opacity = "1");
    btn.onmouseleave = () => (btn.style.opacity = "0.7");
  });

  messageEl.appendChild(buttonContainer);
}

// =================================================================================
// FUNGSI UTAMA APPENDMESSAGE (FINAL)
// =================================================================================
function appendMessage(sender, text, username, profileUrl, files = [], isHistory = false) {
  const container = document.createElement("div");
  // Pesan dari riwayat harus memiliki ID yang sama saat dimuat ulang
  // Jadi, Anda perlu menyimpan `messageId` di localStorage bersama pesan lainnya.
  const messageId = `msg-${username}-${Date.now()}`;
  container.className = `message-container ${sender} message-fade-in`;
  container.setAttribute("data-message-id", messageId);

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
  messageEl.className = `message ${sender === "bot" ? "bot-message" : "user-message"}`;
  messageEl.style.position = "relative";

  if (sender === "bot" && text) {
    messageEl.style.paddingBottom = "36px";
  } else {
    messageEl.style.paddingBottom = text || (files && files.length > 0) ? "8px" : "0px";
  }

  // --- Logika untuk menampilkan file (tidak diubah) ---
  if (files && files.length > 0) {
    const filesContainer = document.createElement("div");
    filesContainer.className = "message-files-container";
    // ... (kode Anda untuk menampilkan imageGrid dan docGrid diletakkan di sini) ...
    messageEl.appendChild(filesContainer);
  }

  const textContentDiv = document.createElement("div");
  if (text) {
    messageEl.appendChild(textContentDiv);
  }

  // --- LOGIKA UTAMA YANG TELAH DIPERBAIKI ---
  if (sender === "user") {
    // Jalur untuk pesan pengguna: sederhana dan aman
    textContentDiv.innerHTML = escapeHtml(text).replace(/\n/g, "<br>");
  } else {
    // sender === 'bot'
    if (!isHistory) {
      // Pesan bot BARU: animasikan teks, LALU panggil fungsi bantuan untuk menambahkan tombol
      typeText(textContentDiv, text, 10, () => {
        addBotActionButtons(messageEl, text, messageId);
      });
    } else {
      // Pesan bot DARI HISTORY: render Markdown (termasuk tabel/kode) secara langsung
      const rawText = text || "";
      const segments = [];
      const blockRegex = /(```[\s\S]*?```)|(^\|.+\|\s*\r?\n^\|[ |:\-]*-[ |:\-]*\|\s*\r?\n(?:^\|.*\|\s*\r?\n?)*)/gm;
      let lastIndex = 0;
      let match;
      // Parse teks menjadi segmen-segmen
      while ((match = blockRegex.exec(rawText)) !== null) {
        if (match.index > lastIndex) {
          segments.push({ type: "text", content: rawText.substring(lastIndex, match.index) });
        }
        if (match[1]) {
          const codeBlock = match[1];
          const filenameMatch = codeBlock.match(/```(.*?)\n/);
          segments.push({
            type: "code",
            filename: filenameMatch ? filenameMatch[1].trim() : "code",
            code: codeBlock
              .replace(/```(.*?)\n/, "")
              .replace(/```$/, "")
              .trim(),
          });
        } else if (match[2]) {
          segments.push({ type: "table", content: match[2] });
        }
        lastIndex = blockRegex.lastIndex;
      }
      if (lastIndex < rawText.length) {
        segments.push({ type: "text", content: rawText.substring(lastIndex) });
      }

      // Render setiap segmen
      for (const segment of segments) {
        if (segment.type === "text") {
          textContentDiv.insertAdjacentHTML("beforeend", parseMarkdown(segment.content));
        } else if (segment.type === "table") {
          textContentDiv.insertAdjacentHTML("beforeend", parseMarkdownTable(segment.content));
        } else if (segment.type === "code") {
          const codeHtml = `<div class="code-wrapper" style="background-color:#1e1e1e; ... ">...</div>`; // Placeholder untuk HTML blok kode Anda
          textContentDiv.insertAdjacentHTML("beforeend", codeHtml);
        }
      }

      // Setelah semua konten dirender, panggil fungsi bantuan untuk menambahkan tombol
      addBotActionButtons(messageEl, text, messageId);
    }
  }

  content.appendChild(messageEl);
  container.appendChild(content);
  chatBox.appendChild(container);

  if (autoScrollEnabled) {
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  checkChatEmpty();
}

function highlightCode(code) {
  return code.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
}

async function typeText(element, rawText, delay = 10, onFinish = () => {}) {
  element.innerHTML = ""; // Bersihkan elemen target

  const parts = [];
  // 1. MENGGUNAKAN REGEX YANG KUAT: Bisa mendeteksi KODE (grup 1) dan TABEL (grup 2)
  const blockRegex = /(```[\s\S]*?```)|(^\|.+\|\s*\r?\n^\|[ |:\-]*-[ |:\-]*\|\s*\r?\n(?:^\|.*\|\s*\r?\n?)*)/gm;

  let lastIndex = 0;
  let match;

  // 2. PROSES PARSING BARU: Loop yang bisa membedakan kode dan tabel
  while ((match = blockRegex.exec(rawText)) !== null) {
    // Ambil teks biasa sebelum blok
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: rawText.slice(lastIndex, match.index) });
    }

    if (match[1]) {
      // Jika grup 1 cocok -> ini adalah BLOK KODE
      const codeBlock = match[1];
      const filenameMatch = codeBlock.match(/```(.*?)\n/);
      parts.push({
        type: "code",
        filename: filenameMatch ? filenameMatch[1].trim() : "code",
        code: codeBlock
          .replace(/```(.*?)\n/, "")
          .replace(/```$/, "")
          .trim(),
      });
    } else if (match[2]) {
      // Jika grup 2 cocok -> ini adalah BLOK TABEL
      parts.push({
        type: "table",
        content: match[2],
      });
    }
    lastIndex = blockRegex.lastIndex;
  }

  // Ambil sisa teks setelah blok terakhir
  if (lastIndex < rawText.length) {
    parts.push({ type: "text", content: rawText.slice(lastIndex) });
  }

  // 3. PROSES RENDERING GABUNGAN: Mendukung teks, kode, dan tabel
  for (const part of parts) {
    if (part.type === "text") {
      // Menggunakan logika "live formatting" rekursif Anda yang sudah bagus
      const parsedHtml = parseMarkdown(part.content);
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = parsedHtml;

      const typeNodeInElement = async (node, parentElement) => {
        if (node.nodeType === Node.TEXT_NODE) {
          for (const char of node.textContent) {
            parentElement.innerHTML += char === "\n" ? "<br>" : escapeHtml(char);
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
      // Menggunakan logika rendering blok kode Anda yang dianimasikan
      const wrapper = document.createElement("div");
      wrapper.className = "code-wrapper";
      Object.assign(wrapper.style, { backgroundColor: "#1e1e1e", fontFamily: "'Source Code Pro', monospace", fontSize: "0.9em", color: "#d4d4d4", position: "relative", borderRadius: "8px", margin: "8px 0" });

      const header = document.createElement("div");
      Object.assign(header.style, { display: "flex", alignItems: "center", padding: "8px", borderBottom: "1px solid #333", backgroundColor: "#252526" });

      const label = document.createElement("span");
      label.textContent = part.filename;
      Object.assign(label.style, { color: "#ccc", fontWeight: "600" });

      const copyBtn = document.createElement("button");
      copyBtn.title = "Salin kode";
      copyBtn.innerHTML = `<img src="images/copy.png" alt="Copy" width="16" height="16" />`;
      Object.assign(copyBtn.style, { background: "transparent", border: "none", cursor: "pointer", padding: "0", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: "auto" });
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(part.code).then(() => showToast("Kode tersalin!"));
      };

      header.appendChild(label);
      header.appendChild(copyBtn);

      const pre = document.createElement("pre");
      Object.assign(pre.style, { margin: "0", paddingTop: "8px", overflowX: "auto", whiteSpace: "pre-wrap", wordWrap: "break-word" });

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
        await new Promise((r) => setTimeout(r, 5)); // Animasi kode lebih cepat
      }
    } else if (part.type === "table") {
      // MENAMBAHKAN KEMBALI LOGIKA RENDER TABEL
      const tableHtml = parseMarkdownTable(part.content); // Memanggil fungsi parse tabel
      element.insertAdjacentHTML("beforeend", tableHtml);
      if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight;
    }
  }

  chatInput.disabled = false;
  if (onFinish) {
    onFinish();
  }
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

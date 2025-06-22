const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const clearChatBtn = document.getElementById("clearChatBtn");
const clearChatBtnn = document.getElementById("clearChatBtnn");
const clearChatBtnnn = document.getElementById("clearChatBtnnn");
const leftMenuBtn = document.getElementById("leftMenuBtn");
const sidebar = document.getElementById("sidebar");
const sidebars = document.getElementById("sidebar"); // Ada duplikat ID, pastikan ini referensi yang benar jika 'sidebar' dan 'sidebars' digunakan berbeda
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
const tombolTutup = document.getElementById("nutupsidebar");
const tombolBuka = document.getElementById("bukasidebar");
const tombolTutupmobile = document.getElementById("nutupsidebar"); // Ada duplikat ID, pastikan ini referensi yang benar

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

// Anda perlu mendefinisikan variabel ini sebelumnya
// const tombolTutup = document.getElementById('ID_TOMBOL_TUTUP');
// const tombolBuka = document.getElementById('ID_TOMBOL_BUKA');
// const sidebars = document.getElementById('ID_SIDEBAR');

// Tentukan lebar minimum untuk mode desktop (dalam piksel)
const desktopBreakpoint = 768;

// 3. Tambahkan "event listener" yang akan menjalankan fungsi saat tombol diklik
tombolTutup.addEventListener("click", () => {
  // Periksa apakah lebar jendela browser saat ini lebih besar atau sama dengan breakpoint desktop
  if (window.innerWidth >= desktopBreakpoint) {
    // 4. Jika ya (mode desktop), jalankan aksi untuk menyembunyikan sidebar
    sidebars.style.display = "none";
    tombolBuka.style.display = "block";
  }
  // Jika tidak (mode mobile), tidak ada aksi yang dijalankan
});

tombolBuka.addEventListener("click", () => {
  // Periksa juga di sini untuk konsistensi
  if (window.innerWidth >= desktopBreakpoint) {
    // 4. Jika ya (mode desktop), jalankan aksi untuk menampilkan sidebar
    sidebars.style.display = "block";
    tombolBuka.style.display = "none";
  }
});

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

tombolTutupmobile.addEventListener("click", () => {
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

// FUNGSI BARU UNTUK MENAMBAHKAN STYLE ANIMASI LOADING
function addLoadingAnimationStyles() {
  // Cek agar style tidak ditambahkan berulang kali
  if (document.getElementById("loading-animation-styles")) return;

  const styleSheet = document.createElement("style");
  styleSheet.id = "loading-animation-styles";
  styleSheet.textContent = `
        .loading-animation {
            display: flex;
            align-items: center;
            padding-top: 5px;
            height: 20px; /* Memberi ruang agar dot tidak membuat layout melompat */
        }
        .loading-animation .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #aaa; /* Warna dot yang lebih lembut */
            margin: 0 3px;
            /* Nama animasi, durasi, perulangan, dan timing function */
            animation: dot-pulse 1.4s infinite ease-in-out both;
        }
        
        /* Memberi jeda animasi untuk setiap dot agar tidak bersamaan */
        .loading-animation .dot:nth-child(1) {
            animation-delay: -0.32s;
        }
        .loading-animation .dot:nth-child(2) {
            animation-delay: -0.16s;
        }
        
        /* Keyframes mendefinisikan langkah-langkah animasi */
        @keyframes dot-pulse {
            0%, 80%, 100% {
                transform: scale(0.8);
                opacity: 0.5;
            }
            40% {
                transform: scale(1);
                opacity: 1;
            }
        }
    `;
  document.head.appendChild(styleSheet);
}

// Panggil fungsi ini sekali saat script dimuat
addLoadingAnimationStyles();

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
      fileObject.extractedText = `URL Video YouTube: ${urlString}`; // Simpan untuk dikirim ke AI
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
// ... (Your existing code above) ...

// ... (Your existing code above, including the helper functions like escapeHtml, parseMarkdown, etc.) ...

// ... (Kode Anda yang ada di atas, termasuk semua variabel global dan fungsi pembantu) ...

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Mencegah refresh halaman
  let userText = chatInput.value.trim(); // Ambil teks input pengguna, hapus spasi di awal/akhir
  const lowerCaseUserText = userText.toLowerCase(); // Konversi ke huruf kecil untuk pencocokan

  // --- Identity Question Detection (Paling Prioritas dan Analitis) ---
  let isIdentityQuestion = false;

  // Normalisasi input pengguna menjadi array kata
  const userWords = lowerCaseUserText
    .split(/\s+/) // Pisahkan berdasarkan spasi
    .filter((word) => word.length > 0) // Hapus string kosong
    .map((word) => word.replace(/[^\w\s]/gi, "")); // Hapus tanda baca

  // Kategori kata kunci untuk berbagai niat identitas
  const questionStarters = ["who", "what", "where", "how", "why", "siapa", "apa", "bagaimana", "mengapa"];
  const botReferences = ["you", "kamu", "bot", "ai", "robot", "chatbot", "diri", "yourself", "dia", "mereka"]; // Ditambah "dia", "mereka" untuk pertanyaan tidak langsung
  const creatorTerms = ["made", "created", "built", "developer", "creator", "pencipta", "pembuat", "menciptakan", "dibuat", "bangun", "mengembangkan", "by", "oleh"]; // Ditambah "by", "oleh"
  const identityTerms = ["identity", "identitas", "origin", "asal", "nature", "jenis", "tipe", "purpose", "tujuan", "siapa", "apa"]; // Ditambah "siapa", "apa"
  const natureTerms = ["human", "ai", "artificial intelligence", "robot", "chatbot", "program", "model", "manusia", "cerdas"]; // Ditambah "manusia", "cerdas"

  // 1. Cek frasa spesifik secara keseluruhan (dengan batas kata)
  const specificIdentityPhrases = [
    // --- English Exact/Common Phrases ---
    "who made you",
    "who created you",
    "who built you",
    "who is your creator",
    "who developed you",
    "by whom were you created",
    "who are you really",
    "what is your identity",
    "tell me about your creator",
    "what kind of ai are you",
    "are you human",
    "are you an ai",
    "are you a robot",
    "are you a chatbot",
    "your creator",
    "your developer",
    "your origin",
    "your source",
    "made by",
    "created by",
    "built by",
    "what are you made of",
    "where were you made",
    "who is behind you",
    "what is your purpose",
    "what do you do", // Bisa juga terkait identitas
    "where did you come from",
    "what are you built for",
    // --- Indonesian Exact/Common Phrases ---
    "siapa yang buat kamu",
    "siapa yang menciptakan kamu",
    "siapa pembuat kamu",
    "siapa pencipta kamu",
    "siapa kamu",
    "kamu siapa",
    "asal usul kamu",
    "identitas kamu",
    "mengenai dirimu",
    "kamu buatan siapa",
    "kamu dibuat oleh siapa",
    "siapa yang membuatmu",
    "apa tujuanmu",
    "jenis bot apa kamu",
    "kamu itu siapa",
    "asalmu dari mana",
    "pengembang kamu siapa",
    "di buat oleh",
    "dibuat oleh",
    "oleh siapa",
    "pembuatnya",
    "penciptanya",
    "dibikin siapa",
    "kamu siapa aslinya",
    "kamu itu dibuat oleh siapa",
    "kamu dibuat dari apa",
    "siapa di balik kamu",
    "apa fungsi kamu",
    "apa kegunaanmu",
    "kamu berasal dari mana",
    // --- Other Languages ---
    "кто тебя создал",
    "wer hat dich erschaffen",
    "qui t'a créé",
    "chi ti ha creato",
    "quién te creó",
    "quem te criou",
    "あなたを作ったのは誰ですか",
    "誰創造了你",
    "谁创造了你",
    "너를 누가 만들었니",
    "คุณเป็นใคร",
    "bạn là ai",
    "നിങ്ങൾ ആരാണ്",
    "क्या तुम कौन हो",
  ];

  for (const phrase of specificIdentityPhrases) {
    // Escape karakter khusus regex jika ada dalam frasa
    const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escapedPhrase}\\b`, "i");
    if (regex.test(lowerCaseUserText)) {
      isIdentityQuestion = true;
      break;
    }
  }

  // 2. Analisis per kata jika frasa spesifik tidak cocok.
  // Ini mencari kombinasi kata-kata yang sangat indikatif dan niat tersembunyi.
  if (!isIdentityQuestion) {
    const hasQuestion = userWords.some((word) => questionStarters.includes(word));
    const hasBotRef = userWords.some((word) => botReferences.includes(word));
    const hasCreator = userWords.some((word) => creatorTerms.includes(word));
    const hasIdentity = userWords.some((word) => identityTerms.includes(word));
    const hasNature = userWords.some((word) => natureTerms.includes(word));

    // Logika kombinasi:
    // a. Pertanyaan umum tentang identitas (e.g., "who are you", "siapa kamu")
    if (userWords.includes("who") && userWords.includes("are") && userWords.includes("you")) {
      isIdentityQuestion = true;
    } else if (userWords.includes("siapa") && userWords.includes("kamu")) {
      isIdentityQuestion = true;
    }
    // b. Pertanyaan tentang asal/pembuat (e.g., "who made you", "dibuat oleh")
    else if (hasQuestion && hasCreator && hasBotRef) {
      isIdentityQuestion = true;
    }
    // c. Pertanyaan tentang sifat/tipe (e.g., "are you human?", "kamu ai?")
    else if (userWords.includes("are") && hasBotRef && hasNature) {
      isIdentityQuestion = true;
    } else if (hasBotRef && hasNature && (userWords.includes("adalah") || userWords.includes("is") || userWords.includes("merupakan"))) {
      isIdentityQuestion = true;
    }
    // d. Pertanyaan tujuan (e.g., "what is your purpose", "apa tujuanmu")
    else if (hasQuestion && userWords.some((word) => ["purpose", "tujuan", "fungsi", "kegunaan"].includes(word)) && hasBotRef) {
      isIdentityQuestion = true;
    }
    // e. Frasa seperti "tell me about" + referensi bot
    else if (userWords.includes("tell") && userWords.includes("me") && userWords.includes("about") && hasBotRef) {
      isIdentityQuestion = true;
    }
    // f. Deteksi sangat singkat (e.g., "pembuatnya?", "oleh siapa?")
    // Ini adalah heuristik yang agak agresif, gunakan dengan hati-hati.
    // Jika input hanya terdiri dari 1-3 kata dan mengandung kata kunci pembuat/identitas kuat.
    else if (userWords.length > 0 && userWords.length <= 3 && (userWords.some((word) => creatorTerms.includes(word)) || userWords.some((word) => identityTerms.includes(word)))) {
      // Exclude generic short questions like "who?", "what?" if they don't imply identity.
      if (
        !(
          (userWords.length === 1 && (userWords.includes("who") || userWords.includes("siapa") || userWords.includes("what") || userWords.includes("apa"))) ||
          (userWords.length === 2 && (userWords.includes("who") || userWords.includes("siapa")) && (userWords.includes("is") || userWords.includes("itu")))
        )
      ) {
        isIdentityQuestion = true;
      }
    }
  }

  // --- EKSEKUSI RESPON IDENTITAS BOT (Jika isIdentityQuestion TRUE) ---
  if (isIdentityQuestion) {
    // Tambahkan pesan pengguna ke chatBox
    appendMessage("user", userText, "You", "https://cdn-icons-png.flaticon.com/512/1077/1077114.png", [], false);
    messages.push({ role: "user", content: userText, files: [] });
    saveMessagesToStorage(); // Simpan pesan pengguna ke localStorage

    isLoading = true;
    appendLoadingMessage(); // Tampilkan indikator loading
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulasikan jeda waktu
    removeLoadingMessage(); // Hapus indikator loading

    const botIdentityReply = "I cannot provide further information about your question. Please provide another question!";
    appendMessage("bot", botIdentityReply, "AI Digging", "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_232210.png?alt=media&token=dc5a0b3a-f869-432a-82a2-c27b32eca77f");
    messages.push({ role: "assistant", content: botIdentityReply, files: [] });
    saveMessagesToStorage(); // Simpan balasan bot ke localStorage

    // Bersihkan input dan reset status UI
    chatInput.value = "";
    chatInput.style.height = "auto";
    chatInput.blur();
    preview.innerHTML = "";
    selectedFiles = [];
    updateFileInput();
    isLoading = false;
    chatInput.disabled = false;

    return; // SANGAT PENTING: Hentikan eksekusi di sini agar tidak memanggil API!
  }

  // --- EKSEKUSI RESPON APLIKASI "CERITO KE BAE" (Jika tidak ada kondisi di atas yang cocok) ---
  // Pastikan ini datang SETELAH deteksi identitas, jika ada kemungkinan tumpang tindih
  if (lowerCaseUserText === "berikan aku aplikasi cerito ke bae") {
    // Tambahkan pesan pengguna ke chatBox
    appendMessage("user", userText, "You", "https://cdn-icons-png.flaticon.com/512/1077/1077114.png", [], false);
    messages.push({ role: "user", content: userText, files: [] });
    saveMessagesToStorage();

    isLoading = true;
    appendLoadingMessage();
    await new Promise((resolve) => setTimeout(resolve, 1500));
    removeLoadingMessage();

    const botReplyText = `Tentu, ini aplikasi "Cerito Ke Bae" yang bisa kamu unduh:

**Nama File:** CeritoKeBae.apk
**Ukuran:** 12 MB
**Status:** Terverifikasi
`;
    const downloadFileName = "CeritoKeBae.apk";
    const downloadFileUrl = "https://example.com/CeritoKeBae.apk"; // Ganti dengan URL unduhan APK yang sebenarnya!
    const downloadLogoUrl = "https://firebasestorage.googleapis.com/v0/b/website-putra.appspot.com/o/icons8-download-96.png?alt=media&token=c26ee380-f3ec-45f9-960e-81bc69e0624b";

    appendMessage("bot", botReplyText, "AI Digging", "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_232210.png?alt=media&token=dc5a0b3a-f869-432a-82a2-c27b32eca77f");

    const lastBotMessageElement = chatBox.lastElementChild.querySelector(".bot-message");
    if (lastBotMessageElement) {
      const downloadContainer = document.createElement("div");
      downloadContainer.className = "download-link-container";
      Object.assign(downloadContainer.style, {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginTop: "10px",
        backgroundColor: "#2e2e2e",
        padding: "10px",
        borderRadius: "8px",
        width: "50%",
      });

      const fileNameEl = document.createElement("span");
      fileNameEl.textContent = downloadFileName;
      Object.assign(fileNameEl.style, { color: "#fff", flexGrow: "1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" });

      const downloadLink = document.createElement("a");
      downloadLink.href = downloadFileUrl;
      downloadLink.download = downloadFileName;
      downloadLink.title = `Unduh ${downloadFileName}`;
      Object.assign(downloadLink.style, {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "40px",
        minHeight: "40px",
        textDecoration: "none",
      });

      const downloadIcon = document.createElement("img");
      downloadIcon.src = downloadLogoUrl;
      downloadIcon.alt = "Download Icon";
      Object.assign(downloadIcon.style, { width: "24px", height: "24px" });

      downloadLink.appendChild(downloadIcon);
      downloadContainer.appendChild(fileNameEl);
      downloadContainer.appendChild(downloadLink);

      lastBotMessageElement.appendChild(downloadContainer);
    }
    messages.push({ role: "assistant", content: botReplyText, files: [] });
    saveMessagesToStorage();

    chatInput.value = "";
    chatInput.style.height = "auto";
    chatInput.blur();
    preview.innerHTML = "";
    selectedFiles = [];
    updateFileInput();
    isLoading = false;
    chatInput.disabled = false;
    return;
  }

  // --- LOGIKA UTAMA: Kirim ke API AI Digging (jika tidak ada kondisi khusus di atas yang cocok) ---

  // Deteksi URL di dalam teks input
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const foundUrls = userText.match(urlRegex);

  if ((!userText && selectedFiles.length === 0 && !foundUrls) || isLoading) {
    showToast("Mohon masukkan pesan, URL, atau lampirkan file.");
    return;
  }

  // Jika ada URL di input, tambahkan ke selectedFiles secara otomatis
  if (foundUrls && foundUrls.length > 0) {
    for (const url of foundUrls) {
      userText = userText.replace(url, "").trim();
      await addUrlToPreview(url);
    }
  }

  const filesForDisplay = selectedFiles.map((f) => ({
    id: f.id,
    name: f.name,
    type: f.type,
    dataURL: f.dataURL,
    originalUrl: f.originalUrl,
    isUrl: f.isUrl,
    extractedText: f.extractedText,
  }));

  const currentUserParts = [];
  if (userText) {
    currentUserParts.push({ text: userText });
  }

  selectedFiles
    .filter((f) => f.type.startsWith("image/") && f.dataURL)
    .forEach((file) => {
      const mimeType = file.type;
      const base64Data = file.dataURL.substring(file.dataURL.indexOf(",") + 1);
      currentUserParts.push({
        inline_data: { mime_type: mimeType, data: base64Data },
      });
    });

  selectedFiles
    .filter((f) => f.extractedText)
    .forEach((file) => {
      if (file.type === "video/youtube" && file.originalUrl) {
        currentUserParts.push({ text: `URL Video YouTube untuk dianalisis: ${file.originalUrl}` });
      } else if (file.extractedText) {
        currentUserParts.push({ text: `Konten dari ${file.isUrl ? "URL" : "file"} "${file.name || file.originalUrl}":\n${file.extractedText}` });
      }
    });

  if (currentUserParts.length === 0) {
    showToast("Tidak ada konten yang dapat dikirim ke AI. Pastikan pesan Anda tidak kosong atau konten file/URL berhasil diekstrak.");
    removeLoadingMessage();
    isLoading = false;
    chatInput.disabled = false;
    return;
  }

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
            if (file.type === "video/youtube" && file.originalUrl) {
              historyParts.push({ text: `URL Video YouTube untuk dianalisis: ${file.originalUrl}` });
            } else if (file.extractedText) {
              historyParts.push({ text: `Konten dari ${file.isUrl ? "URL" : "file"} "${file.name || file.originalUrl}":\n${file.extractedText}` });
            }
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

    const apiKey = "AIzaSyAppIpLXqeL2fyeFkIr3_ERCK1PR5aws3k";
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

// ... (Your existing code below) ...

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

      let displayContent = msg.content; // Ini teks utama yang disimpan

      const filesToDisplay = msg.files || []; // Ini array file yang disimpan

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

    // --- BARIS TAMBAHAN: Hapus simbol dari teks ---
    // Ganti semua karakter yang bukan huruf, angka, atau spasi dengan spasi tunggal,
    // lalu rapikan spasi berlebih.
    const cleanedText = text
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Gunakan teks yang sudah dibersihkan
    const utterance = new SpeechSynthesisUtterance(cleanedText);

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
// FUNGSI BARU (PENGGANTI typeText): Satu fungsi untuk semua rendering konten bot
// =================================================================================
/**
 * Merender konten mentah dari bot (teks, markdown, tabel, kode, diagram) ke dalam elemen target.
 * @param {HTMLElement} element - Elemen div target untuk diisi konten.
 * @param {string} rawText - Teks mentah dari AI.
 * @param {boolean} isAnimated - Jika true, konten akan dianimasikan (efek ketik).
 * @param {function} onFinish - Callback yang dijalankan setelah rendering selesai.
 */
async function renderMessageContent(element, rawText, isAnimated = false, onFinish = () => {}) {
  element.innerHTML = ""; // Selalu bersihkan elemen target
  const delay = isAnimated ? 10 : 0; // Atur jeda animasi

  const parts = [];
  const blockRegex = /(```[\s\S]*?```)|(^\|.+\|\s*\r?\n^\|[ |:\-]*-[ |:\-]*\|\s*\r?\n(?:^\|.*\|\s*\r?\n?)*)/gm;
  let lastIndex = 0;
  let match;

  // 1. Parsing teks mentah menjadi segmen-segmen (teks, kode, tabel)
  while ((match = blockRegex.exec(rawText)) !== null) {
    if (match.index > lastIndex) parts.push({ type: "text", content: rawText.slice(lastIndex, match.index) });
    if (match[1]) {
      const codeBlock = match[1];
      const filenameMatch = codeBlock.match(/```(.*?)\n/);
      const language = filenameMatch ? filenameMatch[1].trim().toLowerCase() : "code";
      parts.push({
        type: "code",
        filename: language,
        code: codeBlock
          .replace(/```(.*?)\n/, "")
          .replace(/```$/, "")
          .trim(),
      });
    } else if (match[2]) {
      parts.push({ type: "table", content: match[2] });
    }
    lastIndex = blockRegex.lastIndex;
  }
  if (lastIndex < rawText.length) parts.push({ type: "text", content: rawText.slice(lastIndex) });

  // 2. Fungsi rekursif untuk animasi teks (hanya digunakan jika isAnimated=true)
  const animateNode = async (node, parentElement) => {
    for (const childNode of Array.from(node.childNodes)) {
      if (childNode.nodeType === Node.TEXT_NODE) {
        for (const char of childNode.textContent) {
          parentElement.innerHTML += char === "\n" ? "<br>" : escapeHtml(char);
          if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight;
          if (isAnimated) await new Promise((r) => setTimeout(r, delay));
        }
      } else if (childNode.nodeType === Node.ELEMENT_NODE) {
        const newElem = document.createElement(childNode.tagName);
        parentElement.appendChild(newElem);
        await animateNode(childNode, newElem);
      }
    }
  };

  // 3. Merender setiap segmen
  for (const part of parts) {
    if (part.type === "text") {
      const sourceContainer = document.createElement("div");
      sourceContainer.innerHTML = parseMarkdown(part.content);
      await animateNode(sourceContainer, element);
    } else if (part.type === "table") {
      element.insertAdjacentHTML("beforeend", parseMarkdownTable(part.content));
    } else if (part.type === "code") {
      const lang = part.filename;
      if (lang === "mermaid") {
        const mermaidDiv = document.createElement("div");
        mermaidDiv.className = "mermaid";
        mermaidDiv.textContent = part.code;
        element.appendChild(mermaidDiv);
      } else if (lang === "diagram" || lang === "flowchart") {
        const pre = document.createElement("pre");
        pre.className = "text-diagram";
        pre.textContent = part.code;
        element.appendChild(pre);
      } else {
        // Render blok kode standar
        const wrapper = document.createElement("div");
        wrapper.className = "code-wrapper";
        Object.assign(wrapper.style, { backgroundColor: "#1e1e1e", fontFamily: "'Source Code Pro', monospace", margin: "8px 0", borderRadius: "8px", overflow: "hidden" });

        const header = document.createElement("div");
        Object.assign(header.style, { display: "flex", alignItems: "center", padding: "8px", borderBottom: "1px solid #333", backgroundColor: "#252526" });

        const label = document.createElement("span");
        label.textContent = lang;
        Object.assign(label.style, { color: "#ccc", fontWeight: "600" });

        const copyBtn = document.createElement("button");
        copyBtn.title = "Salin kode";
        copyBtn.innerHTML = `<img src="images/copy.png" alt="Copy" width="16" height="16" />`;
        Object.assign(copyBtn.style, { background: "transparent", border: "none", cursor: "pointer", marginLeft: "auto" });
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(part.code).then(() => showToast("Kode tersalin!"));
        };

        header.append(label, copyBtn);

        const pre = document.createElement("pre");
        Object.assign(pre.style, { margin: "0", padding: "12px", overflowX: "auto", whiteSpace: "pre-wrap", wordWrap: "break-word" });

        const codeEl = document.createElement("code");
        codeEl.className = `language-${lang}`; // Untuk library highlighting jika ada
        pre.appendChild(codeEl);
        wrapper.append(header, pre);
        element.appendChild(wrapper);

        // Animasikan atau tampilkan langsung isi kode
        if (isAnimated) {
          for (const char of part.code) {
            codeEl.textContent += char;
            if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight;
            await new Promise((r) => setTimeout(r, 5));
          }
        } else {
          codeEl.textContent = part.code;
        }
      }
    }
    if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight;
  }

  // 4. Jalankan callback setelah semua selesai
  if (onFinish) onFinish();
}

// =================================================================================
// FUNGSI UTAMA APPENDMESSAGE (VERSI FINAL YANG SUDAH DIPERBAIKI)
// =================================================================================
// =================================================================================
// FUNGSI UTAMA APPENDMESSAGE (VERSI FINAL DENGAN PERBAIKAN TEKS)
// =================================================================================
function appendMessage(sender, text, username, profileUrl, files = [], isHistory = false, messageId = null) {
  messageId = messageId || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const container = document.createElement("div");
  container.className = `message-container ${sender} message-fade-in`;
  container.setAttribute("data-message-id", messageId);

  const profileEl = document.createElement("img");
  profileEl.src = profileUrl;
  profileEl.className = "profile-image";
  container.appendChild(profileEl);

  const content = document.createElement("div");
  content.className = "message-content";
  container.appendChild(content);

  const nameEl = document.createElement("div");
  nameEl.className = "username";
  nameEl.textContent = username;
  content.appendChild(nameEl);

  const messageEl = document.createElement("div");
  messageEl.className = `message ${sender === "bot" ? "bot-message" : "user-message"}`;
  messageEl.style.position = "relative";

  // --- [PERBAIKAN BARU & KUNCI] ---
  // Memaksa gelembung teks untuk memiliki lebar maksimumnya sendiri agar TIDAK IKUT MEREGANG.
  // Ini adalah solusi untuk masalah "teks panjang mengikuti lebar gambar".
  messageEl.style.maxWidth = "100%"; // Batasi lebar gelembung teks maksimal 80% dari kolom chat.

  // Untuk pesan pengguna, pastikan gelembungnya tetap menempel di kanan.
  if (sender === "user") {
    messageEl.style.marginLeft = "auto";
  }
  // --- AKHIR DARI PERBAIKAN KUNCI ---

  content.appendChild(messageEl);

  if (sender === "bot" && text) {
    messageEl.style.paddingBottom = "36px";
  }

  if (files && files.length > 0) {
    const filesContainer = document.createElement("div");
    filesContainer.className = "message-files-container";

    const imageFiles = files.filter((f) => f.type && f.type.startsWith("image/"));
    const otherFiles = files.filter((f) => !f.type || !f.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      const imageGrid = document.createElement("div");
      imageGrid.className = "message-image-grid";

      // [Perbaikan Sebelumnya - Dipertahankan] Mengubah layout gambar menjadi scrollable.
      Object.assign(imageGrid.style, {
        display: "flex",
        overflowX: "auto",
        maxWidth: "100%",
        padding: "2px",
      });

      imageFiles.forEach((file) => {
        if (file.dataURL) {
          const imgWrapper = document.createElement("div");
          imgWrapper.className = "message-image-wrapper";
          Object.assign(imgWrapper.style, {
            flexShr: "0",
            padding: "0px",
          });

          const img = document.createElement("img");
          img.src = file.dataURL;
          img.alt = file.name;
          Object.assign(img.style, {
            height: "100px",
            width: "auto",
            borderRadius: "8px",
            display: "block",
            cursor: "pointer",
            padding: "0px",
          });

          img.onclick = () => {
            const modal = document.createElement("div");
            modal.className = "image-modal";
            modal.innerHTML = `<span class="close-modal">×</span><img src="${file.dataURL}" />`;
            document.body.appendChild(modal);
            modal.querySelector(".close-modal").onclick = () => modal.remove();
            modal.onclick = (e) => {
              if (e.target === modal) modal.remove();
            };
          };
          imgWrapper.appendChild(img);
          imageGrid.appendChild(imgWrapper);
        }
      });
      filesContainer.appendChild(imageGrid);
    }

    // Bagian untuk file non-gambar (tidak diubah)
    if (otherFiles.length > 0) {
      const docGrid = document.createElement("div");
      docGrid.className = "message-doc-grid";
      otherFiles.forEach((file) => {
        const docTag = document.createElement("div");
        docTag.className = "message-doc-tag";
        docTag.title = file.originalUrl || file.name;
        const icon = document.createElement("span");
        icon.className = "material-icons";
        if (file.type === "application/pdf") {
          icon.textContent = "picture_as_pdf";
          docTag.style.backgroundColor = "#D32F2F";
        } else if (file.type === "video/youtube") {
          icon.textContent = "ondemand_video";
          docTag.style.backgroundColor = "#FF0000";
        } else {
          icon.textContent = "article";
          docTag.style.backgroundColor = "#1976D2";
        }
        const fileNameSpan = document.createElement("span");
        fileNameSpan.textContent = file.name.length > 20 ? file.name.substring(0, 17) + "..." : file.name;
        docTag.appendChild(icon);
        docTag.appendChild(fileNameSpan);
        docGrid.appendChild(docTag);
      });
      filesContainer.appendChild(docGrid);
    }

    content.insertBefore(filesContainer, messageEl);
  }

  const textContentDiv = document.createElement("div");
  if (text) {
    messageEl.appendChild(textContentDiv);
  }

  if (sender === "user") {
    textContentDiv.innerHTML = escapeHtml(text).replace(/\n/g, "<br>");
  } else {
    const onRenderFinish = () => {
      addBotActionButtons(messageEl, text, messageId);
      const mermaidElements = textContentDiv.querySelectorAll(".mermaid");
      if (mermaidElements.length > 0 && window.mermaid) {
        try {
          mermaidElements.forEach((el, index) => (el.id = `mermaid-${messageId}-${index}`));
          mermaid.run({
            nodes: mermaidElements,
          });
        } catch (e) {
          console.error("Mermaid.js error:", e);
        }
      }
    };
    renderMessageContent(textContentDiv, text, !isHistory, onRenderFinish);
  }

  chatBox.appendChild(container);
  if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight;
  checkChatEmpty();
}

function highlightCode(code) {
  return code.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
}

// Fungsi typeText lama sudah digantikan oleh renderMessageContent.
// Jika Anda masih memiliki panggilan ke typeText di tempat lain,
// sebaiknya Anda ubah menjadi renderMessageContent.
// Namun, jika Anda memang masih menggunakan typeText untuk tujuan tertentu,
// perhatikan bahwa fungsi ini tidak akan menangani pemisahan file
// karena itu tugas dari appendMessage.

/*
async function typeText(element, rawText, delay = 10, onFinish = () => {}) {
    element.innerHTML = ""; // Bersihkan elemen target

    const parts = [];
    const blockRegex = /(```[\s\S]*?```)|(^\|.+\|\s*\r?\n^\|[ |:\-]*-[ |:\-]*\|\s*\r?\n(?:^\|.*\|\s*\r?\n?)*)/gm;

    let lastIndex = 0;
    let match;

    while ((match = blockRegex.exec(rawText)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: "text", content: rawText.slice(lastIndex, match.index) });
        }

        if (match[1]) {
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
            parts.push({
                type: "table",
                content: match[2],
            });
        }
        lastIndex = blockRegex.lastIndex;
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
            const tableHtml = parseMarkdownTable(part.content);
            element.insertAdjacentHTML("beforeend", tableHtml);
            if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight;
        }
    }

    chatInput.disabled = false;
    if (onFinish) {
        onFinish();
    }
}
*/

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
  loadingDots.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;

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
  let div = document.createElement("div");
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

function parseMarkdown(text) {
  if (!text) return "";

  // IMPORTANT: Do NOT escapeHtml the whole text here if renderMessageContent
  // is already handling it or if you want raw HTML for specific markdown tags.
  // The previous escapeHtml was applied to the *entire* rawText, which would
  // double-escape or prevent markdown from rendering.
  // Instead, escape text within specific markdown conversions if needed,
  // or rely on the `animateNode` to handle character by character.

  let html = text; // Start with raw text

  // Headers - These should be handled by your text rendering or `parseMarkdown`
  // Ensure they don't break subsequent inline parsing.
  // Using <h3> instead of <strong> to give proper semantic meaning
  html = html.replace(/^###\s*(.*?)(\n|$)/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s*(.*?)(\n|$)/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s*(.*?)(\n|$)/gm, "<h1>$1</h1>");

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");
  // Italic
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");
  // Strikethrough (optional, if you want it)
  html = html.replace(/~~(.*?)~~/g, "<del>$1</del>");

  // Inline Code (assuming ` are escaped already if text is pre-escaped)
  // If you need to ensure HTML within inline code is escaped, apply escapeHtml here:
  // html = html.replace(/`([^`]+)`/g, (match, inlineCode) => `<code class="md-inline-code">${escapeHtml(inlineCode)}</code>`);
  // If you expect `code` to be raw text already HTML escaped by `animateNode` or similar:
  html = html.replace(/`([^`]+)`/g, `<code class="md-inline-code">$1</code>`);

  // Links (basic) - improve this with proper regex for URL and text
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Lists (basic - unordered)
  html = html.replace(/^\s*[-*+]\s+(.*)(\n|$)/gm, "<li>$1</li>");
  if (html.includes("<li>")) {
    // Wrap all <li> elements that are not already inside a ul/ol (simplistic check)
    // This is tricky without a full parser. A simpler way is to replace newlines
    // AFTER list items are processed.
    html = html.replace(/(^<li>.*<\/li>(\n|$)[\s\S]*?)(?!^<li>)/gm, "<ul>$1</ul>\n");
    // This regex is very simplistic and might not capture all list scenarios
    // properly if there are multiple paragraphs between list items.
  }

  // Horizontal rule
  html = html.replace(/---/g, '<hr class="md-hr"/>'); // Add class for styling

  // Newlines to <br> (This should typically be done last for inline formatting)
  // But for list items and headers, you might want to manage block display with CSS
  // rather than <br> for every newline.
  // For general text paragraphs, replacing double newlines with <p> is better.
  html = html.replace(/\n\n/g, "</p><p>"); // Convert paragraphs
  html = html.replace(/\n/g, "<br>"); // Convert single newlines within paragraphs
  html = `<p>${html}</p>`; // Wrap everything in a paragraph initially, then replace

  return html;
}

// Ensure your CSS has styles for these new classes:
// .md-inline-code
// .md-hr
// h1, h2, h3 within .message-content
// ul, li within .message-content (for lists)
// a within .message-content
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

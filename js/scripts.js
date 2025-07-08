const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const clearChatBtn = document.getElementById("clearChatBtn"); // Navbar trash icon
const clearChatBtnn = document.getElementById("clearChatBtnn"); // Chat header trash icon
const newChatBtn = document.getElementById("newChatBtn"); // Sidebar "Chat Baru" button
const leftMenuBtn = document.getElementById("leftMenuBtn");
const sidebar = document.getElementById("sidebar");
const sidebars = document.getElementById("sidebar"); // Duplicate ID, ensure this references the correct 'sidebar' if used differently
const sidebarOverlay = document.getElementById("sidebarOverlay");
const emptyMessage = document.getElementById("emptyMessage");
const pricing = document.getElementById("pricing");
const jelajahideveloper = document.getElementById("jelajahideveloper");
const speakdigging = document.getElementById("speakdigging");
const kebijakanprivasi = document.getElementById("kebijakanprivasi");
const inputContainer = document.querySelector(".input-container");
const menufitur1 = document.getElementById("menufitur1");
const menufiturawal = document.getElementById("menufiturawal");
const menufiturkedua = document.getElementById("menufiturkedua");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const chatContainer = document.querySelector("section.chat-container");
const uploadBtn = document.getElementById("uploadbtn");
const sidebarToggleBtn = document.getElementById("sidebarToggle"); // Not found in HTML, might be unused
const openSidebarBtn = document.getElementById("openSidebarBtn"); // Not found in HTML, might be unused
const tombolTutup = document.getElementById("nutupsidebar"); // For desktop sidebar close
const tombolBuka = document.getElementById("bukasidebar"); // For desktop sidebar open
const tombolTutupmobile = document.getElementById("nutupsidebar"); // Duplicate ID, ensure this references the correct 'nutupsidebar'
// -- TAMBAHKAN INI --
const userProfileSection = document.getElementById("userProfileSection");
const userProfilePic = document.getElementById("userProfilePic");
const userProfileName = document.getElementById("userProfileName");
const logoutBtn = document.getElementById("logoutBtn");
const profileMenu = document.getElementById("profileMenu");
const link_android = document.getElementById("link_android");
const link_androids = document.getElementById("link_androids");

// -- TAMBAHKAN INI --
const profileOptionsBtn = document.getElementById("profileOptionsBtn"); // Tombol titik tiga
// -- AKHIR TAMBAHAN --
const chatHistoryList = document.getElementById("chatHistoryList"); // NEW: Element to display chat history

let messages = []; // Current chat messages
let isLoading = false;
let autoScrollEnabled = true;
let selectedFiles = [];
let allowWelcomeAnimation = false; // PERUBAHAN: Tambahkan variabel izin ini
let typewriterTimeoutId = null; // PERUBAHAN: Tambahkan variabel ini

// Chat history management
let chatSessions = []; // Array to store all chat sessions
let currentChatId = null; // ID of the currently active chat session

// --- IMPORTANT: REPLACE WITH YOUR ACTUAL PROXY SERVER URL! ---
const PROXY_SERVER_URL = "https://ai-digging.vercel.app/";

const OFFICIAL_WEBSITE_URL = "https://ai-digging.vercel.app/";

// Initialize worker for pdf.js if library exists
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js`;
}

// Determine minimum width for desktop mode (in pixels)
const desktopBreakpoint = 768;

// 3. Add "event listener" that will run the function when the button is clicked
tombolTutup.addEventListener("click", () => {
  // Check if the current browser window width is greater than or equal to the desktop breakpoint
  if (window.innerWidth >= desktopBreakpoint) {
    // 4. If yes (desktop mode), execute action to hide sidebar
    sidebars.style.display = "none";
    tombolBuka.style.display = "block";
  }
  // If not (mobile mode), no action is taken
});

tombolBuka.addEventListener("click", () => {
  // Also check here for consistency
  if (window.innerWidth >= desktopBreakpoint) {
    // 4. If yes (desktop mode), execute action to display sidebar
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

document.addEventListener("DOMContentLoaded", () => {
  allowWelcomeAnimation = true; // Beri izin untuk animasi
  createNewChatSession(); // Jalankan fungsi untuk membuat chat baru
  // ===================================================================
  // BAGIAN 1: KONFIGURASI DAN INISIALISASI FIREBASE
  // ===================================================================
  const firebaseConfig = {
    apiKey: "AIzaSyDBjiZV69xqzCS8pcvclAVJ4RQ4TxvYzos",
    authDomain: "website-putra.firebaseapp.com",
    databaseURL: "https://website-putra-default-rtdb.firebaseio.com",
    projectId: "website-putra",
    storageBucket: "website-putra.appspot.com",
    messagingSenderId: "118694699779",
    appId: "1:118694699779:web:2667c1b4d02dcfb333bf36",
    measurementId: "G-7P4RNX03CZ",
  };

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const googleProvider = new firebase.auth.GoogleAuthProvider();

  // ===================================================================
  // BAGIAN 2: MENGAMBIL SEMUA ELEMEN DARI HTML (DOM)
  // ===================================================================
  // Dialog & Auth
  const welcomeBackOverlay = document.getElementById("welcomeBackOverlay");
  const signInBtn = document.getElementById("signInBtn");
  const signUpFreeBtn = document.getElementById("signUpFreeBtn");
  const stayLoggedOutBtn = document.getElementById("stayLoggedOutBtn");

  // Profil Desktop (di dalam sidebar)
  const userProfileSection = document.getElementById("userProfileSection");
  const userProfilePic = document.getElementById("userProfilePic");
  const userProfileName = document.getElementById("userProfileName");
  const profileOptionsBtn = document.getElementById("profileOptionsBtn"); // Tombol titik tiga
  const profileMenu = document.getElementById("profileMenu"); // Menu yg muncul
  const logoutBtn = document.getElementById("logoutBtn");

  // Profil Mobile (di navbar atas)
  const mobileProfileBtn = document.getElementById("mobileProfileBtn");
  const mobileProfilePic = document.getElementById("mobileProfilePic");

  // Interaksi Sidebar Mobile
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const leftMenuBtn = document.getElementById("leftMenuBtn"); // Tombol hamburger utama di navbar
  const nutupsidebarBtn = document.getElementById("nutupsidebar"); // Tombol tutup di dalam sidebar

  // ===================================================================
  // BAGIAN 3: FUNGSI-FUNGSI OTENTIKASI
  // ===================================================================
  const signInWithGoogle = () => {
    auth.signInWithPopup(googleProvider).catch((error) => {
      console.error("Error saat login dengan Google:", error.code, error.message);
      alert(`Gagal login: ${error.message}`);
    });
  };

  const signOutUser = () => {
    auth.signOut().catch((error) => {
      console.error("Error saat logout:", error);
    });
  };

  // ===================================================================
  // BAGIAN 4: LOGIKA UTAMA APLIKASI ANDA (TIDAK DIUBAH)
  // ===================================================================
  function initializePageForLoggedInUser(user) {
    console.log("Inisialisasi halaman untuk pengguna:", user.displayName);
    if (typeof loadAllChatSessions === "function") loadAllChatSessions();
    if (typeof currentChatId !== "undefined" && currentChatId && typeof chatSessions !== "undefined" && chatSessions.some((s) => s.id === currentChatId)) {
      if (typeof loadChatSession === "function") loadChatSession(currentChatId);
    } else {
      if (typeof createNewChatSession === "function") {
        allowWelcomeAnimation = true;
        createNewChatSession();
      }
    }
    if (typeof renderChatHistoryList === "function") renderChatHistoryList();
    if (typeof updateChatBoxPadding === "function") updateChatBoxPadding();
  }

  // ===================================================================
  // BAGIAN 5: PENGECEKAN STATUS LOGIN (TITIK MASUK UTAMA)
  // ===================================================================
  console.log("Menunggu status otentikasi dari Firebase...");

  auth.onAuthStateChanged((user) => {
    if (user) {
      // ---- PENGGUNA SUDAH LOGIN ----
      const photoURL = user.photoURL || "images/default-avatar.png";
      const displayName = user.displayName || "Pengguna";

      uploadBtn.addEventListener("click", () => fileInput.click());

      // 1. Update UI untuk profil DESKTOP
      if (userProfileSection) {
        userProfileSection.style.display = "flex";
        userProfileName.textContent = displayName;
        userProfilePic.src = photoURL;
      }

      // 2. Update UI untuk profil MOBILE
      if (mobileProfileBtn) {
        mobileProfileBtn.style.display = "block";
        mobileProfilePic.src = photoURL;
        if (leftMenuBtn) leftMenuBtn.style.display = "none";
      }

      // 3. Sembunyikan dialog selamat datang
      if (welcomeBackOverlay) welcomeBackOverlay.classList.remove("visible");

      initializePageForLoggedInUser(user);
    } else {
      // ---- PENGGUNA BELUM LOGIN ----
      // 1. Sembunyikan semua elemen profil
      if (userProfileSection) userProfileSection.style.display = "none";
      if (mobileProfileBtn) mobileProfileBtn.style.display = "none";

      // 2. Tampilkan kembali tombol hamburger utama
      if (leftMenuBtn) leftMenuBtn.style.display = "block";

      // 3. Tampilkan dialog selamat datang
      if (welcomeBackOverlay) welcomeBackOverlay.classList.add("visible");
    }
  });

  // ===================================================================
  // BAGIAN 6: SEMUA EVENT LISTENERS (DIPERBAIKI & DILENGKAPI)
  // ===================================================================

  // --- Listener untuk Auth ---
  if (signInBtn) signInBtn.addEventListener("click", signInWithGoogle);
  if (signUpFreeBtn) signUpFreeBtn.addEventListener("click", signInWithGoogle);
  if (stayLoggedOutBtn) {
    stayLoggedOutBtn.addEventListener("click", () => {
      if (welcomeBackOverlay) welcomeBackOverlay.classList.remove("visible");
    });
  }

  // --- Listener untuk Interaksi Sidebar Mobile ---
  function openSidebar() {
    if (sidebar) sidebar.classList.add("active");
    if (sidebarOverlay) sidebarOverlay.classList.add("active");
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove("active");
    if (sidebarOverlay) sidebarOverlay.classList.remove("active");
  }

  if (leftMenuBtn) leftMenuBtn.addEventListener("click", openSidebar);
  if (mobileProfileBtn) mobileProfileBtn.addEventListener("click", openSidebar);
  if (nutupsidebarBtn) nutupsidebarBtn.addEventListener("click", closeSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener("click", closeSidebar);

  // --- Listener untuk Menu Profil di Dalam Sidebar ---
  if (profileOptionsBtn) {
    profileOptionsBtn.addEventListener("click", (event) => {
      event.stopPropagation(); // Mencegah klik menyebar ke elemen lain
      if (profileMenu) profileMenu.classList.toggle("visible");
    });
  }

  // Listener untuk menutup menu profil saat klik di luar area
  document.addEventListener("click", (event) => {
    if (profileMenu && profileMenu.classList.contains("visible")) {
      if (userProfileSection && !userProfileSection.contains(event.target)) {
        profileMenu.classList.remove("visible");
      }
    }
  });

  // Listener untuk tombol logout di dalam menu profil
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (event) => {
      event.stopPropagation(); // Mencegah klik menyebar
      signOutUser();
    });
  }
});

link_android.addEventListener("click", () => {
window.location.href = "https://play.google.com/store/apps/details?id=com.diggingdeeper.ucd&hl=id&pli=1"; 
});

link_androids.addEventListener("click", () => {
window.location.href = "https://play.google.com/store/apps/details?id=com.diggingdeeper.ucd&hl=id&pli=1"; 
});


pricing.addEventListener("click", () => {
  window.location.href = "pricing.html";
});

jelajahideveloper.addEventListener("click", () => {
  showToast("Fitur ini segera hadir");
});

speakdigging.addEventListener("click", () => {
  window.location.href = "voice.html";
});

kebijakanprivasi.addEventListener("click", () => {
  window.location.href = "kebijakan.html";
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

// NEW FUNCTION: Generate a unique ID
function generateUniqueId() {
  return `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function clearChatMessages() {
  if (!chatBox) return;
  const messageElements = chatBox.querySelectorAll(".message-container");
  messageElements.forEach((el) => el.remove());
}

function createNewChatSession(loadImmediately = true) {
  const newId = generateUniqueId();
  messages = [];
  currentChatId = newId;

  clearChatMessages();

  // PERUBAHAN: Reset alignment ke bawah saat chat baru (kosong)
  chatBox.classList.remove("align-top");

  initializeChatDisplay();

  if (loadImmediately) {
    renderChatHistoryList();
  }
}
// NEW FUNCTION: Save all chat sessions to localStorage
function saveAllChatSessions() {
  try {
    localStorage.setItem("allChatSessions", JSON.stringify(chatSessions));
  } catch (e) {
    console.error("Failed to save all chat sessions to localStorage", e);
  }
}

// MODIFIED FUNCTION: Load all chat sessions from localStorage
function loadAllChatSessions() {
  try {
    const storedSessions = localStorage.getItem("allChatSessions");
    if (storedSessions) {
      chatSessions = JSON.parse(storedSessions);
      // Ensure messages array exists and is an array for each session
      chatSessions.forEach((session) => {
        if (!session.messages || !Array.isArray(session.messages)) {
          session.messages = [];
        }
      });
      // Sort sessions by creation date, newest first
      chatSessions.sort((a, b) => b.createdAt - a.createdAt);
    } else {
      chatSessions = []; // Initialize as empty if no stored sessions
    }

    // Set currentChatId to the most recent chat or create a new one if none exist
    if (chatSessions.length > 0) {
      currentChatId = chatSessions[0].id;
    } else {
      // If no sessions, prepare a new empty session, but don't add to list yet
      createNewChatSession(false); // Do not loadImmediately, just prepare currentChatId
    }
  } catch (e) {
    console.error("Failed to load all chat sessions from localStorage", e);
    chatSessions = []; // Reset on error
    createNewChatSession(false); // Prepare new empty session
  }
}

// NEW FUNCTION: Load a specific chat session by ID
function loadChatSession(id) {
  const session = chatSessions.find((s) => s.id === id);
  if (session) {
    currentChatId = id;
    messages = session.messages; // Set global messages to the loaded session's messages
    clearChatMessages(); // Clear current chat display
    messages.forEach((msg) => {
      const role = msg.role === "user" ? "user" : "bot";
      const username = role === "user" ? "You" : "AI Digging";
      const profileUrl =
        role === "user" ? "https://cdn-icons-png.flaticon.com/512/1077/1077114.png" : "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_232210.png?alt=media&token=dc5a0b3a-f869-432a-82a2-c27b32eca77f";
      // Pass the original message ID when loading from history
      appendMessage(role, msg.content, username, profileUrl, msg.files || [], true, msg.id); // isHistory = true
    });
    chatBox.scrollTop = chatBox.scrollHeight;
    initializeChatDisplay(); // Call here to manage initial message display after loading
    // Close sidebar on mobile after selecting a chat
    if (window.innerWidth < desktopBreakpoint) {
      sidebar.classList.remove("active");
      sidebarOverlay.classList.remove("active");
    }
    renderChatHistoryList(); // Update active class
  } else {
    console.error("Chat session not found:", id);
    // If session not found (e.g., deleted by another tab), create a new empty one
    createNewChatSession();
  }
}

// NEW FUNCTION: Update the title of the current chat session
function updateCurrentChatTitle(newTitle) {
  const currentSession = chatSessions.find((s) => s.id === currentChatId);
  // Only update if it's the default title or if there's no title yet
  if (currentSession && (currentSession.title === "Percakapan Baru" || !currentSession.title)) {
    currentSession.title = newTitle.substring(0, 50) + (newTitle.length > 50 ? "..." : ""); // Truncate title
    saveAllChatSessions();
    renderChatHistoryList();
  }
}

// NEW FUNCTION: Render the chat history list in the sidebar
function renderChatHistoryList() {
  chatHistoryList.innerHTML = ""; // Clear existing list
  if (chatSessions.length === 0) {
    chatHistoryList.innerHTML = `<p style="color: #aaa; padding: 10px; margin-top: 20px; text-align: center;">Belum ada riwayat chat.</p>`;
    return;
  }

  chatSessions.forEach((session) => {
    const listItem = document.createElement("button");
    listItem.className = `sidebar-chat-item ${session.id === currentChatId ? "active" : ""}`;
    listItem.setAttribute("data-chat-id", session.id);
    listItem.innerHTML = `
        
        <span class="chat-title">${escapeHtml(session.title)}</span>
        <button class="delete-chat-item" data-chat-id="${session.id}" title="Hapus chat ini">
            <span class="material-icons">delete</span>
        </button>
    `;
    listItem.addEventListener("click", (e) => {
      // Prevent clicking the delete button from loading the chat
      if (!e.target.closest(".delete-chat-item")) {
        loadChatSession(session.id);
      }
    });

    // Add event listener for delete button
    const deleteButton = listItem.querySelector(".delete-chat-item");
    deleteButton.addEventListener("click", async (e) => {
      e.stopPropagation(); // Stop event from propagating to the list item
      await deleteChatSession(session.id);
    });

    chatHistoryList.appendChild(listItem);
  });
}

// NEW FUNCTION: Delete a chat session
async function deleteChatSession(idToDelete) {
  try {
    await showConfirmationDialog("Hapus Chat Ini?", "Tindakan ini tidak dapat diurungkan.");
    chatSessions = chatSessions.filter((session) => session.id !== idToDelete);
    saveAllChatSessions();
    if (currentChatId === idToDelete) {
      // If the deleted chat was the current one, load a new empty chat or the first available
      if (chatSessions.length > 0) {
        loadChatSession(chatSessions[0].id); // Load the first existing chat
      } else {
        createNewChatSession(); // Create a brand new session if none left
      }
    }
    renderChatHistoryList(); // Re-render the list after deletion
    showToast("Chat berhasil dihapus.");
  } catch (error) {
    console.log("Deletion cancelled or error:", error);
    showToast("Penghapusan chat dibatalkan.");
  }
}

// Function to add loading animation styles
// HAPUS SEMUA BLOK INI DARI FILE JAVASCRIPT ANDA
function addLoadingAnimationStyles() {
  // Check to prevent styles from being added repeatedly
  if (document.getElementById("loading-animation-styles")) return;

  const styleSheet = document.createElement("style");
  styleSheet.id = "loading-animation-styles";
  styleSheet.textContent = ` ... (dan semua isinya) ... `;
  document.head.appendChild(styleSheet);
}

// Call this function once when the script loads
addLoadingAnimationStyles();

// File Preview Logic for Multi-Type Files (including PDF and DOCX)
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
      dataURL: null, // Only for images
      extractedText: null, // For PDF/DOCX
      isUrl: false, // Mark whether this is from a URL
    };

    createPreviewElement(fileObject);
    // Only extract content for non-images (PDF, DOCX)
    if (!fileObject.type.startsWith("image/")) {
      extractFileContent(fileObject);
    } else {
      // For images, read as data URL for display
      const reader = new FileReader();
      reader.onload = (e) => {
        fileObject.dataURL = e.target.result;
        // Update existing preview element if needed
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
 * Adds a URL to the preview list and attempts to fetch and extract its content.
 * @param {string} urlString - The URL to process.
 */
async function addUrlToPreview(urlString) {
  const maxFiles = 10;
  if (selectedFiles.length >= maxFiles) {
    showToast(`Maksimal ${maxFiles} file tercapai.`);
    return;
  }

  // [Fix]: Basic URL validation
  try {
    new URL(urlString); // Will throw an error if URL is invalid
  } catch (e) {
    showToast(`URL tidak valid: ${urlString}`);
    console.error("Invalid URL:", urlString, e);
    return;
  }

  // Ensure URL is not already in selectedFiles to avoid duplication
  if (selectedFiles.some((f) => f.isUrl && f.originalUrl === urlString)) {
    showToast(`URL ini sudah ditambahkan: ${urlString}`);
    return;
  }

  const fileId = "file-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
  const fileName = urlString.substring(urlString.lastIndexOf("/") + 1) || "url_content";
  let fileType = "application/octet-stream"; // Default unknown type

  // Detect file type based on heuristics
  if (/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(urlString)) {
    fileType = "image/" + urlString.match(/\.(jpg|jpeg|png|gif|webp)/i)[1].replace("jpg", "jpeg");
  } else if (/\.pdf(\?.*)?$/i.test(urlString)) {
    fileType = "application/pdf";
  } else if (/\.(doc|docx)(\?.*)?$/i.test(urlString)) {
    fileType = "application/msword";
  } else if (urlString.includes("youtube.com/watch") || urlString.includes("youtu.be/")) {
    fileType = "video/youtube";
  } else {
    fileType = "text/html"; // Assume default for regular web links
  }

  const fileObject = {
    id: fileId,
    file: null, // No actual File object for URL
    type: fileType,
    name: fileName,
    dataURL: null, // For images from URL
    extractedText: null, // For text from URL
    isUrl: true, // Mark this as from a URL
    originalUrl: urlString, // Store the original URL
  };

  createPreviewElement(fileObject);
  selectedFiles.push(fileObject);
  updateFileInput();

  // Fetch URL content via proxy
  showToast(`Mencoba memproses URL: ${urlString}`);
  try {
    const response = await fetch(`${PROXY_SERVER_URL}?url=${encodeURIComponent(urlString)}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Failed to fetch content from URL (${response.status}): ${errorData.message || response.statusText}`);
    }

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
      fileObject.extractedText = `URL Video YouTube: ${urlString}`;
      showToast(`Mendeteksi URL YouTube. AI akan menerima URL video.`);
    } else if (fileObject.type === "text/html") {
      const textContent = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(textContent, "text/html");

      let mainContent = "";
      const articleElement = doc.querySelector("article, main, #main-content, .content, .post-content");
      if (articleElement) {
        mainContent = articleElement.textContent;
      } else {
        mainContent = doc.body.textContent || doc.documentElement.textContent;
      }

      fileObject.extractedText = mainContent.replace(/\s+/g, " ").trim().substring(0, 5000);

      if (fileObject.extractedText) {
        showToast(`Teks dari URL web berhasil diekstrak (${fileObject.extractedText.length} karakter).`);
      } else {
        showToast(`Tidak ada teks yang jelas ditemukan dari URL web.`);
      }
    } else {
      fileObject.extractedText = `[Konten URL tidak dapat diproses: ${urlString}]`;
      showToast(`Tipe konten URL tidak didukung untuk ekstraksi teks: ${fileObject.type}. URL akan dikirim sebagai tautan.`);
    }
  } catch (error) {
    console.error("Failed to process URL:", error);
    showToast(`Failed to process URL ${urlString}: ${error.message}`);
    fileObject.extractedText = `[Error: Failed to process URL ${urlString}. ${error.message}]`;
  }
}

function createPreviewElement(fileObject) {
  const wrapper = document.createElement("div");
  wrapper.className = "preview-item";
  wrapper.setAttribute("data-file-id", fileObject.id);
  wrapper.title = fileObject.name;

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "preview-remove-btn";
  closeBtn.innerHTML = "×";
  closeBtn.onclick = () => {
    wrapper.remove();
    selectedFiles = selectedFiles.filter((f) => f.id !== fileObject.id);
    updateFileInput();
  };

  if (fileObject.type.startsWith("image/")) {
    const img = document.createElement("img");
    img.alt = fileObject.name;
    wrapper.appendChild(img);
  } else if (fileObject.type === "video/youtube") {
    wrapper.classList.add("preview-item-doc");
    const icon = document.createElement("span");
    icon.className = "material-icons";
    icon.textContent = "ondemand_video";
    wrapper.style.backgroundColor = "#FF0000";
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
      icon.textContent = "link";
      wrapper.style.backgroundColor = "#0288D1";
    } else {
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
        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
        text = result.value;
      }
      fileObject.extractedText = text.trim();
      if (text) showToast(`Teks dari ${fileObject.name} berhasil diekstrak.`);
    } catch (error) {
      console.error("Failed to extract text:", error);
      showToast(`Failed to process file ${fileObject.name}.`);
      fileObject.extractedText = `[Error: Failed to read file content ${fileObject.name}]`;
    }
  };
  if (!fileObject.type.startsWith("image/")) {
    reader.readAsArrayBuffer(fileObject.file);
  }
}

/**
 * Updates the list of files attached to the file input (for local files only).
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

const text = "Apakah ada yang bisa Digging bantu?";
let index = 0;

function typeWriter() {
  if (index === 0) {
    menufitur1.style.display = "flex";
    emptyMessage.textContent = "";
  }

  if (index < text.length) {
    emptyMessage.textContent += text.charAt(index);
    index++;
    // PERUBAHAN: Simpan ID timeout ke variabel global
    typewriterTimeoutId = setTimeout(typeWriter, 100);
  } else {
    menufiturawal.style.display = "flex";
    menufiturkedua.style.display = "flex";
    typewriterTimeoutId = null; // Reset saat animasi selesai
  }
}
// PERUBAHAN: Fungsi ini sekarang hanya mengatur tampilan layar kosong,
// tanpa memulai animasi secara otomatis.
// PERUBAHAN: Fungsi ini sekarang memeriksa izin sebelum menjalankan animasi
function initializeChatDisplay() {
  if (messages.length === 0) {
    // Bagian ini selalu berjalan untuk chat kosong: menyiapkan layar.
    emptyMessage.textContent = "";
    index = 0;
    menufitur1.style.display = "flex";
    menufiturawal.style.display = "none";
    menufiturkedua.style.display = "none";

    // Cek izin sebelum menjalankan animasi
    if (allowWelcomeAnimation) {
      typeWriter();
      allowWelcomeAnimation = false; // Reset izin setelah digunakan agar tidak berjalan lagi
    }
  } else {
    // Bagian ini berjalan jika chat memiliki pesan: menyembunyikan layar sambutan.
    menufitur1.style.display = "none";
    menufiturawal.style.display = "none";
    menufiturkedua.style.display = "none";
  }
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

/**
 * FUNGSI FINAL UNTUK MENGHILANGKAN menufitur1 SECARA TOTAL
 */
function stopWelcomeAnimation() {
  // Hentikan dulu timer animasi ketik jika masih berjalan
  if (typewriterTimeoutId) {
    clearTimeout(typewriterTimeoutId);
    typewriterTimeoutId = null;
  }

  // Cari elemen kontainer utama yang ingin kita hilangkan
  const welcomeContainer = document.getElementById("menufitur1");

  // Jika elemennya ada, tambahkan kelas "pamungkas" kita
  if (welcomeContainer) {
    welcomeContainer.classList.add("hilang-sepenuhnya");
  }
}

chatBox.addEventListener("scroll", () => {
  const threshold = 40;
  const distanceFromBottom = chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight;
  autoScrollEnabled = distanceFromBottom < threshold;
});

// PERUBAHAN: Event listener untuk "Chat Baru" sekarang secara eksplisit memulai animasi.
// PERUBAHAN: Event listener ini sekarang memberi "izin" untuk animasi berjalan
newChatBtn.addEventListener("click", () => {
  allowWelcomeAnimation = true; // Beri izin untuk animasi
  createNewChatSession(); // Jalankan fungsi untuk membuat chat baru
});

clearChatBtnn.addEventListener("click", () => {
  allowWelcomeAnimation = true; // Beri izin untuk animasi
  createNewChatSession(); // Jalankan fungsi untuk membuat chat baru
});

clearChatBtn.addEventListener("click", () => {
  allowWelcomeAnimation = true; // Beri izin untuk animasi
  createNewChatSession(); // Jalankan fungsi untuk membuat chat baru
});

// Event listeners for clearing chat (now handles deletion of current session)
//clearChatBtn.addEventListener("click", () => deleteChatSession(currentChatId));

/**
 * Fungsi untuk mendeteksi URL dalam teks dan mengubahnya menjadi tautan HTML yang bisa diklik.
 * @param {string} text - Teks masukan yang mungkin mengandung URL.
 * @returns {string} - Teks dengan URL yang sudah diubah menjadi tautan HTML.
 */
function makeLinksClickable(text) {
  // Regular Expression untuk mendeteksi URL (http atau https) diikuti oleh karakter non-spasi
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Mengganti setiap URL yang terdeteksi dengan tag <a> HTML
  const clickableText = text.replace(urlRegex, (url) => {
    // Memastikan tautan terbuka di tab baru dan aman
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:rgb(49, 117, 180); text-decoration: underline; font-weight: bold;">${url}</a>`;
  });

  return clickableText;
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // 1. Hentikan animasi selamat datang jika masih berjalan
  stopWelcomeAnimation();

  let userText = chatInput.value.trim();
  const lowerCaseUserText = userText.toLowerCase();

  // 2. Tandai jika ini adalah pesan pertama. Variabel ini akan kita gunakan nanti.
  const isFirstMessage = messages.length === 0;

  // --- Logika untuk membuat sesi chat baru di riwayat ---
  let isNewSession = false;
  if (!chatSessions.some((s) => s.id === currentChatId)) {
    const newSession = {
      id: currentChatId,
      title: "Percakapan Baru",
      messages: [],
      createdAt: Date.now(),
    };
    chatSessions.unshift(newSession);
    isNewSession = true;
  }

  // Set judul chat berdasarkan pesan pertama
  if (isFirstMessage && userText) {
    updateCurrentChatTitle(userText);
  }

  // --- Penanganan kasus khusus "berikan aku aplikasi cerito ke bae" ---
  if (lowerCaseUserText === "#ceritokebae") {
    appendMessage("user", userText, "You", "https://cdn-icons-png.flaticon.com/512/1077/1077114.png", [], false);
    messages.push({ role: "user", content: userText, files: [], id: generateUniqueId() });

    const currentSession = chatSessions.find((s) => s.id === currentChatId);
    if (currentSession) {
      currentSession.messages = [...messages];
      saveAllChatSessions();
    }
    if (isNewSession) renderChatHistoryList();

    isLoading = true;
    appendLoadingMessage();
    await new Promise((resolve) => setTimeout(resolve, 1500));
    removeLoadingMessage();

    const botReplyText = `Tentu, ini aplikasi "Cerito Ke Bae" yang bisa kamu unduh:\n**Nama File:** CeritoKeBae.apk\n**Ukuran:** 12 MB\n**Status:** Terverifikasi\n**Link:** https://www.upload-apk.com/6quo8GQxRgHNVqe`;
    const downloadFileName = "CeritoKeBae.apk";
    const downloadFileUrl = "https://www.upload-apk.com/6quo8GQxRgHNVqe"; // Ganti dengan URL unduhan sebenarnya
    const downloadLogoUrl = "https://firebasestorage.googleapis.com/v0/b/website-putra.appspot.com/o/icons8-download-96.png?alt=media&token=c26ee380-f3ec-45f9-960e-81bc69e0624b";

    const clickableBotReplyText = makeLinksClickable(botReplyText);

    appendMessage("bot", clickableBotReplyText, "AI Digging", "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_232210.png?alt=media&token=dc5a0b3a-f869-432a-82a2-c27b32eca77f");
    // Pastikan fungsi appendDownloadButton sudah didefinisikan di tempat lain
    if (typeof appendDownloadButton === "function") {
      appendDownloadButton(downloadFileName, downloadFileUrl, downloadLogoUrl);
    }

    messages.push({ role: "assistant", content: botReplyText, files: [], id: generateUniqueId() });
    if (currentSession) {
      currentSession.messages = [...messages];
      saveAllChatSessions();
    }

    chatInput.value = "";
    chatInput.style.height = "auto";
    preview.innerHTML = "";
    selectedFiles = [];
    updateFileInput();
    isLoading = false;
    chatInput.disabled = false;

    // Jika ini pesan pertama, langsung ubah layout ke atas setelah selesai.
    if (isFirstMessage) {
      chatBox.classList.add("align-top");
    }
    return;
  }

  // --- Logika utama untuk mengirim pesan ke AI ---
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const foundUrls = userText.match(urlRegex);

  if ((!userText && selectedFiles.length === 0 && !foundUrls) || isLoading) {
    showToast("Mohon masukkan pesan, URL, atau lampirkan file.");
    return;
  }

  if (foundUrls && foundUrls.length > 0) {
    for (const url of foundUrls) {
      userText = userText.replace(url, "").trim();
      await addUrlToPreview(url);
    }
  }

  const filesForDisplay = selectedFiles.map((f) => ({ id: f.id, name: f.name, type: f.type, dataURL: f.dataURL, originalUrl: f.originalUrl, isUrl: f.isUrl, extractedText: f.extractedText }));

  const currentUserParts = [];
  if (userText) {
    currentUserParts.push({ text: userText });
  }

  // Tambahkan gambar yang dipilih pengguna sebagai inline_data
  selectedFiles
    .filter((f) => f.type.startsWith("image/") && f.dataURL)
    .forEach((file) => {
      const mimeType = file.type;
      const base64Data = file.dataURL.substring(file.dataURL.indexOf(",") + 1);
      currentUserParts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
    });

  // Tambahkan teks yang diekstrak dari file/URL lainnya
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
    showToast("Tidak ada konten yang dapat dikirim ke AI.");
    return;
  }

  // Tampilkan pesan user di UI
  appendMessage("user", userText, "You", "https://cdn-icons-png.flaticon.com/512/1077/1077114.png", filesForDisplay, false);
  messages.push({ role: "user", content: userText, files: filesForDisplay, id: generateUniqueId() });

  const currentSessionAfterUserMsg = chatSessions.find((s) => s.id === currentChatId);
  if (currentSessionAfterUserMsg) {
    currentSessionAfterUserMsg.messages = [...messages];
    saveAllChatSessions();
  }
  if (isNewSession) renderChatHistoryList();

  chatInput.value = "";
  chatInput.style.height = "auto";
  if (window.innerWidth >= 768) {
    chatInput.focus();
  } else {
    chatInput.blur();
  }
  preview.innerHTML = "";
  selectedFiles = [];
  updateFileInput();

  // Tampilkan animasi loading bot
  isLoading = true;
  appendLoadingMessage();

  try {
    // --- Proses memanggil API Gemini ---
    const historyContents = messages.slice(0, -1).map((msg) => {
      const parts = [];
      if (msg.content) {
        parts.push({ text: msg.content });
      }
      // Tambahkan file (gambar/teks dari file lain) dari riwayat ke 'parts'
      if (msg.files && msg.files.length > 0) {
        msg.files.forEach((file) => {
          if (file.type && file.type.startsWith("image/") && file.dataURL) {
            const mimeType = file.type;
            const base64Data = file.dataURL.substring(file.dataURL.indexOf(",") + 1);
            parts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
          } else if (file.extractedText) {
            parts.push({ text: `Konten dari ${file.isUrl ? "URL" : "file"} "${file.name || file.originalUrl}":\n${file.extractedText}` });
          }
        });
      }
      return { role: msg.role, parts: parts.length > 0 ? parts : [{ text: "" }] }; // Pastikan 'parts' tidak kosong
    });

    const finalContents = [...historyContents, { role: "user", parts: currentUserParts }];

    const requestBody = {
      contents: finalContents,
      // Kembali menambahkan systemInstruction karena gemini-1.5-flash mendukungnya
      systemInstruction: { parts: [{ text: "You are AI Digging. A helpful and smart assistant. If asked to create an image, you should respond with a description of the image, as I cannot directly generate images for you." }] },
      // ^ Ganti instruksi sistem ini jika Anda ingin AI merespons cara lain terkait gambar.
    };

    // PASTIKAN API KEY INI ADALAH API KEY DARI GOOGLE AI STUDIO (GEMINI)
    const apiKey = "AIzaSyBe6EkfS-eVWMOQalm2TpxL6ljGBC2z9dI"; // GANTI DENGAN API KEY ANDA YANG SESUNGGUHNYA
    // MENGGUNAKAN MODEL GENERATIF YANG STABIL DAN SERBAGUNA
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const candidates = data.candidates?.[0]?.content?.parts;

    let botReplyText = "";
    let botReplyFiles = []; // Array untuk menyimpan gambar yang dikirim oleh bot

    if (candidates && candidates.length > 0) {
      candidates.forEach((part) => {
        if (part.text) {
          botReplyText += part.text.trim() + "\n";
        } else if (part.inline_data && part.inline_data.mime_type.startsWith("image/")) {
          // Jika bot mengirim gambar (inline_data) - Gemini 1.5 Flash TIDAK langsung mengembalikan gambar ini tanpa Tooling
          // Ini adalah fallback untuk berjaga-jaga jika ada perilaku yang tidak biasa, atau jika Anda mengintegrasikan API gambar di masa mendatang.
          botReplyFiles.push({
            id: generateUniqueId(),
            name: "AI Generated Image",
            type: part.inline_data.mime_type,
            dataURL: `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`,
            isUrl: false,
            extractedText: null,
          });
        }
      });
      botReplyText = botReplyText.trim();
    } else {
      botReplyText = "Maaf, saya tidak bisa memberikan respons saat ini.";
    }

    // Hapus animasi loading
    removeLoadingMessage();

    // Tampilkan respons bot (teks dan gambar)
    appendMessage("bot", botReplyText, "AI Digging", "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_232210.png?alt=media&token=dc5a0b3a-f869-432a-82a2-c27b32eca77f", botReplyFiles);

    // Simpan pesan bot ke riwayat (termasuk informasi file)
    messages.push({ role: "assistant", content: botReplyText, files: botReplyFiles, id: generateUniqueId() });

    const currentSessionAfterBotMsg = chatSessions.find((s) => s.id === currentChatId);
    if (currentSessionAfterBotMsg) {
      currentSessionAfterBotMsg.messages = [...messages];
      saveAllChatSessions();
    }
  } catch (err) {
    console.error("API Error:", err);
    removeLoadingMessage();
    const errorMessage = err.message || "Terjadi kesalahan saat menghubungi server.";
    appendMessage("bot", errorMessage, "AI Digging", "https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_232210.png?alt=media&token=dc5a0b3a-f869-432a-82a2-c27b32eca77f");
    messages.push({ role: "assistant", content: errorMessage, files: [], id: generateUniqueId() });

    const currentSessionOnError = chatSessions.find((s) => s.id === currentChatId);
    if (currentSessionOnError) {
      currentSessionOnError.messages = [...messages];
      saveAllChatSessions();
    }
  } finally {
    isLoading = false;
    chatInput.disabled = false;

    // Jika ini pesan pertama, ubah layout ke atas setelah selesai.
    if (isFirstMessage) {
      chatBox.classList.add("align-top");
    }
  }
});

function saveMessagesToStorage() {
  // This function is now redundant as messages are saved via `saveAllChatSessions`
  // when `currentSession.messages` is updated.
  // We keep it empty for now to avoid breaking existing calls, but its functionality is handled.
}

function loadMessagesFromStorage() {
  // This function is now redundant.
  // The initial loading is handled by `loadAllChatSessions` and `loadChatSession`.
  // Its functionality is now integrated into `loadChatSession(id)`.
  // We keep it empty for now to avoid breaking existing calls.
}

// The `clearChat` function is now handled by `deleteChatSession(currentChatId)`.
// The calls to `clearChatBtn.addEventListener("click", clearChat);` and
// `clearChatBtnn.addEventListener("click", clearChat);`
// have been updated to call `deleteChatSession(currentChatId)` directly.
// The `clearChatBtnnn` is now `newChatBtn` and its event listener is for `createNewChatSession`.

async function clearChat() {
  // This function is now deprecated. Its logic is split between
  // createNewChatSession and deleteChatSession.
  console.warn("clearChat() is deprecated. Use createNewChatSession() or deleteChatSession() instead.");
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
  // This function now only checks the current session's messages
  const hasMessages = messages.length > 0;
  if (hasMessages) {
    menufitur1.style.display = "none";
  } else {
    menufitur1.style.display = "flex";
  }
}

// --- NEW FUNCTION FOR LIKE/UNLIKE ---
function getMessageLikeStatus(messageId) {
  const status = localStorage.getItem(`message_like_status_${messageId}`);
  return status ? JSON.parse(status) : { liked: false, disliked: false };
}

function saveMessageLikeStatus(messageId, status) {
  localStorage.setItem(`message_like_status_${messageId}`, JSON.stringify(status));
}
// --- END OF NEW FUNCTION FOR LIKE/UNLIKE ---

/**
 * NEW HELPER FUNCTION
 * Creates and adds all action buttons (Copy, Speak, Share, Like, Unlike)
 * to a bot message element.
 * @param {HTMLElement} messageEl - The message <div> element where buttons will be added.
 * @param {string} text - The text content of the message to copy, speak, or share.
 * @param {string} messageId - Unique ID of the message for Like/Unlike status.
 */
function addBotActionButtons(messageEl, text, messageId) {
  if (!text) return; // Don't add buttons if bot message has no text

  // Define all icons to be used
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

  // --- Copy Button ---
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

  // --- Speak Button ---
  const speakBtn = document.createElement("button");
  speakBtn.title = "Dengarkan";
  speakBtn.innerHTML = icons.speak;
  speakBtn.onclick = () => {
    if (!("speechSynthesis" in window)) {
      showToast("Fitur suara tidak didukung browser ini.");
      return;
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      return;
    }
    const cleanedText = text
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
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

  // --- Share Button ---
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

  // --- Like Button ---
  const likeBtn = document.createElement("button");
  likeBtn.title = "Suka";
  const messageStatus = getMessageLikeStatus(messageId);
  likeBtn.innerHTML = messageStatus.liked ? icons.liked : icons.like;
  likeBtn.onclick = () => {
    const currentStatus = getMessageLikeStatus(messageId);
    const isLiked = !currentStatus.liked;
    saveMessageLikeStatus(messageId, { liked: isLiked, disliked: false });
    likeBtn.innerHTML = isLiked ? icons.liked : icons.like;
    unlikeBtn.innerHTML = icons.unlike; // Always reset unlike button
  };
  buttonContainer.appendChild(likeBtn);

  // --- Unlike Button ---
  const unlikeBtn = document.createElement("button");
  unlikeBtn.title = "Tidak Suka";
  unlikeBtn.innerHTML = messageStatus.disliked ? icons.unliked : icons.unlike;
  unlikeBtn.onclick = () => {
    const currentStatus = getMessageLikeStatus(messageId);
    const isDisliked = !currentStatus.disliked;
    saveMessageLikeStatus(messageId, { liked: false, disliked: isDisliked });
    unlikeBtn.innerHTML = isDisliked ? icons.unliked : icons.unlike;
    likeBtn.innerHTML = icons.like; // Always reset like button
  };
  buttonContainer.appendChild(unlikeBtn);

  // General styling for all buttons within the container
  buttonContainer.querySelectorAll("button").forEach((btn) => {
    Object.assign(btn.style, { background: "transparent", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center", opacity: "0.7" });
    btn.onmouseenter = () => (btn.style.opacity = "1");
    btn.onmouseleave = () => (btn.style.opacity = "0.7");
  });

  messageEl.appendChild(buttonContainer);
}

// =================================================================================
// MAIN APPENDMESSAGE FUNCTION (FINAL VERSION WITH TEXT FIXES & IMAGE ALIGNMENT)
// =================================================================================
function appendMessage(sender, text, username, profileUrl, files = [], isHistory = false, messageId = null) {
  // If no messageId is provided, generate a new one. This is crucial for history tracking.
  messageId = messageId || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const container = document.createElement("div");
  container.className = `message-container ${sender} message-fade-in`;
  container.setAttribute("data-message-id", messageId); // Set data-attribute for message ID

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
  messageEl.style.position = "relative"; // Needed for action buttons positioning

  // Force the text bubble to have its own max-width to prevent stretching.
  messageEl.style.maxWidth = "100%";

  // For user messages, ensure the bubble sticks to the right.
  if (sender === "user") {
    messageEl.style.marginLeft = "auto";
  }

  content.appendChild(messageEl);

  // Add padding-bottom for bot messages to accommodate action buttons
  if (sender === "bot" && text) {
    messageEl.style.paddingBottom = "36px";
  }

  // Handle files attached to the message
  if (files && files.length > 0) {
    const filesContainer = document.createElement("div");
    filesContainer.className = "message-files-container";

    const imageFiles = files.filter((f) => f.type && f.type.startsWith("image/"));
    const otherFiles = files.filter((f) => !f.type || !f.type.startsWith("image/"));

    // Render image files
    if (imageFiles.length > 0) {
      const imageGrid = document.createElement("div");
      imageGrid.className = "message-image-grid";

      Object.assign(imageGrid.style, {
        display: "flex",
        overflowX: "auto",
        maxWidth: "100%",
        padding: "2px",
        gap: "5px", // Space between images
      });

      // Align single image to the right for user messages
      if (sender === "user" && imageFiles.length === 1) {
        imageGrid.style.justifyContent = "flex-end";
      } else if (sender === "bot" && imageFiles.length === 1) {
        // Align single image to the left for bot messages
        imageGrid.style.justifyContent = "flex-start";
      }

      // Push the entire filesContainer to the right for user messages
      if (sender === "user") {
        Object.assign(filesContainer.style, {
          marginLeft: "auto",
        });
      }

      imageFiles.forEach((file) => {
        if (file.dataURL) {
          const imgWrapper = document.createElement("div");
          imgWrapper.className = "message-image-wrapper";
          Object.assign(imgWrapper.style, {
            flexShrink: "0", // Prevent image from shrinking
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

          // Modal for image preview on click
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

    // Render non-image files (documents, videos, etc.)
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
        } else if (file.type === "text/html" || file.isUrl) {
          // Generic URL
          icon.textContent = "link";
          docTag.style.backgroundColor = "#0288D1";
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

    content.insertBefore(filesContainer, messageEl); // Insert files container before the message text element
  }

  // Handle message text content
  const textContentDiv = document.createElement("div");
  if (text) {
    messageEl.appendChild(textContentDiv);
  }

  if (sender === "user") {
    // For user messages, directly set innerHTML after escaping, no animation
    textContentDiv.innerHTML = escapeHtml(text).replace(/\n/g, "<br>"); // Replace newlines with <br> for display
  } else {
    // For bot messages, use renderMessageContent for animation, markdown, code blocks, etc.
    const onRenderFinish = () => {
      addBotActionButtons(messageEl, text, messageId); // Add action buttons after rendering
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
    // If not from history, animate the text. Otherwise, render instantly.
    renderMessageContent(textContentDiv, text, !isHistory, onRenderFinish);
  }

  chatBox.appendChild(container); // Add the complete message container to chatBox
  if (autoScrollEnabled) chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll if enabled
  checkChatEmpty(); // Update empty chat message visibility
}

function highlightCode(code) {
  return code.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
}

/*
// The old typeText function has been replaced by renderMessageContent.
// If you still have calls to typeText elsewhere, you should change them to renderMessageContent.
// However, if you are indeed still using typeText for some reason,
// note that this function will not handle file separation
// because that is the job of appendMessage.
async function typeText(element, rawText, delay = 10, onFinish = () => {}) {
    element.innerHTML = ""; // Clear target element

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
                await new Promise((r) => setTimeout(r, 5)); // Faster code animation
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
  profileImg.src =
    "[https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_232210.png?alt=media&token=dc5a0b3a-f869-432a-82a2-c27b32eca77f](https://firebasestorage.googleapis.com/v0/b/renvonovel.appspot.com/o/20250526_232210.png?alt=media&token=dc5a0b3a-f869-432a-82a2-c27b32eca77f)";
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

  let html = text;

  // Horizontal rule
  html = html.replace(/---/g, '<hr class="md-hr"/>');

  // Headers (order: H3, H2, H1)
  html = html.replace(/^###\s*(.*?)(\n|$)/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s*(.*?)(\n|$)/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s*(.*?)(\n|$)/gm, "<h1>$1</h1>");

  // Lists (basic - unordered)
  html = html.replace(/^\s*([*-+])\s+(.*)/gm, "<li>$2</li>");
  html = html.replace(/((?:<li>.*?<\/li>\s*)+)/gs, "<ul>$1</ul>");

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");
  // Italic
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");
  // Strikethrough
  html = html.replace(/~~(.*?)~~/g, "<del>$1</del>");

  // Inline Code
  html = html.replace(/`([^`]+)`/g, `<code class="md-inline-code">$1</code>`);

  // Links (basic)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Paragraphs and Line Breaks
  html = html.replace(/\n\n/g, "__PARAGRAPH_BREAK__");
  html = html.replace(/\n/g, "<br>");
  html = html.replace(/__PARAGRAPH_BREAK__/g, "</p><p>");

  if (!/^\s*<(h[1-6]|ul|ol|table|div|hr|pre|p)\b/i.test(html.trim())) {
    html = `<p>${html}</p>`;
  }

  // Remove empty paragraphs
  html = html.replace(/<p><\/p>/g, "");
  html = html.replace(/<p>\s*<br>\s*<\/p>/g, "");

  return html;
}

// --- NEW FUNCTION: parseMarkdownTable (specifically for table conversion) ---
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
      // Ensure number of cells matches number of headers
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
// --- END OF NEW parseMarkdownTable FUNCTION ---

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
                <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <path d="M16 4H8a2 2 0 0 0-2 2v12m2-2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                </svg>
                <span>Copy</span>
                `;

    copyBtn.onclick = () => {
      navigator.clipboard
        .writeText(code.textContent)
        .then(() => {
          if (typeof showToast !== "undefined") {
            showToast("Kode tersalin!");
          }
        })
        .catch((err) => console.error("Failed to copy code:", err));
    };

    toolbar.appendChild(label);
    toolbar.appendChild(copyBtn);
    wrapper.insertBefore(toolbar, pre);
  });
}

/**
 * Renders raw content from the bot (text, markdown, tables, code, diagrams) into the target element.
 * @param {HTMLElement} element - The target div element to be filled with content.
 * @param {string} rawText - The raw text from the AI.
 * @param {boolean} isAnimated - If true, content will be animated (typing effect).
 * @param {function} onFinish - Callback function to be executed after rendering is complete.
 */
async function renderMessageContent(element, rawText, isAnimated = false, onFinish = () => {}) {
  // Always clear the target element before rendering new content
  element.innerHTML = "";

  // Set animation delay. Reduced delay for a faster experience.
  const animationDelay = isAnimated ? 5 : 0; // Changed from 10ms to 5ms

  /**
   * Parses raw text into segments (text, code blocks, tables).
   * @param {string} text - The raw text to parse.
   * @returns {Array<Object>} - An array of segment objects.
   */
  const parseContentIntoSegments = (text) => {
    const segments = [];
    // Regex to capture code blocks (```) or markdown tables
    const blockRegex = /(```[\s\S]*?```)|(^\|.+\|\s*\r?\n^\|[ |:\-]*-[ |:\-]*\|\s*\r?\n(?:^\|.*\|\s*\r?\n?)*)/gm;
    let lastIndex = 0;
    let match;

    while ((match = blockRegex.exec(text)) !== null) {
      // Add text segment before the found block
      if (match.index > lastIndex) {
        segments.push({ type: "text", content: text.slice(lastIndex, match.index) });
      }

      // If it's a code block (match[1])
      if (match[1]) {
        const codeBlock = match[1];
        const filenameMatch = codeBlock.match(/```(.*?)\n/);
        // Extract language/filename, default to 'code' if none
        const language = filenameMatch ? filenameMatch[1].trim().toLowerCase() : "code";
        const codeContent = codeBlock
          .replace(/```(.*?)\n/, "") // Remove opening ```language line
          .replace(/```$/, "") // Remove closing ``` line
          .trim();
        segments.push({ type: "code", language, content: codeContent });
      }
      // If it's a table (match[2])
      else if (match[2]) {
        segments.push({ type: "table", content: match[2] });
      }
      lastIndex = blockRegex.lastIndex;
    }

    // Add remaining text after the last block (if any)
    if (lastIndex < text.length) {
      segments.push({ type: "text", content: text.slice(lastIndex) });
    }
    return segments;
  };

  /**
   * Recursive function to animate adding nodes to the DOM.
   * Used for typing effect on plain text.
   * @param {Node} node - The DOM node to animate.
   * @param {HTMLElement} parentElement - The parent element where the node will be added.
   */
  const animateTextNodeContent = async (node, parentElement) => {
    for (const childNode of Array.from(node.childNodes)) {
      if (childNode.nodeType === Node.TEXT_NODE) {
        // Animate text character by character
        for (const char of childNode.textContent) {
          parentElement.appendChild(document.createTextNode(char));
          // Ensure chatBox and autoScrollEnabled are defined globally
          if (typeof autoScrollEnabled !== "undefined" && autoScrollEnabled && typeof chatBox !== "undefined") {
            chatBox.scrollTop = chatBox.scrollHeight;
          }
          if (isAnimated) {
            await new Promise((resolve) => setTimeout(resolve, animationDelay));
          }
        }
      } else if (childNode.nodeType === Node.ELEMENT_NODE) {
        // Create new element and recursively animate its content
        const newElement = document.createElement(childNode.tagName);
        // Copy all attributes from the original node to the new element (important for markdown styling)
        Array.from(childNode.attributes).forEach((attr) => {
          newElement.setAttribute(attr.name, attr.value);
        });
        parentElement.appendChild(newElement);
        await animateTextNodeContent(childNode, newElement);
      }
    }
  };

  /**
   * Renders a code block with a header, copy button, and syntax highlighting.
   * @param {HTMLElement} parentElement - The element where the code block will be added.
   * @param {Object} codeSegment - The code segment object { type, language, content }.
   */
  const renderCodeBlock = async (parentElement, codeSegment) => {
    const { language, content } = codeSegment;

    // Special handling for Mermaid and text-based diagrams
    if (language === "mermaid") {
      const mermaidDiv = document.createElement("div");
      mermaidDiv.className = "mermaid";
      mermaidDiv.textContent = content;
      parentElement.appendChild(mermaidDiv);
      // mermaid.init() or mermaid.run() needs to be called after all rendering is done.
    } else if (language === "diagram" || language === "flowchart") {
      const pre = document.createElement("pre");
      pre.className = "text-diagram"; // Use class for styling
      pre.textContent = content;
      parentElement.appendChild(pre);
    } else {
      // Standard code block rendering
      const wrapper = document.createElement("div");
      wrapper.className = "code-wrapper"; // Class for CSS styling
      Object.assign(wrapper.style, {
        backgroundColor: "#1e1e1e",
        fontFamily: "'Source Code Pro', monospace",
        margin: "16px 0", // Better vertical spacing
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #333", // Border for clearer display
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)", // Slight shadow
      });

      const header = document.createElement("div");
      header.className = "code-header"; // Class for CSS styling
      Object.assign(header.style, {
        display: "flex",
        alignItems: "center",
        padding: "8px 12px", // Header padding
        borderBottom: "1px solid #333",
        backgroundColor: "#252526",
        color: "#ccc",
        fontWeight: "600",
        fontSize: "0.9em",
      });

      const label = document.createElement("span");
      label.textContent = language.toUpperCase(); // Make language label more prominent
      label.className = "code-language-label"; // Class for CSS styling

      const copyBtn = document.createElement("button");
      copyBtn.title = "Salin kode";
      copyBtn.innerHTML = `<img src="images/copy.png" alt="Copy" width="16" height="16" />`;
      copyBtn.className = "copy-code-btn"; // Class for CSS styling
      Object.assign(copyBtn.style, {
        background: "none",
        border: "none",
        cursor: "pointer",
        marginLeft: "auto",
        padding: "4px",
        borderRadius: "4px",
        transition: "background-color 0.2s ease", // Hover effect
      });
      copyBtn.onmouseover = () => (copyBtn.style.backgroundColor = "#444");
      copyBtn.onmouseout = () => (copyBtn.style.backgroundColor = "transparent");

      copyBtn.onclick = () => {
        navigator.clipboard
          .writeText(content)
          .then(() => {
            if (typeof showToast !== "undefined") {
              showToast("Kode tersalin!");
            }
          })
          .catch((err) => console.error("Failed to copy code:", err));
      };

      header.append(label, copyBtn);

      const pre = document.createElement("pre");
      pre.className = "code-content-pre"; // Class for CSS styling
      Object.assign(pre.style, {
        margin: "0",
        padding: "12px 16px", // Code content padding
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
        color: "#f8f8f2", // Code text color (dark theme)
        fontSize: "0.9em",
        lineHeight: "1.5",
      });

      const codeEl = document.createElement("code");
      codeEl.className = `language-${language}`; // For syntax highlighting libraries like Prism.js
      pre.appendChild(codeEl);
      wrapper.append(header, pre);
      parentElement.appendChild(wrapper);

      // Animate or display code content directly
      if (isAnimated) {
        for (const char of content) {
          codeEl.textContent += char;
          if (typeof autoScrollEnabled !== "undefined" && autoScrollEnabled && typeof chatBox !== "undefined") {
            chatBox.scrollTop = chatBox.scrollHeight;
          }
          await new Promise((resolve) => setTimeout(resolve, 2)); // Faster code animation
        }
      } else {
        codeEl.textContent = content;
      }

      // Call syntax highlighter if available (e.g., Prism.js)
      if (typeof Prism !== "undefined") {
        Prism.highlightElement(codeEl);
      }
    }
  };

  // 1. Parse raw text into segments (text, code, table)
  const segments = parseContentIntoSegments(rawText);

  // 2. Render each segment
  for (const segment of segments) {
    if (segment.type === "text") {
      if (typeof parseMarkdown === "function") {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = parseMarkdown(segment.content);
        await animateTextNodeContent(tempDiv, element);
      } else {
        // Fallback if parseMarkdown is not available
        const textNode = document.createElement("p"); // Use <p> for text paragraphs
        textNode.textContent = segment.content;
        element.appendChild(textNode);
      }
    } else if (segment.type === "table") {
      if (typeof parseMarkdownTable === "function") {
        element.insertAdjacentHTML("beforeend", parseMarkdownTable(segment.content));
      } else {
        // Fallback if parseMarkdownTable is not available
        const pre = document.createElement("pre");
        pre.textContent = segment.content;
        element.appendChild(pre);
      }
    } else if (segment.type === "code") {
      await renderCodeBlock(element, segment);
    }

    // Scroll after each segment is rendered, if auto-scroll is enabled
    if (typeof autoScrollEnabled !== "undefined" && autoScrollEnabled && typeof chatBox !== "undefined") {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }

  // 3. Execute callback after all rendering is complete
  if (onFinish) {
    onFinish();
  }
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

  // Force the text bubble to have its own max-width to prevent stretching.
  messageEl.style.maxWidth = "100%";

  // For user messages, ensure the bubble sticks to the right.
  if (sender === "user") {
    messageEl.style.marginLeft = "auto";
  }

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

      Object.assign(imageGrid.style, {
        display: "flex",
        overflowX: "auto",
        maxWidth: "100%",
        padding: "2px",
      });

      // Align single image to the right for user messages
      if (sender === "user" && imageFiles.length === 1) {
        imageGrid.style.justifyContent = "flex-end";
      } else if (sender === "bot" && imageFiles.length === 1) {
        // Align single image to the left for bot messages
        imageGrid.style.justifyContent = "flex-start";
      }

      // Push the entire filesContainer to the right for user messages
      if (sender === "user") {
        Object.assign(filesContainer.style, {
          marginLeft: "auto",
        });
      }

      imageFiles.forEach((file) => {
        if (file.dataURL) {
          const imgWrapper = document.createElement("div");
          imgWrapper.className = "message-image-wrapper";
          Object.assign(imgWrapper.style, {
            flexShrink: "0",
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

    // Section for non-image files
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
    textContentDiv.innerHTML = escapeHtml(text).replace(/\n/g, "");
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

  // Penting: Pastikan teks input TIDAK di-HTML-escape sepenuhnya di sini
  // karena `renderMessageContent` atau `animateTextNodeContent` akan menangani
  // escaping karakter per karakter saat animasi, atau Anda ingin tag HTML yang
  // dihasilkan oleh parser markdown ini (seperti <strong>, <a>) tetap utuh.

  let html = text; // Mulai dengan teks mentah

  // 1. Tangani Block-level Elements (Header, List, Horizontal Rule) terlebih dahulu
  // Ini penting agar regex untuk inline tidak salah menginterpretasikan baris-baris ini.

  // Horizontal rule
  html = html.replace(/---/g, '<hr class="md-hr"/>'); // Tambahkan kelas untuk styling

  // Headers (perhatikan urutan: H3 dulu, baru H2, H1)
  html = html.replace(/^###\s*(.*?)(\n|$)/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s*(.*?)(\n|$)/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s*(.*?)(\n|$)/gm, "<h1>$1</h1>");

  // Lists (basic - unordered)
  // Ini akan mengidentifikasi item list dan membungkusnya dalam <li>
  // Kemudian, kelompokkan <li> yang berurutan ke dalam <ul>
  html = html.replace(/^\s*([*-+])\s+(.*)/gm, "<li>$2</li>"); // Ganti bullet point dengan <li>
  // Regex untuk membungkus <li> dalam <ul>. Ini cukup kompleks.
  // Untuk kasus sederhana, kita bisa asumsikan <li> berada di blok yang sama.
  // Pendekatan yang lebih robust:
  html = html.replace(/((?:<li>.*?<\/li>\s*)+)/gs, "<ul>$1</ul>");
  // `gs` flags: g for global (semua kecocokan), s for dotAll ('.' mencocokkan newline)

  // 2. Tangani Inline Elements
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");
  // Italic
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");
  // Strikethrough
  html = html.replace(/~~(.*?)~~/g, "<del>$1</del>");

  // Inline Code (pastikan konten di dalamnya tidak di-escape HTML oleh parser ini)
  // `code` adalah salah satu yang harus dihindari dari escapeHtml di sini
  html = html.replace(/`([^`]+)`/g, `<code class="md-inline-code">$1</code>`);

  // Links (dasar)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // 3. Tangani Paragraf dan Line Breaks
  // Ini adalah bagian kunci untuk mengontrol jarak.

  // Ganti SEMUA single newline yang TIDAK mengikuti tag block-level dengan <br>
  // Ini akan memastikan paragraf tidak dipisah oleh <br> dan hanya baris baru 'lembut' yang menggunakannya.
  // Penting: Ini dilakukan setelah block-level elements diubah.
  // Regex ini mencoba menghindari penambahan <br> di dalam tag blok atau setelah tag penutup blok.
  // Ini adalah tantangan umum di parser markdown sederhana.

  // Langkah pertama: Ganti semua double newline (yang menandakan paragraf baru) dengan placeholder unik
  // Lalu ganti semua single newline dengan <br> (kecuali yang di dalam kode block, tapi itu sudah ditangani oleh renderCodeBlock)
  // Kemudian ganti placeholder kembali ke </p><p>
  html = html.replace(/\n\n/g, "__PARAGRAPH_BREAK__"); // Ganti paragraf dengan placeholder
  html = html.replace(/\n/g, "<br>"); // Ganti baris baru tunggal dengan <br>
  html = html.replace(/__PARAGRAPH_BREAK__/g, "</p><p>"); // Kembalikan placeholder ke tag paragraf

  // 4. Bungkus seluruh konten dengan tag <p> jika belum ada tag block-level
  // Ini memastikan semua teks ada di dalam setidaknya satu paragraf.
  // Kita perlu memastikan tidak membungkus tag block-level yang sudah ada (h1, h2, ul, hr, dll.)
  // Cek apakah ada tag block-level di awal teks. Jika tidak, bungkus.
  if (!/^\s*<(h[1-6]|ul|ol|table|div|hr|pre|p)\b/i.test(html.trim())) {
    html = `<p>${html}</p>`;
  }

  // Hapus paragraf kosong yang mungkin muncul karena penggantian
  html = html.replace(/<p><\/p>/g, "");
  html = html.replace(/<p>\s*<br>\s*<\/p>/g, ""); // Hapus p yang hanya berisi br

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

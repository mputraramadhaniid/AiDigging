const apiKey = "AIzaSyBx2GodMWfLdIIRpVU6_A3HK8y1IpPCLZ4"; // GANTI DENGAN API KEY ANDA YANG SESUNGGUHNYA
// Menggunakan model gemini-1.5-flash-8b untuk teks dan visi
const geminiModelUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${apiKey}`;

const startBtn = document.getElementById("startBtn");
const exitBtn = document.getElementById("exitBtn");
const shareScreenBtn = document.getElementById("shareScreenBtn");
const chatbox = document.getElementById("chatbox");
const visualizer = document.getElementById("voiceVisualizer");

let recognition;
let micStream;
let displayStream;
let micMuted = false; // Mic dimulai dalam keadaan tidak muted
let isResponding = false;
let silenceTimer;
const SILENCE_TIMEOUT = 5000; // 5 detik

visualizer.innerHTML = "";

// Aura putih
const auraWhite = document.createElement("div");
Object.assign(auraWhite.style, {
  position: "absolute",
  top: "-6px",
  left: "-6px",
  width: "140px",
  height: "140px",
  borderRadius: "50%",
  background: "rgba(224, 229, 234, 0.6)",
  filter: "blur(8px)",
  pointerEvents: "none",
  zIndex: "-1",
  animation: "moveCloudWhite 8s ease-in-out infinite",
});
visualizer.appendChild(auraWhite);

// Aura biru
const auraBlue = document.createElement("div");
Object.assign(auraBlue.style, {
  position: "absolute",
  top: "-4px",
  left: "25px",
  width: "100px",
  height: "100px",
  borderRadius: "50%",
  background: "rgba(0, 170, 255, 0.5)",
  filter: "blur(6px)",
  pointerEvents: "none",
  zIndex: "-1",
  animation: "moveCloudBlue 6s ease-in-out infinite",
});
visualizer.appendChild(auraBlue);

// Animasi style
const style = document.createElement("style");
style.textContent = `
@keyframes moveCloudWhite {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(12px, 6px); }
}
@keyframes moveCloudBlue {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(-10px, -8px); }
}`;
document.head.appendChild(style);

const isAndroidMobile = /Android/i.test(navigator.userAgent) && /Mobile/i.test(navigator.userAgent);

function setupRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Browser tidak mendukung SpeechRecognition");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "id-ID";
  recognition.interimResults = false;
  recognition.continuous = isAndroidMobile ? false : true; // Tetap menggunakan logika Anda

  recognition.onresult = async (e) => {
    const text = e.results[e.results.length - 1][0].transcript.trim();
    if (text) {
      resetSilenceTimer();

      // PENTING: Pemicu analisis layar
      const analysisTriggers = ["analisis layar", "baca ini", "deskripsikan"];
      const isAnalysisCommand = analysisTriggers.some((trigger) => text.toLowerCase().includes(trigger));

      // Perbaikan: Jika continuous false (Android), hentikan pengenalan setelah mendapatkan hasil
      // Ini memberi kita kontrol penuh untuk memulai ulang (atau tidak)
      if (!recognition.continuous) {
        recognition.stop();
      }

      if (displayStream && isAnalysisCommand) {
        logChat("🧏 Kamu", text); // Log perintah analisis pengguna
        await takeScreenshotAndSendToAI(text); // Meneruskan teks pengguna ke fungsi screenshot
      } else {
        handleMicInput(text); // Handle input teks biasa
      }
    }
  };

  recognition.onerror = (e) => {
    console.error("Recognition error:", e.error);
    if (e.error === "not-allowed") {
      logChat("🤖 AI", "Akses mikrofon ditolak. Mohon izinkan mikrofon di pengaturan browser Anda.");
      alert("Akses mikrofon ditolak. Mohon izinkan mikrofon di pengaturan browser Anda.");
      stopMic(true); // Pastikan mic mati dan statusnya muted
      startBtn.disabled = true; // Nonaktifkan tombol start karena tidak bisa pakai mic
    } else if (!micMuted && !isResponding) {
      console.warn("Recognition error, trying to restart mic...", e.error);
      // Coba nyalakan kembali mic jika error bukan karena izin dan tidak sedang merespons
      startMic();
    }
  };

  recognition.onend = () => {
    // Perbaikan: Hanya restart mic jika tidak dimatikan secara manual dan tidak sedang merespons
    if (!micMuted && !isResponding) {
      console.log("Recognition ended, restarting mic for continuous listening.");
      // Untuk Android (continuous=false), kita perlu memanggil startMic() lagi secara eksplisit
      startMic();
    } else {
      console.log("Recognition ended, but mic is muted or AI is responding. Not restarting mic.");
    }
  };
}

async function initMic() {
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setupRecognition();
    startMic(); // Mulai mic otomatis saat init berhasil
  } catch (err) {
    console.error("Mic error:", err);
    alert("Tidak dapat mengakses mikrofon. Periksa izin browser.");
    startBtn.disabled = true;
    micMuted = true; // Pastikan micMuted jadi true jika gagal
    startBtn.querySelector("span").textContent = "mic_off"; // Tampilkan ikon mati
    logChat("🤖 AI", "Gagal menginisialisasi mikrofon. Periksa izin browser Anda.");
  }
}

function startMic() {
  if (micStream && recognition) {
    micMuted = false;
    micStream.getAudioTracks().forEach((track) => (track.enabled = true));
    try {
      recognition.start();
      console.log("Mic Started.");
      startBtn.querySelector("span").textContent = "mic"; // Pastikan ikon diperbarui
    } catch (e) {
      // Perbaikan: Tangani InvalidStateError jika recognition sudah aktif
      if (e.name === "InvalidStateError") {
        console.warn("Recognition already started or in an invalid state. Ignoring start command.");
        // Jika sudah aktif, tidak perlu melakukan apa-apa
      } else {
        console.error("Recognition start failed unexpectedly:", e);
        // Jika error tidak terduga, coba re-setup dan start
        setupRecognition(); // Re-setup untuk memastikan semua event listener terdaftar
        recognition.start();
      }
    }
    resetSilenceTimer();
  } else {
    console.warn("startMic() failed: micStream or recognition not initialized. Attempting initMic.");
    if (!micStream) {
      initMic(); // Coba inisialisasi ulang jika micStream belum ada
    }
  }
}

// Perbaikan: Parameter setMuted untuk mengontrol status micMuted
function stopMic(setMuted = true) {
  if (recognition) {
    recognition.stop();
    // Clear timeout secara eksplisit saat mic dihentikan
    clearTimeout(silenceTimer);
  }

  if (micStream) {
    micStream.getAudioTracks().forEach((track) => (track.enabled = false));
  }

  if (setMuted) {
    micMuted = true;
    startBtn.querySelector("span").textContent = "mic_off";
  }
  console.log(`Mic Stopped. micMuted: ${micMuted}`);
}

startBtn.onclick = async () => {
  if (!micStream) {
    await initMic();
    if (!micStream) return; // Jika initMic gagal, keluar
  }

  if (micMuted) {
    // Jika mic sedang muted, unmute (start)
    startMic();
  } else {
    // Jika mic tidak muted, mute (stop)
    stopMic(true);
  }
};

async function handleMicInput(text) {
  clearTimeout(silenceTimer);
  if (isResponding) {
    console.log("AI is already responding, ignoring new mic input.");
    return;
  }

  isResponding = true;
  stopMic(true); // Mic dimatikan sementara selama AI memproses
  startBtn.disabled = true;
  shareScreenBtn.disabled = true;

  logChat("🧏 Kamu", text);
  const reply = await fetchAI(text, "text");
  logChat("🤖 AI", reply);
  await speakText(reply); // Tunggu sampai AI selesai bicara

  isResponding = false;
  startBtn.disabled = false; // Aktifkan kembali setelah selesai
  shareScreenBtn.disabled = false; // Aktifkan kembali setelah selesai

  // Perbaikan: Hanya mulai mic kembali jika tidak dimatikan secara manual
  if (!micMuted) {
    startMic();
  } else {
    console.log("AI finished speaking. Mic remains off (muted manually).");
  }
}

// Fungsi untuk menangani input gambar dari screenshot
async function handleScreenshotInput(imageDataBase64, userPromptForImage) {
  clearTimeout(silenceTimer);
  if (isResponding) {
    console.log("AI is already responding, ignoring new screenshot input.");
    return;
  }

  isResponding = true;
  stopMic(true); // Mic dimatikan sementara selama AI memproses
  startBtn.disabled = true;
  shareScreenBtn.disabled = true;

  logChat("📸 Kamu", `Menganalisis layar: "${userPromptForImage}"`);
  const reply = await fetchAI(imageDataBase64, "image", userPromptForImage); // Panggil fetchAI untuk gambar, dengan prompt pengguna
  logChat("🤖 AI", reply);
  await speakText(reply); // Tunggu sampai AI selesai bicara

  isResponding = false;
  startBtn.disabled = false; // Aktifkan kembali setelah selesai
  shareScreenBtn.disabled = false; // Aktifkan kembali setelah selesai

  // Perbaikan: Hanya mulai mic kembali jika tidak dimatikan secara manual
  if (!micMuted) {
    startMic();
  } else {
    console.log("AI finished speaking. Mic remains off (muted manually).");
  }
}

async function fetchAI(input, type, userPromptForImage = "") {
  function cleanText(text) {
    // Hapus karakter non-ASCII dan non-alphanumeric selain spasi, koma, titik, dan newline
    return text.replace(/[^a-zA-Z0-9 .,\n]/g, "");
  }

  try {
    let requestBody;
    const targetUrl = geminiModelUrl;

    if (type === "text") {
      requestBody = JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: input,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
        },
      });
    } else if (type === "image") {
      // Menentukan prompt berdasarkan apakah ada prompt spesifik dari pengguna
      const promptText = userPromptForImage
        ? `Sesuai permintaan saya: "${userPromptForImage}". Tolong analisis dan deskripsikan apa yang Anda lihat di layar ini, fokus pada relevansi konten visual dengan permintaan tersebut. Berikan respon yang singkat dan padat.`
        : "Deskripsikan apa yang Anda lihat di layar ini secara singkat dan informatif. Sebutkan elemen utama dan tujuan dari konten di layar ini.";

      requestBody = JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }, { inlineData: { mimeType: "image/jpeg", data: input.split(",")[1] } }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 200,
        },
      });
    } else {
      throw new Error("Tipe input tidak dikenal.");
    }

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: requestBody,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API HTTP Error:", response.status, errorData);
      return `Maaf, terjadi kesalahan dari AI (${response.status}): ${errorData.error ? errorData.error.message : "Error tidak diketahui"}`;
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) {
      return cleanText(data.candidates[0].content.parts[0].text.trim());
    } else if (data.error) {
      console.error("API Error (dalam respons):", data.error);
      return `Maaf, terjadi kesalahan dari AI: ${data.error.message || "Error tidak diketahui"}`;
    }
    return "Maaf, AI tidak memberikan respons yang dapat dipahami.";
  } catch (err) {
    console.error("AI Error (fetch atau parsing):", err);
    return "Maaf, terjadi kesalahan saat menghubungi AI.";
  }
}

function logChat(sender, text) {
  const e = document.createElement("div");
  e.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatbox.appendChild(e);
  chatbox.scrollTop = chatbox.scrollHeight;
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

async function speakText(text) {
  if (!text) return;

  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    // Beri sedikit waktu untuk memastikan pembatalan selesai
    await new Promise((r) => setTimeout(r, 100));
  }

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    if (isAndroid()) {
      utterance.lang = "id-ID";
    } else {
      const voices = speechSynthesis.getVoices();
      // Cari suara Bahasa Indonesia, atau fallback ke suara pertama
      const idVoice = voices.find((v) => v.lang.startsWith("id")) || voices[0];
      if (idVoice) {
        utterance.voice = idVoice;
        utterance.lang = idVoice.lang;
      } else {
        utterance.lang = "id-ID"; // Default ke id-ID jika tidak ditemukan
      }
    }

    // Perbaikan: Pastikan mikrofon mati sementara selama AI berbicara
    // Menggunakan `false` agar tidak mengubah status `micMuted` permanen
    stopMic(false);

    utterance.onend = () => {
      console.log("TTS Finished.");
      // Setelah AI selesai berbicara, periksa apakah mic seharusnya aktif lagi
      // Hanya aktifkan kembali jika tidak dimatikan secara manual (micMuted adalah false)
      if (!micMuted) {
        startMic();
      }
      resolve();
    };
    utterance.onerror = (e) => {
      console.error("TTS error:", e);
      // Tetap resolve agar alur berlanjut meskipun ada error
      // Perbaikan: Aktifkan kembali mic meskipun ada error TTS
      if (!micMuted) {
        startMic();
      }
      resolve();
    };
    speechSynthesis.speak(utterance);
    console.log("TTS Speaking...");
  });
}

function resetSilenceTimer() {
  clearTimeout(silenceTimer);
  // Timer hanya berjalan jika mic tidak dimatikan manual dan AI tidak sedang merespons
  if (!micMuted && !isResponding) {
    silenceTimer = setTimeout(() => {
      console.log("5 seconds of silence detected. Stopping mic.");
      stopMic(true); // Pastikan mic dimatikan dan statusnya muted
      logChat("🤖 AI", "Saya tidak mendengar apa-apa. Mikrofon dinonaktifkan.");
      // speakText("Saya tidak mendengar apa-apa. Mikrofon dinonaktifkan."); // Opsional: AI memberi tahu pengguna
    }, SILENCE_TIMEOUT);
  }
}

exitBtn.onclick = () => {
  if (recognition) recognition.stop();
  if (micStream) micStream.getTracks().forEach((track) => track.stop());
  if (displayStream) displayStream.getTracks().forEach((track) => track.stop());
  speechSynthesis.cancel();
  window.location.href = "index.html";
};

// --- FUNGSI shareScreenBtn.onclick ---
shareScreenBtn.onclick = async () => {
  if (isResponding) {
    logChat("🤖 AI", "AI sedang merespons, tunggu sebentar.");
    //await speakText("AI sedang merespons, tunggu sebentar.");
    return;
  }

  // Perbaikan: Nonaktifkan tombol segera setelah diklik
  shareScreenBtn.disabled = true;
  startBtn.disabled = true;

  try {
    // Pastikan mic diinisialisasi sebelum memulai share screen
    if (!micStream) {
      await initMic();
      // Kalau initMic gagal di sini, handleScreenShareStopped akan dipanggil di catch
      if (!micStream) {
        // Jika masih tidak ada micStream setelah initMic
        logChat("🤖 AI", "Gagal menginisialisasi mikrofon. Tidak dapat memulai berbagi layar.");
        alert("Gagal mengakses mikrofon. Periksa izin browser.");
        handleScreenShareStopped(); // Reset tombol jika ada error
        return;
      }
    }

    logChat("📸 Kamu", "Memulai berbagi layar...");
    displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false, // Tidak perlu audio dari layar
    });

    // Event listener saat berbagi layar dihentikan oleh pengguna
    displayStream.getVideoTracks()[0].onended = () => {
      console.log("Berbagi layar dihentikan oleh pengguna.");
      handleScreenShareStopped();
    };

    // Mic akan otomatis menyala dan siap mendengarkan setelah share screen dimulai
    // Pastikan mic tidak dimatikan secara manual sebelum ini
    if (!micMuted) {
      startMic();
      logChat("🤖 AI", "Berbagi layar dimulai. Katakan 'analisis layar' atau 'deskripsikan' untuk menganalisis.");
      //await speakText("Berbagi layar dimulai. Katakan analisis layar atau deskripsikan untuk menganalisis.");
    } else {
      //logChat("🤖 AI", "Berbagi layar dimulai, namun mikrofon Anda dinonaktifkan.");
      //await speakText("Berbagi layar dimulai, namun mikrofon Anda dinonaktifkan.");
    }
  } catch (err) {
    // Perbaikan: Penanganan error yang lebih spesifik
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      logChat("🤖 AI", "Izin berbagi layar ditolak. Tidak dapat memulai berbagi layar.");
      console.warn("User denied screen sharing:", err);
      //await speakText("Izin berbagi layar ditolak. Tidak dapat memulai berbagi layar.");
    } else if (err.name === "NotFoundError") {
      logChat("🤖 AI", "Tidak ada layar atau jendela yang tersedia untuk dibagikan.");
      console.error("No screen/window found:", err);
      //await speakText("Tidak ada layar atau jendela yang tersedia untuk dibagikan.");
    } else {
      logChat("🤖 AI", `Terjadi kesalahan saat memulai berbagi layar: ${err.message}`);
      console.error("Screen sharing error:", err);
      //await speakText(`Terjadi kesalahan saat memulai berbagi layar: ${err.message}`);
    }
    handleScreenShareStopped(); // Pastikan state kembali normal jika ada error
  } finally {
    // Tombol akan diaktifkan di handleScreenShareStopped() atau setelah AI bicara
    // jika ada error saat memulai share screen.
  }
};

// --- FUNGSI takeScreenshotAndSendToAI ---
async function takeScreenshotAndSendToAI(userSpokenText) {
  if (!displayStream || isResponding) {
    console.warn("Tidak dapat mengambil screenshot: Tidak ada stream layar aktif atau AI sedang merespons.");
    if (!isResponding) {
      // Hanya bicara jika AI tidak sedang merespons
      logChat("🤖 AI", "Maaf, saya tidak bisa menganalisis layar saat ini karena berbagi layar tidak aktif.");
      //await speakText("Maaf, saya tidak bisa menganalisis layar saat ini karena berbagi layar tidak aktif.");
    }
    // Pastikan mic kembali aktif jika share screen masih aktif (jika ini bukan masalah isResponding)
    if (displayStream && !micMuted) {
      startMic();
    } else {
      startBtn.disabled = false;
      shareScreenBtn.disabled = false;
    }
    return;
  }

  isResponding = true;
  stopMic(true); // Matikan mic sementara saat screenshot diambil dan dikirim
  startBtn.disabled = true;
  shareScreenBtn.disabled = true;

  try {
    const track = displayStream.getVideoTracks()[0];
    if (!track) {
      logChat("🤖 AI", "Gagal mendapatkan video track dari stream layar aktif.");
      await speakText("Gagal mendapatkan video track dari stream layar aktif.");
      return; // Penting: keluar dari fungsi jika tidak ada track
    }

    const video = document.createElement("video");
    video.style.display = "none";
    video.srcObject = new MediaStream([track]);
    document.body.appendChild(video);
    await video.play(); // Tunggu video siap diputar

    // Perbaikan: Tunggu sebentar untuk memastikan frame pertama siap
    await new Promise((resolve) => setTimeout(resolve, 100)); // Beri waktu video untuk memuat

    const canvas = document.createElement("canvas");
    // Gunakan dimensi asli video untuk kualitas terbaik
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Kualitas JPEG 0.8-0.9 adalah kompromi yang baik antara ukuran file dan kualitas
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);

    video.remove(); // Hapus elemen video sementara dari DOM

    logChat("📸 Kamu", `Mengirim screenshot dengan permintaan: "${userSpspokenText}" ke AI...`);
    const reply = await fetchAI(imageDataUrl, "image", userSpokenText);
    logChat("🤖 AI", reply);
    await speakText(reply);
  } catch (err) {
    logChat("🤖 AI", `Terjadi kesalahan saat mengambil screenshot atau menganalisis: ${err.message}`);
    console.error("Screenshot or AI analysis error:", err);
    //await speakText(`Terjadi kesalahan saat mengambil screenshot atau menganalisis: ${err.message}`);
  } finally {
    isResponding = false;
    // Setelah AI merespons, mic harus kembali menyala jika share screen masih aktif
    // dan tidak dimatikan secara manual
    if (displayStream && !micMuted) {
      startMic();
    } else {
      // Jika share screen sudah tidak aktif atau mic dimatikan manual
      startBtn.disabled = false;
      shareScreenBtn.disabled = false;
    }
  }
}

// --- FUNGSI handleScreenShareStopped ---
function handleScreenShareStopped() {
  if (displayStream) {
    displayStream.getTracks().forEach((track) => track.stop());
    displayStream = null;
  }
  stopMic(true); // Mic akan dimatikan dan statusnya muted (normal)
  startBtn.disabled = false; // Aktifkan tombol start
  shareScreenBtn.disabled = false; // Aktifkan tombol share screen
  logChat("🤖 AI", "Berbagi layar telah dihentikan.");
  console.log("Screen share stopped, mic is off and buttons are enabled.");
  // speakText("Berbagi layar telah dihentikan."); // Opsional: AI memberi tahu pengguna
}

// Perbaikan: Panggil initMic() di onload dan tangani status awal
window.onload = async () => {
  speechSynthesis.cancel(); // Pastikan tidak ada suara TTS yang tertinggal
  logChat("🤖 AI", "Memulai aplikasi...");
  await initMic(); // Memastikan inisialisasi mic di awal dan menunggu hasilnya

  // Setelah initMic, periksa apakah mic berhasil diaktifkan
  if (micStream && !micMuted) {
    startBtn.disabled = false; // Aktifkan tombol start jika mic berhasil
    shareScreenBtn.disabled = false; // Aktifkan tombol share screen
    logChat("🤖 AI", "Mikrofon siap. Ucapkan 'Halo' untuk memulai.");
    //await speakText("Halo, saya siap mendengarkan."); // AI menyapa di awal
  } else {
    startBtn.disabled = true; // Biarkan disabled jika mic gagal atau ditolak
    shareScreenBtn.disabled = false; // Tombol share screen tetap bisa diakses
    logChat("🤖 AI", "Gagal menginisialisasi mikrofon. Periksa izin. Anda masih bisa menggunakan fitur berbagi layar.");
  }
};

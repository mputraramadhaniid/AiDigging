const apiKey = "AIzaSyBx2GodMWfLdIIRpVU6_A3HK8y1IpPCLZ4"; // GANTI DENGAN API KEY ANDA YANG SESUNGGUHNYA
// Menggunakan model gemini-1.5-flash-8b untuk teks dan visi
const geminiModelUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

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
// Kembali ke 5 detik untuk mematikan mic jika tidak ada ucapan
const SILENCE_TIMEOUT = 15000; // 5 detik untuk mematikan mic otomatis karena tidak ada ucapan

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
  recognition.continuous = isAndroidMobile ? false : true;

  recognition.onresult = async (e) => {
    const text = e.results[e.results.length - 1][0].transcript.trim();
    // PERBAIKAN: Hanya reset timer dan proses jika ada teks yang valid
    if (text) {
      resetSilenceTimer(); // Reset timer karena ada ucapan terdeteksi

      if (!recognition.continuous) {
        recognition.stop();
      }

      const analysisTriggers = ["analisis layar", "baca ini", "deskripsikan"];
      const isAnalysisCommand = analysisTriggers.some((trigger) => text.toLowerCase().includes(trigger));

      if (displayStream && isAnalysisCommand) {
        logChat("🧏 Kamu", text);
        await takeScreenshotAndSendToAI(text);
      } else {
        handleMicInput(text);
      }
    }
    // Jika text kosong (hanya noise), timer keheningan akan tetap berjalan dan mematikan mic setelah SILENCE_TIMEOUT
  };

  recognition.onerror = (e) => {
    console.error("Recognition error:", e.error);
    if (e.error === "not-allowed") {
      logChat("🤖 AI", "Akses mikrofon ditolak. Mohon izinkan mikrofon di pengaturan browser Anda.");
      alert("Akses mikrofon ditolak. Mohon izinkan mikrofon di pengaturan browser Anda.");
      stopMic(true);
      startBtn.disabled = true;
    } else if (!micMuted && !isResponding) {
      console.warn("Recognition error, trying to restart mic...", e.error);
      startMic();
    }
    // Jika ada error (termasuk "no-speech" yang bisa terjadi karena noise),
    // timer keheningan akan tetap berjalan.
  };

  recognition.onend = () => {
    // PERBAIKAN: Jika `onend` dipicu dan tidak ada respons dari AI dan mic tidak dimatikan manual,
    // mic akan restart untuk mendengarkan ucapan baru.
    if (!micMuted && !isResponding) {
      console.log("Recognition ended, restarting mic for continuous listening.");
      startMic();
    } else {
      console.log("Recognition ended, but mic is muted or AI is responding. Not restarting mic.");
    }
  };

  // onspeechstart: Dipicu saat suara yang dikenali sebagai ucapan dimulai
  recognition.onspeechstart = () => {
    console.log("Speech started.");
    resetSilenceTimer(); // Reset timer karena ada ucapan terdeteksi
  };

  // onspeechend: Dipicu saat ucapan yang dikenali selesai
  recognition.onspeechend = () => {
    console.log("Speech ended.");
    // Biarkan timer berjalan, karena mungkin ada jeda sebelum onresult terpicu
  };

  // onsoundstart: Dipicu saat ada suara (termasuk noise)
  recognition.onsoundstart = () => {
    console.log("Sound started (could be speech or noise).");
    // Kita bisa reset timer di sini juga, untuk menandakan adanya aktivitas audio.
    // Namun, jika tujuannya hanya ucapan, onspeechstart lebih relevan.
    // Untuk tujuan ini, kita tidak akan reset timer di sini agar SILENCE_TIMEOUT tetap mematikan mic jika hanya noise.
  };

  // onsoundend: Dipicu saat tidak ada suara sama sekali
  recognition.onsoundend = () => {
    console.log("Sound ended (no more audio activity).");
    // Ini akan membiarkan silenceTimer berjalan menuju penutupan mic
  };

  // onnomatch: Dipicu ketika tidak ada ucapan yang cocok dengan grammar
  recognition.onnomatch = () => {
    console.log("No speech match found (could be noise or unclear speech).");
    // Tidak perlu reset timer di sini, karena ini bukan ucapan yang valid
  };
}

async function initMic() {
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setupRecognition();
    startMic();
  } catch (err) {
    console.error("Mic error:", err);
    alert("Tidak dapat mengakses mikrofon. Periksa izin browser.");
    startBtn.disabled = true;
    micMuted = true;
    startBtn.querySelector("span").textContent = "mic_off";
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
      startBtn.querySelector("span").textContent = "mic";
    } catch (e) {
      if (e.name === "InvalidStateError") {
        console.warn("Recognition already started or in an invalid state. Ignoring start command.");
      } else {
        console.error("Recognition start failed unexpectedly:", e);
        setupRecognition();
        recognition.start();
      }
    }
    // PERBAIKAN: Mulai timer keheningan saat mic aktif.
    // Timer ini akan mematikan mic jika tidak ada ucapan yang terdeteksi.
    resetSilenceTimer();
  } else {
    console.warn("startMic() failed: micStream or recognition not initialized. Attempting initMic.");
    if (!micStream) {
      initMic();
    }
  }
}

function stopMic(setMuted = true) {
  if (recognition) {
    recognition.stop();
    clearTimeout(silenceTimer); // Hentikan timer saat mic dihentikan manual
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
    if (!micStream) return;
  }

  if (micMuted) {
    startMic();
  } else {
    stopMic(true);
  }
};

async function handleMicInput(text) {
  // PERBAIKAN: Hanya proses jika ada teks yang valid dari ucapan
  if (!text) {
    console.log("Received empty text input from mic, ignoring.");
    // Pastikan mic tetap aktif jika belum dimatikan manual atau AI sedang merespons
    if (!micMuted && !isResponding) {
      startMic();
    }
    return;
  }

  clearTimeout(silenceTimer);
  if (isResponding) {
    console.log("AI is already responding, ignoring new mic input.");
    return;
  }

  isResponding = true;
  stopMic(true);
  startBtn.disabled = true;
  shareScreenBtn.disabled = true;

  logChat("🧏 Kamu", text);
  const reply = await fetchAI(text, "text");
  logChat("🤖 AI", reply);
  await speakText(reply);

  isResponding = false;
  startBtn.disabled = false;
  shareScreenBtn.disabled = false;

  if (!micMuted) {
    startMic();
  } else {
    console.log("AI finished speaking. Mic remains off (muted manually).");
  }
}

async function handleScreenshotInput(imageDataBase64, userPromptForImage) {
  clearTimeout(silenceTimer);
  if (isResponding) {
    console.log("AI is already responding, ignoring new screenshot input.");
    return;
  }

  isResponding = true;
  stopMic(true);
  startBtn.disabled = true;
  shareScreenBtn.disabled = true;

  logChat("📸 Kamu", `Menganalisis layar: "${userPromptForImage}"`);
  const reply = await fetchAI(imageDataBase64, "image", userPromptForImage);
  logChat("🤖 AI", reply);
  await speakText(reply);

  isResponding = false;
  startBtn.disabled = false;
  shareScreenBtn.disabled = false;

  if (!micMuted) {
    startMic();
  } else {
    console.log("AI finished speaking. Mic remains off (muted manually).");
  }
}

async function fetchAI(input, type, userPromptForImage = "") {
  function cleanText(text) {
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
    await new Promise((r) => setTimeout(r, 100));
  }

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    if (isAndroid()) {
      utterance.lang = "id-ID";
    } else {
      const voices = speechSynthesis.getVoices();
      const idVoice = voices.find((v) => v.lang.startsWith("id")) || voices[0];
      if (idVoice) {
        utterance.voice = idVoice;
        utterance.lang = idVoice.lang;
      } else {
        utterance.lang = "id-ID";
      }
    }

    stopMic(false);

    utterance.onend = () => {
      console.log("TTS Finished.");
      if (!micMuted) {
        startMic();
      }
      resolve();
    };
    utterance.onerror = (e) => {
      console.error("TTS error:", e);
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
  if (!micMuted && !isResponding) {
    silenceTimer = setTimeout(() => {
      console.log(`${SILENCE_TIMEOUT / 1000} seconds of silence detected. Stopping mic.`);
      stopMic(true); // Pastikan mic dimatikan dan statusnya muted
      logChat("🤖 AI", `Saya tidak mendengar ucapan apa pun selama ${SILENCE_TIMEOUT / 1000} detik. Mikrofon dinonaktifkan.`);
      speakText(`Saya tidak mendengar ucapan apa pun selama ${SILENCE_TIMEOUT / 1000} detik. Mikrofon dinonaktifkan.`);
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

  shareScreenBtn.disabled = true;
  startBtn.disabled = true;

  try {
    if (!micStream) {
      await initMic();
      if (!micStream) {
        logChat("🤖 AI", "Gagal menginisialisasi mikrofon. Tidak dapat memulai berbagi layar.");
        alert("Gagal mengakses mikrofon. Periksa izin browser.");
        handleScreenShareStopped();
        return;
      }
    }

    logChat("📸 Kamu", "Memulai berbagi layar...");
    displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });

    displayStream.getVideoTracks()[0].onended = () => {
      console.log("Berbagi layar dihentikan oleh pengguna.");
      handleScreenShareStopped();
    };

    if (!micMuted) {
      startMic();
      logChat("🤖 AI", "Berbagi layar dimulai. Katakan 'analisis layar' atau 'deskripsikan' untuk menganalisis.");
      //await speakText("Berbagi layar dimulai. Katakan analisis layar atau deskripsikan untuk menganalisis.");
    } else {
      logChat("🤖 AI", "Berbagi layar dimulai, namun mikrofon Anda dinonaktifkan.");
      //await speakText("Berbagi layar dimulai, namun mikrofon Anda dinonaktifkan.");
    }
  } catch (err) {
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
    handleScreenShareStopped();
  }
};

// --- FUNGSI takeScreenshotAndSendToAI ---
async function takeScreenshotAndSendToAI(userSpokenText) {
  if (!displayStream || isResponding) {
    console.warn("Tidak dapat mengambil screenshot: Tidak ada stream layar aktif atau AI sedang merespons.");
    if (!isResponding) {
      logChat("🤖 AI", "Maaf, saya tidak bisa menganalisis layar saat ini karena berbagi layar tidak aktif.");
      await speakText("Maaf, saya tidak bisa menganalisis layar saat ini karena berbagi layar tidak aktif.");
    }
    if (displayStream && !micMuted) {
      startMic();
    } else {
      startBtn.disabled = false;
      shareScreenBtn.disabled = false;
    }
    return;
  }

  isResponding = true;
  stopMic(true);
  startBtn.disabled = true;
  shareScreenBtn.disabled = true;

  try {
    const track = displayStream.getVideoTracks()[0];
    if (!track) {
      logChat("🤖 AI", "Gagal mendapatkan video track dari stream layar aktif.");
      await speakText("Gagal mendapatkan video track dari stream layar aktif.");
      return;
    }

    const video = document.createElement("video");
    video.style.display = "none";
    video.srcObject = new MediaStream([track]);
    document.body.appendChild(video);
    await video.play();

    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);

    video.remove();

    logChat("📸 Kamu", `Mengirim screenshot dengan permintaan: "${userSpokenText}" ke AI...`);
    const reply = await fetchAI(imageDataUrl, "image", userSpokenText);
    logChat("🤖 AI", reply);
    await speakText(reply);
  } catch (err) {
    logChat("🤖 AI", `Terjadi kesalahan saat mengambil screenshot atau menganalisis: ${err.message}`);
    console.error("Screenshot or AI analysis error:", err);
    await speakText(`Terjadi kesalahan saat mengambil screenshot atau menganalisis: ${err.message}`);
  } finally {
    isResponding = false;
    if (displayStream && !micMuted) {
      startMic();
    } else {
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
  stopMic(true);
  startBtn.disabled = false;
  shareScreenBtn.disabled = false;
  logChat("🤖 AI", "Berbagi layar telah dihentikan.");
  console.log("Screen share stopped, mic is off and buttons are enabled.");
  //speakText("Berbagi layar telah dihentikan."); // Opsional: AI memberi tahu pengguna
}

// Perbaikan: Panggil initMic() di onload dan tangani status awal
window.onload = async () => {
  speechSynthesis.cancel();
  logChat("🤖 AI", "Memulai aplikasi...");
  await initMic();

  if (micStream && !micMuted) {
    startBtn.disabled = false;
    shareScreenBtn.disabled = false;
    logChat("🤖 AI", "Mikrofon siap. Ucapkan 'Halo' untuk memulai.");
    //await speakText("Halo, saya siap mendengarkan."); // AI menyapa di awal
  } else {
    startBtn.disabled = true;
    shareScreenBtn.disabled = false;
    logChat("🤖 AI", "Gagal menginisialisasi mikrofon. Periksa izin. Anda masih bisa menggunakan fitur berbagi layar.");
  }
};

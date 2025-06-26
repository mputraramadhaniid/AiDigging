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
  recognition.continuous = isAndroidMobile ? false : true;

  recognition.onresult = async (e) => {
    const text = e.results[e.results.length - 1][0].transcript.trim();
    if (text) {
      resetSilenceTimer();

      // PENTING: Pemicu analisis layar
      // Menggunakan frasa "analisis layar" atau "baca ini" atau "deskripsikan"
      // Anda bisa sesuaikan frasa pemicu ini
      const analysisTriggers = ["analisis layar", "baca ini", "deskripsikan"];
      const isAnalysisCommand = analysisTriggers.some((trigger) => text.toLowerCase().includes(trigger));

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
    if (!micMuted && !isResponding) {
      console.warn("Recognition error, trying to restart mic...");
      startMic(); // Coba nyalakan kembali mic
    }
  };

  recognition.onend = () => {
    if (!micMuted && !isResponding) {
      console.log("Recognition ended, restarting mic for continuous listening.");
      startMic(); // Mic akan otomatis aktif lagi
    }
  };
}

async function initMic() {
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setupRecognition();
    startMic(); // Mulai mic otomatis saat init
  } catch (err) {
    console.error("Mic error:", err);
    alert("Tidak dapat mengakses mikrofon. Periksa izin browser.");
    startBtn.disabled = true;
    micMuted = true; // Pastikan micMuted jadi true jika gagal
    startBtn.querySelector("span").textContent = "mic_off"; // Tampilkan ikon mati
  }
}

function startMic() {
  if (micStream && recognition) {
    micMuted = false;
    micStream.getAudioTracks().forEach((track) => (track.enabled = true));
    try {
      recognition.start();
      console.log("Mic Started.");
    } catch (e) {
      console.warn("Recognition start failed, re-initializing:", e);
      setupRecognition();
      recognition.start();
    }
    startBtn.querySelector("span").textContent = "mic";
    resetSilenceTimer();
  } else {
    console.warn("startMic() failed: micStream or recognition not initialized. Attempting initMic.");
    if (!micStream) {
      initMic(); // Coba inisialisasi ulang
    }
  }
}

// Perbaikan: Parameter setMuted untuk mengontrol status micMuted
function stopMic(setMuted = true) {
  if (micStream && recognition) {
    recognition.stop();
    if (setMuted) {
      micMuted = true;
    }
    micStream.getAudioTracks().forEach((track) => (track.enabled = false));
    startBtn.querySelector("span").textContent = "mic_off";
    clearTimeout(silenceTimer);
    console.log("Mic Stopped.");
  }
}

startBtn.onclick = async () => {
  if (!micStream) {
    await initMic();
    if (!micStream) return;
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
  if (isResponding) return;

  isResponding = true;
  stopMic(true); // Mic dimatikan sementara selama AI memproses
  startBtn.disabled = true;
  shareScreenBtn.disabled = true;

  logChat("🧏 Kamu", text);
  const reply = await fetchAI(text, "text");
  logChat("🤖 AI", reply);
  await speakText(reply); // Tunggu sampai AI selesai bicara

  isResponding = false;
  startBtn.disabled = false;
  shareScreenBtn.disabled = false;

  if (!micMuted) {
    startMic();
    // logChat("🤖 AI", "Silakan bicara lagi."); // Opsional: Bisa dihapus untuk mengurangi output AI
    // await speakText("Silakan bicara lagi."); // Opsional: Bisa dihapus untuk mengurangi output AI
  } else {
    console.log("AI finished speaking. Mic remains off (muted manually).");
  }
}

// Fungsi untuk menangani input gambar dari screenshot
async function handleScreenshotInput(imageDataBase64, userPromptForImage) {
  if (isResponding) return;

  isResponding = true;
  stopMic(true); // Mic dimatikan sementara selama AI memproses
  startBtn.disabled = true;
  shareScreenBtn.disabled = true;

  logChat("📸 Kamu", `Menganalisis layar: "${userPromptForImage}"`);
  const reply = await fetchAI(imageDataBase64, "image", userPromptForImage); // Panggil fetchAI untuk gambar, dengan prompt pengguna
  logChat("🤖 AI", reply);
  await speakText(reply); // Tunggu sampai AI selesai bicara

  isResponding = false;
  startBtn.disabled = false;
  shareScreenBtn.disabled = false;

  if (!micMuted) {
    startMic();
    // logChat("🤖 AI", "Silakan bicara lagi."); // Opsional: Bisa dihapus untuk mengurangi output AI
    // await speakText("Silakan bicara lagi."); // Opsional: Bisa dihapus untuk mengurangi output AI
  } else {
    console.log("AI finished speaking. Mic remains off (muted manually).");
  }
}

async function fetchAI(input, type, userPromptForImage = "") {
  function cleanText(text) {
    return text.replace(/[^a-zA-Z0-9 ,.\n]/g, "");
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
    await new Promise((r) => setTimeout(r, 100)); // Beri sedikit waktu untuk memastikan pembatalan selesai
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

    // Perbaikan: Pastikan mikrofon mati selama AI berbicara
    // Menggunakan `false` agar tidak mengubah status `micMuted` permanen
    stopMic(false);

    utterance.onend = () => {
      console.log("TTS Finished.");
      resolve();
    };
    utterance.onerror = (e) => {
      console.error("TTS error:", e);
      resolve(); // Tetap resolve agar alur berlanjut meskipun ada error
    };
    speechSynthesis.speak(utterance);
    console.log("TTS Speaking...");
  });
}

function resetSilenceTimer() {
  clearTimeout(silenceTimer);
  if (!micMuted && !isResponding) {
    silenceTimer = setTimeout(() => {
      console.log("5 seconds of silence detected. Stopping mic.");
      stopMic(true); // Pastikan mic dimatikan dan statusnya muted
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
    alert("AI sedang merespons, tunggu sebentar.");
    return;
  }

  shareScreenBtn.disabled = true;
  startBtn.disabled = true;

  try {
    // Pastikan mic diinisialisasi sebelum memulai share screen
    if (!micStream) {
      await initMic();
      // Kalau initMic gagal di sini, handleScreenShareStopped akan dipanggil di catch
      if (!micStream) {
        logChat("🤖 AI", "Gagal menginisialisasi mikrofon. Tidak dapat memulai berbagi layar.");
        alert("Gagal mengakses mikrofon. Periksa izin browser.");
        handleScreenShareStopped(); // Reset tombol jika ada error
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

    startMic(); // Mic akan otomatis menyala dan siap mendengarkan setelah share screen dimulai
  } catch (err) {
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      logChat("🤖 AI", "Izin berbagi layar ditolak. Tidak dapat memulai berbagi layar.");
      console.warn("User denied screen sharing:", err);
    } else if (err.name === "NotFoundError") {
      logChat("🤖 AI", "Tidak ada layar atau jendela yang tersedia untuk dibagikan.");
      console.error("No screen/window found:", err);
    } else {
      logChat("🤖 AI", `Terjadi kesalahan saat memulai berbagi layar: ${err.message}`);
      console.error("Screen sharing error:", err);
    }
    handleScreenShareStopped(); // Pastikan state kembali normal jika ada error
  } finally {
    // Tombol akan diaktifkan di handleScreenShareStopped() atau setelah AI bicara
    // jika ada error saat memulai share screen.
    // Jika share screen berhasil dimulai, tombol start akan tetap disabled sampai
    // AI merespons permintaan bicara atau share screen dihentikan.
  }
};

// --- FUNGSI takeScreenshotAndSendToAI ---
async function takeScreenshotAndSendToAI(userSpokenText) {
  if (!displayStream || isResponding) {
    console.warn("Tidak dapat mengambil screenshot: Tidak ada stream layar aktif atau AI sedang merespons.");
    if (!isResponding) {
      logChat("🤖 AI", "Maaf, saya tidak bisa menganalisis layar saat ini.");
      await speakText("Maaf, saya tidak bisa menganalisis layar saat ini.");
    }
    // Pastikan mic kembali aktif jika share screen masih aktif
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
      return;
    }

    const video = document.createElement("video");
    video.style.display = "none";
    video.srcObject = new MediaStream([track]);
    document.body.appendChild(video);
    video.play();

    // Menggunakan onloadeddata untuk memastikan frame pertama siap
    await new Promise((resolve) => (video.onloadeddata = resolve));

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);

    video.remove(); // Hapus elemen video sementara dari DOM

    logChat("📸 Kamu", `Mengirim screenshot dengan permintaan: "${userSpokenText}" ke AI...`);
    const reply = await fetchAI(imageDataUrl, "image", userSpokenText);
    logChat("🤖 AI", reply);
    await speakText(reply);
  } catch (err) {
    logChat("🤖 AI", `Terjadi kesalahan saat mengambil screenshot atau menganalisis: ${err.message}`);
    console.error("Screenshot or AI analysis error:", err);
  } finally {
    isResponding = false;
    // Setelah AI merespons, mic harus kembali menyala jika share screen masih aktif
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
  stopMic(true); // Mic akan dimatikan dan statusnya muted (normal)
  startBtn.disabled = false; // Aktifkan tombol start
  shareScreenBtn.disabled = false; // Aktifkan tombol share screen
  logChat("🤖 AI", "Berbagi layar telah dihentikan.");
  console.log("Screen share stopped, mic is off and buttons are enabled.");
}

window.onload = () => {
  speechSynthesis.cancel();
  initMic(); // Memastikan inisialisasi mic di awal
};

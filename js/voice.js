const startBtn = document.getElementById("startBtn");
const exitBtn = document.getElementById("exitBtn");
const chatbox = document.getElementById("chatbox");
const visualizer = document.getElementById("voiceVisualizer");

let recognition;
let micStream;
let micMuted = false;
let isResponding = false;
let silenceTimer;

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

// Deteksi apakah Android mobile
const isAndroidMobile = /Android/i.test(navigator.userAgent) && /Mobile/i.test(navigator.userAgent);

// Setup recognition, sesuaikan continuous berdasarkan device
function setupRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Browser tidak mendukung SpeechRecognition");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "id-ID";
  recognition.interimResults = false;
  recognition.continuous = isAndroidMobile ? false : true;  // perbedaan di sini

  recognition.onresult = (e) => {
    const text = e.results[e.results.length - 1][0].transcript.trim();
    if (text) {
      resetSilenceTimer();
      handleMicInput(text);
    }
  };

  recognition.onerror = (e) => {
    console.error("Recognition error:", e.error);
  };

  recognition.onend = () => {
    if (!isResponding && !micMuted) {
      // Di desktop, restart recognition otomatis
      if (!isAndroidMobile) {
        try {
          recognition.start();
        } catch (e) {
          console.warn("Restart recognition failed:", e);
        }
      }
      // Di Android mobile, mic akan hidup lagi setelah respon selesai (handleMicInput)
    }
  };
}

async function initMic() {
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setupRecognition();
    recognition.start();
    resetSilenceTimer();
    startBtn.querySelector("span").textContent = "mic";
  } catch (err) {
    console.error("Mic error:", err);
    alert("Tidak dapat mengakses mikrofon. Periksa izin browser.");
  }
}

startBtn.onclick = async () => {
  if (!micStream) return;
  micMuted = !micMuted;
  micStream.getAudioTracks().forEach((track) => (track.enabled = !micMuted));

  if (micMuted) {
    recognition.stop();
    startBtn.querySelector("span").textContent = "mic_off";
    clearTimeout(silenceTimer);
  } else {
    try {
      recognition.start();
    } catch (e) {
      setupRecognition();
      recognition.start();
    }
    startBtn.querySelector("span").textContent = "mic";
    resetSilenceTimer();
  }
};

async function handleMicInput(text) {
  clearTimeout(silenceTimer);
  if (isResponding) return;

  isResponding = true;
  recognition.stop();
  micStream.getAudioTracks().forEach((track) => (track.enabled = false));

  logChat("🧏 Kamu", text);
  const reply = await fetchAI(text);
  logChat("🤖 AI", reply);
  await speakText(reply);

  micStream.getAudioTracks().forEach((track) => (track.enabled = true));
  isResponding = false;

  // Perbedaan device: 
  // Android: start mic lagi setelah respon (karena continuous=false)
  // Desktop: recognition sudah continuous, tapi tetap jaga restart
  if (!micMuted) {
    try {
      recognition.start();
    } catch (e) {
      setupRecognition();
      recognition.start();
    }
  }
  resetSilenceTimer();
}

async function fetchAI(userInput) {
  function cleanText(text) {
    return text.replace(/[^a-zA-Z0-9 ,.\n]/g, "");
  }
  try {
    const response = await fetch("https://api.paxsenix.biz.id/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer YOUR_API_KEY_HERE",
      },
      body: JSON.stringify({
        model: "gpt-4",
        temperature: 0.7,
        messages: [{ role: "user", content: userInput }],
      }),
    });
    const data = await response.json();
    return cleanText(data.choices[0].message.content.trim());
  } catch (err) {
    console.error("AI Error:", err);
    return "Maaf, terjadi kesalahan.";
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
    await new Promise(r => setTimeout(r, 100));
  }

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    if (isAndroid()) {
      // Android: pakai default voice tanpa assign voice khusus
      utterance.lang = "id-ID";
    } else {
      // Desktop atau lain: bisa assign voice khusus jika perlu
      const voices = speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.startsWith("id")) || voices[0];
      if (idVoice) {
        utterance.voice = idVoice;
        utterance.lang = idVoice.lang;
      } else {
        utterance.lang = "id-ID";
      }
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      console.error("TTS error:", e);
      resolve();
    };
    speechSynthesis.speak(utterance);
  });
}

function resetSilenceTimer() {
  clearTimeout(silenceTimer);
  if (!isResponding && !micMuted) {
    silenceTimer = setTimeout(() => {
      resetSilenceTimer();
    }, 10000);
  }
}

exitBtn.onclick = () => {
  window.location.href = "index.html";
};

window.onload = () => {
  speechSynthesis.cancel();
  setTimeout(() => {
    initMic();
  }, 300); // beri jeda kecil agar izin mic siap
};

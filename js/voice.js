const startBtn = document.getElementById("startBtn");
const exitBtn = document.getElementById("exitBtn");
const visualizer = document.getElementById("voiceVisualizer");

// Bersihkan isi visualizer dulu supaya aura tidak numpuk
visualizer.innerHTML = "";

// Aura putih lembut (background lingkaran)
const auraWhite = document.createElement("div");
auraWhite.style.position = "absolute";
auraWhite.style.top = "-6px"; // makin dekat ke tengah
auraWhite.style.left = "-6px";
auraWhite.style.width = "140px"; // ukuran lebih kecil
auraWhite.style.height = "140px";
auraWhite.style.borderRadius = "50%";
auraWhite.style.background = "rgba(224, 229, 234, 0.6)"; // putih soft, transparansi lebih tinggi
auraWhite.style.filter = "blur(8px)"; // blur tipis banget
auraWhite.style.pointerEvents = "none";
auraWhite.style.zIndex = "-1";
auraWhite.style.animation = "moveCloudWhite 8s ease-in-out infinite";
visualizer.appendChild(auraWhite);

// Aura biru lembut (awan) yang akan kita kontrol ukurannya juga
const auraBlue = document.createElement("div");
auraBlue.style.position = "absolute";
auraBlue.style.top = "-4px"; // posisi rapat ke lingkaran
auraBlue.style.left = "25px";
auraBlue.style.width = "100px"; // ukuran default
auraBlue.style.height = "100px";
auraBlue.style.borderRadius = "50%";
auraBlue.style.background = "rgba(0, 170, 255, 0.5)"; // biru lebih transparan
auraBlue.style.filter = "blur(6px)"; // blur tipis
auraBlue.style.pointerEvents = "none";
auraBlue.style.zIndex = "-1";
auraBlue.style.animation = "moveCloudBlue 6s ease-in-out infinite";
visualizer.appendChild(auraBlue);

// Tambahkan CSS dinamis untuk animasi awan
const style = document.createElement("style");
style.textContent = `
@keyframes moveCloudWhite {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(12px, 6px); }
}
@keyframes moveCloudBlue {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-10px, -8px); }
}
`;
document.head.appendChild(style);

// Fungsi loading start button
function setStartButtonLoading(isLoading) {
  if (isLoading) {
    startBtn.classList.add("loading");
    startBtn.disabled = true;
    startBtn.style.opacity = 0.6;
    startBtn.style.cursor = "not-allowed";
  } else {
    startBtn.classList.remove("loading");
    startBtn.disabled = false;
    startBtn.style.opacity = 1;
    startBtn.style.cursor = "pointer";
  }
}

const synth = window.speechSynthesis;
function speak(text) {
  if (synth.speaking) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "id-ID";
  const voices = synth.getVoices();
  const maleVoice = voices.find((v) => v.lang === "id-ID" && v.name.toLowerCase().includes("dimas")) || voices.find((v) => v.lang === "id-ID");
  if (maleVoice) utter.voice = maleVoice;

  // Setup AudioContext dan Analyser untuk memantau volume/nada
  let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;

  // Source dummy, karena kita tidak bisa langsung menghubungkan TTS ke AudioContext,
  // kita pakai interval untuk simulasi perubahan volume secara acak sebagai contoh
  // (Kalau punya source audio real, bisa sambungkan langsung)

  // Mulai animasi aura saat speak
  utter.onstart = () => {
    auraWhite.style.animationPlayState = "running";
    auraBlue.style.animationPlayState = "running";
    visualizer.style.transform = "scale(1)";

    let angle = 0; // sudut dalam radian
    window.volumeAnim = setInterval(() => {
      // Simulasi volume random 50-200 (bisa disesuaikan)
      const volume = 50 + Math.random() * 150;

      // Skala berdasarkan volume, maksimal 1.3
      let scale = volume > 100 ? 1 + (volume - 100) / 300 : 1;
      if (scale > 1.3) scale = 1.3;

      // Gerakan lingkaran radius 8px horizontal, 5px vertical
      const radiusX = 8;
      const radiusY = 5;
      const x = Math.cos(angle) * radiusX;
      const y = Math.sin(angle) * radiusY;

      auraBlue.style.transform = `translate(${x}px, ${y}px) scale(${scale.toFixed(3)})`;

      // Tambah sudut (kecepatan gerak)
      angle += 0.15; // bisa diubah (semakin besar, semakin cepat)

      // Jangan biarkan angle makin besar terus (agar stabil)
      if (angle > Math.PI * 2) angle -= Math.PI * 2;
    }, 50); // update tiap 50ms
  };

  utter.onend = () => {
    auraWhite.style.animationPlayState = "paused";
    auraBlue.style.animationPlayState = "paused";
    visualizer.style.transform = "scale(1)";
    auraBlue.style.transform = "translate(0, 0) scale(1)";

    clearInterval(window.volumeAnim);
    setStartButtonLoading(false);
  };

  // optional onboundary to reset scale, kalau mau
  utter.onboundary = (event) => {
    if (event.name === "word") {
      // Bisa dikosongkan atau isi untuk efek tambahan
    }
  };

  synth.speak(utter);
}

async function sendToAI(userInput) {
  function cleanText(text) {
    return text.replace(/[^a-zA-Z0-9 ,\.\n]/g, "");
  }
  try {
    const messages = [{ role: "user", content: userInput }];
    const response = await fetch("https://api.paxsenix.biz.id/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer YOUR_API_KEY_HERE",
      },
      body: JSON.stringify({
        model: "gpt-4",
        temperature: 0.7,
        messages,
      }),
    });

    const data = await response.json();
    const aiReply = cleanText(data.choices[0].message.content.trim());
    speak(aiReply);
  } catch (err) {
    console.error(err);
    speak("Maaf, terjadi kesalahan.");
  }
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "id-ID";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  startBtn.onclick = () => {
    recognition.start();
    setStartButtonLoading(true);
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    sendToAI(transcript);
  };

  recognition.onerror = () => {
    speak("Maaf, tidak bisa mengenali suara Anda.");
    setStartButtonLoading(false);
  };

  recognition.onend = () => {
    // tombol tetap loading sampai TTS selesai
  };
} else {
  alert("Browser Anda tidak mendukung Speech Recognition API");
}

exitBtn.onclick = () => {
  window.location.href = "index.html";
};

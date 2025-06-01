const startBtn = document.getElementById("startBtn");
const exitBtn = document.getElementById("exitBtn");
const visualizer = document.getElementById("voiceVisualizer");

// Aura lingkaran
const auraDiv = document.createElement("div");
auraDiv.style.position = "absolute";
auraDiv.style.top = "-25px";
auraDiv.style.left = "-25px";
auraDiv.style.width = "200px";
auraDiv.style.height = "200px";
auraDiv.style.borderRadius = "50%";
auraDiv.style.background = `
        conic-gradient(
          from 0deg,
          rgba(255,0,0,0.3),
          rgba(255,154,0,0.3),
          rgba(208,222,33,0.3),
          rgba(79,220,74,0.3),
          rgba(63,218,216,0.3),
          rgba(47,201,226,0.3),
          rgba(28,127,238,0.3),
          rgba(95,21,242,0.3),
          rgba(186,12,248,0.3),
          rgba(251,7,217,0.3),
          rgba(255,0,0,0.3)
        )
      `;
auraDiv.style.filter = "blur(25px)";
auraDiv.style.pointerEvents = "none";
auraDiv.style.zIndex = "-1";
auraDiv.style.animation = "spin 8s linear infinite";
auraDiv.style.animationPlayState = "paused";
visualizer.appendChild(auraDiv);

const synth = window.speechSynthesis;

function speak(text) {
  if (synth.speaking) {
    console.warn("SpeechSynthesis sedang berbicara");
    return;
  }
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "id-ID";
  const voices = synth.getVoices();
  const indoVoice = voices.find((v) => v.lang === "id-ID");
  if (indoVoice) utter.voice = indoVoice;

  utter.onstart = () => {
    auraDiv.style.animationPlayState = "running";
    visualizer.style.transform = "scale(1)";
  };

  utter.onend = () => {
    auraDiv.style.animationPlayState = "paused";
    visualizer.style.transform = "scale(1)";
  };

  utter.onboundary = (event) => {
    if (event.name === "word") {
      // Simulasi suara keras (acak), bisa diganti dengan deteksi amplitudo
      const scaleLevel = Math.random() < 0.3 ? 1.2 : 1.05;
      visualizer.style.transform = `scale(${scaleLevel})`;
      setTimeout(() => {
        visualizer.style.transform = "scale(1)";
      }, 200);
    }
  };

  synth.speak(utter);
}

async function sendToAI(userInput) {
  function cleanText(text) {
    return text.replace(/[^a-zA-Z0-9 ,.\n]/g, "");
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
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API response error ${response.status}: ${errorData.error.message || "Unknown error"}`);
    }

    const data = await response.json();
    const aiReplyRaw = data.choices[0].message.content.trim();
    const aiReply = cleanText(aiReplyRaw);

    speak(aiReply);
  } catch (error) {
    console.error("Gagal panggil API:", error);
    speak("Maaf, terjadi kesalahan saat memproses permintaan.");
  }
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  alert("Browser Anda tidak mendukung Speech Recognition API");
} else {
  const recognition = new SpeechRecognition();
  recognition.lang = "id-ID";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  startBtn.onclick = () => {
    recognition.start();
    startBtn.disabled = true;
    startBtn.style.background = "rgba(128, 128, 128, 0.7)";
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    console.log("Hasil rekaman suara:", transcript);
    sendToAI(transcript);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    speak("Maaf, tidak dapat mengenali suara Anda.");
  };

  recognition.onend = () => {
    startBtn.disabled = false;
    startBtn.style.background = "rgba(128, 128, 128, 0.4)";
  };
}

exitBtn.onclick = () => {
  window.close();
};

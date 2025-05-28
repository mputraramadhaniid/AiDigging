const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

function displayMessage(message, isUser = false) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat-message");

  if (isUser) {
    messageElement.classList.add("user-message");
  } else {
    messageElement.classList.add("ai-message");
  }

  messageElement.textContent = message;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function sendMessage() {
  const message = userInput.value.trim();

  if (message) {
    displayMessage(message, true); // Display user's message
    userInput.value = ""; // Clear the input field

    // Send message to AI server
    sendToServer(message);
  }
}

// Send the message to the server (using fetch API)
function sendToServer(inputText) {
  const mapnetwork = new FormData();
  mapnetwork.append("text", inputText);

  fetch("https://supremeapp.uz/apps/chat_gpt/demo/index.php", {
    method: "POST",
    body: mapnetwork,
  })
    .then((response) => {
      console.log("Response status:", response.status); // Debug: Cek status HTTP
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const aiMessage = data.response || "Sorry, I didn't understand that.";
      displayMessage(aiMessage, false); // Display AI's response
    })
    .catch((error) => {
      displayMessage("Error: Could not reach the server.", false);
      console.error("Error:", error);
    });
}

userInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

// Speech recognition setup
const micButton = document.getElementById("micButton"); // Fixed the ID reference
const speechStatus = document.getElementById("speechStatus"); // Speech recognition status

// Input text and related elements
const inputText = document.getElementById("inputText");
const targetLang = document.getElementById("targetLang");
const translateBtn = document.getElementById("translateBtn");
const outputText = document.getElementById("outputText");
const overlay = document.getElementById("overlay"); // Overlay for spinner
const historyList = document.getElementById("history");
const clearBtn = document.getElementById("clearBtn");
const wordLimit = 250; // Set word limit to 250

const detectedLangLabel = document.createElement("p");
detectedLangLabel.style.fontSize = "0.9rem";
detectedLangLabel.style.color = "#555";
detectedLangLabel.style.marginTop = "0"; // Reset any negative margin

const wordCounter = document.createElement("p");
wordCounter.style.textAlign = "right";
wordCounter.style.fontSize = "0.9rem";
wordCounter.style.marginTop = "5px"; // Adjust the margin for better spacing

// Insert word counter and detected language label as block elements
inputText.parentNode.insertBefore(wordCounter, inputText.nextSibling);
inputText.parentNode.insertBefore(detectedLangLabel, wordCounter.nextSibling); // Place language below the word counter

// Update word count dynamically
inputText.addEventListener("input", () => {
  const wordCount = inputText.value.trim().split(/\s+/).filter(Boolean).length;
  wordCounter.textContent = `Word Count: ${wordCount}`;

  // Show warning if word count exceeds the limit
  if (wordCount > wordLimit) {
    wordCounter.style.color = "red";
    wordCounter.textContent = `Word Count: ${wordCount} (Limit: ${wordLimit} words) - Please shorten your text.`;
  } else {
    wordCounter.style.color = "#555"; // Reset color if within limit
  }
});

// Get user media (microphone) access
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('Microphone access granted');
  })
  .catch(err => {
    console.error('Microphone access denied', err);
  });

// Speech recognition initialization
let recognition;
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = "en-US"; // Set the default recognition language
  recognition.interimResults = false;

  micButton.addEventListener("click", () => {
    recognition.start();
    speechStatus.textContent = "Speak now...";
    micButton.classList.add("active"); // Optional visual feedback
  });

  recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript; // Get recognized text
    inputText.value += (inputText.value ? " " : "") + speechResult; // Append to input box
    speechStatus.textContent = "Speech added to input box.";
    inputText.dispatchEvent(new Event("input")); // Trigger word count update
  };

  recognition.onspeechend = () => {
    recognition.stop();
    micButton.classList.remove("active");
  };

  recognition.onerror = (event) => {
    speechStatus.textContent = `Error: ${event.error}`;
    recognition.stop();
    micButton.classList.remove("active");
  };
} else {
  micButton.style.display = "none"; // Hide mic button if Speech Recognition isn't supported
  speechStatus.textContent = "Speech recognition not supported in this browser.";
}

// Handle translation
translateBtn.addEventListener("click", async () => {
  const text = inputText.value.trim();
  const target = targetLang.value;

  // Check word limit before proceeding with translation
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount > wordLimit) {
    alert(`Please shorten your text. The word limit is ${wordLimit} words.`);
    return; // Stop the translation if word count exceeds the limit
  }

  if (!text) {
    alert("Please enter text to translate.");
    return;
  }

  try {
    // Show overlay and spinner during the translation process
    overlay.style.display = "flex";
    document.body.classList.add("blur"); // Prevent interaction during translation

    // Step 1: Detect the language of the input text
    const detectResponse = await fetch("/detect-language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const detectData = await detectResponse.json();
    if (detectData.error) {
      alert(detectData.error);
      return;
    }

    // Display the detected language name below the input text
    detectedLangLabel.textContent = detectData.language
      ? `Detected Language: ${detectData.language}`
      : "Could not detect language";

    // Step 2: Translate the text
    const response = await fetch("/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, target }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch translation");
    }

    const data = await response.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    // Populate output text area and save to history
    outputText.value = data.translatedText;
    saveToHistory(text, data.translatedText, target);
  } catch (error) {
    alert("Error: Could not detect language or translate text. Please try again later.");
    console.error(error);
  } finally {
    // Hide overlay and spinner after translation process is complete
    overlay.style.display = "none";
    document.body.classList.remove("blur"); // Re-enable interactions
  }
});

// Save translation to history
function saveToHistory(input, output, targetLang) {
  const historyItem = document.createElement("li");
  historyItem.textContent = `To (${targetLang}): ${input} -> ${output}`;
  historyList.appendChild(historyItem);
}

// Clear inputs, output, and history
clearBtn.addEventListener("click", () => {
  inputText.value = "";
  outputText.value = "";
  historyList.innerHTML = ""; // Clear the history list
  wordCounter.textContent = "Word Count: 0"; // Reset word counter
});

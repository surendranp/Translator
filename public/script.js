const inputText = document.getElementById("inputText");
const targetLang = document.getElementById("targetLang");
const translateBtn = document.getElementById("translateBtn");
const outputText = document.getElementById("outputText");
const overlay = document.getElementById("overlay");
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

  // Show spinner and overlay
  overlay.style.display = "flex";
  document.body.classList.add("blur");

  try {
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
    detectedLangLabel.textContent = detectData.language ? `Detected Language: ${detectData.language}` : "Could not detect language";

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
    // Hide spinner and overlay
    overlay.style.display = "none";
    document.body.classList.remove("blur");
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

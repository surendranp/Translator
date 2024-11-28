const inputText = document.getElementById("inputText");
const targetLang = document.getElementById("targetLang");
const translateBtn = document.getElementById("translateBtn");
const outputText = document.getElementById("outputText");
const overlay = document.getElementById("overlay");
const historyList = document.getElementById("history");
const clearBtn = document.getElementById("clearBtn");

// Add dynamic word counter
const wordCounter = document.createElement("p");
wordCounter.style.textAlign = "right";
wordCounter.style.fontSize = "0.9rem";
wordCounter.style.marginTop = "-10px";
inputText.parentNode.insertBefore(wordCounter, inputText.nextSibling);

// Update word count dynamically
inputText.addEventListener("input", () => {
  const wordCount = inputText.value.trim().split(/\s+/).filter(Boolean).length;
  wordCounter.textContent = `Word Count: ${wordCount}`;
});

// Handle translation
translateBtn.addEventListener("click", async () => {
  const text = inputText.value.trim();
  const target = targetLang.value;

  if (!text) {
    alert("Please enter text to translate.");
    return;
  }

  // Show spinner and overlay
  overlay.style.display = "flex";
  document.body.classList.add("blur");

  try {
    // Send text and target language to the `/translate` endpoint
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
    alert("Error: Could not translate text. Please try again later.");
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

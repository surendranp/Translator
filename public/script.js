const inputText = document.getElementById("inputText");
const targetLang = document.getElementById("targetLang");
const translateBtn = document.getElementById("translateBtn");
const outputText = document.getElementById("outputText");
const spinner = document.getElementById("spinner");
const historyList = document.getElementById("history");
const clearBtn = document.getElementById("clearBtn");

// Handle translation
translateBtn.addEventListener("click", async () => {
  const text = inputText.value.trim();
  const target = targetLang.value;

  if (!text) {
    alert("Please enter text to translate.");
    return;
  }

  spinner.classList.remove("hidden");

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
    saveToHistory(text, data.translatedText, data.detectedLang, target);
  } catch (error) {
    alert("Error: Could not translate text. Please try again later.");
    console.error(error);
  } finally {
    spinner.classList.add("hidden");
  }
});

// Save translation to history
function saveToHistory(input, output, sourceLang, targetLang) {
  const historyItem = document.createElement("li");
  historyItem.textContent = `From (${sourceLang}) to (${targetLang}): ${input} -> ${output}`;
  historyList.appendChild(historyItem);
}

// Clear inputs, output, and history
clearBtn.addEventListener("click", () => {
  inputText.value = "";
  outputText.value = "";
  historyList.innerHTML = ""; // Clear the history list
});

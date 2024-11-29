import express from "express";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Load OpenAI API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Serve static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

// Function to chunk text into smaller parts (max 500 characters each)
function chunkText(text, chunkSize = 500) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

// Language detection endpoint
app.post("/detect-language", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required for language detection." });
  }

  try {
    const prompt = `Please detect the language of the following text: "${text}"`;

    // Make request to OpenAI API for language detection
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const language = response.data.choices[0].message.content.trim();
    res.json({ language });
  } catch (error) {
    console.error("Language detection error:", error.message);
    res.status(500).json({ error: "Could not detect language. Please try again later." });
  }
});

// Translation API endpoint
app.post("/translate", async (req, res) => {
  const { text, target } = req.body;

  if (!text || !target) {
    return res.status(400).json({ error: "Invalid input data." });
  }

  try {
    const textChunks = chunkText(text, 500); // OpenAI recommends keeping tokens below ~500 for performance.
    const translations = [];

    for (const chunk of textChunks) {
      const prompt = `
Detect the source language of the following text and translate it to the target language:
Input: "${chunk}"
Target Language: ${target}

Output the detected source language and the translated text.
      `;

      // Make request to OpenAI API
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      const completion = response.data.choices[0].message.content;
      const translatedTextMatch = completion.match(/Translated Text:\s*(.+)/i);
      const translatedText = translatedTextMatch ? translatedTextMatch[1] : "";
      translations.push(translatedText);
    }

    // Combine all translated chunks
    res.json({ translatedText: translations.join(" ") });
  } catch (error) {
    console.error("Translation error:", error.message);
    res.status(500).json({ error: "Translation failed. Please try again." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

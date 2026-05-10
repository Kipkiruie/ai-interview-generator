import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [jobTitle, setJobTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateQuestions = async () => {
    if (loading) return;

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    if (!apiKey) {
      setError("API key missing. Please check your .env file.");
      return;
    }

    if (!jobTitle.trim()) {
      setError("Please enter a job title.");
      return;
    }

    setLoading(true);
    setError("");
    setQuestions([]);

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `
You are a senior HR interviewer.

Generate exactly 3 interview questions for the role: ${jobTitle}.

Requirements:
- Make questions practical and real-world based
- Focus on experience, behavior, and problem-solving
- Return ONLY numbered questions (1, 2, 3)
- No explanations
              `,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "AI Interview Generator",
          },
        }
      );

      const text = response.data?.choices?.[0]?.message?.content;

      if (!text) {
        throw new Error("No response from AI");
      }

      const formatted = text
        .split("\n")
        .map((q) => q.replace(/^\d+[\.\-\)]\s*/, "").trim())
        .filter(Boolean);

      setQuestions(formatted);
    } catch (err) {
      console.error(err);

      const status = err?.response?.status;

      if (status === 401) {
        setError("Invalid API key (401 Unauthorized)");
      } else if (status === 403) {
        setError("Access denied (403)");
      } else if (status === 404) {
        setError("Model not found (404)");
      } else if (status === 429) {
        setError("Too many requests. Please wait a moment.");
      } else {
        setError("Something went wrong. Check console.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>AI Interview Question Generator</h1>
        <p>Generate professional interview questions instantly</p>

        <input
          type="text"
          placeholder="Enter job title (e.g. Customer Success Manager)"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          disabled={loading}
        />

        <button onClick={generateQuestions} disabled={loading}>
          {loading ? "Generating..." : "Generate Questions"}
        </button>

        {error && <p className="error">{error}</p>}

        <div className="results">
          {questions.map((q, i) => (
            <div key={i} className="question">
              {i + 1}. {q}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
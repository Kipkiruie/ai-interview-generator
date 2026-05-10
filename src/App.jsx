import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [jobTitle, setJobTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [roleLevel, setRoleLevel] = useState("mid");
  const [interviewType, setInterviewType] = useState("mixed");

  useEffect(() => {
    const saved = localStorage.getItem("ai-history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveHistory = (role, qs) => {
    const item = {
      role,
      questions: qs,
      date: new Date().toISOString(),
    };

    const updated = [item, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem("ai-history", JSON.stringify(updated));
  };

  const generateQuestions = async () => {
    if (loading) return;

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    if (!apiKey) {
      setError("Missing API key. Check environment variables.");
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
      const prompt = `
You are a FAANG-level principal hiring manager.

ROLE: ${jobTitle}
LEVEL: ${roleLevel}
TYPE: ${interviewType}

TASK:
Generate EXACTLY 3 interview questions.

STRICT FORMAT RULES:
Return ONLY this structure:

Behavioral Question:
<question>

Role-Specific Question:
<question>

Problem-Solving Question:
<question>

RULES:
- No numbering
- No bullet points
- No explanations
- No extra text
- Keep questions realistic like Google/Amazon interviews
- Adapt difficulty based on role level
      `;

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are an expert FAANG interviewer generating structured hiring assessments.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "AI Interview SaaS Generator",
          },
        }
      );

      const text = response.data?.choices?.[0]?.message?.content;

      if (!text) throw new Error("Empty response from AI");

      // SAFER PARSING (production-grade)
      const cleaned = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      let parsed = cleaned.filter((l) =>
        l.toLowerCase().includes("question") === false || l.includes("?")
      );

      parsed = parsed
        .map((q) =>
          q
            .replace(/^(behavioral question:|role-specific question:|problem-solving question:)/i, "")
            .trim()
        )
        .filter(Boolean)
        .slice(0, 3);

      // fallback safety
      while (parsed.length < 3) {
        parsed.push("AI did not return a complete question. Please retry.");
      }

      setQuestions(parsed);
      saveHistory(jobTitle, parsed);
    } catch (err) {
      console.error(err);

      const status = err?.response?.status;

      if (status === 401) setError("Invalid API key (401)");
      else if (status === 403) setError("Access denied (403)");
      else if (status === 404) setError("Model not found (404)");
      else if (status === 429) setError("Rate limit exceeded. Try again.");
      else setError("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const exportQuestions = () => {
    const text = questions.join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${jobTitle}-interview-questions.txt`;
    a.click();
  };

  return (
    <div className="container">
      <div className="card">

        <h1>AI Interview SaaS Generator</h1>
        <p>Generate structured, FAANG-level interview questions instantly</p>

        <input
          type="text"
          placeholder="e.g. Software Engineer, PM, Customer Success Manager"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          disabled={loading}
        />

        <div className="row">
          <select value={roleLevel} onChange={(e) => setRoleLevel(e.target.value)}>
            <option value="junior">Junior</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
          </select>

          <select value={interviewType} onChange={(e) => setInterviewType(e.target.value)}>
            <option value="mixed">Mixed</option>
            <option value="technical">Technical</option>
            <option value="behavioral">Behavioral</option>
          </select>
        </div>

        <button onClick={generateQuestions} disabled={loading}>
          {loading ? "Generating..." : "Generate Questions"}
        </button>

        {error && <p className="error">{error}</p>}

        {!loading && questions.length === 0 && (
          <p className="empty-state">
            Enter a role to generate structured interview questions
          </p>
        )}

        <div className="results">
          {questions.map((q, i) => (
            <div key={i} className="question">
              <strong>
                {i === 0
                  ? "Behavioral:"
                  : i === 1
                  ? "Role-Specific:"
                  : "Problem-Solving:"}
              </strong>{" "}
              {q}
            </div>
          ))}
        </div>

        {questions.length > 0 && (
          <button onClick={exportQuestions} className="secondary-btn">
            Export Questions
          </button>
        )}

        {history.length > 0 && (
          <div className="history">
            <h3>Recent Generations</h3>
            {history.map((h, i) => (
              <div key={i} className="history-item">
                {h.role}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
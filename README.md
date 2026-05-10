# 🤖 AI Interview Question Generator

A production-ready AI-powered web application that generates professional interview questions for any job title using LLM APIs (OpenRouter). Built with React and deployed on Vercel.

🌐 Live Demo: https://ai-interview-generator-tau.vercel.app/

---

## 🚀 Project Overview

This application allows users to input a job title and instantly receive 3 high-quality, AI-generated interview questions tailored to that role.

It simulates a real-world SaaS AI product by integrating:
- Large Language Models (LLMs)
- Secure API handling
- Real-time user interaction
- Cloud deployment

---

## ✨ Features

- 🎯 Generate interview questions from any job title
- ⚡ Instant AI responses using OpenRouter LLM API
- 🧠 Smart prompt engineering for professional outputs
- ⏳ Loading state for better UX
- 🚫 Cooldown system to prevent API spam (rate-limit protection)
- ❌ Full error handling (401, 403, 404, 429)
- 📱 Clean and responsive UI
- 🌐 Fully deployed on Vercel

---

## 🧠 How It Works

1. User enters a job title (e.g. Customer Success Manager)
2. React frontend sends request to OpenRouter API
3. AI model generates structured interview questions
4. Response is formatted and displayed in the UI

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- JavaScript (ES6+)
- Axios

### AI / Backend API
- OpenRouter API
- LLM Models (e.g. GPT-style / Mistral)

### Deployment
- Vercel

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Kipkiruie/ai-interview-generator.git
cd ai-interview-generator
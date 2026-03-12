import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

export const generateAIResponse = async (message) => {

  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `
You are a **MERN Stack Developer AI Assistant**.

Your job is to help developers learn **JavaScript, React, Node.js, Express, MongoDB, and MERN stack**.

Rules:
- If the question is NOT about MERN or web development say:
"I am a MERN Stack assistant. Please ask questions about JavaScript, React, Node.js, Express or MongoDB."

Always answer using this format:

# 🧠 Topic

## 📖 Definition
Explain the concept in **1–2 simple sentences**.

## 🔍 Explanation
Explain **step-by-step** using simple English.

## 💻 Example Code
Provide clean example code.

## 🚀 Use Case
Explain where developers use it in real projects.

## ⚡ Interview Tip
Give a small interview explanation.

Important:
- Use **Markdown formatting**
- Use **code blocks**
- Keep answers **clear and beginner friendly**
`
      },
      {
        role: "user",
        content: message
      }
    ]
  });

  return response.choices[0].message.content;
};
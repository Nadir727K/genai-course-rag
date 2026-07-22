# Advanced RAG System for Udemy Course Subtitles

A production-grade Retrieval-Augmented Generation (RAG) system built with **Node.js** and **JavaScript** that ingests Udemy course subtitle files, chunks them intelligently, generates embeddings, and stores them in **Pinecone** for semantic search.

The system enables students to ask natural language questions about course content and receive accurate answers with **lesson names** and **timestamp citations**. It also includes advanced RAG techniques such as **Input Guardrails**, **Query Translation**, **HyDE (Hypothetical Document Embeddings)**, **Intelligent Routing**, **Corrective RAG (CRAG)**, and **LLM-based Answer Generation**.

---

## 🚀 Demo

**Demo Video:**  

https://github.com/user-attachments/assets/888c8810-cfb3-47a4-a3e5-ddadd555af46


## ✨ Features

- Subtitle ingestion from `.vtt` and `.srt` files
- Intelligent text chunking
- OpenAI embeddings generation
- Pinecone vector database integration
- Semantic similarity search
- Multi-stage RAG pipeline
- Input Guardrails
- Query Translation
- HyDE Retrieval
- Intelligent Query Routing
- Corrective RAG (CRAG)
- LLM answer generation
- Lesson name and timestamp citations
- Modular and production-ready architecture

---

## 🛠️ Tech Stack

- Node.js
- JavaScript
- OpenAI API
- Pinecone
- LangChain
- dotenv

---

## 📂 Project Structure

```
genai-course-rag/
│
├── src/
│   ├── ingest/
│   ├── rag/
│   ├── vectorstore/
│   ├── utils/
│   └── chat.js
│
├── subtitles/
├── .env
├── package.json
└── README.md
```

---

## ⚙️ Installation

Clone the repository:

```bash
git clone <repository-url>
```

Move into the project:

```bash
cd genai-course-rag
```

Install dependencies:

```bash
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root.

```env
OPENAI_API_KEY=sk-your-openai-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=genai-cohort-rag
```

---

## 📥 Ingest Course Data

Run the ingestion pipeline to process subtitles and upload embeddings to Pinecone.

```bash
node src/ingest/index.js
```

---

## 💬 Ask Questions

Start querying the course.

```bash
node src/rag/chat.js "What is Expo and how does it compare to bare React Native?"
```

Example output:

```
Answer:
Expo is a framework built on top of React Native that simplifies development by providing pre-configured tooling and APIs.

Lesson:
React Native Introduction

Timestamp:
00:18:24
```

---

## 📖 How It Works

1. Load subtitle files
2. Clean and preprocess text
3. Split into semantic chunks
4. Generate OpenAI embeddings
5. Store embeddings in Pinecone
6. Apply input guardrails
7. Improve the query using Query Translation and HyDE
8. Retrieve relevant chunks
9. Validate retrieval using CRAG
10. Generate the final answer with citations

---

## 📜 License

This project is created for educational purposes.

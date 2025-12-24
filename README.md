# AI Resume Extractor Microservice

A production-style FastAPI microservice for high-fidelity semantic parsing of resumes. It uses **Gemma 3** (local via Ollama) and **Google AI Studio** (cloud) to convert unstructured PDF resumes into structured JSON data.

## 🚀 Key Features
- **Semantic Parsing:** Extracts Skills, Experience, Education, Projects, and Summaries.
- **Dual LLM Support:** 
  - **Local:** Ollama (Gemma 3)
  - **Cloud:** Google AI Studio (Gemma 3 / Gemini 1.5 Flash)
- **Asynchronous Processing:** Long-running parsing tasks run in the background.
- **OCR Fallback:** Uses Tesseract and Poppler to parse scanned PDF resumes.
- **Production Ready:** Containerized with Docker and ready for Render deployment.

## 🛠️ Tech Stack
- **Framework:** FastAPI
- **LLM Orchestration:** LangChain
- **PDF Processing:** pdfplumber, pypdf, pdf2image
- **OCR:** Tesseract
- **Containerization:** Docker & Docker Compose

## 💻 Local Development

### Prerequisites
- Python 3.11+
- Tesseract & Poppler (`brew install tesseract poppler`)
- Ollama (running with `gemma3` pulled)

### Setup
1. Clone the repository.
2. Create a virtual environment and install dependencies:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
3. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

## ☁️ Deployment on Render

### 1. Push to GitHub
Yes, you should push all project files **except** those excluded by `.gitignore` (like `.venv` and `conductor/`).

```bash
git add .
git commit -m "feat: Initial commit for cloud deployment"
git push origin main
```

### 2. Render Setup
1. Log in to [Render](https://render.com).
2. Click **New +** > **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file.
5. **Configure Secrets:** In the Render dashboard, you must provide the following:
   - `GOOGLE_API_KEY`: Your key from [Google AI Studio](https://aistudio.google.com/).
   - `API_KEY`: A secret string of your choice to protect your API (sent via `X-API-Key` header).

### 📖 API Usage

**Submit Resume:**
```bash
curl -X POST "https://your-app.onrender.com/v1/parse" \
     -H "X-API-Key: your-secret-key" \
     -F "file=@resume.pdf"
```

**Check Status:**
```bash
curl "https://your-app.onrender.com/v1/jobs/<job_id>" \
     -H "X-API-Key: your-secret-key"
```

---
Built with ❤️ by Akshat Shrivastava


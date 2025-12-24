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

### 📖 API Usage

The microservice is deployed at: `https://resume-extractor-5uc5.onrender.com`

**1. Submit a Resume for Parsing**
```bash
curl -X POST "https://resume-extractor-5uc5.onrender.com/v1/parse" \
     -H "X-API-Key: YOUR_SECRET_KEY" \
     -F "file=@your_resume.pdf"
```
*Returns a `job_id` to track processing.*

**2. Retrieve Parsed JSON Results**
```bash
curl -X GET "https://resume-extractor-5uc5.onrender.com/v1/jobs/{job_id}" \
     -H "X-API-Key: YOUR_SECRET_KEY"
```

### 🐍 Programmatic Integration

#### Python
```python
import requests
import time

API_URL = "https://resume-extractor-5uc5.onrender.com/v1"
HEADERS = {"X-API-Key": "YOUR_SECRET_KEY"}

# 1. Submit Resume
with open("resume.pdf", "rb") as f:
    response = requests.post(f"{API_URL}/parse", headers=HEADERS, files={"file": f})
    job_id = response.json()["job_id"]

# 2. Poll for results
while True:
    res = requests.get(f"{API_URL}/jobs/{job_id}", headers=HEADERS).json()
    if res["status"] == "completed":
        print(res["result"])
        break
    elif res["status"] == "failed":
        print("Error:", res.get("error"))
        break
    time.sleep(5)
```

#### JavaScript (Node.js/Browser)
```javascript
const API_URL = "https://resume-extractor-5uc5.onrender.com/v1";
const HEADERS = { "X-API-Key": "YOUR_SECRET_KEY" };

async function parseResume(file) {
  const formData = new FormData();
  formData.append("file", file);

  // 1. Submit
  const subResponse = await fetch(`${API_URL}/parse`, {
    method: "POST",
    headers: HEADERS,
    body: formData
  });
  const { job_id } = await subResponse.json();

  // 2. Poll
  const poll = setInterval(async () => {
    const res = await fetch(`${API_URL}/jobs/${job_id}`, { headers: HEADERS });
    const data = await res.json();
    
    if (data.status === "completed") {
      console.log(data.result);
      clearInterval(poll);
    }
  }, 5000);
}
```

---
Built with ❤️ by [Akshat Shrivastava](https://github.com/akshatshrivastava)


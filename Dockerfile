FROM python:3.11

# Install system dependencies for Tesseract OCR
# Using full python image covers most build deps
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    tesseract-ocr \
    libtesseract-dev \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip to ensure wheel support is latest
RUN pip install --upgrade pip

# Copy requirements first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (default for FastAPI/Uvicorn)
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

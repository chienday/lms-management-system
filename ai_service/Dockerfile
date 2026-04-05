FROM python:3.10-slim

# Install only necessary system packages (no Ollama)
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Copy & cấp quyền cho start.sh (nếu cần)
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expose only the application port (8000)
EXPOSE 8000

CMD ["/start.sh"]
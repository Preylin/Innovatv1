FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el contenido de la carpeta api al WORKDIR (/app)
COPY . .

# CORRECCIÓN: Como main.py está en la carpeta 'app', usamos app.main:app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
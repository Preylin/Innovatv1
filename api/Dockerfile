FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar la carpeta app, alembic y el archivo alembic.ini
COPY . .

EXPOSE 8000

# CORRECCIÓN: Como main.py está en la carpeta 'app', usamos app.main:app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
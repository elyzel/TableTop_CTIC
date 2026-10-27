# OBJETIVO: encapsular o TableTop com Python, Flask e Gunicorn.
# ARQUIVO NOVO: Dockerfile
# COLE TODO O CONTEÚDO.

FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Cria um usuário sem privilégios administrativos.
RUN groupadd --gid 10001 tabletop \
    && useradd --uid 10001 --gid tabletop --create-home tabletop

# Instala primeiro as dependências.
COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

# Copia somente os arquivos necessários para executar o projeto.
COPY app.py fase2.py cenario.json interrogatorio.json ./
COPY static/ ./static/
COPY templates/ ./templates/

# Prepara a pasta que receberá o volume persistente.
RUN mkdir -p /app/dados \
    && chown tabletop:tabletop /app/dados

USER tabletop

EXPOSE 5000

# Verifica se a aplicação responde.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:5000/', timeout=3).close()"]

# Um único processo preserva o estado compartilhado em memória.
# As threads permitem atender várias requisições nesse processo.
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--worker-class", "gthread", "--threads", "8", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-", "app:app"]
FROM tiagopeixoto/graph-tool-git:latest

WORKDIR /app

# Tools to build venv
RUN pacman -Sy --noconfirm \
    python-pip \
    python-virtualenv \
    git \
 && pacman -Scc --noconfirm

# IMPORTANT: inherit system packages (graph-tool)
RUN python -m venv /venv --system-site-packages

# Upgrade pip inside venv
RUN /venv/bin/pip install --upgrade pip

# FastAPI stack inside venv
RUN /venv/bin/pip install --no-cache-dir \
    fastapi \
    uvicorn \
    python-multipart \
    markdown pygments

# Copy backend code
COPY . /app

# Use venv python
ENTRYPOINT ["/venv/bin/python"]

# Start FastAPI
CMD ["-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]

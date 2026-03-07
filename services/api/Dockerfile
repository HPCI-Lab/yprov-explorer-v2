FROM tiagopeixoto/graph-tool-git:latest

WORKDIR /app

# Install pip and virtualenv
RUN pacman -Sy --noconfirm python-pip python-virtualenv

# Create a virtual environment
RUN python -m venv /venv

# Copy requirements file and install packets in the virtual environment
COPY requirements.txt /app
RUN /venv/bin/pip install --no-cache-dir -r requirements.txt

# Copy the source code
COPY . /app

# Use python from the virtual environment
ENTRYPOINT ["/venv/bin/python"]
CMD ["app.py"]

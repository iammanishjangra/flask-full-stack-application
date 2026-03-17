# Simple Flask & MySQL Full-Stack App

A clean, minimalist full-stack project demonstrating how to connect a Vanilla JS frontend, a Flask Python backend, and a MySQL database together using Docker and Jenkins for deployment.

## Components
1. **Frontend**: Vanilla HTML/CSS/JS served via Nginx. It communicates with the backend via Nginx reverse proxy on `/api/`.
2. **Backend**: A lightweight Python Flask application providing a RESTful API (`/api/status` and `/api/messages`).
3. **Database**: A MySQL 8.0 container initialized automatically with a `messages` table.

## Local Execution (No Docker)

### 1. Database
Make sure MySQL is installed and running. Create the database and table:
```bash
mysql -u root -p < db/init.sql
```

### 2. Backend
Navigate to the `backend` folder, set up your Python environment, and start the app:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set your connection details:
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=yourpassword
export DB_NAME=app_db

python app.py
```
*Runs on `http://localhost:5000`*

### 3. Frontend
Open another terminal in the `frontend` directory and serve the static files:
```bash
cd frontend
python3 -m http.server 8000
```
*Access frontend at `http://localhost:8000`*

## Jenkins Delivery Pipeline

A `Jenkinsfile` is provided in the root directory. This pipeline is set up for a traditional bare-metal/VM deployment without Docker.

### Pipeline Stages
1. **Checkout**: Pulls code from SCM.
2. **Deploy Frontend**: Copies static files to `/var/www/flask-app-frontend`, setting permissions.
3. **Deploy Backend**: Copies Python backend files to `/var/www/flask-app-backend`, builds a virtual environment, and installs requirements via pip.
4. **Restart Services**: Attempts to restart Apache (serving the frontend/proxy) and a `flask-backend.service` systemd service.
5. **Verify**: Ensures the backend is responding.

### Jenkins Server Requirements:
For this Jenkinsfile to work, your Jenkins server (or the target server if utilizing ssh steps) will need:
- `python3` and `python3-venv` installed.
- Appropriate file permissions or `sudo` rights without password for Jenkins to copy files to `/var/www/`.
- Apache configured to point its DocumentRoot to `/var/www/flask-app-frontend`.
- A systemd service file configured to run the Flask application in `/var/www/flask-app-backend/venv/bin/python app.py`.

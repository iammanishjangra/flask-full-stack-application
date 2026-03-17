# 🚀 Apache + PM2 + Flask — Python Project Setup Guide

**Author:** Manish  
**Server:** agent-1  
**Tailscale IP:** 100.68.126.54  
**Project Path:** `/var/www/php82/python-project`  
**Access URL:** `http://100.68.126.54/php82/python-project/`

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Folder Structure](#folder-structure)
3. [Files Created](#files-created)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [Commands Reference](#commands-reference)
6. [Architecture Flow](#architecture-flow)
7. [Troubleshooting](#troubleshooting)

---

## 🧭 Project Overview

Is project mein ek Flask (Python) web application ko production-ready setup ke saath deploy kiya gaya hai:

- **PHP 8.2** — Server par PHP version install ki gayi
- **Flask** — Python web framework jo port `5000` par run karta hai
- **PM2** — Node.js based process manager jo Flask app ko alive rakhta hai
- **Apache** — Web server jo port `80` par requests leta hai aur Reverse Proxy ke through Flask app ko forward karta hai
- **Tailscale** — Server ko public IP dene ke liye use kiya

---

## 📁 Folder Structure

```
/var/www/
└── php82/
    └── python-project/
        ├── app.py                  ← Main Flask application
        ├── ecosystem.config.js     ← PM2 configuration file
        ├── Jenkinsfile             ← CI/CD pipeline config (pre-existing)
        ├── README.md               ← Ye file
        ├── requirements.txt        ← Python dependencies list
        ├── templates/
        │   └── index.html          ← HTML template (Flask render_template)
        └── venv/                   ← Python virtual environment
            ├── bin/
            │   └── python          ← Virtual env ka Python binary
            ├── lib/
            └── ...
```

---

## 📄 Files Created

### 1. `app.py` — Main Flask Application

**Location:** `/var/www/php82/python-project/app.py`

**Content:**
```python
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    # Ye function hamare home page (index.html) ko render karega
    return render_template('index.html')

@app.route('/about')
def about():
    # Ek simple about API endpoint
    return {"message": "Hello Manish! Ye apka naya python web project hai."}

if __name__ == '__main__':
    print("🚀 App start ho raha hai! Browser me http://127.0.0.1:5000 kholiye")
    app.run(host='0.0.0.0', port=5000, debug=False)
```

**Kya karta hai:**
- `/` route par `templates/index.html` render karta hai
- `/about` route par ek JSON response deta hai
- Port `5000` par `0.0.0.0` host par run karta hai (sabhi network interfaces pe listen karta hai)
- `debug=False` — production mode mein run hota hai

---

### 2. `ecosystem.config.js` — PM2 Configuration

**Location:** `/var/www/php82/python-project/ecosystem.config.js`

**Content:**
```javascript
module.exports = {
  apps: [
    {
      name: "python-project",
      script: "/var/www/php82/python-project/venv/bin/python",
      args: "app.py",
      cwd: "/var/www/php82/python-project",
      interpreter: "none",
      env: {
        FLASK_ENV: "production",
        FLASK_DEBUG: "0"
      },
      watch: false,
      max_memory_restart: "500M",
      error_file: "/var/log/pm2/python-project-error.log",
      out_file: "/var/log/pm2/python-project-out.log"
    }
  ]
}
```

**Kya karta hai:**
- PM2 ko batata hai ki app ka naam `python-project` hai
- Virtual environment ka Python binary use karta hai
- Working directory set karta hai
- Memory limit 500MB set karta hai
- Error aur output logs ka path define karta hai
- `watch: false` — production mein file changes pe auto-restart nahi hota

---

### 3. `templates/index.html` — Frontend HTML Page

**Location:** `/var/www/php82/python-project/templates/index.html`

**Content overview:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Manish's Python Project</title>
    <!-- CSS styling with Segoe UI font, blue color theme -->
</head>
<body>
    <div class="container">
        <h1>🎉 Welcome to Your Python Web App!</h1>
        <p>Flask application successfully running</p>
        <a href="/about" class="btn">Click Here for About API</a>
    </div>
</body>
</html>
```

**Kya karta hai:**
- Flask ka `render_template('index.html')` is file ko serve karta hai
- Blue color scheme aur card-based layout use karta hai
- `/about` route ka button hai

---

### 4. Apache VirtualHost Config — `python-project.conf`

**Location:** `/etc/apache2/sites-available/python-project.conf`

**Content:**
```apache
<VirtualHost *:80>
    ServerName 100.68.126.54
    DocumentRoot /var/www/html

    # Python Project Reverse Proxy
    ProxyPreserveHost On
    ProxyPass /php82/python-project/ http://127.0.0.1:5000/
    ProxyPassReverse /php82/python-project/ http://127.0.0.1:5000/

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined

</VirtualHost>
```

**Kya karta hai:**
- Port `80` par server ko `100.68.126.54` IP ke liye configure karta hai
- `/php82/python-project/` URL ko internally `http://127.0.0.1:5000/` par forward karta hai
- `ProxyPreserveHost On` — original host header preserve karta hai
- Error aur access logs Apache ke default log directory mein save hote hain

---

### 5. `requirements.txt` — Python Dependencies

**Location:** `/var/www/php82/python-project/requirements.txt`

**Content (generated via `pip freeze`):**
```
Flask==3.x.x
Werkzeug==3.0.1
Jinja2==x.x.x
...
```

**Kya karta hai:**
- Project ke saare Python dependencies list karta hai
- Doosre system par project deploy karne ke liye use hota hai: `pip install -r requirements.txt`

---

## 🔧 Step-by-Step Setup

### Step 1: PHP 8.2 Install Karna

```bash
sudo apt update
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.2 php8.2-cli php8.2-common libapache2-mod-php8.2

# Version verify karo
php -v
```

**Kyun kiya:** Server par PHP 8.2 version install karne ke liye official Ondrej PHP repository use ki.

---

### Step 2: Project Folder Structure Banana

```bash
sudo mkdir -p /var/www/php82/python-project
sudo chown -R $USER:$USER /var/www/php82
sudo chmod -R 755 /var/www/php82
```

**Kyun kiya:** `/var/www/php82/` folder PHP 8.2 environment ka root folder hai. Iske andar `python-project/` folder mein Flask app rakhi.

---

### Step 3: Python Virtual Environment Setup

```bash
# Python3 aur pip install karo
sudo apt install -y python3 python3-pip python3-venv

# Project folder mein jao
cd /var/www/php82/python-project

# Virtual environment banao
python3 -m venv venv

# Activate karo
source venv/bin/activate

# Flask install karo
pip install flask

# Requirements save karo
pip freeze > requirements.txt

# Deactivate karo
deactivate
```

**Kyun kiya:** Virtual environment banane se project ka apna isolated Python setup hota hai. System ke Python se alag rehta hai, conflicts nahi hote.

---

### Step 4: Flask App (app.py) Ready Karna

```bash
nano /var/www/php82/python-project/app.py
```

App already project mein thi. `debug=False` set kiya production ke liye.

---

### Step 5: PM2 Install Karna

```bash
# Node.js install karo (PM2 ke liye zaroori)
sudo apt install -y nodejs npm

# PM2 globally install karo
sudo npm install -g pm2

# Version verify karo
pm2 --version
```

**Kyun kiya:** PM2 ek process manager hai jo Flask app ko background mein chalaata hai. Server restart hone par bhi app alive rehti hai.

---

### Step 6: PM2 se Flask App Start Karna

```bash
cd /var/www/php82/python-project

# Direct command se start karo (bina ecosystem file ke)
pm2 start venv/bin/python \
  --name "python-project" \
  --interpreter none \
  -- app.py

# Status check karo
pm2 status

# System restart pe auto-start enable karo
pm2 startup
pm2 save
```

**Output:**
```
┌────┬───────────────────┬──────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┐
│ id │ name              │ status   │ mode    │ pid     │ uptime   │ ↺      │ cpu  │ memory    │
├────┼───────────────────┼──────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┤
│ 0  │ python-project    │ online   │ fork    │ 18568   │ 9m       │ 0      │ 0%   │ 30.9mb    │
└────┴───────────────────┴──────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┘
```

**Kyun kiya:** Flask app ko PM2 ke through start kiya taaki background mein chale aur crash hone par automatically restart ho.

---

### Step 7: Flask App Direct Test Karna

```bash
curl http://localhost:5000
```

**Expected output:** `index.html` ka HTML content — iska matlab Flask sahi chal rahi hai ✅

---

### Step 8: Apache Proxy Modules Enable Karna

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo systemctl restart apache2
```

**Kyun kiya:** Apache by default proxy nahi karta. Ye modules enable karne se Apache HTTP requests ko doosre port (5000) par forward kar sakta hai.

---

### Step 9: Apache VirtualHost Config Banana

```bash
sudo nano /etc/apache2/sites-available/python-project.conf
```

Config content upar dekho (Files Created section mein).

**Kyun kiya:** Apache ko batana pada ki `/php82/python-project/` URL ko port 5000 par chal rahi Flask app ko forward kare.

---

### Step 10: Site Enable Karna aur Default Disable Karna

```bash
# Naya config enable karo
sudo a2ensite python-project.conf

# Default config disable karo (conflict avoid karne ke liye)
sudo a2dissite 000-default.conf

# Syntax check karo
sudo apache2ctl configtest
# Output: Syntax OK ✅

# Apache reload karo
sudo systemctl reload apache2
```

**Kyun kiya:** `000-default.conf` aur `python-project.conf` dono enabled hone par conflict ho sakta tha. Default disable kiya aur apna config enable kiya.

---

## 📌 Commands Reference

### Apache Commands

| Command | Kaam |
|---|---|
| `sudo a2enmod proxy` | Proxy module enable karo |
| `sudo a2enmod proxy_http` | HTTP proxy module enable karo |
| `sudo a2ensite python-project.conf` | Site config enable karo |
| `sudo a2dissite 000-default.conf` | Default site disable karo |
| `sudo apache2ctl configtest` | Config syntax check karo |
| `sudo systemctl reload apache2` | Apache reload karo (bina restart) |
| `sudo systemctl restart apache2` | Apache restart karo |
| `sudo systemctl status apache2` | Apache status dekho |
| `sudo tail -f /var/log/apache2/error.log` | Live error logs dekho |

### PM2 Commands

| Command | Kaam |
|---|---|
| `pm2 start ... -- app.py` | App start karo |
| `pm2 status` | Sab apps ka status dekho |
| `pm2 logs python-project` | Live logs dekho |
| `pm2 restart python-project` | App restart karo |
| `pm2 stop python-project` | App stop karo |
| `pm2 delete python-project` | PM2 list se remove karo |
| `pm2 startup` | System boot pe auto-start setup karo |
| `pm2 save` | Current process list save karo |
| `pm2 monit` | Live monitoring dashboard |

### Flask / Python Commands

| Command | Kaam |
|---|---|
| `python3 -m venv venv` | Virtual environment banao |
| `source venv/bin/activate` | Virtual environment activate karo |
| `pip install flask` | Flask install karo |
| `pip freeze > requirements.txt` | Dependencies save karo |
| `deactivate` | Virtual environment deactivate karo |

### Test Commands

| Command | Kaam |
|---|---|
| `curl http://localhost:5000` | Flask direct test karo |
| `curl http://localhost/php82/python-project/` | Apache proxy test karo |
| `curl -v http://100.68.126.54/php82/python-project/` | Full verbose test |

---

## 🗺️ Architecture Flow

```
Browser (User)
      |
      | http://100.68.126.54/php82/python-project/
      ↓
Apache Web Server (Port 80)
      |
      | ProxyPass → http://127.0.0.1:5000/
      ↓
PM2 Process Manager
      |
      | Flask app alive rakhta hai
      ↓
Flask Application (Port 5000)
      |
      | render_template('index.html')
      ↓
templates/index.html
      |
      ↓
HTML Response browser ko wapas ✅
```

---

## 🔍 Troubleshooting

### Problem: 404 Not Found

**Check karo:**
```bash
# 1. PM2 chal raha hai?
pm2 status

# 2. Flask port 5000 par chal rahi hai?
curl http://localhost:5000

# 3. Proxy modules enable hain?
apache2ctl -M | grep proxy

# 4. Correct config enabled hai?
ls -la /etc/apache2/sites-enabled/

# 5. Config syntax theek hai?
sudo apache2ctl configtest

# 6. Error logs dekho
sudo tail -20 /var/log/apache2/error.log
```

### Problem: Flask app crash ho gayi

```bash
# PM2 logs dekho
pm2 logs python-project --lines 50

# App restart karo
pm2 restart python-project
```

### Problem: Apache start nahi ho raha

```bash
sudo apache2ctl configtest
sudo systemctl status apache2
sudo tail -20 /var/log/apache2/error.log
```

---

## 📝 Important Notes

1. **debug=False** — Production mein hamesha `debug=False` rakho `app.py` mein
2. **pm2 save** — PM2 startup commands ke baad `pm2 save` zaroor chalaao, warna reboot ke baad app start nahi hogi
3. **Tailscale IP** — `100.68.126.54` Tailscale network ki private IP hai, sirf Tailscale network se accessible hai
4. **Virtual Environment** — Hamesha `venv/bin/python` use karo PM2 mein, system Python nahi
5. **Folder naam** — Folder `php82` hai (bina dot), URL mein bhi `php82` use karo

---

*Last updated: March 17, 2026*  
*Server: agent-1 | OS: Ubuntu 24.04 | Apache: 2.4.58 | Python: 3.12.3*

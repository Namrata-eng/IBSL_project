# 🚀 ISKCON Kopargaon Website — AWS EC2 Production Deployment Runbook

Complete, end-to-end guide for deploying the **ISKCON Kopargaon Temple Website** (React + Vite SPA frontend, Node.js + Express backend, MongoDB Atlas database) to an **AWS EC2 Ubuntu** instance with **Nginx**, **PM2**, **SSL (Let's Encrypt)**, and persistent external uploads storage.

---

## 📋 Architecture Overview

```
                      Internet / Devotees
                               │
                               ▼
                    [AWS Route 53 / DNS]
                    A Record -> Elastic IP
                               │
                               ▼
               [AWS EC2 Ubuntu (t3.small/medium)]
          ┌────────────────────┴────────────────────┐
          │  UFW Firewall (Ports 22, 80, 443 open) │
          └────────────────────┬────────────────────┘
                               ▼
               [Nginx Reverse Proxy & Static Host]
              /                |                 \
             /                 |                  \
            ▼                  ▼                   ▼
    Static Vite Assets     /uploads/*           /api/*
   /client/dist (SPA)  /var/www/iskcon-uploads  Express API (Port 5000)
    (1-yr cache, gzip)  (Persistent across pulls)   (Managed by PM2)
                                                   │
                                                   ▼
                                         [MongoDB Atlas Cluster]
                                            (TLS Encrypted)
```

---

## 🛠️ Step 1: AWS EC2 Instance Provisioning

1. **Log in to the AWS Management Console** and navigate to **EC2 Dashboard**.
2. Click **Launch Instance**:
   - **Name**: `iskcon-kopargaon-production`
   - **OS / AMI**: **Ubuntu Server 22.04 LTS (HVM)** or **Ubuntu Server 24.04 LTS** (64-bit x86).
   - **Instance Type**:
     - Recommended: `t3.small` (2 vCPU, 2 GB RAM) or `t3.medium` (2 vCPU, 4 GB RAM) for smooth production operation and image compression.
     - Minimum: `t2.micro` / `t3.micro` (1 vCPU, 1 GB RAM — if using micro, create a 2 GB swapfile before running builds).
   - **Key Pair**: Select or generate a key pair (e.g. `iskcon-key.pem`) and download it.
3. **Configure Security Group**:
   Create a Security Group `iskcon-web-sg` with the following inbound rules:
   | Type | Protocol | Port Range | Source | Purpose |
   | :--- | :--- | :--- | :--- | :--- |
   | **SSH** | TCP | `22` | `My IP` (or `0.0.0.0/0`) | Secure server terminal access |
   | **HTTP** | TCP | `80` | `0.0.0.0/0` (Anywhere IPv4) | Web traffic & Let's Encrypt renewal |
   | **HTTPS** | TCP | `443` | `0.0.0.0/0` (Anywhere IPv4) | Secure HTTPS production traffic |
4. **Storage**: Set EBS root volume to **30 GB gp3** (General Purpose SSD).
5. Click **Launch Instance**.

### 📌 Allocate & Associate an Elastic IP (Crucial)
> [!IMPORTANT]
> Standard public IP addresses on EC2 change upon instance stop/start. Always attach an **Elastic IP** so your DNS record never breaks:
1. In the EC2 console, go to **Network & Security** → **Elastic IPs**.
2. Click **Allocate Elastic IP address** → **Allocate**.
3. Select the allocated IP, click **Actions** → **Associate Elastic IP address**.
4. Choose your running instance `iskcon-kopargaon-production` and click **Associate**.

---

## 🌐 Step 2: Domain & DNS Configuration

At your domain registrar (GoDaddy, Namecheap, Cloudflare, Route 53, etc.), configure DNS records pointing to your EC2 Elastic IP:

| Record Type | Host / Name | Value / Destination | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` (or root domain) | `<Your_Elastic_IP>` (e.g. `3.109.120.45`) | Auto / 300s |
| **A** or **CNAME** | `www` | `<Your_Elastic_IP>` or `iskconkopargaon.com` | Auto / 300s |

Verify DNS propagation in your terminal:
```bash
dig +short iskconkopargaon.com
# Should return your Elastic IP address
```

---

## 🍃 Step 3: MongoDB Atlas Setup

1. In your **MongoDB Atlas** account, create or select your project cluster.
2. **Network Access / IP Allowlist**:
   - Go to **Network Access** → **Add IP Address**.
   - Add your EC2 Elastic IP: `<Your_Elastic_IP>/32` with label `EC2-Production`.
   *(Optional during initial testing: allow access from anywhere `0.0.0.0/0`, then restrict to the EC2 Elastic IP).*
3. **Database User**:
   - Go to **Database Access** → **Add New Database User**.
   - Authentication Method: **Password**.
   - Role: `Read and write to any database`.
   - Save username and password.
4. **Get Connection String**:
   - Click **Connect** → **Drivers** (Node.js).
   - Copy connection string:
     ```text
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/iskcon_kopargaon?retryWrites=true&w=majority
     ```

---

## 💻 Step 4: First-Time Server Deployment

### 1. SSH into the Server
```bash
chmod 400 iskcon-key.pem
ssh -i iskcon-key.pem ubuntu@<Your_Elastic_IP>
```

### 2. (Optional for 1 GB RAM instances) Setup Swap
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 3. Clone Repository into `/var/www/iskcon-kopargaon`
```bash
sudo mkdir -p /var/www
sudo chown -R ubuntu:ubuntu /var/www
cd /var/www
git clone https://github.com/PRATHMESH-MAHAJAN-2005/IBSL_Project.git iskcon-kopargaon
cd iskcon-kopargaon
git checkout feature_prathmesh
```

### 4. Configure Production Environment Variables
Create and edit the server environment file:
```bash
cp server/.env.example server/.env
nano server/.env
```

Ensure the following variables are set with your production secrets:
```ini
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<db_user>:<db_password>@cluster0.abcde.mongodb.net/iskcon_kopargaon?retryWrites=true&w=majority
JWT_SECRET=generate_a_random_64_character_string_here_108
CLIENT_URL=https://iskconkopargaon.com,https://www.iskconkopargaon.com
UPLOAD_DIR=/var/www/iskcon-uploads
SCREENSHOT_RETENTION_VERIFIED_DAYS=30
SCREENSHOT_RETENTION_REJECTED_DAYS=15
SMTP_USER=iskconkopargaon@gmail.com
SMTP_PASS=your_gmail_16_char_app_password
ADMIN_EMAIL=iskconkopargaon@gmail.com
```
Save and exit with `Ctrl + O`, `Enter`, `Ctrl + X`.

### 5. Update Nginx Domain in Configuration
Open `deploy/nginx-iskcon.conf`:
```bash
nano deploy/nginx-iskcon.conf
```
Replace `iskconkopargaon.com www.iskconkopargaon.com` with your registered domain name on line 10.

### 6. Run the Automated Setup Script
Run the idempotent provisioning script:
```bash
sudo bash deploy/setup-ec2.sh
```
This script will:
- Update Ubuntu packages.
- Install Node.js 20 LTS, Nginx, Certbot, PM2, and UFW.
- Configure UFW firewall (ports 22, 80, 443).
- Create `/var/www/iskcon-uploads` with permissions.
- Link Nginx site configuration and reload Nginx.
- Install npm dependencies and build both client and server.
- Start the server under PM2 and configure systemd autostart on reboot.

---

## 🗄️ Step 5: Live Database Image Migration

To map any old images in your production database to the clean local assets:
```bash
cd /var/www/iskcon-kopargaon
npm run migrate:images --workspace server
```
This script is **idempotent** and will update services, events, darshan gallery, and prasadam records to point to `/images/...`.

---

## 🔒 Step 6: SSL Certificate (HTTPS) via Let's Encrypt

Once your DNS A records have propagated to your Elastic IP:
```bash
sudo certbot --nginx -d iskconkopargaon.com -d www.iskconkopargaon.com
```
- Provide your admin email when prompted.
- Agree to the Terms of Service.
- Certbot will automatically install the certificate, configure HTTPS redirects in Nginx, and setup automatic renewal via systemd timer.

Test automatic renewal:
```bash
sudo certbot renew --dry-run
```

---

## 🔄 Ongoing Updates (Zero-Downtime Deployment)

Whenever you push new code to GitHub, deploy updates with zero downtime:

```bash
cd /var/www/iskcon-kopargaon
bash deploy/update.sh
```

Or manually:
```bash
cd /var/www/iskcon-kopargaon
git pull origin feature_prathmesh
npm install
npm run build
pm2 reload iskcon-api
sudo nginx -t && sudo systemctl reload nginx
```

> [!NOTE]
> `pm2 reload iskcon-api` performs a graceful rolling restart without dropping ongoing HTTP connections.

---

## 💾 Backups & Persistence

### 1. Uploaded Images (`/var/www/iskcon-uploads`)
All admin-uploaded images are saved to `/var/www/iskcon-uploads`, completely outside the git repository directory. Redeployments and `git pull` operations will **never** overwrite or delete uploaded media.

To backup uploads to an AWS S3 bucket:
```bash
# Install AWS CLI
sudo apt install -y awscli

# Daily cron backup to S3
aws s3 sync /var/www/iskcon-uploads s3://your-backup-bucket/iskcon-uploads/ --delete
```

### 2. Database Backup (MongoDB Atlas)
- Ensure **Cloud Backup** is enabled in your MongoDB Atlas cluster settings (Snapshots taken automatically every 6 or 24 hours).

---

## 🩺 Troubleshooting & Diagnostics

### 1. 502 Bad Gateway
- **Cause**: Node.js backend is not running or crashed on startup.
- **Check PM2 logs**:
  ```bash
  pm2 status
  pm2 logs iskcon-api --lines 50
  ```
- **Check direct API health**:
  ```bash
  curl http://127.0.0.1:5000/api/health
  ```

### 2. MongoDB Connection Timeout / DNS Error
- **Cause**: IP not allowlisted in MongoDB Atlas or network SRV lookup blocked.
- **Fix**:
  1. Go to MongoDB Atlas → **Network Access** and verify your Elastic IP is present.
  2. If using an ISP or DNS that fails SRV resolution, edit `server/.env` and add:
     ```ini
     DNS_SERVERS=1.1.1.1,8.8.8.8
     ```
  3. Restart PM2: `pm2 restart iskcon-api`.

### 3. Image Upload Fails ("File too large" or 413)
- **Cause**: Nginx `client_max_body_size` smaller than file size.
- **Fix**:
  1. Verify `deploy/nginx-iskcon.conf` contains `client_max_body_size 6m;`.
  2. Reload Nginx: `sudo nginx -t && sudo systemctl reload nginx`.

### 4. CORS Errors on API Calls
- **Cause**: Live website domain is not in `CLIENT_URL`.
- **Fix**:
  1. In `server/.env`, verify `CLIENT_URL`:
     ```ini
     CLIENT_URL=https://iskconkopargaon.com,https://www.iskconkopargaon.com
     ```
  2. Reload backend: `pm2 restart iskcon-api`.

### 5. Check System Resources
```bash
# Check CPU & RAM
htop

# Check disk space
df -h

# Check Nginx access and error logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```


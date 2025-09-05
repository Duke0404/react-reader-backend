# React Reader Backend

A self-hostable backend service for the React Reader application, providing user authentication, library synchronization, text-to-speech, and translation services.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd react-reader-backend
```

### 2. Configure Environment
Create a `.env` file:
```bash
# Required
JWT_SECRET=your_secure_jwt_secret_key_at_least_32_characters_long

# Optional - defaults provided
MONGO_URI=mongodb://mongodb:27017/readerdb
SERVER_PORT=3000
HTTPS_PORT=3443
NODE_ENV=production
```

### 3. Start the Services
```bash
docker-compose up
```

That's it! The backend will be available at:
- **HTTP**: `http://localhost:3000`
- **HTTPS**: `https://localhost:3443` (for cross-origin requests)

## 🔐 HTTPS Setup for Cross-Origin Authentication

If you're using the React Reader frontend from GitHub Pages or any external domain, you'll need HTTPS for secure cookie authentication.

### Automatic Certificate Generation
The Docker setup automatically generates self-signed certificates. You just need to trust them once.

### Trust the Certificate

#### On macOS:
```sh
# Copy certificate from container
docker cp express-app:/app/certs/cert.pem ./localhost-cert.pem

# Add to system trust store
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain localhost-cert.pem
```

#### On Linux:
```sh
# Copy certificate from container
docker cp express-app:/app/certs/cert.pem ./localhost-cert.pem

# Add to system trust store
sudo cp localhost-cert.pem /usr/local/share/ca-certificates/localhost.crt
sudo update-ca-certificates
```

#### On Windows:
```sh
# Copy certificate from container
docker cp express-app:/app/certs/cert.pem ./localhost-cert.pem

# Import certificate (run as Administrator)
certlm.msc
# Import -> Trusted Root Certification Authorities -> localhost-cert.pem
```

### Manual Browser Setup (Alternative)
If you can't modify system certificates:

1. **Open browser** and navigate to `https://localhost:3443/health`
2. **Click "Advanced"** on the security warning
3. **Click "Proceed to localhost (unsafe)"**
4. **Certificate is now accepted** for this browser session

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user  
- `GET /auth/validate` - Validate JWT token
- `POST /auth/logout` - Logout user

### Library Management
- `GET /library` - Get user's book library
- `POST /library` - Update user's library
- `DELETE /library/:bookId` - Delete book from library

### Text-to-Speech
- `POST /readAloud` - Generate audio from text

### Translation  
- `POST /translate` - Translate text
- `GET /translate/languages` - Get available languages
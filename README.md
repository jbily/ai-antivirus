# AI-Antivirus

AI-Antivirus is a web application that uses AI to detect malware signatures and scan network hosts for potential threats.

## Features

- Upload and analyze datasets (CSV/JSON) containing malware signatures or traffic logs
- Scan IP addresses and CIDR ranges on your local network
- AI-powered threat detection and risk assessment
- Real-time scan progress updates
- Comprehensive threat reports with risk scores and mitigation recommendations
- Bilingual interface (English and French)

## Tech Stack

- **Backend**: Python 3.11, FastAPI, SQLModel (SQLite)
- **AI Layer**: Pre-trained ML model (dummy model included)
- **Network Scanning**: python-nmap
- **Frontend**: React, Vite, TailwindCSS, shadcn/ui
- **Communication**: REST API + WebSockets
- **Containerization**: Docker and Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose

### Installation

```bash
git clone https://github.com/your-username/ai-antivirus.git
cd ai-antivirus
docker compose up --build
```

Once the application is running, open your browser and navigate to:

```
http://localhost:3000
```

## Development

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

## License

MIT
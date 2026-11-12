# Carbonexa Backend (FastAPI + MySQL)

## Setup (Windows, PowerShell, from the `backend` folder)
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env      # then edit DB_PASSWORD and JWT_SECRET
```

## Create the MySQL database (MySQL Command Line / Workbench)
```sql
CREATE DATABASE carbonexa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'carbonexa'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON carbonexa.* TO 'carbonexa'@'localhost';
FLUSH PRIVILEGES;
```

## Run
```powershell
uvicorn app.main:app --reload --port 8000
```
- Swagger UI: http://127.0.0.1:8000/docs
- Health: GET http://127.0.0.1:8000/api/v1/health
- DB check: GET http://127.0.0.1:8000/api/v1/health/db

## Tests
```powershell
pytest
```

## Migrations
```powershell
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

## Connect the frontend (env only, no code changes)
In `carbonexa-frontend/.env.local`:
```
VITE_API_BASE_URL=/api/v1
PHP_API_ORIGIN=http://127.0.0.1:8000
```
Keep `VITE_DATA_MODE=mock` until the project endpoints exist (Phase 4).

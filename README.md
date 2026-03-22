# 💱 Currency Converter — тест Python + Frontend

Тестовый проект для проверки хостинга Python-бэкенда на Таймвебе.

## Структура

```
currency-converter/
├── backend/
│   ├── main.py              # FastAPI сервер
│   └── requirements.txt     # Зависимости
├── frontend/
│   └── index.html           # Фронтенд (статика)
└── README.md
```

## Быстрый старт (локально)

### 1. Бэкенд

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

Проверка: http://localhost:8000 → `{"status": "ok", ...}`

### 2. Фронтенд

Просто открой `frontend/index.html` в браузере.  
Или через любой статик-сервер:

```bash
cd frontend
python -m http.server 3000
```

Открой http://localhost:3000

## Деплой на Таймвеб

### Бэкенд (Python-хостинг / VPS)

1. Загрузить файлы из `backend/`
2. Установить зависимости: `pip install -r requirements.txt`
3. Запустить: `uvicorn main:app --host 0.0.0.0 --port 8000`
4. Убедиться, что порт 8000 открыт

### Фронтенд

1. Загрузить `frontend/index.html` на статик-хостинг (или тот же сервер)
2. В поле "Backend URL" внизу страницы указать адрес бэкенда, например:
   `https://your-server.timeweb.cloud:8000`

## API Endpoints

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/` | Статус сервера |
| GET | `/health` | Healthcheck |
| GET | `/currencies` | Список валют |
| GET | `/convert?amount=100&from=USD&to=RUB` | Конвертация |

## Стек

- **Backend**: Python 3.11+, FastAPI, httpx
- **Frontend**: HTML/CSS/JS (ванилла, без фреймворков)
- **Данные**: Frankfurter API (бесплатный, без ключей, курсы ЕЦБ)

## Примечания

- Frankfurter API не поддерживает RUB напрямую (санкции ЕЦБ).  
  Если RUB недоступен — бэкенд вернёт ошибку, попробуй USD→EUR или другие пары.
- CORS настроен на `*` — для теста ок, на проде ограничь домены.

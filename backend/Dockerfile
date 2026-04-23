FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml ./

RUN pip install flask flask-cors flask-jwt-extended flask-sqlalchemy psycopg2-binary python-dotenv sqlalchemy

COPY . .

EXPOSE 5000

CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]

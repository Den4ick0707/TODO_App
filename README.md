# Todo Task
Реалізовано програму для введення задач
Програма складається з двох частин - *Frontend* і *Backend*

## Щоб запустити програму потрібно:

1. Мати підключення до інтернету
2. Потрібно щоб були встановленні *Docker* та *Node.js*
2. Завантажити архів та розпакувати його
3. Виконати в терміналі таку команду в директорії де файл README.md:
```
    cd ./todo_app_backend
```

4. Потрібно ще створити профіль на mailtrap.io та в вкладці Sandboxes -> My sandbox в полі Credential 
    буде username та password їх потрібно вставити вв відповідні поля в .env файлі
5. Потім створити файл .env та ввести туди це:
```
PORT=3000
MONGO_URI=mongodb://db:27017/todo_db
DB_NAME=todo_db

# Session
SESSION_SECRET=your_super_secret_key_change_in_production

# Mailtrap
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER= ваш профіль на mailtrap
MAILTRAP_PASS=ваш пароль на mailtrap

FRONTEND_URL=http://localhost:8080

NODE_ENV=development

```
6. Потім виконати команду:
```
    docker-compose up --build
```

7. Коли все успішно запустилося переходимо до директорії Frontend:
```
    cd ../todo_app_frontend
``` 
8. Потім виконуємо команду:
```
    npm install
```
та
```
    gulp
```

9. Коли все вдало запустилося потрібно перейти за посиланням:
```
    http://localhost:8080/
```

## Програму реалізованно за допомогою:

### Backend
- Фреймворк - Express.js
- База данних - MongoDb
- Документація API - Swagger(http://localhost:3000/api-docs)
- Використанно Docker для контейнеризації та Docker compose для запуску та налагдження декількох контейцнерів


### Frontend
- HTML,SCSS
- JavaScript
- Використанно збірник Gulp



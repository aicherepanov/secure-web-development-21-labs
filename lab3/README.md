# Отчет по Лабораторной работе №3
> Цель работы: Поиск и устранение XSS уязвимостей.

### 1. Войти на сайт и увидеть список книг и авторов

Чтобы авторизоваться на сайте предварительно создадим пользователя в таблице users, в качестве пароля запишем **md5** хеш:

![alt text](img/Screenshot_1.png "Таблица Users")

В результате успешной авторизации и редиректа на route **/books** видим список книг и авторов:

![alt text](img/Screenshot_2.png "Список книг")

### 2. На странице со списком книг найти
#### 2.1 Reflected XSS в поиске книг

![alt text](img/Screenshot_3.png "Reflected XSS")

#### 2.2 Persisted (Stored) XSS при создании книги

![alt text](img/Screenshot_4.png "Persisted (Stored) XSS")
![alt text](img/Screenshot_5.png "Persisted (Stored) XSS")

#### 2.3 Потенциальную уязвимость через Cookie Injection

```span(id='lblUser')``` отображает значение ```cookie``` ```userId```
Изменим его:

![alt text](img/Screenshot_9.png "Cookie Injection")

#### 2.4 Session hijacking

Похищение cookie любым из 3-х способов приведет к захвату сессии

![alt text](img/Screenshot_10.png "Cookie hijacking")
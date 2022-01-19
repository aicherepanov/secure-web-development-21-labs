const express = require('express');
const app = express();
const port = 8080;
const { Client } = require('pg');
const cookieParser = require('cookie-parser');


app.use(express.static('static'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({
  extended: true
}));

app.use(function (req, res, next) {
    res.setHeader(
      'Content-Security-Policy',
      "img-src 'self'; script-src 'self';"
    );
    next();
  });

const client = new Client({ //Вставьте свои параметры БД
    user: 'postgres',
    host: 'localhost', 
    database: 'lib',
    password: 'P@ssw0rd',
    port: 5432,
});
client.connect();

app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.redirect('/login.html');
})

app.get('/books', async (req, res) => {

    let user = req.cookies["userId"];
    if(!user){
        console.log("unauthenticated. redirect to login");
        res.redirect('/');
        return;
    }
    console.log('Cookies: ', req.cookies)

    let bookname = req.query.name;
    
    let sql = `select ba.id, a.name as author, b.name as book from books_by_authors ba
                left join author a on a.id = ba.aid
                left join book b on b.id = ba.bid`;
    if(bookname){
        sql+=`\rwhere b.name like '%${bookname}%'`        
    }
    try{
        let data = await client.query(sql);
        res.render('booklist', {data: data.rows, filter: bookname});
    }
    catch(e)
    {
        console.log(e);
        res.send(`error ${e.message}. <br/> SQL:${sql}`);
    }
    
})

app.post('/signin', async (req, res) => {
    let login = req.body.name;
    let pass = req.body.pass;
    //let sql = "SELECT name as result FROM users WHERE name = '" + login + "' AND pass = md5('" + pass + "')";
    let sql = {
        text: "SELECT name as result FROM users WHERE name = $1 AND pass = md5($2)", 
        values: [login, pass]
    };
    try{
        let data = await client.query(sql);
        let userId = data.rows[0].result;
        if(data.rows.length>0 && userId){
            const oneDayToSeconds = 24 * 60 * 60;
            res.cookie('userId', userId,{maxAge: oneDayToSeconds});
            res.redirect('/books');
        }else
        {
            res.send(`fail ${login}`);
        }
    }
    catch(e)
    {
        console.log(e);
        res.send(`error ${e.message}. <br/> SQL:${sql}`);
    }

  })

app.post('/addbook', async (req, res) => {
    console.log("adding new book");
    let aid = req.body.author;
    let bname = req.body.bookname;
    let bid = Math.floor(Math.random() * 1000);

    let booksql = {
        text: "insert into book(id,name) values($1,$2)", 
        values: [bid, bname]
    };
    let assingsql = {
        text: "insert into books_by_authors(id, aid, bid) values($1,$2,$3)", 
        values: [Math.floor(Math.random() * 1000), aid,bid]
    };

    try{
        await client.query(booksql);
        await client.query(assingsql); 
        res.redirect('/books');
    }
    catch(e)
    {
        console.log(e);
        res.send(`error ${e.message}. <br/> SQL:${sql}`);
    }


    console.log("added new book");
  })

app.listen(port, ()=>{
	console.log(`server running at http://localhost:${port}`);
})
//XSS alert!!!
//<img src=1 onerror='javascript:alert(document.cookie)'/>
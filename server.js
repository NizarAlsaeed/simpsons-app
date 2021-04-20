'use strict';
require('dotenv').config();
// Application Dependencies
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');
const cors = require('cors');
// Environment variables

// Application Setup
const app = express();
const PORT =  process.env.PORT;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({extended:true}));
// Specify a directory for static resources
app.use(express.static(__dirname+'/public'));
// define our method-override reference
app.use(methodOverride('_method'));
// Set the view engine for server-side templating
app.set('view engine','ejs');
// Use app cors
//app.use(cors);

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);

// app routes here
// -- WRITE YOUR ROUTES HERE --
app.get('/',(req,res)=>{
    const url = 'https://thesimpsonsquoteapi.glitch.me/quotes?count=10';
    superagent.get(url).set('User-Agent', '1.0').then(result=>{
        res.render('index',{result:result.body});
    });
});
app.post('/',(req,res)=>{
    let data = req.body.data;
    let SQL = `INSERT INTO symp (character, quote, image, characterDirection) VALUES($1,$2,$3,$4) RETURNING *`;
    let values=data;
    client.query(SQL,values).then(result=>{
        res.redirect('/favorite-quotes');
    });
});
app.get('/favorite-quotes',(req,res)=>{
    let SQL =`SELECT * FROM symp`;
    client.query(SQL).then(result=>{
        res.render('fav',{result:result.rows});
    });
});
app.get('/favorite-quotes/:quote_id',(req,res)=>{
    let id = req.params.quote_id;
    let values=[];
    let SQL =`SELECT * FROM symp WHERE id=$1`;
    values[0]=id;
    client.query(SQL,values).then(result=>{
        res.render('details',{result:result.rows});
    });
});
app.put('/favorite-quotes/:quote_id',(req,res)=>{
    let id = req.params.quote_id;
    let data = req.body.data;
    let values=[];
    console.log('put', id);
    let SQL =`UPDATE symp SET character=${Object.values(data)[0]}, quote=${Object.values(data)[1]} WHERE id=$1 RETURNING *`;
    console.log('${Object.values(data)[0]}', `${Object.values(data)[0]}`)
    values[0]=id;
    client.query(SQL,values).then(result=>{
        res.render('details',{result:result.rows});
    });
});
app.delete('/favorite-quotes/:quote_id',(req,res)=>{
    let id = req.params.quote_id;
    let values=[];
    console.log('delete', id);
    let SQL =`DELETE FROM symp WHERE id=$1 returning *`;
    values[0]=id;
    client.query(SQL,values).then(result=>{
        console.log('result', result.rows)
        res.redirect('/');
    });
});
// helper functions

// app start point
client.connect().then(() =>
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
);

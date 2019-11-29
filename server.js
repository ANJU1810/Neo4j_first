var express = require("express");
var bodyparser = require("body-parser");
var path = require("path");
var neo4j = require("neo4j-driver").v1;

var app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}));
app.set('views',path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.use(express.static(path.join(__dirname, 'public')));
var driver = neo4j.driver('bolt://localhost' ,neo4j.auth.basic('neo4j' ,'12345'));
var session = driver.session();

//registration form
app.get('/',function(req,res)
{
   // res.send('hlo');
    res.render('index');
});

//login form
app.get('/login',function(req,res)
{
   // res.send('hlo');
    res.render('login');
});

//admin login
app.get('/admin',function(req,res)
{
   // res.send('hlo');
    res.render('admin');
});


//create graph
app.post('/action',function(req,res)
{
    var Name = req.body.name;
    var Email = req.body.email;
    var Pass = req.body.pass;

   // console.log(Name);
    session
    .run('CREATE (n:user {name:{nameParam}, email:{emailParam} ,password:{passParam}}) RETURN n', {nameParam:Name ,emailParam:Email ,passParam:Pass})
    .then(function(result)
    {
        res.redirect('/');
        session.close();
    })
    .catch(function(err)
    {
        console.log(err);
    })
    res.redirect('/');
})


//user login
app.post('/done' ,function(req,res)
{
    var email = req.body.emailid;
    var pass = req.body.passwd;

    session
    .run('MATCH (n:user {email:{emailParam}}) RETURN n' ,{emailParam:email})
    .then(function(result)
    {
        result.records.forEach(function(record)
        {
           
           console.log(record._fields[0].properties);
           var data = record._fields[0].properties;
            if(data.password == pass)
            {
                res.render('logactive');
                console.log('correct');
            }
            
            else
            {
                res.send('password incorrect');
            }
        })
    })
    .catch(function(err)
    {
        console.log(err);
    });
})


//admin login
app.post('/admin' ,function(req,res)
{
    var User = req.body.user;
    var pass = req.body.passwd;

    session
    .run('MATCH (n:admin {name:{nameParam}}) RETURN n' ,{nameParam:User})
    .then(function(result)
    {
        result.records.forEach(function(record)
        {
           
           console.log(record._fields[0].properties);
            var data1 = record._fields[0].properties;
            if(data1.password == pass)
            {
                res.render('adminHome');
                console.log('correct');
            }
            
            else
            {
                res.send('password incorrect');
            }
        })
    })
    .catch(function(err)
    {
        console.log(err);
    });
  
})


//users data view
app.post("/view" ,function(req,res)
{
    session
    .run('MATCH (n:user) RETURN n')
    .then(function(result)
    {
        var userAr = [];
        result.records.forEach(function(record)
        {
            userAr.push({
                id:record._fields[0].identity.low,
                name:record._fields[0].properties.name,
                email:record._fields[0].properties.email
            });
        });
        res.render('view' ,{
            users:userAr
        });
    })
    .catch(function(err)
    {
        console.log(err);
    })
})


// view relation page
app.post('/relation' ,function(req,res)
{
   // var name = req.body.name1;
   // var name1 = req.body.name2;
    //var rel = req.body.relation;

    session
    .run('MATCH (n:user) RETURN n')
    .then(function(result)
    {
        var userRl = [];
        result.records.forEach(function(record)
        {
            userRl.push({
                id:record._fields[0].identity.low,
                name:record._fields[0].properties.name,
                email:record._fields[0].properties.email
            });
        });
        res.render('relationadd' ,{
            reln:userRl
        });
    })
    .catch(function(err)
    {
        console.log(err);
    })
})


//add relation
app.post('/viewrelation' ,function(req,res)
{
    var name = req.body.name;
   // var name1 = req.body.name2;
    var rel = req.body.relation;

    session
    .run('MATCH (a:user {name:{nameParam}}), (b:admin) MERGE(a)-[r:'+rel+']-(b) RETURN a,b ' ,{nameParam:name})
    .then(function(result)
    {
       
     res.send('add relation');

        session.close();

    })
    .catch(function(err)
    {
        console.log(err);
    });
})



app.listen(4000);
module.exports = app;
var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create(
    {
        defaultLayout:'main',
        helpers: {
            if_eq: function(a,b,opts){
                if (a === b){
                    return opts.fn(this);
                }else{
                    return opts.inverse(this);
                }
            }
        }
    });
var bodyParser = require('body-parser');
var request = require('request');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ extended:false }));
app.use(express.static('public'));
var mysql = require('./public/js/sqlPool.js');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 65535);


function selectTableFull(res,context){
    mysql.pool.query('SELECT * FROM workouts', function(err,rows,fields){
        if(err){
            next(err);
            return;
        }
        var table = JSON.stringify(rows);
        context.table = JSON.parse(table)
        for(i = 0; i < context.table.length; i++){
            var date = context.table[i].date.split("T");
            context.table[i].date = date[0];
        }
        res.render('home',context);
    })
}

function selectTableOne(res,context){
    mysql.pool.query('SELECT * FROM workouts ORDER BY id DESC LIMIT 1', function(err,rows,fields){
        if(err){
            next(err);
            return;
        }
        table = JSON.stringify(rows);
        context.table = JSON.parse(table);
        context.row = context.table[0];
        var date = context.row.date.split("T");
        context.row.date = date[0];
        res.send(context);
    });
}

app.get('/', function(req,res,next){
    var context = {};
    selectTableFull(res,context);
});

app.post('/', function(req,res,next){
    var context = {}
    if(req.body.buttonStatus === "new") {
        var unitsBool = "0";
        if (req.body.units === "lbs") {
            unitsBool = "1";
        }
        mysql.pool.query("INSERT INTO workouts(name, reps, weight, date, lbs) VALUES (?,?,?,?,?)",
            [req.body.name, req.body.reps, req.body.weight, req.body.date, unitsBool], function (err, result) {
            if (err) {
                next(err);
                return;
            }
            selectTableOne(res, context);
        });
    }else if(req.body.buttonStatus === "delete"){
        mysql.pool.query("DELETE FROM workouts WHERE id=?", [req.body.deleteID], function(err, result){
            if (err){
                next(err);
                return;
            }
            selectTableFull(res, context);
        });
    }else if(req.body.buttonStatus === "edit") {
        mysql.pool.query("SELECT * FROM workouts WHERE id=? ", [req.body.editID], function(err, result){
            if(err){
                next(err);
                return;
            }
            if(result.length === 1){
                var curVals = result[0];
                var unitsBool = 0;
                if(req.body.units === "lbs"){
                    unitsBool = 1;
                }
                mysql.pool.query("UPDATE workouts SET name=?, reps=?, weight=?, lbs=?, date=? WHERE id=? ",
                    [req.body.name || curVals.name, req.body.reps || curVals.reps, req.body.weight || curVals.weight,
                    unitsBool, req.body.date || curVals.date, req.body.editID], function(err,result){
                    if(err){
                        next(err);
                        return;
                    }
                    selectTableFull(res, context);
                    })
            }
        })
    }else{
        console.log('Error');
        res.end();
    }
});

app.post('/edit', function(req,res, next){
    var context = {};
    mysql.pool.query("SELECT * FROM workouts WHERE id=?", [req.body.editID], function(err, rows, fields){
        if (err){
            next(err);
            return;
        }
        var row = JSON.stringify(rows);
        row = JSON.parse(row);
        context.data = row[0];
        var date = context.data.date.split("T");
        context.data.date = date[0];
        res.render('edit', context);
    })

})

app.get('/reset-table',function(req,res,next){
    var context = {};
    mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){ //replace your connection pool with the your variable containing the connection pool
        var createString = "CREATE TABLE workouts("+
            "id INT PRIMARY KEY AUTO_INCREMENT,"+
            "name VARCHAR(255) NOT NULL,"+
            "reps INT,"+
            "weight INT,"+
            "date DATE,"+
            "lbs BOOLEAN);";
        mysql.pool.query(createString, function(err){
            context.results = "Table reset";
            res.render('reset',context);
        })
    });
});

app.use(function(req,res){
    res.status(404);
    res.render('404');
});

app.use(function(req,res,next){
    console.error(req.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const expressValidator = require('express-validator');
const mongojs = require('mongojs');
const db = mongojs('customerapp', ['users']);
const ObjectId = mongojs.ObjectId;

const app = express();

// const logger = (req, res, next) => {
// 	console.log('Logging');
// 	next();
// }

// app.use(logger);

//View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

//Set Static Path
app.use(express.static(path.join(__dirname, 'public')));

//Global Vars
app.use( (req, res, next) => {
	res.locals.errors = null;
	next();
})

//Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;
 
    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.get('/', (req, res) => {
	db.users.find( (err, docs) => {
			console.log(docs);
			res.render('index', {
			title: 'Customers',
			users: docs
		})
	})
})

app.post('/users/add', (req, res) => {
	req.checkBody('first_name', 'First name is required').notEmpty();
	req.checkBody('last_name', 'Last name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();

	const errors = req.validationErrors();

	if(errors) {
		db.users.find( (err, docs) => {
			console.log(docs);
			res.render('index', {
			title: 'Customers',
			users: docs,
			errors: errors
		})
	})
	}else {
		const newUser = {
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		email: req.body.email
		}
		console.log('Success');
		db.users.insert(newUser, (err, result) => {
			if (err) {
				console.log(err);
			}
			res.redirect('/');
		});
	}
	
})

app.delete('/users/delete/:id', (req, res) => {
	db.users.remove({_id: ObjectId(req.params.id)}, (err) => {
		if(err) {
			console.log(err);
		}
		res.redirect('/');
	})
})

app.listen(3000, () => {
	console.log('Server Started on Port 3000');
})
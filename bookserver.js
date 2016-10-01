var express = require('express'),
	// session = require('express-session'),
	// socketio = require("socket.io"),
	fs = require("fs"),
	path = require('path'),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	ObjectId = require('mongoose').Schema.ObjectId,
	// formidable = require('formidable'),
	dbName = 'booksite';

var app = express();
app.use(express.static(__dirname+"/public"));
app.use(bodyParser.json());
app.use(cookieParser());
// app.use(session({
//   secret: 'recommand 128 bytes random string', 
//   cookie: { maxAge: 60 * 1000 }
// }));

var bookSchema = mongoose.Schema({
    title: String,
    cover: String,
    author: String,
    rating: Number,
    description: String,
    post: String,
    postId: String,
    date: {type: Date, default: Date()},
    ratenum: Number
});

var reviewSchema = mongoose.Schema({
	bookId: String,
	title: String,
	postId: String,
	name: String,
    body: String,
    date: Date
});

var userSchema = mongoose.Schema({
	name: String,
	pwd: String,
});

var books = mongoose.model('books', bookSchema);
var users = mongoose.model('users', userSchema);
var reviews = mongoose.model('reviews', reviewSchema);

mongoose.connect('mongodb://localhost/'+dbName);
var db = mongoose.connection;

db.on('error', console.error);
db.once('open', startServer);

function startServer(){	
	app.get('/booklist', function (req, res) {
		// var booklist;
		books.find(function(err, booklist){
			if(err) return console.error(err);
			if (typeof req.cookies.name != "undefined") {
				// console.log(req.cookies.name+"...")
				var info = {booklist: booklist, name: req.cookies.name, id: req.cookies.id};
			}else{
				// console.log("....");
				var info = {booklist:booklist, name: ""};
			}
			res.json(info);
		});
		console.log('Receive GET request for book list');
	});

	app.post('/signin', function(req, res) {
		users.findOne({name: req.body.name}, function(err, user_hash){
			if (err) return handleError(err);

			// console.log(req.body.name + ":"+ user_hash);
			var info;
			if (user_hash){
				if (user_hash.pwd != req.body.pwd) {
					info = {success: false, msg: 'Wrong password'};
				}else{
					info = {success: true, name: user_hash.name, id: user_hash._id};

					// req.session.name = user_hash.name;
					// req.session.id = user_hash._id;
				}
			}else{
				info = {success: false, msg: 'No such user'};
				// res.json(info);
			}
			res.json(info);
		});
	});

	app.post('/signup', function(req, res) {
		users.findOne({name: req.body.name}, function(err, user_hash){
			if (err) return handleError(err);

			var info;
			if (user_hash){
				// console.log(user_hash.name+"...");
				info = {success: false, msg: 'The username has already existed.'};
				res.json(info);
			}else{
				var newuser = new users({name: req.body.name, pwd: req.body.pwd});
				newuser.save(function (err, newuser) {
					if (err) return console.error(err);
					// console.log(newuser);
					var info = {success: true, name: newuser.name, id: newuser._id};
					// req.session.name = user_hash.name;
					// req.session.id = user_hash._id;
					res.json(info);
				});
			}
			
		});
	});

	app.post('/setcookies', function(req, res){
		res.cookie('name', req.body.name);
		res.cookie('id', req.body.id);
		res.cookie("httpOnly", "true", {  
	        httpOnly: true  
	    });
		// console.log(req.cookies+"......");
		res.json(req.cookies);
	});

	app.get('/logout', function(req, res){
		res.clearCookie('name');
		res.clearCookie('id');
		res.send("success");
	});

	app.post('/addbook', function(req, res){
		console.log('Request to add a book');

		var book = req.body;
		var info;

		books.findOne({title: book.title, author: book.author}, function(err, repbook){
			if(err) return console.error(err);
			if (repbook) {
				var info = {success: false, msg: 'The book has been already added by user "'+repbook.post+'"'};
				res.json(info);
			}else{
				// var form = new formidable.IncomingForm();
				// form.encoding = 'utf-8';
				// form.uploadDir = '/User/Roselle/books/public/img';
				// form.keepExtensions = true;

				
				book.ratenum = 1;
				book.date = new Date();

				var impos = Math.ceil(Math.random()*11)+4;
				book.cover = "./img/img" + impos + ".jpg";

				var newbook = new books(book);
				newbook.save(function(err, newbook){
					if (err) return console.error(err);	
					var info = {success: true};
					res.json(info);
				});
			}
			
		});
	});

	app.post('/onebook', function(req, res){
		console.log('Request to a book');

		var bookId = req.body.id;

		// console.log(bookId);

		books.findOne({_id: mongoose.Types.ObjectId(bookId)}, function(err, onebook){
			if(err) return console.error(err);

			var info;
			if (onebook) {
				// info = {success: true, book: onebook};
				reviews.find({bookId: bookId}, function(err, bkreview){
					if(err) return console.error(err);
					var info = {success: true, book: onebook, reviews: bkreview};
					// info.reviews = bkreview;
					// console.log(bkreview+"...");

					if(typeof req.cookies.name != "undefined"){
						info.user = {name: req.cookies.name, id: req.cookies.id};
					}
					res.json(info);
				});
			}else{
				info = {success: false, response: 'Sorry, the unexpected database error'};
				res.json(info);
			}
			
			// res.json(info);
		});
		

	});

	app.post('/addreview', function(req, res){
		console.log('Comments');

		var review;
		// review.date = new Date();

		if (typeof req.cookies.name != "undefined") {
			// console.log(req.cookies+"...");
			// req.body.review.name = req.cookie.name;
			// review.name = req.cookie.name;
			review = {"name": req.cookies.name, "postId": req.cookies.id, "bookId": req.body.bookId, "title": req.body.title, "body": req.body.body, "date": req.body.date};
		}else{
			// review.name = "";
			// console.log("Anonymous");
			review = {"name": "Anonymous", "bookId": req.body.bookId, "title": req.body.title, "body": req.body.body, "date": req.body.date};
		}
		

		var newreview = new reviews(review);
		newreview.save(function(err, newreview){
			if (err) return console.error(err);
			var info = {success: true};
			res.json(info);
		});
		
	});

	app.post('/rateBook', function(req,res){
		books.update({_id: mongoose.Types.ObjectId(req.body.bookId)}, {$set: { rating: req.body.rating, ratenum: req.body.ratenum }}, function(err, raw){
			if (err) return handleError(err);

			// console.log(req.body);
			console.log(raw);
			res.json({success: true});
		});
	});

	app.post('/oneuser', function(req,res){
		books.find({postId: req.body.id},function(err, postbook){
			if(err) return console.error(err);
			if (postbook) {
				// info = {success: true, book: onebook};
				reviews.find({postId: req.body.id}, function(err, bkreview){
					if(err) return console.error(err);
					var info = {success: true, books: postbook, reviews: bkreview};
					// info.reviews = bkreview;
					// console.log(bkreview+"...");

					if(typeof req.cookies.name != "undefined"){
						info.user = {name: req.cookies.name, id: req.cookies.id};
					}
					res.json(info);
				});
			}else{
				var info = {success: false, response: 'Sorry, the unexpected database error'};
				res.json(info);
			}
		});
	});

	app.post('/edit', function(req, res){
		var bookId = req.body.bookId;
		// console.log(bookId);
		books.findOne({_id: mongoose.Types.ObjectId(bookId)}, function(err, editbook){
			if (err) return console.error(err);
			// console.log(editbook);
			res.json(editbook);
		});
	});

	app.post('/update', function(req, res){
		var book = req.body;
		console.log(book);
		books.update({_id: mongoose.Types.ObjectId(req.body._id)}, {$set: { title: book.title, description: book.description, author: book.author, date: book.date }}, function(err, raw){
			if (err) return handleError(err);

			console.log(raw);
			res.json({success:true});
		});
		
	});

	var server = app.listen(8000, function () {
	  console.log('book-server listening on port 8000!');
	});	
}

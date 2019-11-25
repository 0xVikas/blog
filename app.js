var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
//app.use('/users', usersRouter);

function compare( a, b ) {
  if ( a.upvoters.length < b.upvoters.length ){
    return 1;
  }
  if ( a.upvoters.length > b.upvoters.length ){
    return -1;
  }
  return 0;
}

let login_stat = false;

let users = {"user1":"pass1", "user2":"pass2", "user3":"pass3", "user4":"pass4"};

let blogposts = [];
let num_of_blogs = 0;

let blogposts_dict = {};

app.get('/', function(req, res, next) {
  if(!login_stat){
  res.render('index', { title: 'PhoenixHub', msg: ''});
  }
  else{
    res.render('home', {user: curr_user, blogposts: blogposts});
  }
});

app.post('/newpost', function(req,res,next){
  if(login_stat){
  var datetime = new Date();
  let time_now = datetime.toISOString().slice(0,10)
  npost = {user: curr_user, content: req.body.content, time: time_now, upvoters: [], downvoters: [], blogid: num_of_blogs};
  blogposts_dict[num_of_blogs] = npost;
  blogposts.push(npost);
  blogposts.sort(compare);
  res.render('home', {user: curr_user, blogposts: blogposts});
  num_of_blogs += 1;
  console.log(blogposts);
  }
  else{
    res.render('index', {title: 'PhoenixHub', msg: 'Please Login first!'})
  }
});

app.post('/', function(req,res,next){
  console.log(req.body.email);
  console.log(req.body.pass);
  if(users[req.body.email] == req.body.pass){
    login_stat = true;
    curr_user = req.body.email;
    blogposts.sort(compare);
    res.render('home', {user: curr_user, blogposts: blogposts});
  }
  else{
    res.render('index', {title: 'PhoenixHub', msg: 'Wrong Username/Password'});
  }
});

app.post('/search', function(req,res,next){
  if(login_stat){
    filtered_blogposts = [];
    for(let i=0;i<blogposts.length;i++){
      if(blogposts[i].user == req.body.s_user){
        filtered_blogposts.push(blogposts[i]);
      }
    }
    res.render('home', {user: curr_user, blogposts: filtered_blogposts});
  }
  else{
    res.render('index', {title: 'PhoenixHub', msg: 'Please Login first!'})
  }
});

app.post('/upvote', function(req,res,next){
  mindex = blogposts.indexOf(blogposts_dict[req.body.blogid]);
  if(blogposts[mindex].downvoters.includes(curr_user)){
    let x_index = blogposts[mindex].downvoters.indexOf(curr_user);
    blogposts[mindex].downvoters.splice(x_index, 1);
  }

  if(!blogposts[mindex].upvoters.includes(curr_user)){
    blogposts[mindex].upvoters.push(curr_user);
    }
    blogposts.sort(compare);
  res.render('home', {user: curr_user, blogposts: blogposts});
});

app.post('/downvote', function(req,res,next){
  mindex = blogposts.indexOf(blogposts_dict[req.body.blogid]);
  if(blogposts[mindex].upvoters.includes(curr_user)){
    let x_index = blogposts[mindex].upvoters.indexOf(curr_user);
    blogposts[mindex].upvoters.splice(x_index, 1);
  }
  if(!blogposts[mindex].downvoters.includes(curr_user)){
  blogposts[mindex].downvoters.push(curr_user);
  }
  blogposts.sort(compare);
  res.render('home', {user: curr_user, blogposts: blogposts});
});

app.get('/logout', function(req,res,next){
  login_stat = false;
  cuss_user = '';
  res.render('index', {title: 'PhoenixHub', msg: ''})
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

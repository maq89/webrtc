var express = require('express.io');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var multer  = require('multer');  
var FileReader = require('filereader');
var upload  = multer({ dest: __dirname + '/public/uploads/' });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.cookieParser());
app.use(express.session({secret: 'videoConference'}));
app.use(express.static(__dirname + '/public'));


app.http().io();

var PORT = 3000;

app.listen(3000, '0.0.0.0', function() {
    console.log('server started on port ' + PORT);
});




app.get('/', function(req, res){
	res.render('index.ejs');
});

app.post('/', function(req, res){
	var room = Math.floor(Math.random() * 100000);
	while(true){
		if(app.io.sockets.clients(room).length != 0){
			room = Math.floor(Math.random() * 100000);
		}
		else{
			break;
		}
	}
	req.session.users = {
		caller : req.body.username,
		callee : '',
		ask_name : false
	}
	res.redirect('/room/'+room);
});

app.get('/room/:room_id', function(req, res){
	var data = {};
	var room = req.param('room_id');
	if(app.io.sockets.clients(room).length == 2){
		data = {room_id : 0, users : {}};
	}
	else{
		data = {room_id : room, users : JSON.stringify(req.session.users)};
		req.session.users.ask_name = true;
	}
	
	res.render('room.ejs', data);
});


app.post('/send', upload.array('blob'), function (req, res) {
	console.log(req.body);
	console.log(req.files);
	
	var file_data = fs.readFileSync(req.files[0].path);
	
	var file = req.files[0].destination + req.files[0].originalname;
	
	
	
	fs.appendFile(file, new Buffer(file_data), function(err) {
		if(err) {
			return console.log(err);
		}

		console.log("The file was saved!");
	}); 
	
	
	//var src = fs.createReadStream(req.files[0].path);
	//var dest = fs.createWriteStream(file);
	//src.pipe(dest);
	//src.on('end', function() { console.log('complete'); });
	//src.on('error', function(err) { console.log('error'); });
	
	
	/*
	var reader = new FileReader();
	reader.onload = function(){
		//var buffer = new Buffer(reader.result)
		fs.writeFile('test.webm', new Buffer(reader.result), (err, res) => {
			if(err){
				console.error(err)
				return
			}
			console.log('video saved')
		})
	}
	reader.readAsArrayBuffer(src);
	*/
	
	
	//console.log(src);
	res.send('ok')
});


app.get('/test', function(req, res){
	
	//C:\\Users\\musaib\\Desktop\\webrtc2\\public\\uploads\\61a1f1f2a30ecab8d6ce218bff78b2ef
	
	var reader = new FileReader();
	reader.readAsBinaryString('C:/Users/musaib/Desktop/webrtc2/public/uploads/61a1f1f2a30ecab8d6ce218bff78b2ef');
	res.send(reader);
});

app.io.route('ready', function(req) {
    req.io.join(req.data);
    req.io.room(req.data).broadcast('announce', {
		message: 'New client in the ' + req.data + ' room.'
    });
});


app.io.route('signal', function(req) {
	//Note the use of req here for broadcasting so only the sender doesn't receive their own messages
	req.io.room(req.data.room).broadcast('signaling_message', {
        type: req.data.type,
		message: req.data.message
    });
})


app.io.route('set_names', function(req) {
	req.session.users.callee = req.data.callee;
    req.io.room(req.data.room_id).broadcast('names', req.session.users);
});



app.io.route('save_video', function(req) {
	
	console.log(req.data.room_id);
	console.log(req.data.blob_data);
	
	/*
	var reader = new FileReader()
	reader.onload = function(){
		//var buffer = new Buffer(reader.result)
		fs.writeFile('test.webm', new Buffer(reader.result), (err, res) => {
			if(err){
				console.error(err)
				return
			}
			console.log('video saved')
		})
	}
	reader.readAsArrayBuffer(req.data.blob);
	*/
	
	
	//req.io.room(req.data.room_id).broadcast('names', req.session.users);
});



/*

app.io.route('ready', function(req) {
	req.io.join(req.data)
	app.io.room(req.data).broadcast('announce', {
		 message: 'New client in the ' + req.data + ' room. '
	})
})




	//req.io.emit('room_created', {'message' : 'success'});

app.post('/room', function(req, res){
	res.render('room.ejs');
});

app.post('/room/room_id', function(req, res){
	res.render('room.ejs');
});

*/
















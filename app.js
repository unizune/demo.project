var app = require('express').createServer()
var io = require('socket.io').listen(app);

app.listen(3000);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

var usernames = {};
var rooms = ['room1','room2','room3'];

io.sockets.on('connection', function (socket) {
	
	socket.on('adduser', function(username){
	
		socket.username = username;
		usernames[username] = username;

		joinRoom(socket, rooms[0])
	});
	
	socket.on('sendchat', function (data) {
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});
	
	socket.on('switchRoom', function(newRoom){
		socket.leave(socket.room);
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
		joinRoom(socket, newRoom);
	});
	
	socket.on('disconnect', function(){
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});


	function joinRoom(socket, roomName) {
		socket.join(roomName);
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ roomName);
		socket.room = roomName;
		socket.broadcast.to(roomName).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms, roomName);
	}
});

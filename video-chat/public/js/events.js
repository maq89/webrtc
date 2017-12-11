var joinRoomBtn = document.querySelector('#joinRoomBtn');

joinRoomBtn.addEventListener('click', function (event) { 
	var username = document.querySelector('#username').value;
	io.emit('set_names', {room_id : room_id, callee : username});
	calleeName.innerHTML = username;
	askName(false);
	io.emit('signal',{"type": users.caller, "message":"Are you ready for a call?", "room":room_id});
});
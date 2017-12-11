var myVideoArea = document.querySelector("#myVideoTag");
var theirVideoArea = document.querySelector("#theirVideoTag");
var signalingArea = document.querySelector("#signalingArea");
var connectionType;
var configuration = {
	'iceServers': [{
		'url': 'stun:stun.l.google.com:19302'
	}]
};

function signaling(){		
	io.on('signaling_message', function(data) {
		displaySignalMessage("Signal received: " + data.type);
		
		//console.log('Before : ', data);
		
		//Setup the RTC Peer Connection object
		if (!rtcPeerConn)
			startSignaling();
			
		//console.log('After : ', data);	
			
		if (data.type != users.caller) {
			var message = JSON.parse(data.message);
			if (message.sdp) {
				rtcPeerConn.setRemoteDescription(new RTCSessionDescription(message.sdp), function () {
				
					//console.log(rtcPeerConn.remoteDescription.type);
				
					connectionType = rtcPeerConn.remoteDescription.type;
				
					// if we received an offer, we need to answer
					if (rtcPeerConn.remoteDescription.type == 'offer') {
						//rtcPeerConn.createAnswer(sendLocalDesc, logError);
						
						
						rtcPeerConn.setRemoteDescription(rtcPeerConn.remoteDescription).then(function () {
							return rtcPeerConn.createAnswer();
						})
						.then(function (answer) {
							return rtcPeerConn.setLocalDescription(answer);
						})
						.then(function () {
							io.emit('signal',{"type":"SDP", "message": JSON.stringify({ 'sdp': rtcPeerConn.localDescription }), "room":room_id});
						})
						.catch(e => console.log(e));
						
					}
				}, logError);
			}
			else {
				rtcPeerConn.addIceCandidate(new RTCIceCandidate(message.candidate)).catch(e => console.log(e));
			}
		}
		
	});
}
						
function startSignaling() {

	displaySignalMessage("starting signaling...");
	
	rtcPeerConn = new webkitRTCPeerConnection(configuration);
	
	// send any ice candidates to the other peer
	rtcPeerConn.onicecandidate = function (evt) {
		if (evt.candidate)
			io.emit('signal',{"type":"ice candidate", "message": JSON.stringify({ 'candidate': evt.candidate }), "room":room_id});
		displaySignalMessage("completed that ice candidate...");
	};
	
	// let the 'negotiationneeded' event trigger offer generation
	rtcPeerConn.onnegotiationneeded = function () {
		displaySignalMessage("on negotiation called");
		//rtcPeerConn.createOffer(sendLocalDesc, logError);
		
		rtcPeerConn.createOffer().then(function (offer) {
			return rtcPeerConn.setLocalDescription(offer);
		})
		.then(function () {
			// send the offer to the other peer
			io.emit('signal',{"type":"SDP", "message": JSON.stringify({ 'sdp': rtcPeerConn.localDescription }), "room":room_id});
		})
		.catch(e => console.log(e));
		
	}
	
	// once remote stream arrives, show it in the remote video element
	remoteStream();
	
	
	
	// get a local stream, show it in our video tag and add it to be sent
	localStream();
  
}

function remoteStream(){
	rtcPeerConn.onaddstream = function (evt) {
		displaySignalMessage("going to add their stream...");
		theirVideoArea.src = URL.createObjectURL(evt.stream);
	};
}

function localStream(){
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	navigator.getUserMedia({
		'audio': false,
		'video': true
	}, function (stream) {
		window.stream = stream;
		displaySignalMessage("going to display my stream...");
		myVideoArea.src = URL.createObjectURL(stream);
		rtcPeerConn.addStream(stream);
	}, logError);
}

function sendLocalDesc(desc) {
	rtcPeerConn.setLocalDescription(desc, function () {
		displaySignalMessage("sending local description");
		io.emit('signal',{"type":"SDP", "message": JSON.stringify({ 'sdp': rtcPeerConn.localDescription }), "room":room_id});
	}, logError);
}

function logError(error) {
	displaySignalMessage(error.name + ': ' + error.message);
}

function displaySignalMessage(message) {
	//signalingArea.innerHTML = signalingArea.innerHTML + "<br/>" + message;
}
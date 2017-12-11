var recordedBlobs;

function startRecording() {
  recordedBlobs = [];
  var options = {mimeType: 'video/webm;codecs=vp9'};
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.log(options.mimeType + ' is not Supported');
    options = {mimeType: 'video/webm;codecs=vp8'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.log(options.mimeType + ' is not Supported');
      options = {mimeType: 'video/webm'};
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType + ' is not Supported');
        options = {mimeType: ''};
      }
    }
  }
  try {
	console.log(window.stream);
    mediaRecorder = new MediaRecorder(window.stream, options);
	//window.stream = '';
  } catch (e) {
    console.error('Exception while creating MediaRecorder: ' + e);
    alert('Exception while creating MediaRecorder: '
      + e + '. mimeType: ' + options.mimeType);
    return;
  }
  //console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
 
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(10); // collect 10ms of data
  //console.log('MediaRecorder started', mediaRecorder);
}

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

var video_id = 1;
function download() {
   
    var blob = new Blob(recordedBlobs, {type: 'video/webm'});
	
	console.log();
  
	//console.log(blob);
	
	//var blob = new Blob(["This is my blob content"], {type : "text/plain"});
  
	var data = new FormData();
	data.append('room_id', room_id);
	data.append('blob', blob, 'video'+(video_id++)+'.webm');
	

	$.ajax({
		url :  "http://localhost:3000/send",
		type: 'POST',
		data: data, //{'id': '123'},
		contentType: false, //"application/x-www-form-urlencoded",
		processData: false, //true,
		success: function(data) {
		  console.log('sent');
		},    
		error: function() {
		  console.log('ERROR video blob not send');
		}
	});
  
    /*
	var reader = new FileReader()
	reader.onload = function(){
		var buffer = new Buffer(reader.result)
		fs.writeFile(path, buffer, {}, (err, res) => {
			if(err){
				console.error(err)
				return
			}
			console.log('video saved')
		})
	}
	reader.readAsArrayBuffer(req.data.blob);
	*/
	
  
  //io.emit('save_video', {room_id : room_id, blob_data : JSON.stringify(blob)});
  
  /*
  var url = window.URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'test.webm';
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
  */
}
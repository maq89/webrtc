function askName(type){
	var usernameblock = document.querySelector('#usernameBlock');
	var videosBlock = document.querySelector('#videosBlock');
	if(type){
		usernameblock.style.display = 'block';
		videosBlock.style.display = 'none';
	}
	else{
		usernameblock.style.display = 'none';
		videosBlock.style.display = 'block';
	}
}


function displayUsersNames(users){
	var callerName = document.querySelector('#callerName');
	var calleeName = document.querySelector('#calleeName');
	callerName.innerHTML = users.caller;
	calleeName.innerHTML = users.callee;
}


function decode(str){
	var parser = new DOMParser;
	var dom = parser.parseFromString('<!doctype html><body>' + str, 'text/html');
	return dom.body.textContent;
}
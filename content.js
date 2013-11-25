// Get the video id from the URL
var id;
var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
var match = document.URL.match(regExp);
if (match&&match[2].length==11){
	id = match[2];
}

var title = document.getElementsByClassName("watch-title")[0];
if (title) {
	titleText = title.innerText;
	chrome.runtime.sendMessage({title: titleText, id: id}, function(response) {
		if (response.success) {
			console.log(response.lyrics);
		} else {
			console.log("Couldn't find lyrics");
		}
	});
} else {
	console.log("No title found to look up");
}
var getUrlFromResponseText = function(str) {
	var started = false;
	var result = "";
	for (var i = 0; i < str.length; i++) {
		if (str[i] == "/") {
			started = true;
		}
		if (started) {
			if (str[i] == "|") {
				return "http://www.rapgenius.com"+result;
			}
			result += str[i];
		}
	}
	return;
}

var getSongUrl = function(songText, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			console.log("Server offered: "+xhr.responseText);
			callback(getUrlFromResponseText(xhr.responseText));
		}
	}
	xhr.open("GET", "http://rock.rapgenius.com/search/quick?q=" + songText, true);
	xhr.setRequestHeader("Accept", "application/x-javascript, text/javascript, text/html, application/xml, text/xml, */*");
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send();
}

var processTitleText = function(songText) {
	console.log("Page requested lyrics for: " + songText);
    var parensPos = songText.indexOf("(");
    songText = (parensPos > 0) ? songText.substr(0, parensPos) : songText;
    songText = songText.replace(/[^A-Za-z0-9 áâàåäðéêèëíîìïóôòøõöúûùü]/g,'').replace(/official/gi,"").replace(/video/gi, "");
    if (songText.length < 25) { 
    	songText = undefined;
    	console.log("Title was too short!");
    };
    console.log(songText.length);
    return songText;
}

// Todo: implement me: http://www-googleapis-test.sandbox.google.com/youtubeMusic/v1/musicVideos/X7bHe--mp1g?countryCode=us
var getMetaData = function(id, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			console.log("YouTube server gave: "+xhr.responseText);
			var meta = JSON.parse(xhr.responseText);
			if (meta && meta.artist && meta.artist.name && meta.name) {
				callback({artist: meta.artist.name, track: meta.name, success: true});
			} else {
				callback({success: false});
			}
		}
	}
	xhr.open("GET", "http://www-googleapis-test.sandbox.google.com/youtubeMusic/v1/musicVideos/" + id + "?countryCode=us", true);
	xhr.setRequestHeader("Accept", "application/x-javascript, text/javascript, text/html, application/xml, text/xml, */*");
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send();
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("Message received from a content script running on:" + sender.tab.url);
    console.log(request);

    getMetaData(request.id, function(meta) {
    	var queryText;
		if (meta.success) {
			queryText = meta.artist + " " + meta.track;
			queryText = queryText.replace(/[^A-Za-z0-9 áâàåäðéêèëíîìïóôòøõöúûùü]/g,'');
		} else {
			queryText = processTitleText(request.title);
		}

		if (queryText != undefined) {
			console.log("Doing a lookup based on "+queryText);

			getSongUrl(queryText, function(url) {
				if (url) {
			    	console.log (url);
			    	sendResponse({success: true, lyrics: url});
				} else {
					sendResponse({success: false});
				}
			});
		}
    });

    return true; //this tells the content script to wait for an async response
  });
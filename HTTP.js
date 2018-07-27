function HTTP(url, method) {
  ChatLib.chat("url: " + url)
    var request = new XMLHttpRequest();
    request.open(method, url, true);
    request.setCallbackMethod("requestCompleted");
    request.send();
    p("Sent a " + method + " request to " + url)
}

function requestCompleted(res) {
    p("Request completed with status code " + res.status + ", " + res.statusText);
    parseHTML(res.responseText);
    ChatLib.chat("Cookies: " + res.getResponseHeader("Set-Cookie"))
}

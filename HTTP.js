function HTTP(url, method, cookies) {
  ChatLib.chat("url: " + url)
    var request = new XMLHttpRequest();
    request.open(method, url, true);
    request.setCallbackMethod("requestCompleted");
    if (cookies) {
      request.addRequestHeader("Set-Cookie", cookies)
    }
    request.send();
    p("Sent a " + method + " request to " + url)
}

var cookies;
function requestCompleted(res) {
    p("Request completed with status code " + res.status + ", " + res.statusText);
    parseHTML(res.responseText);
    cookies = res.getResponseHeader("Set-Cookie");
    ChatLib.chat("Cookies: " + cookies)
}

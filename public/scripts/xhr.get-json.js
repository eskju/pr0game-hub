window.getJSON = function (url, callback, queue = true) {
    const concatSym = url.search(/\?/) !== -1 ? '&' : '?';
    url = apiUrl + url + concatSym + 'api_key=' + apiKey + '&version=' + version;

    if (debugMode) {
        console.log('GET', url);
    }

    return xmlhttpRequest({
        method: 'GET',
        url: url,
        onload: function (response) {
            callback(response);

            if (debugMode) {
                console.log(response.responseText);
            }
        },
        onerror: function (response) {
            if (debugMode) {
                console.log(response.status);
            }
        }
    });
};

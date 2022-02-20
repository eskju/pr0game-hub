window.getJSON = function (url, callback) {
    const concatSym = url.search(/\?/) !== -1 ? '&' : '?';
    url = apiUrl + url + concatSym + 'api_key=' + apiKey + '&version=' + version;

    if (debugMode) {
        console.log('GET', url);
    }

    return xmlhttpRequest({
        method: 'GET',
        url: url,
        onload: function (response) {
            if (debugMode) {
                console.log(response.responseText);
            }

            callback(response);
        },
        onerror: function (response) {
            if (debugMode) {
                console.log(response.status);
            }
        }
    });
};

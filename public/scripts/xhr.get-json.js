window.getJSON = function (url, callback) {
    url = apiUrl + url + '?api_key=' + apiKey + '&version=' + version;

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
        }
    });
};

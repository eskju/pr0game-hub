window.postJSON = function (url, data, callback, queue = true) {
    if (queue && false) {
        queueXhr('POST', url, data, callback);
        return;
    }

    url = apiUrl + url + '?api_key=' + apiKey + '&version=' + version;

    if (debugMode) {
        console.log('POST', url, data);
    }

    return xmlhttpRequest({
        method: 'POST',
        data: JSON.stringify(data),
        url: url,
        headers: {
            'Content-Type': 'application/json'
        },
        onload: function (response) {
            callback(response);
        },
        onerror: function (response) {
            if (debugMode) {
                console.log(response.status);
            }
        }
    });
};

window.postJSON = function (url, data, callback, queue = true) {
    if (queue) {
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

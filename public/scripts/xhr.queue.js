var xhrQueue = [];

window.queueXhr = function (method, url, data, callback) {
    xhrQueue.push({method, url, data, callback});

    if (xhrQueue.length === 1) {
        $('content').prepend('<div style="padding: 10px 15px; background: ' + getRgb(cRed) + '; color: ' + getRgb(cWhite) + '; z-index: 10000; top: 0; left: 0; right: 0;" id="update-bar"><button style="background: none; border-radius: 3px; color: #fff; border: 1px solid #fff; padding: 5px 10px;" onclick="processXhrQueue()">Daten synchronisieren</button></div>');
    }
};

window.processXhrQueue = function () {
    $.each(xhrQueue, function (key, obj) {
        switch (obj.type) {
            case 'POST':
                postJSON(obj.url, obj.data, obj.callback, false);
                break;

            case 'GET':
                getJSON(obj.url, obj.callback, false);
                break;
        }
    });

    xhrQueue = [];
    $('#update-bar').html('<i class="fa fa-spin fa-spinner"></i> Updating ...');
    $('#update-bar').animate({opacity: 0}, 1000, function () {
        $('#update-bar').remove();
    });
}

window.processQueue = function () {
    if (playerUpdateQueue.length > 0) {
        getProgressBar().html('Updating ' + playerUpdateQueue.length + ' items ...');
        var id = playerUpdateQueue.shift();
        $('content').append('<iframe class="player-iframe" id="iframe' + id + '" width="1" height="1" src="/game.php?page=playerCard&id=' + id + '"></iframe>');
        $('#iframe' + id).animate({left: 0}, 200, function () {
            if ($('iframe').length >= 10) {
                $($('iframe')[0]).remove();
            }

            processQueue();
        });
    } else {
        getProgressBar().html('Save & reload');
        $('body').animate({opacity: 0}, 1000, function () {
            window.location.reload();
        });
    }
};

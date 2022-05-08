window.hotkeys = function () {
    $(window).keypress(function (e) {
        if ($('*:focus').length === 0) {
            if (e.keyCode === 32) {
                e.stopPropagation();
                e.preventDefault();
                processXhrQueue();
            }
        }
    });
};

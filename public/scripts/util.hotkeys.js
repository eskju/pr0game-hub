window.hotkeys = function () {
    $(window).keypress(function (e) {
        if ($('*:focus').length === 0) {
            if (e.keyCode === 103) {
                document.location.href = '/game.php?page=overview';
            }

            if (e.keyCode === 104) {
                document.location.href = '/game.php?page=messages&category=100';
                return;
            }
        }
    });
};

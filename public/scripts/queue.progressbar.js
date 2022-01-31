window.getProgressBar = function () {
    const progressBar = $('#progress-bar');

    if (progressBar.length === 1) {
        return progressBar;
    }

    $('body').prepend('<div style="padding: 10px 15px; background: ' + getRgb(cBlue) + '; color: ' + getRgb(cWhite) + '; z-index: 10000; position: fixed; top: 0; left: 0; right: 0;" id="progress-bar"></div>');
    return $('#progress-bar');
};

window.showSpyReportHistory = function (spyReportHistory) {
    $('body').append('<div id="spyReportBackdrop" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.95); z-index: 10000"></div>');
    $('body').append('<div id="spyReportOverlay" style="position: fixed; top: 25px; left: 25px; right: 25px; max-height: 95%; z-index: 10000; background: #161618; overflow-y: auto"></div>');
    var container = $('#spyReportOverlay');
    var html = '';
    html += showSpyReportHistoryBox(spyReportHistory, 'resources');
    html += showSpyReportHistoryBox(spyReportHistory, 'fleet');
    html += showSpyReportHistoryBox(spyReportHistory, 'defense');
    html += showSpyReportHistoryBox(spyReportHistory, 'science');
    html += showSpyReportHistoryBox(spyReportHistory, 'buildings');

    $(container).html(html);

    // close by ESC or backdrop click
    $(window).keydown(function (event) {
        if (event.key === 'Escape') {
            $('#spyReportOverlay').remove();
            $('#spyReportBackdrop').remove();
        }
    });

    $('#spyReportBackdrop').click(function () {
        $('#spyReportOverlay').remove();
        $('#spyReportBackdrop').remove();
    });
};

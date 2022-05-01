window.showSpyReportHistory = function (galaxy, system, planet, limit) {
    if(!limit) {
        limit = (getValue('filter_spy_report_lines') || 10);
    }

    getJSON('spy-reports/' + galaxy + '/' + system + '/' + planet + '?lines=' + limit, function (spyReports) {
        const spyReportHistory = JSON.parse(spyReports.responseText);

        $('#spyReportBackdrop').remove();
        $('#spyReportOverlay').remove();
        $('body').append('<div id="spyReportBackdrop" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.95); z-index: 10000"></div>');
        $('body').append('<div id="spyReportOverlay" style="position: fixed; top: 25px; left: 25px; right: 25px; max-height: 95%; z-index: 10000; background: #161618; overflow-y: auto"></div>');
        var container = $('#spyReportOverlay');
        var html = '<div style="padding: 10px; text-align: center">';
        html += '<b>Spionage-Historie von <a href="/game.php?page=galaxy&galaxy=' + (galaxy || '') + '&system=' + (system || '') + '">' + galaxy + ':' + system + ':' + planet + '</a></b><br>';
        html += '<a href="javascript:void(0)" onclick="showSpyReportHistory(' + galaxy + ',' + system + ',' + planet + ')">Standard</a> | ';
        html += '<a href="javascript:void(0)" onclick="showSpyReportHistory(' + galaxy + ',' + system + ',' + planet + ', 5)">5 Zeilen</a> | ';
        html += '<a href="javascript:void(0)" onclick="showSpyReportHistory(' + galaxy + ',' + system + ',' + planet + ', 10)">10 Zeilen</a> | ';
        html += '<a href="javascript:void(0)" onclick="showSpyReportHistory(' + galaxy + ',' + system + ',' + planet + ', 999999)">Alle Zeilen</a> | ';
        html += '<a href="javascript:void(0)" onclick="' + getCombatSimulatorLink(spyReportHistory, galaxy, system, planet) + '">Kampfsim</a> ';
        html += '</div>';
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
    });
};

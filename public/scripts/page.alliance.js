window.parsePageAlliance = function () {
    var allianceId = unsafeWindow.location.href.match(/[\?\&]id=([(0-9]+)/i)[1];
    var tbl = $($('content table')[0]);
    tbl.append('<tr><th colspan="2">Planeten</th></tr>');
    getJSON('alliances/' + allianceId + '/planets', function(response) {
        if(response.status === 200) {
            $.each(JSON.parse(response.responseText), function(key, obj) {
                tbl.append('<tr><td style="text-align: left">' + obj.coordinates + '</td><td style="text-align: left">' + obj.name + '</td></tr>');
            });
        }
    });
}

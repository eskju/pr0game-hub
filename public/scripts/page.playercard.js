window.parsePagePlayerCard = function () {
    var playerId = unsafeWindow.location.href.match(/[\?\&]id=([(0-9]+)/i)[1];

    if($('body').html().match(/\/includes\/pages\/game\/ShowPlayerCardPage\.class\.php/)) {
        postJSON('players/' + playerId + '/delete', {}, function() {});
        return;
    }

    var allianceId = ($('#content tr:nth-child(4) a').attr('onclick') || '').match(/\&id\=([0-9]+)/);

    postJSON('players/' + playerId, {
        name: $('#content tr:nth-child(2) td:nth-child(2)').html(),
        alliance_id: allianceId ? allianceId[1] : null,
        alliance_name: $('#content tr:nth-child(4) a').html() || null,
        main_coordinates: $('#content tr:nth-child(3) a').html().replace(/\[(.*)\]/, '$1'),
        score_building: getInt($('#content tr:nth-child(6) td:nth-child(2)').html()),
        score_science: getInt($('#content tr:nth-child(7) td:nth-child(2)').html()),
        score_military: getInt($('#content tr:nth-child(8) td:nth-child(2)').html()),
        score_defense: getInt($('#content tr:nth-child(9) td:nth-child(2)').html()),
        score: getInt($('#content tr:nth-child(10) td:nth-child(2)').html()),
        combats_won: getInt($('#content tr:nth-child(13) td:nth-child(2)').html()),
        combats_draw: getInt($('#content tr:nth-child(14) td:nth-child(2)').html()),
        combats_lost: getInt($('#content tr:nth-child(15) td:nth-child(2)').html()),
        combats_total: getInt($('#content tr:nth-child(16) td:nth-child(2)').html()),
        units_shot: getInt($('#content tr:nth-child(18) td:nth-child(2)').html()),
        units_lost: getInt($('#content tr:nth-child(19) td:nth-child(2)').html()),
        rubble_metal: getInt($('#content tr:nth-child(20) td:nth-child(2)').html()),
        rubble_crystal: getInt($('#content tr:nth-child(21) td:nth-child(2)').html()),
    }, function (response) {});

    var tbl = $('table');
    tbl.append('<tr><th colspan="3">Planeten</th></tr>');
    getJSON('players/' + playerId + '/planets', function(response) {
        if(response.status === 200) {
            $.each(JSON.parse(response.responseText), function(key, obj) {
                tbl.append('<tr><td colspan="3" style="text-align: left">' + obj.coordinates + '</td></tr>');
            });
        }
    });

    $('#content').append('<canvas id="playerChart" style="width: 95%; margin: 15px auto; height: 300px"></canvas>');
    displayChart(playerId);
}

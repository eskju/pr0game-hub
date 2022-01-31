window.parsePageGalaxy = function () {
    $('tr td:nth-child(2) a.tooltip_sticky').each(function (key, obj) {
        var tooltipSrc = $(obj).attr('data-tooltip-content');
        var playerId = $(obj).parent().parent().find('td:nth-child(6) a').attr('data-tooltip-content').match(/Dialog\.Buddy\(([0-9]+)\)/);
        playerId = playerId ? parseInt(playerId[1]) : null;

        var coords = tooltipSrc.match(/([0-9]+)\:([0-9]+)\:([0-9]+)/, tooltipSrc);
        var planetId = tooltipSrc.match(/doit\(6\,([0-9]+)/, tooltipSrc);
        planetId = planetId ? parseInt(planetId[1]) : null;

        if (coords && planetId) {
            postJSON('planets', {
                coordinates: coords[0],
                planet_id: planetId,
                player_id: playerId
            }, function (response) {
            });
        }
    });
};

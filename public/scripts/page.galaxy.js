window.PageGalaxy = function () {
    this.init = function () {
        this.parsePlanetIds();
        this.enhanceList();
    }

    this.parsePlanetIds = function () {
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

    this.enhanceList = function () {
        const systemCoords = $('content > table tr:first-child th').html().match(/System ([0-9]+)\:([0-9]+)/);
        const headerRow = $($('content > table tr')[1]);
        headerRow.append('<th class="text-right"><i class="fa fa-crosshairs"></i></th>');
        headerRow.append('<th class="text-right"><i class="fa fa-user-secret"></i></th>');
        headerRow.append('<th class="text-right">MET</th>');
        headerRow.append('<th class="text-right">CRY</th>');
        headerRow.append('<th class="text-right">DEU</th>');

        getJSON('galaxy/' + systemCoords[1] + '/' + systemCoords[2], function (response) {
            if (response.status === 200) {
                const json = JSON.parse(response.responseText);
                let firstCell;
                let planet;

                $('content > table tr').each(function (key, obj) {
                    firstCell = $($($(obj).find('td')[0]).find('a'))

                    if (firstCell.length === 0) {
                        firstCell = $($(obj).find('td')[0]);
                    }

                    planet = parseInt(firstCell.html());

                    if (!isNaN(planet)) {
                        $(obj).append('<td class="text-right">' + (json[planet].last_battle_report || '') + '</td>');
                        $(obj).append('<td class="text-right">' + (json[planet].last_spy_report || '') + '</td>');
                        $(obj).append('<td class="text-right">' + (json[planet].last_spy_crystal || '') + '</td>');
                        $(obj).append('<td class="text-right">' + (json[planet].last_spy_deuterium || '') + '</td>');
                        $(obj).append('<td class="text-right">' + (json[planet].last_spy_deuterium || '') + '</td>');
                    }
                });
            }
        });
    };
};

window.PageGalaxy = function () {
    this.init = function () {
        this.parsePlanetIds();
        this.enhanceList();
    }

    this.parsePlanetIds = function () {
        let tooltipSrc, playerId, coords, planetId, moonId, activity, parent, parentParent;
        const payload = [];

        $('tr td:nth-child(2) a.tooltip_sticky').each(function (key, obj) {
            obj = $(obj);
            parent = obj.parent();
            parentParent = parent.parent();
            tooltipSrc = obj.attr('data-tooltip-content');
            playerId = parentParent.find('td:nth-child(6) a').attr('data-tooltip-content').match(/Dialog\.Playercard\(([0-9]+)\)/);
            playerId = playerId ? parseInt(playerId[1]) : null;

            coords = tooltipSrc.match(/([0-9]+)\:([0-9]+)\:([0-9]+)/, tooltipSrc);
            planetId = tooltipSrc.match(/doit\(6\,([0-9]+)/, tooltipSrc);
            planetId = planetId ? parseInt(planetId[1]) : null;
            moonId = parentParent.find('td:nth-child(4)').html().match(/javascript\:doit\(([0-9]+)\,([0-9]+)\)/);
            activity = parentParent.find('td:nth-child(3)').html().match(/\(([*0-9]+)/);
            moonId = moonId ? moonId[2] : null;

            if (coords && planetId) {
                payload.push({
                    coordinates: coords[0],
                    planet_id: planetId,
                    player_id: playerId,
                    moon_id: moonId,
                    activity: activity && activity.length > 0 ? (activity[1] || null) : null,
                });
            }

            /*
            if (coords && planetId) {
                postJSON('planets', {
                    coordinates: coords[0],
                    planet_id: planetId,
                    player_id: playerId,
                    moon_id: moonId,
                    activity: activity && activity.length > 0 ? (activity[1] || null) : null,
                }, function (response) {
                });
            }
            */
        });

        postJSON('planets/new', payload, function(response) {});
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

                    if (!isNaN(planet) && json[planet]) {
                        $(obj).append('<td class="text-right" style="white-space: nowrap;">' + (json[planet].last_battle_report || '') + '</td>');
                        $(obj).append('<td class="text-right" style="white-space: nowrap;" id="lastSpyReport' + json[planet].id + '">' + (json[planet].last_spy_report || '') + '</td>');
                        $(obj).append('<td class="text-right" style="white-space: nowrap;">' + (json[planet].last_spy_metal || '') + '</td>');
                        $(obj).append('<td class="text-right" style="white-space: nowrap;">' + (json[planet].last_spy_crystal || '') + '</td>');
                        $(obj).append('<td class="text-right" style="white-space: nowrap;">' + (json[planet].last_spy_deuterium || '') + '</td>');
                    }
                });

                $.each(json, function (key, obj) {
                    $('#lastSpyReport' + obj.id).click(function () {
                        showSpyReportHistory(obj.galaxy, obj.system, obj.planet);
                    });
                });
            }
        });
    };
};

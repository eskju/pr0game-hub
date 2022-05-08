window.PageGalaxy = function () {
    const $this = this;

    this.init = function () {
        this.enhanceList();
    }

    this.enhanceList = function () {
        const systemCoords = $('content > table tr:first-child th').html()?.match(/System ([0-9]+)\:([0-9]+)/);
        const headerRow = $($('content > table tr')[1]);
        headerRow.append('<th class="text-right"><i class="fa fa-crosshairs"></i></th>');
        headerRow.append('<th class="text-right"><i class="fa fa-user-secret"></i></th>');
        headerRow.append('<th class="text-right">MET</th>');
        headerRow.append('<th class="text-right">CRY</th>');
        headerRow.append('<th class="text-right">DEU</th>');

        getJSON('galaxy/' + systemCoords[1] + '/' + systemCoords[2], function (response) {
            if (response.status === 200) {
                const json = JSON.parse(response.responseText);
                const payload = [];
                let firstCell, planet, updateRequired = false;
                let tooltipCell, tooltipSrc, playerId, coords, planetId, moonId, parent, parentParent;

                // loop planets rows
                $('content > table tr').each(function (key, obj) {
                    firstCell = $($($(obj).find('td')[0]).find('a'))
                    tooltipCell = $($(obj).find('td:nth-child(2) a.tooltip_sticky'));

                    // parse data
                    if (tooltipCell) {
                        parent = tooltipCell.parent();
                        parentParent = parent.parent();
                        tooltipSrc = tooltipCell.attr('data-tooltip-content');
                        playerId = parentParent.find('td:nth-child(6) a').attr('data-tooltip-content')?.match(/Dialog\.Playercard\(([0-9]+)\)/);
                        playerId = playerId ? parseInt(playerId[1]) : null;
                        coords = tooltipSrc?.match(/([0-9]+)\:([0-9]+)\:([0-9]+)/, tooltipSrc);
                        planetId = tooltipSrc?.match(/doit\(6\,([0-9]+)/, tooltipSrc);
                        planetId = planetId ? parseInt(planetId[1]) : null;
                        moonId = parentParent.find('td:nth-child(4)').html()?.match(/javascript\:doit\(([0-9]+)\,([0-9]+)\)/);
                        moonId = moonId ? moonId[2] : null;

                        if (coords && planetId) {
                            payload.push({
                                coordinates: coords[0],
                                planet_id: planetId,
                                player_id: playerId,
                                moon_id: moonId
                            });

                            if (json[key - 1].external_id !== planetId) {
                                updateRequired = true;
                            }

                            if (json[key - 1].moon_id !== moonId) {
                                updateRequired = true;
                            }
                        }
                    }

                    if (firstCell.length === 0) {
                        firstCell = $($(obj).find('td')[0]);
                    }

                    planet = parseInt(firstCell.html());

                    if (!isNaN(planet) && json[planet]) {
                        $(obj).append('<td class="text-right" style="white-space: nowrap;">' + (json[planet].last_battle_report || '') + '</td>');
                        $(obj).append('<td class="text-right" style="white-space: nowrap;" onclick="showSpyReportHistory(' + json[planet].galaxy + ', ' + json[planet].system + ', ' + json[planet].planet + ')">' + (json[planet].last_spy_report || '') + '</td>');
                        $(obj).append('<td class="text-right" style="white-space: nowrap;">' + (json[planet].last_spy_metal || '') + '</td>');
                        $(obj).append('<td class="text-right" style="white-space: nowrap;">' + (json[planet].last_spy_crystal || '') + '</td>');
                        $(obj).append('<td class="text-right" style="white-space: nowrap;">' + (json[planet].last_spy_deuterium || '') + '</td>');
                    }
                });

                // queue update if necessary
                if (updateRequired) {
                    postJSON('planets/new', {
                        planets: payload,
                        galaxy: parseInt($('input[name=galaxy]').val()),
                        system: parseInt($('input[name=system]').val())
                    }, function (response) {
                    });
                }
            }
        });
    };
};

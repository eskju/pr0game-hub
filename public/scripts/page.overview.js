window.PageOverview = function () {
    const $this = this;

    this.renderTime = new Date().getTime();

    this.isLoading = false;
    this.cacheKey = 'overviewData';
    this.container = null;
    this.request = null;
    this.fleetQueue = [];

    this.sumFleetMetal = 0;
    this.sumFleetCrystal = 0;
    this.sumFleetDeuterium = 0;

    this.init = function () {
        this.parseOwnAttacks();
        this.prepareHtml();
        this.analyzeFleetMovement();
        this.renderHtml();
        this.loadData();
        this.bindHotkeys();
    };

    this.bindHotkeys = function () {
        const mappingFilters = {
            i: 'filter_inactive',
            n: 'filter_noobs',
            u: 'filter_vacation',
            a: 'filter_alliance',
            s: 'filter_spy_report',
            k: 'filter_battle_report',
        };

        const mappingThresholds = {
            p: 'filter_score_enable',
            g: 'filter_score_building_enable',
            f: 'filter_score_science_enable',
            m: 'filter_score_fleet_enable',
            v: 'filter_score_defense_enable',
            i: 'filter_inactive_since_enable',
            k: 'filter_last_battle_report_enable',
            s: 'filter_last_spy_report_enable',
            q: 'filter_metal_enable',
            w: 'filter_crystal_enable',
            e: 'filter_deuterium_enable',
        };

        $(window).keypress(function (e) {
            const key = e.key.toLowerCase();
            let newValue = null;

            if ($('*:focus').length === 0) {
                if (!e.shiftKey) {
                    if (mappingFilters[key]) {
                        switch (getValue(mappingFilters[key])) {
                            case 'HIDE':
                                newValue = 'ONLY';
                                break;

                            case 'ONLY':
                                newValue = 'ALL';
                                break;

                            default:
                                newValue = 'HIDE';
                        }

                        setValue(mappingFilters[key], newValue)
                    }
                }

                // thresholds
                else {
                    if (mappingThresholds[key]) {
                        switch (getValue(mappingThresholds[key])) {
                            case '0':
                                newValue = '1';
                                break;

                            default:
                                newValue = '0';
                        }

                        setValue(mappingThresholds[key], newValue)
                    }
                }

                $this.renderHtml();
            }
        });
    }

    this.setLoading = function (value) {
        this.isLoading = value;
    };

    this.prepareHtml = function () {
        let infos;


        $($('content .infos')[1]).addClass('fleet-movement');
        $($('content .infos')[1]).html($($('content .infos')[1]).html().replace(/\&nbsp\;/, '')); // remove trailing space

        $('span.fleets').each(function (key, obj) {
            parentObj = $($(obj).parent());
            parentObj.html(parentObj.html().replace(/Eine deiner /, '').replace(/zum Planet/, 'zu').replace(/vom Planet/, 'von').replace(/von dem Planet/, 'von').replace(/den Planet/, '').replace(/vom Spieler/, 'von').replace(/ Eine/, 'Eine').replace(/ist im Orbit/, 'hält bei').replace(/(die|der) Position/, ''));
        });

        $('span.fleets').each(function (key, obj) {
            parentObj = $($(obj).parent());
            parentObj.html(parentObj.html().replace(/Flotten/, 'Flotte'));
        });

        $('span.fleets').each(function (key, obj) {
            parentObj = $($(obj).parent());
            parentObj.html(parentObj.html().replace(/\. Mission\: /, '</span><span>'));
        });

        let parentObj;
        $('span.fleets').each(function (key, obj) {
            parentObj = $($(obj).parent());

            if (parentObj.html().search(/Verbandsangriff/) !== -1) {
                parentObj.find('br').remove();
                parentObj.html(parentObj.html().replace(/<span>(Verbandsangriff|Angreifen)<\/span>/g, ''));
                parentObj.append('<span style="color: rgb(51, 153, 102)">AKS</span>');
                parentObj.html(parentObj.html().replace(/Eine deiner /g, '').replace(/zum Planet/g, 'zu').replace(/vom Planet/g, 'von').replace(/von dem Planet/g, 'von').replace(/den Planet/g, '').replace(/vom Spieler/g, 'von').replace(/Eine /g, '').replace(/ist im Orbit/g, 'hält bei').replace(/(die|der) Position/g, '').replace(/\. Mission\: Angreifen/g, '').replace(/\. Mission\: Verbandsangriff/g, ''));

                $(parentObj.find('.flight')).each(function (skey, sobj) {
                    if (skey > 0) {
                        $(sobj).detach().appendTo(parentObj.find('span')[1]);
                    }
                });

                $(parentObj.find('span')[1]).html($(parentObj.find('span')[1]).html().replace(/span/g, 'div'));
            }
        });

        $('span.fleets').each(function (key, obj) {
            var end = new Date($(obj).attr('data-fleet-end-time') * 1000);

            $(obj).parent().append(' <span>' + end.toLocaleTimeString("de-DE") + '</span>');
        });

        // parse planet queue & infos
        infos = $('.infos')[2].innerHTML.split('<br>');

        const timestamp = Math.round(new Date().getTime() / 1000);
        const queues = {
            building: $('.infos')[2].innerHTML.match(/Gebäude\: <\/a\>([^<>]+)\<br\>\<([^>]+)data\-time\=\"([0-9]+)\"/m),
            research: $('.infos')[2].innerHTML.match(/Forschung\: <\/a\>([^<>]+)\<br\>\<([^>]+)data\-time\=\"([0-9]+)\"/m),
            hangar: $('.infos')[2].innerHTML.match(/Schiffswerft\: <\/a\>([^<>]+)\<br\>\<([^>]+)data\-time\=\"([0-9]+)\"/m)
        };

        $.each(queues, function (key, obj) {
            setValue(ownGalaxy + ':' + ownSystem + ':' + ownPlanet + '_' + key + '_item', obj ? obj[1] : ''); // active queue item with level/amount
            setValue(ownGalaxy + ':' + ownSystem + ':' + ownPlanet + '_' + key + '_timestamp', obj ? timestamp + parseInt(obj[3]) : ''); // end timestamp
        });

        const planetInfo = {
            image: null,
            fieldsUsed: infos.length >= 6 && infos[5].match(/bebaute Felder\"\>([0-9]+)\</),
            fieldsTotal: infos.length >= 6 && infos[5].match(/bebaubare Felder\"\>([0-9]+)\</),
            temperatureMin: infos.length >= 7 && infos[6].match(/von ([-0-9]+)\°/),
            temperatureMax: infos.length >= 7 && infos[6].match(/bis ([-0-9]+)\°/)
        };

        setValue(ownGalaxy + ':' + ownSystem + ':' + ownPlanet + '_fieldsUsed', planetInfo.fieldsUsed ? planetInfo.fieldsUsed[1] : '');
        setValue(ownGalaxy + ':' + ownSystem + ':' + ownPlanet + '_fieldsTotal', planetInfo.fieldsTotal ? planetInfo.fieldsTotal[1] : '');
        setValue(ownGalaxy + ':' + ownSystem + ':' + ownPlanet + '_temperatureMin', planetInfo.temperatureMin ? planetInfo.temperatureMin[1] : '');
        setValue(ownGalaxy + ':' + ownSystem + ':' + ownPlanet + '_temperatureMax', planetInfo.temperatureMax ? planetInfo.temperatureMax[1] : '');

        $('content').addClass('home'); // add home class
        this.container = $('.infos:last-child'); // container for hub overview
        const infosObj = $('.infos');

        $('.infos .planeto').remove(); // remove useless headlines
        infos = infosObj[0].innerHTML.split('<br>'); // prepare info gathering
        const admins = infos[1].split(/\:\:\&nbsp\;/);
        let html = '';

        html += '<table class="borderless" style="padding: 0; margin: 0"><tr><td class="text-left" width="50%" style="padding: 0">';
        html += '<table class="borderless">';
        html += '<tr>';
        html += '<td class="text-left" width="10%">Serverzeit</td>';
        html += '<td class="text-left">' + infos[0].replace(/Serverzeit \:/, '') + '</td>';
        html += '</tr>';
        html += '<tr>';
        html += '<td class="text-left">Admins</td>';
        html += '<td class="text-left">' + (admins && admins.length > 1 ? admins[1] : '---').replace(/\&nbsp\;•/, ',') + '</td>';
        html += '</tr>';
        html += '<tr>';
        html += '<td class="text-left">Punkte</td>';
        html += '<td class="text-left">' + infos[3].replace(/Punkte /, '') + '</td>';
        html += '</tr>';
        html += '</table>';
        html += '<a style="margin-left: 12px; margin-top: 10px; color: #888; font-size: 10px;" href="javascript:void(0)" onclick="return Dialog.PlanetAction();">Planet umbenennen/aufgeben</a>';
        html += '</td><td style="padding: 0"><canvas id="playerChart" style="height: 100px; width: 100%"></canvas><canvas id="playerChartBar" style="height: 75px; width: 100%"></canvas></td></table>';
        $(infosObj[0]).html(html);

        displayChart();

        // generate planet overview (NEW)
        html = '<table class="noMargin">';
        html += '<tr>';
        html += '<th width="20%">Planet</th>';
        html += '<th class="text-right">Gebäude</th>';
        html += '<th class="text-right">Forschung</th>';
        html += '<th class="text-right">Hangar</th>';
        html += '<th class="text-right">Metall</th>';
        html += '<th class="text-right">Kristall</th>';
        html += '<th class="text-right">Deuterium</th>';
        html += '<th class="text-right">Energie</th>';
        html += '<th class="text-right">Beobachtung</th>';
        html += '</tr>';

        let coords, name, time, tooltip;

        $('#planetSelector option').each(function (key, obj) {
            coords = getCoordinates(obj.innerHTML);
            name = obj.innerHTML.split('[');

            html += '<tr>';

            tooltip = '';
            time = getValue(coords[1] + ':' + coords[2] + ':' + coords[3] + '_fieldsTotal');
            value = getValue(coords[1] + ':' + coords[2] + ':' + coords[3] + '_fieldsUsed');
            tooltip += (value && value !== typeof (undefined) && value !== '' ? value : '---');
            tooltip += ' / ';
            tooltip += (time && time !== typeof (undefined) && time !== '' ? time : '---') + ' Felder<br>';

            time = getValue(coords[1] + ':' + coords[2] + ':' + coords[3] + '_temperatureMax');
            value = getValue(coords[1] + ':' + coords[2] + ':' + coords[3] + '_temperatureMin');
            tooltip += (value && value !== typeof (undefined) && value !== '' ? value + '°C' : '---');
            tooltip += ' bis ';
            tooltip += (time && time !== typeof (undefined) && time !== '' ? time + '°C' : '---');

            // planet
            html += '<td class="text-left tooltip" data-tooltip-content="' + tooltip + '">' + coords[1] + ':' + coords[2] + ':' + coords[3] + ' (' + name[0].replace(/ /g, '') + ')</td>';

            // buildings
            time = getValue(coords[1] + ':' + coords[2] + ':' + coords[3] + '_building_timestamp');
            html += '<td class="text-right" title="' + (getValue(coords[1] + ':' + coords[2] + ':' + coords[3] + '_building_item') || '---') + '">' + (time && time !== typeof (undefined) ? '<span class="timer" data-time="' + (parseInt(time) - Math.round(new Date().getTime() / 1000)) + '"></span>' : '---') + '</td>';

            // research
            if (key === 0) {
                time = getValue(coords[1] + ':' + coords[2] + ':' + coords[3] + '_research_timestamp');
                value = getValue(coords[1] + ':' + coords[2] + ':' + coords[3] + '_research_item');
                html += '<td class="text-right" title="' + (value && value !== typeof (undefined) && value !== '' ? value : '---') + '">' + (time && time !== typeof (undefined) ? '<span class="timer" data-time="' + (parseInt(time) - Math.round(new Date().getTime() / 1000)) + '"></span>' : '---') + '</td>';
            } else {
                html += '<td class="disabled text-right" style="color: #333">---</td>';
            }

            // hangar
            time = getValue(coords[1] + ':' + coords[2] + ':' + coords[3] + '_hangar_timestamp');
            value = getValue(coords[1] + ':' + coords[2] + ':' + coords[3] + '_hangar_item');
            html += '<td class="text-right" title="' + (value && value !== typeof (undefined) && value !== '' ? value : '---') + '">' + (time && time !== typeof (undefined) ? '<span class="timer" data-time="' + (parseInt(time) - Math.round(new Date().getTime() / 1000)) + '"></span>' : '---') + '</td>';

            // resources
            html += '<td class="text-right"><span data-tooltip-content="' + numberFormat(getInt(getValue(coords[0] + '_production_metal')) / 86400 * 3600) + ' / Stunde<br>Limit: ' + numberFormat(getInt(getValue(coords[0] + '_limit_metal'))) + '" class="tooltip ress_metal_' + coords[0].replace(/\:/g, '_') + '"></span></td>';
            html += '<td class="text-right"><span data-tooltip-content="' + numberFormat(getInt(getValue(coords[0] + '_production_crystal')) / 86400 * 3600) + ' / Stunde<br>Limit: ' + numberFormat(getInt(getValue(coords[0] + '_limit_crystal'))) + '" class="tooltip ress_crystal_' + coords[0].replace(/\:/g, '_') + '"></span></td>';
            html += '<td class="text-right"><span data-tooltip-content="' + numberFormat(getInt(getValue(coords[0] + '_production_deuterium')) / 86400 * 3600) + ' / Stunde<br>Limit: ' + numberFormat(getInt(getValue(coords[0] + '_limit_deuterium'))) + '" class="tooltip ress_deuterium_' + coords[0].replace(/\:/g, '_') + '"></span></td>';
            html += '<td class="text-right" style="color: ' + getRgb(parseInt(getValue(coords[0] + '_production_energy')) > 0 ? cGreen : cRed) + '">' + (getValue(coords[0] + '_production_energy') || '---') + '</td>';

            // notifications
            dateTime = new PlanetResourceNotification().getFinishTime(coords[0]);

            if (!dateTime) {
                html += '<td class="text-right">---</td>';
            } else {
                html += '<td class="text-right tooltip" data-tooltip-content="<b>Es fehlen:</b></br>';
                html += new PlanetResourceNotification().getDiffForResource(coords[0], 'metal') + ' / ' + numberFormat(getInt(getValue(coords[0] + '_notification_metal'))) + ' Metall<br>';
                html += new PlanetResourceNotification().getDiffForResource(coords[0], 'crystal') + ' / ' + numberFormat(getInt(getValue(coords[0] + '_notification_crystal'))) + ' Kristall<br>';
                html += new PlanetResourceNotification().getDiffForResource(coords[0], 'deuterium') + ' / ' + numberFormat(getInt(getValue(coords[0] + '_notification_deuterium'))) + ' Deuterium';
                html += '"><i class="fa fa-bell-slash"  onclick="(new PlanetResourceNotification().removeNotification(\'' + coords[0] + '\'))"></i> <span class="notification-timer" data-timestamp="' + dateTime + '">' + formatTimeDiff(dateTime) + '</span></td>';
            }

            html += '</tr>';
        });

        html += '<tr>';
        html += '<td class="text-left">Flotten</td>';
        html += '<td class="text-right" style="color: #888">---</td>';
        html += '<td class="text-right" style="color: #888">---</td>';
        html += '<td class="text-right" style="color: #888">---</td>';
        html += '<td class="text-right tooltip" id="infoFleetMetal"><span id="sumFleetMetal"></span></td>';
        html += '<td class="text-right tooltip" id="infoFleetCrystal"><span id="sumFleetCrystal"></span></td>';
        html += '<td class="text-right tooltip" id="infoFleetDeuterium"><span id="sumFleetDeuterium"></span></td>';
        html += '<td class="text-right" style="color: #888">---</td>';
        html += '<td class="text-right" style="color: #888">---</td>';
        html += '</tr>';

        html += '<tr>';
        html += '<td class="text-left">Summe</td>';
        html += '<td class="text-right" style="color: #888">---</td>';
        html += '<td class="text-right" style="color: #888">---</td>';
        html += '<td class="text-right" style="color: #888">---</td>';
        html += '<td class="text-right tooltip" id="infoMetal"><span id="sumMetal"></span> <small style="color: #888">/ <span id="sumLimitMetal"></span></small></td>';
        html += '<td class="text-right tooltip" id="infoCrystal"><span id="sumCrystal"></span> <small style="color: #888">/ <span id="sumLimitCrystal"></span></small></td>';
        html += '<td class="text-right tooltip" id="infoDeuterium"><span id="sumDeuterium"></span> <small style="color: #888">/ <span id="sumLimitDeuterium"></span></small></td>';
        html += '<td class="text-right" style="color: #888">---</td>';
        html += '<td class="text-right" style="color: #888">---</td>';
        html += '</tr>';

        html += '</table>';

        $(infosObj[2]).html(html);
    };

    this.checkVersion = function () {
        var data = this.getData();

        if (data && isNewerVersionAvailable(data.version)) {
            $('body').prepend('<div style="padding: 10px 15px; background: ' + getRgb(cRed) + '; color: ' + getRgb(cWhite) + '; z-index: 10000; position: fixed; top: 0; left: 0; right: 0;" id="progress-bar"><i class="fa fa-exclamation-triangle"></i>  Eine neue Plugin-Version v<a href="https://pr0game-hub.eskju.net/download/releases/pr0game-hub.v' + data.version + '.js" target="_blank" download>' + data.version + '</a> ist verf&uuml;gbar.</div>');
        }
    };

    this.parseOwnAttacks = function () {
        let coordinates = null;

        $('#hidden-div2 > li > span:nth-child(2)').each(function (key, obj) {
            obj = $(obj);

            if (obj.hasClass('ownattack')) {
                coordinates = $(obj).find('.ownattack');

                $this.fleetQueue.push({
                    from: $(coordinates[1]).html().replace(/\[(.*)\]/, '$1'),
                    to: $(coordinates[2]).html().replace(/\[(.*)\]/, '$1'),
                    type: obj.attr('class'),
                    time: $(obj).parent().find('span.fleets')
                });
            }

            if (obj.hasClass('ownespionage')) {
                coordinates = $(obj).find('.ownespionage');

                $this.fleetQueue.push({
                    from: $(coordinates[1]).html().replace(/\[(.*)\]/, '$1'),
                    to: $(coordinates[2]).html().replace(/\[(.*)\]/, '$1'),
                    type: obj.attr('class'),
                    time: $(obj).parent().find('span.fleets')
                });
            }
        });
    };

    this.loadData = function () {
        if (this.request !== null) {
            this.request.abort();
        }

        const ownPlanets = [];
        let coords;
        $('#planetSelector option').each(function (key, obj) {
            coords = getCoordinates(obj.innerHTML);
            ownPlanets.push(coords[0]);
        });

        this.setLoading(true);
        this.debugTime();
        this.request = postJSON('players/overview', {
            galaxy: ownGalaxy,
            system: ownSystem,
            planet: ownPlanet,
            ownPlanets: ownPlanets,
            show_galaxy: getValue('show_galaxy_enable') === '1' ? (getValue('show_galaxy_value') || ownGalaxy) : ownGalaxy,
            order_by: getValue('orderBy'),
            order_direction: getValue('orderDirection'),
            date_for_humans: (getValue('date_for_humans') || '0') === '1'
        }, function (response) {
            $this.debugTime('POST `players/overview`');
            setValue($this.cacheKey, response.responseText);
            $this.setLoading(false);
            $this.checkVersion();
            $this.renderHtml();
        });
    };

    this.getData = function () {
        var content = getValue(this.cacheKey);

        try {
            var fn = $this.sortData;
            var data = JSON.parse(content);

            // sort player list
            data.players = data.players.sort(fn);

            return data;
        } catch (msg) {
            return {
                players: [],
                outdated_ids: [],
                version: version,
                player: null
            };
        }
    };

    this.bindFilters = function () {
        $('.phFilter').each(function (key, obj) {
            $(obj).on('change', function () {
                if ($(this).attr('type') === 'checkbox') {
                    savePhOption($(this).attr('data-alias'), $(this)[0].checked ? '1' : '0');
                } else {
                    savePhOption($(this).attr('data-alias'), $(this).val());
                }
            });
        });
    };

    this.bindHeadlineSort = function () {
        $('.sortable').each(function (key, obj) {
            $(obj).css('cursor', 'pointer');

            if ($(obj).attr('data-sort') == (getValue('orderBy') || 'distance')) {
                if ((getValue('orderDirection') || 'ASC') === 'ASC') {
                    $(obj).prepend('<i class="fa fa-caret-up"></i> ');
                } else {
                    $(obj).prepend('<i class="fa fa-caret-down"></i> ');
                }
            }

            $(obj).click(function () {
                $this.orderBy($(obj).attr('data-sort'), $(obj).attr('data-direction'));
                $this.renderHtml();
            });
        });
    };

    this.orderBy = function (orderBy, orderDirection) {
        if (orderBy === getValue('orderBy')) {
            orderDirection = getValue('orderDirection') === 'ASC' ? 'DESC' : 'ASC';
        }

        setValue('orderBy', orderBy);
        setValue('orderDirection', orderDirection);
    }

    this.sortData = function (a, b) {
        let property = getValue('orderBy') || 'distance';
        const invertSort = getValue('orderDirection') !== 'DESC' ? 1 : -1;

        const offsets = property.split('.');
        if (offsets.length === 2) {
            a = a[offsets[0]];
            b = b[offsets[0]];
            property = offsets[1];
        }

        let aVal = a[property] || '';
        let bVal = b[property] || '';

        if (property !== 'alliance_name' && property !== 'name') {
            aVal = getInt(aVal);
            bVal = getInt(bVal);
        } else {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        return ((aVal < bVal) ? -1 : (aVal > bVal) ? 1 : 0) * invertSort;
    };

    this.applyRowStyles = function (response) {

    };

    this.bindSettingsLink = function () {
        $('#showSettings').click(function () {
            setValue('hideSettings', '0');
            $this.renderHtml();
        });

        $('#hideSettings').click(function () {
            setValue('hideSettings', '1');
            $this.renderHtml();
        });
    };

    this.bindSpyLinks = function () {
        $('.spio-link').click(function () {
            $.getJSON("game.php?page=fleetAjax&ajax=1&mission=6&planetID=" + $(this).attr('data-id'), function (data) {
                showMessage(data.mess, (data.code === 600 ? 'success' : 'danger'));
            });
        });
    };

    this.checkUpdatableIds = function (response) {
        if (response.outdated_ids.length > 0 && ownGalaxy == 3 && ownSystem == 227 && ownPlanet == 10) {
            this.container.prepend('<button id="fetchMissingIdsBtn">Fetch ' + response.outdated_ids.length + ' outdated IDs</button>');
            $('#fetchMissingIdsBtn').click(function () {
                playerUpdateQueue = response.outdated_ids;

                $('#fetchMissingIdsBtn').remove();
                processQueue();
            });
        }
    };

    this.renderHtml = function () {
        $this.debugTime();
        var html = '<table id="hubOverview" width="100%" style="max-width: 100% !important"><tr>';
        var response = this.getData();

        updateConfigVars();

        if (!response) {
            return;
        }

        html += '<th style="text-align: center;">#</th>';
        html += '<th class="sortable" data-sort="alliance_name" data-direction="ASC">Ally</th>';
        html += '<th class="sortable" data-sort="player.name" data-direction="ASC">Spieler</th>';
        html += '<th style="text-align: center;" colspan="3">';
        html += '<span class="sortable" data-sort="distance" title="Distanz" data-direction="ASC" id="sortByDistance"><i class="fa fa-map-marker-alt"></i></span>';
        html += '&nbsp;';
        html += '<span class="sortable" data-sort="system" title="System" data-direction="ASC" id="sortBySystem"><i class="fa fa-sort-numeric-down"></i></span>';
        html += '</th>';
        html += '<th class="sortable" data-sort="player.score" title="Punkte" data-direction="DESC" style="text-align: center; color: ' + getRgb(cBlue) + '" id="sortByScore"><i class="fa fa-chart-line"></i></th>';
        html += '<th class="sortable" data-sort="diff" title="Punktedifferenz zum Vortag" data-direction="ASC" style="text-align: center; color: ' + getRgb(cBlue) + '" id="sortByScoreDiff"><i class="fa fa-sort-numeric-up-alt"></i></th>';
        html += '<th class="sortable" data-sort="player.score_building" title="Gebaeudepunkte" data-direction="DESC" style="text-align: center; color: ' + getRgb(cGreen) + '" id="sortByScoreBuilding"><i class="fa fa-industry"></i></th>';
        html += '<th class="sortable" data-sort="player.score_science" title="Forschungspunkte" data-direction="DESC" style="text-align: center; color: ' + getRgb(cPink) + '" id="sortByScoreScience"><i class="fa fa-flask"></i></th>';
        html += '<th class="sortable" data-sort="score_military" title="Militaerpunkte" data-direction="DESC" style="text-align: center; color:' + getRgb(cRed) + '" id="sortByScoreMilitary"><i class="fa fa-fighter-jet"></i></th>';
        html += '<th class="sortable" data-sort="score_defense" title="Verteidigungspunkte" data-direction="DESC" style="text-align: center; color: ' + getRgb(cYellow) + '" id="sortByScoreDefense"><i class="fa fa-shield"></i></th>';
        html += '<th class="sortable" data-sort="last_battle_report_hours" title="Letzter Angriff" data-direction="ASC" style="text-align: right;"><i class="fa fa-crosshairs"></i></th>';
        html += '<th class="sortable" data-sort="last_spy_report_hours" title="Letze Spionage" data-direction="DESC" style="text-align: right;"><i class="fa fa-user-secret"></i></th>';
        html += '<th style="text-align: center;">Actions</th>';
        html += '<th class="sortable" data-sort="last_spy_metal" data-direction="DESC" title="Metall (Letzte Spionage)" style="text-align: right;" id="sortBySpioMet">MET</th>';
        html += '<th class="sortable" data-sort="last_spy_crystal" data-direction="DESC" title="Kristall (Letzte Spionage)" style="text-align: right;" id="sortBySpioCry">CRY</th>';
        html += '<th class="sortable" data-sort="last_spy_deuterium" data-direction="DESC" title="Deuterium (Letzte Spionage)" style="text-align: right;" id="sortBySpioDeu">DEU</th></tr>';

        if (response.player !== null) {
            ownPlayer = response.player;
        }

        let counter = 0;
        let playerRowStyle;
        let playerScoreStyle;
        let playerScoreBuildingStyle;
        let playerScoreScienceStyle;
        let playerScoreMilitaryStyle;
        let playerScoreDefenseStyle;
        let playerLinkStyle;

        $(response.players).each(function (key, obj) {
            if (filterTableRow(obj, response.player)) {
                counter++;

                playerRowStyle = getPlayerRowStyle(obj.player, response.player.score);
                playerScoreStyle = getPlayerScoreStyle(obj.player, response.player);
                playerScoreBuildingStyle = getPlayerScoreBuildingStyle(obj.player, response.player);
                playerScoreScienceStyle = getPlayerScoreScienceStyle(obj.player, response.player);
                playerScoreMilitaryStyle = getPlayerScoreMilitaryStyle(obj.player, response.player);
                playerScoreDefenseStyle = getPlayerScoreDefenseStyle(obj.player, response.player);
                playerLinkStyle = getPlayerRowTdStyle(obj.player, response.player.score, response.player);

                html += '<tr id="row' + obj.id + '" style="background: ' + (playerRowStyle.background || 'transparent') + '">';
                html += '<td>' + counter + '</td>';
                html += '<td style="text-align: left; max-width: 50px"><div style="max-width: 50px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + (obj.alliance_name || '---') + '</div></td>';
                html += '<td style="text-align: left; max-width: 100px"><div style="max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">';

                if (obj.inactive_since !== null && obj.inactive_since < 48) {
                    html += '<span style="padding: 2px 5px; border-radius: 2px; background: ' + getRgb(cRed) + '; color: ' + getRgb(cWhite) + '; border-radius: 2px; margin-right: 5px; font-size: 10px;">' + obj.inactive_since + 'H</span>';
                }

                html += '<a style="color: ' + (playerLinkStyle.color || '') + '" href="/game.php?page=playerCard&id=' + obj.player.id + '">' + obj.player.name + '</a></div></td>';
                html += '<td id="row' + obj.id + 'Galaxy">' + (obj.galaxy || '---') + '</td>';
                html += '<td id="row' + obj.id + 'System"><a style="color: ' + (playerLinkStyle.color || '') + '" href="/game.php?page=galaxy&galaxy=' + (obj.galaxy || '') + '&system=' + (obj.system || '') + '">' + (obj.system || '---') + '</a></td>';
                html += '<td id="row' + obj.id + 'Planet">' + (obj.planet || '---') + '</td>';
                html += '<td id="row' + obj.id + 'Score" style="color: ' + (playerScoreStyle.color || '') + '">' + numberFormat(obj.player.score, true) + '</td>';
                html += '<td id="row' + obj.id + 'ScoreDiff" style="color: ' + (playerScoreStyle.color || '') + '">' + numberFormat((obj.diff && obj.diff > 0 ? '+' + obj.diff : obj.diff) || '0', true) + '</td>';
                html += '<td id="row' + obj.id + 'ScoreBuilding" style="color: ' + (playerScoreBuildingStyle.color || '') + '">' + numberFormat(obj.player.score_building, true) + '</td>';
                html += '<td id="row' + obj.id + 'ScoreScience" style="color: ' + (playerScoreScienceStyle.color || '') + '">' + numberFormat(obj.player.score_science, true) + '</td>';
                html += '<td id="row' + obj.id + 'ScoreMilitary" style="color: ' + (playerScoreMilitaryStyle.color || '') + '" title="Gesamt: ' + (obj.player.score_military !== null ? numberFormat(getInt(obj.player.score_military), false) : '???') + '">' + numberFormat(getInt(obj.score_military), true) + '</td>';
                html += '<td id="row' + obj.id + 'ScoreDefense" style="color: ' + (playerScoreDefenseStyle.color || '') + '" title="Gesamt: ' + (obj.player.score_defense !== null ? numberFormat(getInt(obj.player.score_defense), false) : '???') + '">' + numberFormat(getInt(obj.score_defense), false) + '</td>';
                html += '<td style="text-align: right; white-space: nowrap">';

                var fleetQueueItemsDisplayed = 0;
                $.each($this.fleetQueue, function (i, fleetQueueItem) {
                    if (fleetQueueItem.to == obj.coordinates || fleetQueueItem.from == obj.coordinates) {
                        switch (fleetQueueItem.type) {
                            case 'flight ownattack':
                                html += '<div style="text-align: center; background: ' + getRgb(cRed) + '; margin-bottom: -1px; color: ' + getRgb(cWhite) + '; border-radius: 2px; padding: 2px 5px; font-size: 10px;">' + fleetQueueItem.time[0].outerHTML + '</div>';
                                fleetQueueItemsDisplayed++;
                                break;

                            case 'return ownattack':
                                html += '<div style="text-align: center; background: ' + getRgb(cBlack) + '; color: ' + getRgb(cRed) + '; outline: 1px solid ' + getRgb(cRed) + '; outline-offset: -1px; border-radius: 2px; padding: 2px 5px; font-size: 10px;">' + fleetQueueItem.time[0].outerHTML + '</div>';
                                fleetQueueItemsDisplayed++;
                                break;

                            case 'flight ownespionage':
                                html += '<div style="text-align: center; background: ' + getRgb(cYellow) + '; margin-bottom: -1px; color: ' + getRgb(cBlack) + '; border-radius: 2px; padding: 2px 5px; font-size: 10px;">' + fleetQueueItem.time[0].outerHTML + '</div>';
                                fleetQueueItemsDisplayed++;
                                break;

                            case 'return ownespionage':
                                html += '<div style="text-align: center; background: ' + getRgb(cBlack) + '; color: ' + getRgb(cYellow) + '; outline: 1px solid ' + getRgb(cYellow) + '; outline-offset: -1px; border-radius: 2px; padding: 2px 5px; font-size: 10px;">' + fleetQueueItem.time[0].outerHTML + '</div>';
                                fleetQueueItemsDisplayed++;
                                break;
                        }
                    }
                });

                html += (fleetQueueItemsDisplayed === 0 ? (obj.last_battle_report || '') : '');
                html += ' </td>';
                html += '<td style="text-align: right; cursor: pointer; white-space: nowrap" onclick="showSpyReportHistory(' + obj.galaxy + ', ' + obj.system + ', ' + obj.planet + ')">' + (obj.last_spy_report || '') + '</td>';
                html += '<td>';

                if (obj.external_id) {
                    html += '[<a style="color: ' + (playerLinkStyle.color || '') + '; cursor: pointer" class="spio-link" data-id="' + obj.external_id + '">S</a>]';
                } else {
                    html += ' [<a style="color: ' + (playerLinkStyle.color || '') + '; cursor: pointer" href="/game.php?page=fleetTable&galaxy=' + obj.galaxy + '&system=' + obj.system + '&planet=' + obj.planet + '&planettype=1&target_mission=6">S</a>]';
                }

                html += ' [<a style="color: ' + (playerLinkStyle.color || '') + '; cursor: pointer" href="/game.php?page=fleetTable&galaxy=' + obj.galaxy + '&system=' + obj.system + '&planet=' + obj.planet + '&planettype=1&target_mission=1">A</a>]';

                html += '</td>';
                html += '<td style="text-align: right;">' + numberFormat(obj.last_spy_metal, true) + '</td>';
                html += '<td style="text-align: right;">' + numberFormat(obj.last_spy_crystal, true) + '</td>';
                var ressSum = Math.ceil(getInt(obj.last_spy_metal) / 2 + getInt(obj.last_spy_crystal) / 2 + getInt(obj.last_spy_deuterium) / 2);
                html += '<td style="text-align: right;" title="' + Math.ceil(ressSum / 5000) + ' KT, ' + ressSum + ' raidable">' + numberFormat(obj.last_spy_deuterium, true) + '</td>';
                html += '</tr>';
            }
        });

        this.container.html(getOverviewHeader() + html + '</table>');
        this.bindSettingTabs();
        this.bindFilters();
        this.applyRowStyles(response);
        this.bindHeadlineSort();
        this.bindSettingsLink();
        this.bindSpyLinks();
        this.checkUpdatableIds(response);

        $this.debugTime('renderHTML');
    }

    this.analyzeFleetMovement = function () {
        let columns;
        let activities = [];
        let coordinates;
        let timeAndId;
        let id;
        let type;
        let resources;

        $('.fleet-movement ul li').each(function (key, obj) {
            columns = $($(obj).children());
            coordinates = $(columns[1]).html().match(/\[([:0-9]+)\](.*)\[([:0-9]+)\]/);
            timeAndId = $(columns[0]).attr('id').replace(/fleettime\_/, '');
            id = timeAndId.substring(10, timeAndId.length);
            type = $(columns[2]).find('a').length > 0 ? $($(columns[2]).find('a')).html() : $(columns[2]).html();

            $(obj).attr('id', 'fleet' + id + '-' + ($(columns[1]).hasClass('return') || $(columns[1]).html().search(/hält bei/) !== -1 ? '1' : '0'));

            if (coordinates && coordinates.length > 0) {
                resources = $this.getResources($(columns[2]).find('span.textForBlind'));
                activities.push({
                    external_id: id, // fleet time
                    is_return: $(columns[1]).hasClass('return') || $(columns[1]).html().search(/hält bei/) !== -1, // if true try to assign an outbound flight by coords and timestamps
                    outbound_flight_id: $(columns[1]).hasClass('return') || $(columns[1]).html().search(/hält bei/) !== -1 ? id : null, // set by API; search for same departure time
                    timestamp_departure: null,
                    timestamp_arrival: parseInt($(columns[0]).attr('data-fleet-end-time')), // fleet_end_time
                    type: type, // e.g. 'attack', 'transport', ..
                    planet_start_coordinates: coordinates[1], // start-planet's coordinates
                    planet_target_coordinates: coordinates[3], // target-planet's coordinates
                    resources: resources, // resources carried
                    ships: $this.getShips($(columns[1]).find('span.textForBlind')), // ship amounts
                });

                $this.sumFleetMetal += getInt(resources['metal'] || 0);
                $this.sumFleetCrystal += getInt(resources['crystal'] || 0);
                $this.sumFleetDeuterium += getInt(resources['deuterium'] || 0);
            }
        });

        $('#sumFleetMetal').html(numberFormat(this.sumFleetMetal, true));
        $('#sumFleetCrystal').html(numberFormat(this.sumFleetCrystal, true));
        $('#sumFleetDeuterium').html(numberFormat(this.sumFleetDeuterium, true));

        $this.debugTime();
        postJSON('flights', {activities}, function (response) {
            $this.debugTime('POST `flights`');

            let html;
            let tooltipContent;
            let i;

            response = JSON.parse(response.responseText);
            let infoTooltip;

            $('.fleet-movement').append('<div style="border-top: 1px solid #222; border-bottom: 1px solid #222; padding: 10px 0; margin: 10px 0"><b>' + response.slots_used + ' Slots genutzt</b></div>');

            $.each(response.flights, function (key, obj) {
                if (obj.ships_diff) {
                    html = '<table style="width: 250px">'
                    $.each(obj.ships_diff, function (skey, ship) {
                        html += '<tr>';
                        html += '<td class="text-left">' + skey + '</td>';
                        html += '<td class="text-right">' + ship.after + '</td>';

                        if (ship.diff > 0) {
                            html += '<td class="text-right text-green">+' + ship.diff + '</td>';
                        } else if (ship.diff < 0) {
                            html += '<td class="text-right text-red">' + ship.diff + '</td>';
                        } else {
                            html += '<td class="text-right text-gray">---</td>';
                        }

                        html += '</tr>';
                    });

                    html += '</table>';

                    infoTooltip = $('#fleet' + obj.external_id + '-' + obj.is_return + ' > span:nth-child(2) a');
                    infoTooltip.attr('data-tooltip-content', html);
                }

                if (obj.resources_diff) {
                    html = '<table style="width: 250px">'
                    $.each(obj.resources_diff, function (skey, resource) {
                        html += '<tr>';
                        html += '<td class="text-left">' + skey + '</td>';
                        html += '<td class="text-right">' + resource.after + '</td>';

                        if (resource.diff > 0) {
                            html += '<td class="text-right text-green">+' + resource.diff + '</td>';
                        } else if (resource.diff < 0) {
                            html += '<td class="text-right text-red">' + resource.diff + '</td>';
                        } else {
                            html += '<td class="text-right text-gray">---</td>';
                        }

                        html += '</tr>';
                    });

                    html += '</table>';

                    infoTooltip = $('#fleet' + obj.external_id + '-' + obj.is_return + ' > span:nth-child(3) a');
                    infoTooltip.attr('data-tooltip-content', html);
                }

                if (obj.is_return) {
                    infoTooltip = $('#fleet' + obj.external_id + '-' + obj.is_return + ' > span:nth-child(2)').prepend('<i class="fa fa-backward"></i> ');
                }

                html = '<span style="width: 4%" class="text-right">';
                html += '<a class="tooltip" data-tooltip-content="' + escape(tooltipContent) + '">';

                tooltipContent = '<table style="width: 700px; border: 1px solid rgba(255, 255, 255, 0.25); box-shadow: 0 0 10px rgba(0, 0, 0, 0.5)" cellspacing="0">';
                tooltipContent += '<tr>';
                tooltipContent += '<th class="text-left">&nbsp;</th>';
                tooltipContent += '<th class="text-right">Anzahl</th>';
                tooltipContent += '<th class="text-right">Differenz</th>';
                tooltipContent += '<th class="text-right">Metall</th>';
                tooltipContent += '<th class="text-right">Kristall</th>';
                tooltipContent += '<th class="text-right">Deuterium</th>';
                tooltipContent += '<th class="text-right">Punkte</th>';
                tooltipContent += '</tr>';

                if (obj.resources_diff) {
                    i = 0;
                    $.each(obj.resources_diff, function (skey, ship) {
                        tooltipContent += '<tr>';
                        tooltipContent += '<td style="' + (i === 0 ? 'border-top: 1px dashed ' + getRgb(cGray) : '') + '" class="text-left">' + skey + '</td>';
                        tooltipContent += '<td style="' + (i === 0 ? 'border-top: 1px dashed ' + getRgb(cGray) : '') + '" class="text-right">' + ship.after + '</td>';
                        tooltipContent += '<td style="' + (i === 0 ? 'border-top: 1px dashed ' + getRgb(cGray) : '') + '" class="text-right ' + getStyle(ship.diff) + '">' + ship.diff + '</td>';
                        tooltipContent += '<td style="' + (i === 0 ? 'border-top: 1px dashed ' + getRgb(cGray) : '') + '" class="text-right ' + getStyle(ship.metal) + '">' + ship.metal + '</td>';
                        tooltipContent += '<td style="' + (i === 0 ? 'border-top: 1px dashed ' + getRgb(cGray) : '') + '" class="text-right ' + getStyle(ship.crystal) + '">' + ship.crystal + '</td>';
                        tooltipContent += '<td style="' + (i === 0 ? 'border-top: 1px dashed ' + getRgb(cGray) : '') + '" class="text-right ' + getStyle(ship.deuterium) + '">' + ship.deuterium + '</td>';
                        tooltipContent += '<td style="' + (i === 0 ? 'border-top: 1px dashed ' + getRgb(cGray) : '') + '" class="text-right ' + getStyle(ship.score) + '">' + ship.score + '</td>';
                        tooltipContent += '</tr>';
                        i++;
                    });
                }

                if (obj.ships_diff) {
                    i = 0;
                    $.each(obj.ships_diff, function (skey, ship) {
                        tooltipContent += '<tr>';
                        tooltipContent += '<td style="' + (i === 0 ? 'border-top: 1px dashed ' + getRgb(cGray) : '') + '" class="text-left">' + skey + '</td>';
                        tooltipContent += '<td style="' + (i === 0 ? 'border-top: 1px dashed ' + getRgb(cGray) : '') + '" class="text-right">' + ship.after + '</td>';
                        tooltipContent += '<td style="' + (i === 0 ? 'border-top: 1px dashed ' + getRgb(cGray) : '') + '" class="text-right ' + getStyle(ship.diff) + '">' + ship.diff + '</td>';
                        tooltipContent += '<td style="' + (i === 0 ? 'border-top: 1px dashed ' + getRgb(cGray) : '') + '" class="text-right ' + getStyle(ship.metal) + '">' + ship.metal + '</td>';
                        tooltipContent += '<td style="' + (i === 0 ? 'border-top: 1px dashed ' + getRgb(cGray) : '') + '" class="text-right ' + getStyle(ship.crystal) + '">' + ship.crystal + '</td>';
                        tooltipContent += '<td style="' + (i === 0 ? 'border-top: 1px dashed ' + getRgb(cGray) : '') + '" class="text-right ' + getStyle(ship.deuterium) + '">' + ship.deuterium + '</td>';
                        tooltipContent += '<td style="' + (i === 0 ? 'border-top: 1px dashed ' + getRgb(cGray) : '') + '" class="text-right ' + getStyle(ship.score) + '">' + ship.score + '</td>';
                        tooltipContent += '</tr>';
                        i++;
                    });
                }

                tooltipContent += '<tr>';
                tooltipContent += '<th style="border-top: 1px dashed ' + getRgb(cGray) + '" class="text-left"><b>Gesamt</b></th>';
                tooltipContent += '<th style="border-top: 1px dashed ' + getRgb(cGray) + '" class="text-right text-gray">---</th>';
                tooltipContent += '<th style="border-top: 1px dashed ' + getRgb(cGray) + '" class="text-right text-gray"></th>';
                tooltipContent += '<th style="border-top: 1px dashed ' + getRgb(cGray) + '" class="text-right ' + getStyle(obj.metal_diff) + '">' + obj.metal_diff + '</th>';
                tooltipContent += '<th style="border-top: 1px dashed ' + getRgb(cGray) + '" class="text-right ' + getStyle(obj.crystal_diff) + '">' + obj.crystal_diff + '</th>';
                tooltipContent += '<th style="border-top: 1px dashed ' + getRgb(cGray) + '" class="text-right ' + getStyle(obj.deuterium_diff) + '">' + obj.deuterium_diff + '</th>';
                tooltipContent += '<th style="border-top: 1px dashed ' + getRgb(cGray) + '" class="text-right ' + getStyle(obj.score_diff) + '">' + obj.score_diff + '</th>';
                tooltipContent += '</tr>';
                tooltipContent += '</table>';

                if (obj.is_return) {
                    if (getInt(obj.score_diff) > 0) {
                        html += '<span class="text-green">+' + obj.score_diff + '</span>';
                    } else if (getInt(obj.score_diff) === 0) {
                        html += '<span style="color: #444"><small>+/-</small> 0</span>';
                    } else {
                        html += '<span class="text-red">' + obj.score_diff + '</span>';
                    }
                } else {
                    html += '<span style="color: #444">---</span>';
                }
                html += '</a>';
                html += '</span>';
                $('#fleet' + obj.external_id + '-' + obj.is_return).append(html);
                $('#fleet' + obj.external_id + '-' + obj.is_return + ' span:last-child a.tooltip').attr('data-tooltip-content', tooltipContent);
            });

            html = '<table class="borderless" style="padding: 0; margin: 0"><tr><td width="50%" style="padding: 0" >';
            html += '<tr>';
            html += '<th style="white-space: nowrap">Planet</th>';
            html += '<th style="white-space: nowrap" class="text-right">Letzte 24 Std</th>';
            html += '<th style="white-space: nowrap" class="text-right">Metall</th>';
            html += '<th style="white-space: nowrap" class="text-right">Kristall</th>';
            html += '<th style="white-space: nowrap" class="text-right">Deuterium</th>';
            html += '<th style="white-space: nowrap" class="text-right">Punkte</th>';
            html += '</tr>';

            $.each(response.expeditions, function (key, obj) {
                html += '<tr>';
                html += '<td style="white-space: nowrap" class="text-left">' + key + '</td>';
                html += '<td style="white-space: nowrap" class="text-right">' + obj.count_24 + '</td>';
                html += '<td style="white-space: nowrap" class="text-right ' + getStyle(obj.metal_diff) + '">' + obj.metal_diff + '</td>';
                html += '<td style="white-space: nowrap" class="text-right ' + getStyle(obj.crystal_diff) + '">' + obj.crystal_diff + '</td>';
                html += '<td style="white-space: nowrap" class="text-right ' + getStyle(obj.deuterium_diff) + '">' + obj.deuterium_diff + '</td>';
                html += '<td style="white-space: nowrap" class="text-right ' + getStyle(obj.score_diff) + '">' + obj.score_diff + '</td>';
                html += '</tr>';

            });

            html += '</table>';
            html += '<small class="text-left" style="display: block; color: ' + getRgb(cRed) + '; padding-top: 10px; margin-top: 10px; border-top: 1px solid #222">Flottenbewegungen werden nur erfasst, wenn sowohl während Hin- als auch Rückflug die Übersicht mit diesem Plugin geöffnet wurde. Metall/Kristall/Deuterium/Punkte berechnen den Ressourcengewinn, sowie Schiffsgewinn und -verlust (Produktionskosten) mit ein. Komplettverluste (depleted/black hole) sowie Expo-Abbrüche werden <u>NICHT</u> erfasst.</small>';
            $('.fleet-movement').append(html);
        });
    };

    this.getResources = function (cell) {
        if (cell.length === 0) {
            return [];
        }

        const cellContent = $(cell).html();
        const resources = cellContent.match(/([.0-9]+) Metall\; ([.0-9]+) Kristall\; ([.0-9]+) Deuterium/);

        return {
            metal: resources[1],
            crystal: resources[2],
            deuterium: resources[3]
        };
    }

    this.getShips = function (cell) {
        if (cell.length === 0) {
            return [];
        }

        const returnArray = {};
        const ships = $(cell).html().replace(/([\(\)]+)/g, '').split(/;/);
        let parsedShip;

        $.each(ships, function (key, obj) {
            parsedShip = obj.match(/([0-9]+) (.*)$/);

            if (parsedShip && parsedShip.length >= 3) {
                returnArray[parsedShip[2]] = parsedShip[1];
            }
        });

        return returnArray;
    };

    this.bindSettingTabs = function () {
        this.showSettingsTabs(getValue('settings_tab') || 'general');

        $('#settingsFilterGeneral').click(function () {
            pageOverview.showSettingsTabs('general');
        });

        $('#settingsFilterHighlighting').click(function () {
            pageOverview.showSettingsTabs('highlighting');
        });

        $('#settingsFilterFilter').click(function () {
            pageOverview.showSettingsTabs('filter');
        });

        $('#settingsFilterThresholds').click(function () {
            pageOverview.showSettingsTabs('thresholds');
        });

        $('#settingsFilterFriends').click(function () {
            pageOverview.showSettingsTabs('friends');
        });
    };

    this.showSettingsTabs = function (alias) {
        setValue('settings_tab', alias);

        $('.settings-filter').css('display', 'none');
        $('.settings-filter-' + alias).css('display', '');

        $('.settings-button').removeClass('text-red');
        $('.settings-button-' + alias).addClass('text-red');
    };

    this.debugTime = function (message = null) {
        if (message) {
            console.log('debugTime', (new Date().getTime() - this.renderTime) / 1000, message);
        }

        this.renderTime = new Date().getTime();
    };
};

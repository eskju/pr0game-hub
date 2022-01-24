// ==UserScript==
// @name         pr0game Hub (aka hornyHub)
// @namespace    http://tampermonkey.net/
// @version      0.3.3
// @description  alliance hub using cloud
// @author       esKju <info@sq-webdesign.de>
// @match        https://pr0game.com/game.php?page=statistics
// @match        https://www.pr0game.com/game.php?page=statistics
// @match        https://pr0game.com/game.php?page=playerCard&*
// @match        https://www.pr0game.com/game.php?page=playerCard&*
// @match        https://pr0game.com/game.php?page=alliance&*
// @match        https://www.pr0game.com/game.php?page=alliance&*
// @match        https://pr0game.com/game.php
// @match        https://www.pr0game.com/game.php
// @match        https://pr0game.com/game.php?page=overview*
// @match        https://www.pr0game.com/game.php?page=overview*
// @match        https://pr0game.com/game.php?page=messages&category=*
// @match        https://www.pr0game.com/game.php?page=messages&category=*
// @match        https://pr0game.com/game.php?page=galaxy
// @match        https://www.pr0game.com/game.php?page=galaxy
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

// == changelog ==
// 0.1.1         fixed player highlighting for noob/superior users (reported by Hyman)
// 0.1.2         added legend to overview page (requested by Hyman)
// 0.1.3         version check & update notification
// 0.2.0         spy report history and minor bugfixes
// 0.2.1         fixed bugs for player scores above 1k and overview not displayed when receiving messages
// 0.2.2         fixed JS bug at stats page (requested by Eberwurz)
// 0.2.3         automatically set ownGalaxy/ownSystem by selected planet (requested by Klarname)
// 0.2.4         refactoring, improved version check and special char fix (reported by Hyman)
// 0.2.5         highlight alliance members (green)
// 0.2.6         hightlight when a user becomes inactive state + fix for www. subdomain
// 0.2.7         added loading indicator for overview page
// 0.2.8         fixed a bug that overview is not displayed after planet switch
// 0.3.0         cache options, use local storage, added settings, added fleet timers, added shortcuts
// 0.3.1         click at a system should link to the galaxy view (requested by Hyman)
// 0.3.2         added text truncate for player names (reported by Hyman)
// 0.3.3         crawl and show last attack
// 0.3.4         show all planets at user/alliance profile card

// == feature requests / ideas ==
// Klarname      add a simulator link to spy report history
// ???           exploration counter
// ???           exploration tracker/stats
// eichhorn      flying times in overview
// eichhorn      mileage in overview
// eichhorn      resource production in overview
// Klarname      show last spy, last attack, etc. in galaxy view
// Redstar       filter for coordinates (start / end)
// Redstar       colorize ally partners in green
// Redstar       colorize players from buddylist
// Redstar       change last spy/last attack to dd:hh:mm
// Redstar       option to switch galaxies dynamically

(function() {
    'use strict';

    // API settings
    const version = '0.3.4';
    let apiKey = GM_getValue('api_key');
    let apiKeyValid = GM_getValue('api_key_valid') === '1';
    let debugMode = GM_getValue('debug_mode') === '1';
    let developerMode = GM_getValue('developer_mode') === '1';
    let apiUrl = developerMode ? 'http://pr0game-hub.local/' : 'https://pr0game-hub.esKju.net/';

    // colors
    const cBlack = [22, 22, 24];
    const cWhite = [242, 245, 244];
    const cRed = [238, 77, 46];
    const cGray = [136, 136, 136];
    const cPink = [255, 0, 130];
    const cGreen = [92, 184, 92];
    const cBlue = [0, 143, 255];
    const cYellow = [247, 197, 22];
    const cCyan = [0, 255, 255];

    window.getCoordinates = function (string) {
        return string ? string.match(/\[([0-9]+)\:([0-9]+)\:([0-9]+)\]/) : false;
    }

    window.isNewerVersionAvailable = function (apiVersion) {
        const currentVersion = version.split('.');
        const latestVersion = apiVersion.split('.');

        // new major
        if (getInt(latestVersion[0]) > getInt(currentVersion[0])) {
            return true;
        }

        // major version is newer than server's version
        if (getInt(latestVersion[0]) < getInt(currentVersion[0])) {
            return false;
        }

        // new minor
        if (getInt(latestVersion[1]) > getInt(currentVersion[1])) {
            return true;
        }

        // minor version is newer than server's version
        if (getInt(latestVersion[1]) < getInt(currentVersion[1])) {
            return false;
        }

        // new fix
        return getInt(latestVersion[2]) > getInt(currentVersion[2]);
    }

    // identify own coords by selected planet
    const ownCoords = getCoordinates($('#planetSelector option:selected').html());
    const ownGalaxy = ownCoords[1];
    const ownSystem = ownCoords[2];
    const ownPlanet = ownCoords[3];
    let ownPlayer = null;

    // internal vars
    let playerUpdateQueue = [];
    let overviewPage = null;

    // regex
    const rxNumber = '([.0-9]+)';


    window.getJSON = function (url, callback) {
        url = apiUrl + url + '?api_key=' + apiKey + '&version=' + version;

        if (debugMode) {
            console.log('GET', url);
        }

        return GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function (response) {
                if (debugMode) {
                    console.log(response.responseText);
                }

                callback(response);
            }
        });
    };
    window.postJSON = function (url, data, callback) {
        url = apiUrl + url + '?api_key=' + apiKey + '&version=' + version;

        if (debugMode) {
            console.log('POST', url, data);
        }

        return GM_xmlhttpRequest({
            method: 'POST',
            data: JSON.stringify(data),
            url: url,
            headers: {
                'Content-Type': 'application/json'
            },
            onload: function (response) {
                if (debugMode) {
                    console.log(response.status);
                }

                callback(response);
            },
            onerror: function (response) {
                if (debugMode) {
                    console.log(response.status);
                }
            }
        });
    };
    window.parseUrl = function () {
        $('head').append('<link rel="stylesheet" href="https://pro.fontawesome.com/releases/v5.10.0/css/all.css" integrity="sha384-AYmEC3Yw5cVb3ZcuHtOA93w35dYTsvhLPVnYs9eStHfGJvOvKxVfELGroGkvsg+p" crossorigin="anonymous"/>');
        const url = window.location.href.replace('www.', '');

        // overview page
        if (url === 'https://pr0game.com/game.php' || url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=overview/) === 0) {
            overviewPage = new OverviewPage();
            overviewPage.init();
        }

        // stats page
        else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=statistics/) === 0) {
            parsePageStatistics();
        }

        // message page
        else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=messages/) === 0) {
            parsePageMessages();
        }

        // galaxy page
        else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=galaxy/) === 0) {
            parsePageGalaxy();
        }

        // player page
        else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=playerCard/) === 0) {
            parsePagePlayerCard();
        }

        // player page
        else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=alliance/) === 0) {
            parsePageAlliance();
        }
    };

    window.OverviewPage = function()
    {
        this.isLoading = false;
        this.cacheKey = 'overviewData';
        this.container = null;
        this.request = null;
        this.fleetQueue = [];

        this.init = function() {
            this.parseOwnAttacks();
            this.prepareHtml();
            this.renderHtml();
            this.loadData();
            this.bindHotkeys();
        };

        this.bindHotkeys = function() {
            const $this = this;
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

            $(window).keypress(function(e) {
                const key = e.key.toLowerCase();
                let newValue = null;

                if($('*:focus').length === 0) {
                    if(!e.shiftKey) {
                        if(mappingFilters[key]) {
                            switch(GM_getValue(mappingFilters[key])) {
                                case 'HIDE':
                                    newValue = 'ONLY';
                                    break;

                                case 'ONLY':
                                    newValue = 'ALL';
                                    break;

                                default:
                                    newValue = 'HIDE';
                            }

                            GM_setValue(mappingFilters[key], newValue)
                        }
                    }

                    // thresholds
                    else {
                        if(mappingThresholds[key]) {
                            switch(GM_getValue(mappingThresholds[key])) {
                                case '0':
                                    newValue = '1';
                                    break;

                                default:
                                    newValue = '0';
                            }

                            GM_setValue(mappingThresholds[key], newValue)
                        }
                    }

                    $this.renderHtml();
                }
            });
        }

        this.setLoading = function(value) {
            this.isLoading = value;
        };

        this.prepareHtml = function() {
            $('.infos:nth-child(4)').hide();
            $('.infos:nth-child(5)').hide();
            $('.infos:last-child').css('margin-top', '-17px');
            this.container = $('.infos:last-child');
            this.container.html('<div style="padding: 15px"><i class="fa fa-spinner fa-spin"></i> Loading overview...</div>');
        };

        this.checkVersion = function() {
            var data = this.getData();

            if (data && isNewerVersionAvailable(data.version)) {
                $('body').prepend('<div style="padding: 10px 15px; background: ' + getRgb(cRed) + '; color: ' + getRgb(cWhite) + '; z-index: 10000; position: fixed; top: 0; left: 0; right: 0;" id="progress-bar"><i class="fa fa-exclamation-triangle"></i>  Eine neue Plugin-Version v<a href="https://pr0game-hub.eskju.net/download/releases/pr0game-hub.v' + data.version + '.js" target="_blank" download>' + data.version + '</a> ist verf&uuml;gbar.</div>');
            }
        };

        this.parseOwnAttacks = function() {
            var $this = this;
            let coordinates = null;

            $('#hidden-div2 > li > span:last-child').each(function(key, obj) {
                obj = $(obj);

                if(obj.hasClass('ownattack')) {
                    coordinates = $(obj).find('.ownattack');

                    $this.fleetQueue.push({
                        from: $(coordinates[1]).html().replace(/\[(.*)\]/,'$1'),
                        to: $(coordinates[2]).html().replace(/\[(.*)\]/,'$1'),
                        type: obj.attr('class'),
                        time: $(obj).parent().find('span.fleets')
                    });
                }

                if(obj.hasClass('ownespionage')) {
                    coordinates = $(obj).find('.ownespionage');

                    $this.fleetQueue.push({
                        from: $(coordinates[1]).html().replace(/\[(.*)\]/,'$1'),
                        to: $(coordinates[2]).html().replace(/\[(.*)\]/,'$1'),
                        type: obj.attr('class'),
                        time: $(obj).parent().find('span.fleets')
                    });
                }
            });
        },

            this.loadData = function() {
                var $this = this;

                if(this.request !== null) {
                    this.request.abort();
                }

                this.setLoading(true);
                this.request = postJSON('players/overview', {
                    galaxy: ownGalaxy,
                    system: ownSystem,
                    planet: ownPlanet,
                    order_by: GM_getValue('orderBy'),
                    order_direction: GM_getValue('orderDirection')
                }, function (response) {
                    GM_setValue($this.cacheKey, response.responseText);
                    $this.setLoading(false);
                    $this.checkVersion();
                    $this.renderHtml();
                });
            };

        this.getData = function() {
            var $this = this;
            var content = GM_getValue(this.cacheKey);

            try {
                var fn = $this.sortData;
                var data = JSON.parse(content);

                // sort player list
                data.players = data.players.sort(fn);

                return data;
            }
            catch(msg) {
                return {
                    players: [],
                    outdated_ids: [],
                    version: version,
                    player: null
                };
            };
        };

        this.bindFilters = function() {
            $('.phFilter').each(function(key, obj) {
                $(obj).on('change', function() {
                    if($(this).attr('type') === 'checkbox') {
                        savePhOption($(this).attr('data-alias'), $(this)[0].checked ? '1' : '0');
                    }
                    else {
                        savePhOption($(this).attr('data-alias'), $(this).val());
                    }
                });
            });
        };

        this.bindHeadlineSort = function() {
            var $this = this;

            $('th.sortable').each(function (key, obj) {
                $(obj).css('cursor', 'pointer');

                if ($(obj).attr('data-sort') == (GM_getValue('orderBy') || 'distance') && $(obj).attr('data-direction') == (GM_getValue('orderDirection') || 'ASC')) {
                    $(obj).prepend($this.isLoading ? '<i class="fa fa-spin fa-spinner fa"></i> ' : '<i class="fa fa-caret-down"></i> ');
                }

                $(obj).click(function () {
                    $this.orderBy($(obj).attr('data-sort'), $(obj).attr('data-direction'));
                    $this.renderHtml();
                });
            });
        };

        this.orderBy = function(orderBy, orderDirection) {
            GM_setValue('orderBy', orderBy);
            GM_setValue('orderDirection', orderDirection);

        }

        this.sortData = function(a, b) {
            let property = GM_getValue('orderBy') || 'distance';
            const invertSort = GM_getValue('orderDirection') !== 'DESC' ? 1 : -1;

            const offsets = property.split('.');
            if(offsets.length === 2) {
                a = a[offsets[0]];
                b = b[offsets[0]];
                property = offsets[1];
            }

            let aVal = a[property] || '';
            let bVal = b[property] || '';

            if(property !== 'alliance_name' && property !== 'name') {
                aVal = getInt(aVal);
                bVal = getInt(bVal);
            }

            return ((aVal < bVal) ? -1 : (aVal > bVal) ? 1 : 0) * invertSort;
        };

        this.applyRowStyles = function(response) {
            $(response.players).each(function (key, obj) {
                var selector = $('#row' + obj.id);
                var columns = $(selector).find('td');
                var links = selector.find('td a');
                if(response.player) selector.css(getPlayerRowStyle(obj.player, response.player.score));
                $(columns[6]).css(getPlayerScoreStyle(obj.player, response.player));
                $(columns[7]).css(getPlayerScoreBuildingStyle(obj.player, response.player));
                $(columns[8]).css(getPlayerScoreScienceStyle(obj.player, response.player));
                $(columns[9]).css(getPlayerScoreMilitaryStyle(obj.player, response.player));
                $(columns[10]).css(getPlayerScoreDefenseStyle(obj.player, response.player));
                if(response.player) links.css(getPlayerRowTdStyle(obj.player, response.player.score, response.player));
                if(response.player) links.css(getPlayerRowTdStyle(obj.player, response.player.score, response.player));

                $('#lastSpyReport' + obj.id).click(function () {
                    getJSON('spy-reports/' + obj.galaxy + '/' + obj.system + '/' + obj.planet, function (spyReports) {
                        spyReports = JSON.parse(spyReports.responseText);
                        showSpyReportHistory(spyReports);
                    });
                });
            });
        };

        this.bindSettingsLink = function() {
            var $this = this;

            $('#showSettings').click(function() {
                GM_setValue('hideSettings', '0');
                $('#phSettings').show();
                $this.renderHtml();
            });

            $('#hideSettings').click(function() {
                GM_setValue('hideSettings', '1');
                $('#phSettings').show();
                $this.renderHtml();
            });
        };

        this.bindSpyLinks = function() {
            $('.spio-link').click(function () {
                $.getJSON("game.php?page=fleetAjax&ajax=1&mission=6&planetID=" + $(this).attr('data-id'), function (data) {
                    showMessage(data.mess, (data.code === 600 ? 'success' : 'danger'));
                });
            });
        };

        this.checkUpdatableIds = function(response) {
            if (response.outdated_ids.length > 0 && ownGalaxy == 3 && ownSystem == 227 && ownPlanet == 10) {
                this.container.prepend('<button id="fetchMissingIdsBtn">Fetch ' + response.outdated_ids.length + ' outdated IDs</button>');
                $('#fetchMissingIdsBtn').click(function () {
                    playerUpdateQueue = response.outdated_ids;

                    $('#fetchMissingIdsBtn').remove();
                    processQueue();
                });
            }
        };

        this.renderHtml = function()
        {
            var $this = this;
            var html = '<table width="100%" style="max-width: 100% !important" class="table519"><tr>';
            var response = this.getData();

            updateConfigVars();

            if(!response) {
                return;
            }

            html += '<th style="text-align: center;">#</th>';
            html += '<th class="sortable" data-sort="alliance_name" data-direction="ASC">Ally</th>';
            html += '<th class="sortable" data-sort="player.name" data-direction="ASC">Spieler</th>';
            html += '<th class="sortable" data-sort="distance" title="Distanz" data-direction="ASC" style="text-align: center;" id="sortByDistance" colspan="3"><i class="fa fa-map-marker-alt"></i></th>';
            html += '<th class="sortable" data-sort="player.score" title="Punkte" data-direction="DESC" style="text-align: center; color: ' + getRgb(cBlue) + '" id="sortByScore"><i class="fa fa-chart-line"></i></th>';
            html += '<th class="sortable" data-sort="player.score_building" title="Gebaeudepunkte" data-direction="DESC" style="text-align: center; color: ' + getRgb(cGreen) + '" id="sortByScoreBuilding"><i class="fa fa-home"></i></th>';
            html += '<th class="sortable" data-sort="player.score_science" title="Forschungspunkte" data-direction="DESC" style="text-align: center; color: ' + getRgb(cPink) + '" id="sortByScoreScience"><i class="fa fa-flask"></i></th>';
            html += '<th class="sortable" data-sort="player.score_military" title="Militaerpunkte" data-direction="DESC" style="text-align: center; color:' + getRgb(cRed) + '" id="sortByScoreMilitary"><i class="fa fa-fighter-jet"></i></th>';
            html += '<th class="sortable" data-sort="player.score_defense" title="Verteidigungspunkte" data-direction="DESC" style="text-align: center; color: ' + getRgb(cYellow) + '" id="sortByScoreDefense"><i class="fa fa-shield"></i></th>';
            html += '<th class="sortable" data-sort="last_battle_report_hours" title="Letzter Angriff" data-direction="ASC" style="text-align: right;">Attack <i class="fa fa-crosshairs"></i></th>';
            html += '<th class="sortable" data-sort="last_spy_report_hours" title="Letze Spionage" data-direction="DESC" style="text-align: right;">Spy <i class="fa fa-user-secret"></i></th>';
            html += '<th style="text-align: center;">Actions</th>';
            html += '<th class="sortable" data-sort="last_spy_metal" data-direction="DESC" title="Metall (Letzte Spionage)" style="text-align: right;" id="sortBySpioMet">MET</th>';
            html += '<th class="sortable" data-sort="last_spy_crystal" data-direction="DESC" title="Kristall (Letzte Spionage)" style="text-align: right;" id="sortBySpioCry">CRY</th>';
            html += '<th class="sortable" data-sort="last_spy_deuterium" data-direction="DESC" title="Deuterium (Letzte Spionage)" style="text-align: right;" id="sortBySpioDeu">DEU</th></tr>';

            if (response.player !== null) {
                ownPlayer = response.player;
            }

            let counter = 0;
            $(response.players).each(function (key, obj) {
                if(filterTableRow(obj, response.player)) {
                    counter++;
                    html += '<tr id="row' + obj.id + '">';
                    html += '<td>' + counter + '</td>';
                    html += '<td style="text-align: left; max-width: 50px"><div style="max-width: 50px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + (obj.alliance_name || '---') + '</div></td>';;
                    html += '<td style="text-align: left; max-width: 100px"><div style="max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">';

                    if (obj.inactive_since !== null && obj.inactive_since < 48) {
                        html += '<span style="padding: 2px 5px; border-radius: 2px; background: ' + getRgb(cRed) + '; color: ' + getRgb(cWhite) + '; border-radius: 2px; margin-right: 5px; font-size: 10px;">' + obj.inactive_since + 'H</span>';
                    }

                    html += '<a href="/game.php?page=playerCard&id=' + obj.player.id + '">' + obj.player.name + '</a></div></td>';
                    html += '<td id="row' + obj.id + 'Galaxy">' + (obj.galaxy || '---') + '</td>';
                    html += '<td id="row' + obj.id + 'System"><a href="/game.php?page=galaxy&galaxy=' + (obj.galaxy || '') + '&system=' + (obj.system || '') + '">' + (obj.system || '---') + '</a></td>';
                    html += '<td id="row' + obj.id + 'Planet">' + (obj.planet || '---') + '</td>';
                    html += '<td id="row' + obj.id + 'Score">' + (obj.player.score || '') + '</td>';
                    html += '<td id="row' + obj.id + 'ScoreBuilding">' + (obj.player.score_building || '') + '</td>';
                    html += '<td id="row' + obj.id + 'ScoreScience">' + (obj.player.score_science || '') + '</td>';
                    html += '<td id="row' + obj.id + 'ScoreMilitary">' + (obj.player.score_military || '') + '</td>';
                    html += '<td id="row' + obj.id + 'ScoreDefense">' + (obj.player.score_defense || '') + '</td>';
                    html += '<td style="text-align: right">';

                    var fleetQueueItemsDisplayed = 0;
                    $.each($this.fleetQueue, function(i, fleetQueueItem) {
                        if(fleetQueueItem.to == obj.coordinates || fleetQueueItem.from == obj.coordinates) {
                            switch(fleetQueueItem.type) {
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
                    html +=' </td>';
                    html += '<td style="text-align: right; cursor: pointer" id="lastSpyReport' + obj.id + '">' + (obj.last_spy_report || '') + '</td>';
                    html += '<td>';

                    if (obj.external_id) {
                        html += '[<a class="spio-link" data-id="' + obj.external_id + '" style="cursor: pointer">S</a>]';
                    } else {
                        html += ' [<a style="color: #666" href="/game.php?page=fleetTable&galaxy=' + obj.galaxy + '&system=' + obj.system + '&planet=' + obj.planet + '&planettype=1&target_mission=6" style="cursor: pointer">S</a>]';
                    }

                    html += ' [<a  href="/game.php?page=fleetTable&galaxy=' + obj.galaxy + '&system=' + obj.system + '&planet=' + obj.planet + '&planettype=1&target_mission=1" style="cursor: pointer">A</a>]';

                    html += '</td>';
                    html += '<td style="text-align: right;">' + (obj.last_spy_metal || '') + '</td>';
                    html += '<td style="text-align: right;">' + (obj.last_spy_crystal || '') + '</td>';
                    var ressSum = Math.ceil(getInt(obj.last_spy_metal) / 2 + getInt(obj.last_spy_crystal) / 2 + getInt(obj.last_spy_deuterium) / 2);
                    html += '<td style="text-align: right;" title="' + Math.ceil(ressSum / 5000) + ' KT, ' + ressSum + ' raidable">' + (obj.last_spy_deuterium || '') + '</td>';
                    html += '</tr>';
                }
            });

            this.container.html(getOverviewHeader() + html + '</table>');
            this.bindFilters();
            this.applyRowStyles(response);
            this.bindHeadlineSort();
            this.bindSettingsLink();
            this.bindSpyLinks();
            this.checkUpdatableIds(response);
        }
    };

    window.parsePageStatistics = function () {
        var userIds = [];
        var inactiveIds = [];
        var vacationIds = [];

        $('.table519:nth-child(2) tr').each(function (key, obj) {
            if (key > 0) {
                var userId = parseInt($(obj).find('td:nth-child(2) a').attr('onclick').replace(/return Dialog\.Playercard\((.*)\, (.*)\);/, '$1'));
                userIds.push(userId);

                $(obj).attr('id', 'row' + userId);

                if ($(obj).find('td:nth-child(2) .galaxy-short-inactive').length > 0) {
                    inactiveIds.push(userId);
                }

                if ($(obj).find('td:nth-child(2) .galaxy-short-vacation').length > 0) {
                    vacationIds.push(userId);
                }
            } else {
                $(obj).append('<th>Koords</th>');
                $(obj).append('<th>B</th>');
                $(obj).append('<th>S</th>');
                $(obj).append('<th>M</th>');
                $(obj).append('<th>D</th>');
            }
        });

        postJSON('players/stats', {
            ids: userIds,
            inactive_ids: inactiveIds,
            vacation_ids: vacationIds,
            order_by: GM_getValue('orderBy')
        }, function (response) {
            response = JSON.parse(response.responseText);

            $(response.players).each(function (key, obj) {
                var selector = $('#row' + obj.id);
                selector.append('<td id="row' + obj.id + 'Coordinates">' + (obj.main_coordinates || '---') + '</td>');
                selector.append('<td id="row' + obj.id + 'ScoreBuilding">' + (obj.score_building || '') + '</td>');
                selector.append('<td id="row' + obj.id + 'ScoreScience">' + (obj.score_science || '') + '</td>');
                selector.append('<td id="row' + obj.id + 'ScoreMilitary">' + (obj.score_military || '') + '</td>');
                selector.append('<td id="row' + obj.id + 'ScoreDefense">' + (obj.score_defense || '') + '</td>');

                selector.css(getPlayerRowStyle(obj));
                $('#row' + obj.id + ' td:nth-child(5)').css(getPlayerScoreStyle(obj, response.player));
                $('#row' + obj.id + 'ScoreBuilding').css(getPlayerScoreBuildingStyle(obj, response.player));
                $('#row' + obj.id + 'ScoreScience').css(getPlayerScoreScienceStyle(obj, response.player));
                $('#row' + obj.id + 'ScoreMilitary').css(getPlayerScoreMilitaryStyle(obj, response.player));
                $('#row' + obj.id + 'ScoreDefense').css(getPlayerScoreDefenseStyle(obj, response.player));
            });

            if (response.missing_ids.length > 0 && ownGalaxy == 3 && ownSystem == 227) {
                $('content').prepend('<button id="fetchMissingIdsBtn">Fetch ' + response.missing_ids.length + ' missing IDs</button>');
                $('#fetchMissingIdsBtn').click(function () {
                    playerUpdateQueue = response.missing_ids;

                    $('#fetchMissingIdsBtn').remove();
                    processQueue();
                });
            }

            if (response.outdated_ids.length > 0 && ownGalaxy == 3 && ownSystem == 227) {
                $('content').prepend('<button id="fetchUpdatableIdsBtn">Fetch ' + response.outdated_ids.length + ' outdated IDs</button>');
                $('#fetchUpdatableIdsBtn').click(function () {
                    playerUpdateQueue = response.outdated_ids;

                    $('#fetchMissingIdsBtn').remove();
                    processQueue();
                });
            }
        });
    };
    window.parsePageMessages = function () {
        var messages = $($('#messagestable > tbody > tr').get().reverse());
        messages.each(function (key, obj) {
            // spy report
            if ($(obj).find('.spyRaport').length > 0) {
                var dateTime = $(messages[key - 1]).find('td:nth-child(2)').html();

                var headerText = $(obj).find('.spyRaportHead a').html();
                var parseResult = headerText.match(/Spionagebericht von (.*) \[([0-9]+)\:([0-9]+)\:([0-9]+)\] am (.*)/, headerText);
                var galaxy = parseResult[2];
                var system = parseResult[3];
                var planet = parseResult[4];
                var timestamp = parseResult[5];
                var coords = galaxy + ':' + system + ':' + planet;

                var labels = $(obj).find('.spyRaportContainerRow .spyRaportContainerCell:nth-child(2n+1)');
                var values = $(obj).find('.spyRaportContainerRow .spyRaportContainerCell:nth-child(2n)');
                var resources = {};

                labels.each(function (labelKey, label) {
                    resources[($(label).find('a').attr('onclick') || '').match(/\(([0-9]+)\)/)[1]] = getInt($(values[labelKey]).html());
                });

                postJSON('spy-reports', {
                    id: parseInt($(obj).attr('class').match(/message\_([0-9]+)/)[1]),
                    galaxy: parseInt(parseResult[2]),
                    system: parseInt(parseResult[3]),
                    planet: parseInt(parseResult[4]),
                    timestamp: parseResult[5],
                    resources: resources
                }, function (response) {
                });
            }

            if ($(obj).find('.raportMessage').length > 0) {
                var html = $(obj).html();
                var parseResult = getCoordinates($(obj).find('.raportMessage').html());
                console.log(html);

                postJSON('battle-reports', {
                    report_id: html.match(/(raport|report)\=([^"]{32})/)[2],
                    galaxy: parseInt(parseResult[1]),
                    system: parseInt(parseResult[2]),
                    planet: parseInt(parseResult[3]),
                    attacker_lost: getInt(html.match(/Angreifer\: ([\.0-9]+)\</)[1]),
                    defender_lost: getInt(html.match(/Verteidiger\: ([\.0-9]+)\</)[1]),
                    metal: getInt(html.match(/(reportSteal|raportSteal) element901\"\>([\.0-9]+)\</)[2]),
                    crystal: getInt(html.match(/(reportSteal|raportSteal) element902\"\>([\.0-9]+)\</)[2]),
                    deuterium: getInt(html.match(/(reportSteal|raportSteal) element903\"\>([\.0-9]+)\</)[2]),
                    debris_metal: getInt(html.match(/(reportDebris|raportDebris) element901\"\>([\.0-9]+)\</)[2]),
                    debris_crystal: getInt(html.match(/(reportDebris|raportDebris) element902\"\>([\.0-9]+)\</)[2]),
                    timestamp: $(messages[key + 1]).find('td:nth-child(2)').html()
                }, function (response) {
                });
            }
        });
    }
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
    window.parsePagePlayerCard = function () {
        var allianceId = ($('#content tr:nth-child(4) a').attr('onclick') || '').match(/\&id\=([0-9]+)/);
        var playerId = window.location.href.match(/[\?\&]id=([(0-9]+)/i)[1];

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
    }

    window.parsePageAlliance = function () {
        var allianceId = window.location.href.match(/[\?\&]id=([(0-9]+)/i)[1];
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

    window.getRgb = function(color) {
        return 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
    }

    window.getPlayerRowStyle = function (obj, ownScore) {
        if (obj.on_vacation === 1) {
            return {background: getRgb(cBlue)};
        } else if (ownPlayer !== null && (ownPlayer.alliance_id !== null && ownPlayer.alliance_id === obj.alliance_id)) {
            return {background: getRgb(cGreen)};
        } else if (obj.is_inactive === 1) {
            return {background: getRgb(cCyan)};
        } else if (getInt(obj.score) < ownScore / 5) {
            return {background: getRgb(cGray)};
        } else if (getInt(obj.score) > ownScore * 5) {
            return {background: getRgb(cRed)};
        }

        return {};
    }
    window.getPlayerRowTdStyle = function (obj, ownScore) {
        if (obj.on_vacation === 1) {
            return {color: getRgb(cBlue)};
        } else if (ownPlayer !== null && (ownPlayer.alliance_id !== null && ownPlayer.alliance_id === obj.alliance_id)) {
            return {color: getRgb(cGreen)};
        } else if (obj.is_inactive === 1) {
            return {color: getRgb(cCyan)};
        } else if (getInt(obj.score) < getInt(ownScore) / 5) {
            return {color: getRgb(cGray)};
        } else if (getInt(obj.score) > getInt(ownScore) * 5) {
            return {color: getRgb(cRed)};
        }

        return {};
    }
    window.getColorIntensity = function (value, threshold) {
        var intensity = value / threshold * 255;
        return intensity > 255 ? 255 : intensity;
    }
    window.getColor = function pickHex(color1, weight) {
        var color = [255, 255, 255];
        var w1 = weight;
        w1 = w1 < 0 ? 0 : w1;
        w1 = w1 > 1 ? 1 : w1;
        var w2 = 1 - w1;
        w2 = w2 > 1 ? 1 : w2;
        w2 = w2 < 0 ? 0 : w2;
        var rgb = [Math.round(color1[0] * w1 + color[0] * w2),
            Math.round(color1[1] * w1 + color[1] * w2),
            Math.round(color1[2] * w1 + color[2] * w2)];
        return 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';
    };
    window.getPlayerAttributeStyle = function(obj, player, alias, color) {
        let referenceValue = 1;

        if(cfgHighlight[alias] && cfgHighlight[alias].enabled) {
            referenceValue = cfgHighlight[alias].threshold;
        }
        else {
            if(player && player[alias]) {
                referenceValue = getInt(player[alias]);
            }
        }

        return {color: getColor(color, getInt(obj[alias]) / referenceValue)};
    };

    window.getPlayerScoreStyle = function (obj, player) {
        return getPlayerAttributeStyle(obj, player, 'score', cBlue);
    }
    window.getPlayerScoreBuildingStyle = function (obj, player) {
        return getPlayerAttributeStyle(obj, player, 'score_building', cGreen);
    }
    window.getPlayerScoreScienceStyle = function (obj, player) {
        return getPlayerAttributeStyle(obj, player, 'score_science', cPink);
    }
    window.getPlayerScoreMilitaryStyle = function (obj, player) {
        return getPlayerAttributeStyle(obj, player, 'score_military', cRed);
    }
    window.getPlayerScoreDefenseStyle = function (obj, player) {
        return getPlayerAttributeStyle(obj, player, 'score_defense', cYellow);
    }

    window.getProgressBar = function () {
        const progressBar = $('#progress-bar');

        if (progressBar.length === 1) {
            return progressBar;
        }

        $('body').prepend('<div style="padding: 10px 15px; background: ' + getRgb(cBlue) + '; color: ' + getRgb(cWhite) + '; z-index: 10000; position: fixed; top: 0; left: 0; right: 0;" id="progress-bar"></div>');
        return $('#progress-bar');
    };
    window.processQueue = function () {
        if (playerUpdateQueue.length > 0) {
            getProgressBar().html('Updating ' + playerUpdateQueue.length + ' items ...');
            var id = playerUpdateQueue.shift();
            $('content').append('<iframe class="player-iframe" id="iframe' + id + '" width="1" height="1" src="/game.php?page=playerCard&id=' + id + '"></iframe>');
            $('#iframe' + id).on('load', processQueue);
            $('#iframe' + id).animate({left: 0 }, 1000, function() {
                $(this).remove();
            });
        } else {
            getProgressBar().html('Save & reload');
            $('body').animate({opacity: 0}, 1000, function () {
                window.location.reload();
            });
        }
    };

    window.showMessage = function(message, level) {
        let background;
        let color;

        switch(level)
        {
            case 'danger':
                background = '#161618';
                color = '#d23c22';
                break;

            default:
                background = '#161618';
                color = '#5cb85c';
                break;
        }

        $('#alertBox').remove();
        $('body').prepend('<div id="alertBox" style="padding: 25px 15px; background: ' + background + '; color: ' + color + '; z-index: 10000; position: fixed; top: 0; left: 0; right: 0; opacity: 0; text-align: center; font-weight: bold;">' + message + '</div>');
        $('#alertBox').animate({ opacity: 1 }, 250).animate({ opacity: 1 }, 2500).animate({ opacity: 0 }, 500, function() { $(this).remove(); });
    }

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
    window.showSpyReportHistoryBox = function (spyReportHistory, offset) {
        var html = '<table width="100%" style="max-width: 100% !important" class="table519"><tr>';
        html += '<th style="text-align: left; width: 250px" width="200">Zeit</th>';

        $(spyReportHistory[offset].data[0].values).each(function (key, obj) {
            html += '<th style="text-align: center;">' + obj.name + '</th>';
        });

        html += '</tr>';

        $(spyReportHistory[offset].data).each(function (key, obj) {
            html += '<tr>';
            html += '<td style="text-align: left;">' + obj.timestamp + '</td>';

            $(obj.values).each(function (key, value) {
                value.value = value.value === null ? '---' : value.value;
                html += '<td style="position: relative; ' + (value.value.toString() !== '0' && value.value.toString() !== '---' ? 'color: #fff' : 'color: #444') + '">';
                html += value.value;

                if (value.difference === null || value.difference === 0 || value.valueBefore === value.value) {
                    // nothing to show
                } else if (value.valueBefore && value.valueBefore > value.value) {
                    html += ' <span style="color: ' + getRgb(cRed) + '; position: absolute; right: 15px">' + value.difference + '</span>';
                } else {
                    html += ' <span style="color: ' + getRgb(cGreen) + '; position: absolute; right: 15px">+' + value.difference + '</span>';
                }

                html += '</td>';
            });

            html += '</tr>';
        });

        html += '</table>';

        return html;
    };
    window.getInt = function (intOrString) {
        return parseInt((intOrString !== null && intOrString !== undefined && intOrString !== ''? intOrString : '0').toString().replace(/\./, ''));
    }

    let cfgHighlight = {};

    let filterInactive = GM_getValue('filter_inactive') || 'ALL';
    let filterNoobs = GM_getValue('filter_noobs') || 'ALL';
    let filterVacation = GM_getValue('filter_vacation') || 'ALL';
    let filterAlliance = GM_getValue('filter_alliance') || 'ALL';
    let filterSpyReport = GM_getValue('filter_spy_report') || 'ALL';
    let filterBattleReport = GM_getValue('filter_last_battle_report') || 'ALL';
    let filterScoreEnabled = GM_getValue('filter_score_enable') || '0';
    let filterScoreMin = GM_getValue('filter_score_min') || '';
    let filterScoreMax = GM_getValue('filter_score_max') || '';
    let filterScoreBuildingEnabled = GM_getValue('filter_score_building_enable') || '0';
    let filterScoreBuildingMin = GM_getValue('filter_score_building_min') || '';
    let filterScoreBuildingMax = GM_getValue('filter_score_building_max') || '';
    let filterScoreScienceEnabled = GM_getValue('filter_score_science_enable') || '0';
    let filterScoreScienceMin = GM_getValue('filter_score_science_min') || '';
    let filterScoreScienceMax = GM_getValue('filter_score_science_max') || '';
    let filterScoreFleetEnabled = GM_getValue('filter_score_fleet_enable') || '0';
    let filterScoreFleetMin = GM_getValue('filter_score_fleet_min') || '';
    let filterScoreFleetMax = GM_getValue('filter_score_fleet_max') || '';
    let filterScoreDefenseEnabled = GM_getValue('filter_score_defense_enable') || '0';
    let filterScoreDefenseMin = GM_getValue('filter_score_defense_min') || '';
    let filterScoreDefenseMax = GM_getValue('filter_score_defense_max') || '';
    let filterInactiveSinceEnabled = GM_getValue('filter_inactive_since_enable') || '0';
    let filterInactiveSinceMin = GM_getValue('filter_inactive_since_min') || '';
    let filterInactiveSinceMax = GM_getValue('filter_inactive_since_max') || '';
    let filterLastBattleReportEnabled = GM_getValue('filter_last_battle_report_enable') || '0';
    let filterLastBattleReportMin = GM_getValue('filter_last_battle_report_min') || '';
    let filterLastBattleReportMax = GM_getValue('filter_last_battle_report_max') || '';
    let filterLastSpyReportEnabled = GM_getValue('filter_last_spy_report_enable') || '0';
    let filterLastSpyReportMin = GM_getValue('filter_last_spy_report_min') || '';
    let filterLastSpyReportMax = GM_getValue('filter_last_spy_report_max') || '';
    let filterMetalEnabled = GM_getValue('filter_metal_enable') || '0';
    let filterMetalMin = GM_getValue('filter_metal_min') || '';
    let filterMetalMax = GM_getValue('filter_metal_max') || '';
    let filterCrystalEnabled = GM_getValue('filter_crystal_enable') || '0';
    let filterCrystalMin = GM_getValue('filter_crystal_min') || '';
    let filterCrystalMax = GM_getValue('filter_crystal_max') || '';
    let filterDeuteriumEnabled = GM_getValue('filter_deuterium_enable') || '0';
    let filterDeuteriumMin = GM_getValue('filter_deuterium_min') || '';
    let filterDeuteriumMax = GM_getValue('filter_deuterium_max') || '';

    window.updateConfigVars = function() {
        cfgHighlight = {
            score: {
                enabled: (GM_getValue('highlight_score_enable') || '0') === '1',
                threshold: getInt(GM_getValue('highlight_score_value') || '')
            },
            score_building: {
                enabled: (GM_getValue('highlight_score_building_enable') || '0') === '1',
                threshold: getInt(GM_getValue('highlight_score_building_value') || '')
            },
            score_science: {
                enabled: (GM_getValue('highlight_score_science_enable') || '0') === '1',
                threshold: getInt(GM_getValue('highlight_score_science_value') || '')
            },
            score_military: {
                enabled: (GM_getValue('highlight_score_military_enable') || '0') === '1',
                threshold: getInt(GM_getValue('highlight_score_military_value') || '')
            },
            score_defense: {
                enabled: (GM_getValue('highlight_score_defense_enable') || '0') === '1',
                threshold: getInt(GM_getValue('highlight_score_defense_value') || '')
            }
        };

        filterInactive = GM_getValue('filter_inactive') || 'ALL';
        filterNoobs = GM_getValue('filter_noobs') || 'ALL';
        filterVacation = GM_getValue('filter_vacation') || 'ALL';
        filterAlliance = GM_getValue('filter_alliance') || 'ALL';
        filterSpyReport = GM_getValue('filter_spy_report') || 'ALL';
        filterBattleReport = GM_getValue('filter_last_battle_report') || 'ALL';
        filterScoreEnabled = GM_getValue('filter_score_enable') || '0';
        filterScoreMin = GM_getValue('filter_score_min') || '';
        filterScoreMax = GM_getValue('filter_score_max') || '';
        filterScoreBuildingEnabled = GM_getValue('filter_score_building_enable') || '0';
        filterScoreBuildingMin = GM_getValue('filter_score_building_min') || '';
        filterScoreBuildingMax = GM_getValue('filter_score_building_max') || '';
        filterScoreScienceEnabled = GM_getValue('filter_score_science_enable') || '0';
        filterScoreScienceMin = GM_getValue('filter_score_science_min') || '';
        filterScoreScienceMax = GM_getValue('filter_score_science_max') || '';
        filterScoreFleetEnabled = GM_getValue('filter_score_fleet_enable') || '0';
        filterScoreFleetMin = GM_getValue('filter_score_fleet_min') || '';
        filterScoreFleetMax = GM_getValue('filter_score_fleet_max') || '';
        filterScoreDefenseEnabled = GM_getValue('filter_score_defense_enable') || '0';
        filterScoreDefenseMin = GM_getValue('filter_score_defense_min') || '';
        filterScoreDefenseMax = GM_getValue('filter_score_defense_max') || '';
        filterInactiveSinceEnabled = GM_getValue('filter_inactive_since_enable') || '0';
        filterInactiveSinceMin = GM_getValue('filter_inactive_since_min') || '';
        filterInactiveSinceMax = GM_getValue('filter_inactive_since_max') || '';
        filterLastBattleReportEnabled = GM_getValue('filter_last_battle_report_enable') || '0';
        filterLastBattleReportMin = GM_getValue('filter_last_battle_report_min') || '';
        filterLastBattleReportMax = GM_getValue('filter_last_battle_report_max') || '';
        filterLastSpyReportEnabled = GM_getValue('filter_last_spy_report_enable') || '0';
        filterLastSpyReportMin = GM_getValue('filter_last_spy_report_min') || '';
        filterLastSpyReportMax = GM_getValue('filter_last_spy_report_max') || '';
        filterMetalEnabled = GM_getValue('filter_metal_enable') || '0';
        filterMetalMin = GM_getValue('filter_metal_min') || '';
        filterMetalMax = GM_getValue('filter_metal_max') || '';
        filterCrystalEnabled = GM_getValue('filter_crystal_enable') || '0';
        filterCrystalMin = GM_getValue('filter_crystal_min') || '';
        filterCrystalMax = GM_getValue('filter_crystal_max') || '';
        filterDeuteriumEnabled = GM_getValue('filter_deuterium_enable') || '0';
        filterDeuteriumMin = GM_getValue('filter_deuterium_min') || '';
        filterDeuteriumMax = GM_getValue('filter_deuterium_max') || '';
    }

    window.getOverviewHeader = function() {
        let header = '<table cellspacing="0"><tr><td width="50%%" style="text-align: left; padding: 5px 10px">';
        header += '<a href="https://pr0game-hub.eskju.net/download/legend.png" target="_blank"><i class="fa fa-info-circle"></i> Legende</a>';
        header += ' // ';
        header += '<a href="https://pr0game-hub.eskju.net/download/faq.txt" target="_blank"><i class="fa fa-question-circle"></i> FAQ</a>';
        header += '</td>';

        if(GM_getValue('hideSettings') === '1') {
            header += '<td id="showSettings" style="text-align: right; padding: 5px 10px; cursor: pointer;"><i class="fa fa-cogs fa"></i> Einstellungen anzeigen</td>';
        }
        else {
            header += '<td id="hideSettings" style="text-align: right; padding: 5px 10px; cursor: pointer;"><span style="color: lightgreen"><i class="fa fa-cogs"></i> Einstellungen ausblenden</span></td>';
        }

        header += '</tr></table>';

        header += displayOverviewSettings();

        return header;
    }

    var setupMessage = '';
    window.checkRequirements = function() {
        if(!GM_getValue('api_keys')) {
            setupMessage = 'Bitte hinterlege den API Key, den du von @eichhorn#1526 erhalten hast.';
            return false;
        }

        return true;
    };

    window.showSetupDialog = function() {
        $('head').append('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">');
        $('.wrapper').css('filter', 'blur(5px)');
        $('body').append('<div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.95); z-index: 10000"></div>');
        $('body').append('<div id="configOverlay" style="position: fixed; top: 25px; left: 25px; right: 25px; max-height: 95%; z-index: 10000; background: #161618; overflow-y: auto; padding: 25px 50px;"></div>');
        const overlay = $('#configOverlay');
        $(overlay).append('<p><b style="color: #fff">Willkommen bei pr0gameHub!</b></p>');
        $(overlay).append('<p style="color: rgb(0, 255, 255)">Für bisherige User: Damit das Updaten leichter wird, kann der API Key nun im lokalen Speicher hinterlegt werden. So muss die Updatedatei nicht mehr editiert werden.</p><br><br>');
        $(overlay).append('<div class="alert alert-info">' + setupMessage + '</div>');
        $(overlay).append('<div class="input-group"><input id="apiKey" type="text" placeholder="Dein API Key" class="form-control" style="text-align: left"><div id="apiKeySave" class="input-group-append"><a class="btn btn-success" href="javascript:void(0)">prüfen &amp; speichern</a></div></div>');
        $('#apiKeySave').click(saveApiKey);
        $('#apiKeySave').on('keypress',function(e) {
            if(e.which == 13) {
                saveApiKey();
            }
        });
    };

    window.saveApiKey = function(apiKey) {
        var url = apiUrl + 'login?api_key=' + $('#apiKey').val() + '&version=' + version;

        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function (response) {
                if(response.status !== 200) {
                    setupMessage = 'Der API Key ist ungültig.';
                    showSetupDialog();
                }
            }
        });

        GM_setValue('api_key', $('#apiKey').val());
    };

    window.displayOverviewSettings = function() {
        let html = '';
        html += '<table id="phSettings" width="100%" style="max-width: 100% !important; ' + (GM_getValue('hideSettings') === '1' ? 'display: none' : '') + '" class="table519">';
        html += '<tr><th colspan="4">API</th></tr>';
        html += '<tr><td colspan="4"><p style="font-size: 11px; text-align: left;">Solltest Du keinen API Key besitzen, wende Dich bitte per Discord an @eichhorn#1526.<br><b style="color: ' + getRgb(cRed) + '">Gib Deinen API Key nicht an andere weiter!</b></p></td></tr>';
        html += '<tr>';
        html += '<td width="50%" style="text-align: left">API Key</td>';
        html += '<td colspan="3"><input class="phFilter" data-alias="api_key" type="text" style="width: 100%" placeholder="API Key" value="' + (GM_getValue('api_key') || '') + '"></td>';
        html + '</tr>';
        html += '<tr>';
        html += '<td width="50%" style="text-align: left">Debug-Modus</td>';
        html += '<td><input type="checkbox" class="phFilter" data-alias="debug_mode" value="1" ' + (GM_getValue('debug_mode') === '1' ? 'checked' : '') + '></td><td colspan="2" style="text-align: left; color: #888">Zeige Infos in der Konsole</td>';
        html + '</tr>';
        html += '<tr>';
        html += '<td width="50%" style="text-align: left">Developer-Modus</td>';
        html += '<td><input type="checkbox" class="phFilter" data-alias="developer_mode" value="1" ' + (GM_getValue('developer_mode') === '1' ? 'checked' : '') + '></td><td colspan="2" style="text-align: left; color: #888">Nutzt die Entwickler-API (nur zum Coden!)</td>';
        html + '</tr>';

        html += '<tr><th colspan="4">HIGHLIGHTING</th></tr>';
        html += '<tr><td colspan="4"><p style="font-size: 11px; text-align: left;">Standardmäßig werden die Spielerwerte als Referenz genommen; Für Galaxie/System/Planet wird standardmäßig der aktive Planet gesetzt. Ist die Checkbox angehakt, wird der jeweilige Wert vom Eingetragenen überschrieben. Die Spieler-Werte werden in der Farbskala weiß (0 Punkte) bis Farbe (gesetztes Punktelimit) dargestellt.</p></td></tr>';
        html += displayOverviewHighlight('Gesamtpunkte', 'highlight_score', cBlue);
        html += displayOverviewHighlight('Gebäudepunkte', 'highlight_score_building', cGreen);
        html += displayOverviewHighlight('Forschungspunkte', 'highlight_score_science', cPink);
        html += displayOverviewHighlight('Militärpunkte', 'highlight_score_military', cRed);
        html += displayOverviewHighlight('Verteidigungspunkte', 'highlight_score_defense', cYellow);

        html += '<tr><th colspan="4">FILTER</th></tr>';
        html += displayOverviewSettingsSelect(getHotkeyIcon('I') + 'Inaktive Spieler', 'filter_inactive', {ALL: 'Anzeigen', HIDE: 'Ausblenden', ONLY: 'Andere ausblenden'});
        html += displayOverviewSettingsSelect(getHotkeyIcon('N') + 'Spieler mit Noobschutz', 'filter_noobs', {ALL: 'Anzeigen', HIDE: 'Ausblenden', ONLY: 'Andere ausblenden'});
        html += displayOverviewSettingsSelect(getHotkeyIcon('U') + 'Spieler im Urlaubsmodus', 'filter_vacation', {ALL: 'Anzeigen', HIDE: 'Ausblenden', ONLY: 'Andere ausblenden'});
        html += displayOverviewSettingsSelect(getHotkeyIcon('A') + 'Spieler der Allianz', 'filter_alliance', {ALL: 'Anzeigen', HIDE: 'Ausblenden', ONLY: 'Andere ausblenden'});
        html += displayOverviewSettingsSelect(getHotkeyIcon('S') + 'Spieler mit Spiobericht', 'filter_spy_report', {ALL: 'Anzeigen', HIDE: 'Ausblenden', ONLY: 'Andere ausblenden'});
        html += displayOverviewSettingsSelect(getHotkeyIcon('K') + 'Spieler mit Kampfbericht', 'filter_battle_report', {ALL: 'Anzeigen', HIDE: 'Ausblenden', ONLY: 'Andere ausblenden'});
        html += '<tr><th colspan="4">THRESHOLDS</th></tr>';
        html += displayOverviewSettingsRange(getHotkeyIcon('P', true) + 'Punkte', 'filter_score');
        html += displayOverviewSettingsRange(getHotkeyIcon('G', true) + 'Gebäudepunkte', 'filter_score_building');
        html += displayOverviewSettingsRange(getHotkeyIcon('F', true) + 'Forschungspunkte', 'filter_score_science');
        html += displayOverviewSettingsRange(getHotkeyIcon('M', true) + 'Militärpunkte', 'filter_score_fleet');
        html += displayOverviewSettingsRange(getHotkeyIcon('V', true) + 'Verteidigungspunkte', 'filter_score_defense');
        html += displayOverviewSettingsRange(getHotkeyIcon('I', true) + 'Inaktiv seit ... Stunden', 'filter_inactive_since');
        html += displayOverviewSettingsRange(getHotkeyIcon('K', true) + 'Stunden seit letztem Kampfbericht', 'filter_last_battle_report');
        html += displayOverviewSettingsRange(getHotkeyIcon('S', true) + 'Stunden seit letztem Spionagebericht', 'filter_last_spy_report');
        html += displayOverviewSettingsRange(getHotkeyIcon('Q', true) + 'Metall (letzte Spionage)', 'filter_metal');
        html += displayOverviewSettingsRange(getHotkeyIcon('W', true) + 'Kristall (letzte Spionage)', 'filter_crystal');
        html += displayOverviewSettingsRange(getHotkeyIcon('E', true) + 'Deuterium (letzte Spionage)', 'filter_deuterium');
        html += '</table>';

        return html;
    }

    window.getHotkeyIcon = function(key, shift = false) {
        let html = '';

        if(shift) {
            html = getHotkeyIcon('<i class="fa fa-arrow-up"></i>');
        }

        return html + '<span style="width: 21px; outline: 1px solid ' + getRgb(cRed) + '; outline-offset: -1px; display: inline-block; font-size: 10px; line-height: 21px; text-align: center; margin-right: 5px; border-radius: 2px; background: ' + getRgb(cBlack) + '; color: ' + getRgb(cRed) + '">' + key + '</span>';
    };

    window.displayOverviewHighlight = function(label, alias, color) {
        let html = '<tr>';
        html += '<td width="50%" style="text-align: left; color: ' + getRgb(color) + '">' + label + '</td>';
        html += '<td width="4%">';
        html += '<input id="' + alias + '" class="phFilter" data-alias="' + alias + '_enable" value="1" type="checkbox" ' + (GM_getValue(alias + '_enable') === '1' ? 'checked' : '') + '>';
        html += '</td>';
        html += '<td width="46%" colspan="2">';
        html += '<input id="' + alias + '_value" class="phFilter" data-alias="' + alias + '_value" style="width: 100%" placeholder="Schwellwert" value="' + (GM_getValue(alias + '_value') || '') + '">';
        html += '</td>';
        html += '</tr>';

        return html;
    }

    window.displayOverviewSettingsSelect = function(label, alias, values) {
        let html = '<tr>';
        html += '<td width="50%" style="text-align: left">' + label + '</td>';
        html += '<td colspan="3">';
        html += '<select id="' + alias + '_select" class="phFilter" data-alias="' + alias + '" style="width: 100%">';

        $.each(values, function(key, obj) {
            html += '<option value="' + key + '" ' + (GM_getValue(alias) === key ? 'selected' : '') + '>' + obj + '</option>';
        });

        html += '</select>';
        html += '</td>';
        html + '</tr>';

        return html;
    };

    window.displayOverviewSettingsRange = function(label, alias) {
        let html = '<tr>';
        html += '<td width="50%" style="text-align: left">' + label + '</td>';
        html += '<td width="4%">';
        html += '<input id="' + alias + '_enable" class="phFilter" data-alias="' + alias + '_enable" value="1" type="checkbox" ' + (GM_getValue(alias + '_enable') === '1' ? 'checked' : '') + '>';
        html += '</td>';
        html += '<td width="23%">';
        html += '<input id="' + alias + '_min" class="phFilter" data-alias="' + alias + '_min" style="width: 100%" placeholder="min" value="' + (GM_getValue(alias + '_min') || '') + '">';
        html += '</td>';
        html += '<td width="23%">';
        html += '<input id="' + alias + '_max" class="phFilter" data-alias="' + alias + '_max" style="width: 100%" placeholder="max" value="' + (GM_getValue(alias + '_max') || '') + '">';
        html += '</td>';
        html + '</tr>';

        return html;
    };

    window.filterTableRow = function(obj, player) {
        // selects
        if(filterInactive === 'HIDE' && obj.player.is_inactive === 1) return false;
        if(filterInactive === 'ONLY' && obj.player.is_inactive === 0) return false;

        if(player !== null) {
            if(filterNoobs === 'HIDE' && obj.player.is_inactive === 0 && getInt(obj.player.score) < getInt(player.score) / 5) return false;
            if(filterNoobs === 'ONLY' && obj.player.is_inactive === 0 && getInt(obj.player.score) >= getInt(player.score) / 5) return false;
        }
        if(filterVacation === 'HIDE' && obj.player.on_vacation === 1) return false;
        if(filterVacation === 'ONLY' && obj.player.on_vacation === 0) return false;

        if(player) {
            if(filterAlliance === 'HIDE' && obj.player.alliance_id !== null && obj.player.alliance_id === player.alliance_id) return false;
            if(filterAlliance === 'ONLY' && (obj.player.alliance_id === null || obj.player.alliance_id !== player.alliance_id)) return false;
        }
        if(filterSpyReport === 'HIDE' && obj.last_spy_report !== '') return false;
        if(filterSpyReport === 'ONLY' && obj.last_spy_report === '') return false;
        if(filterBattleReport === 'HIDE' && obj.last_battle_report !== '') return false;
        if(filterBattleReport === 'ONLY' && obj.last_battle_report === '') return false;
        if(filterScoreEnabled === '1' && getInt(filterScoreMin) > 0 && getInt(filterScoreMin) > getInt(obj.player.score)) return false;
        if(filterScoreEnabled === '1' && getInt(filterScoreMax) > 0 && getInt(filterScoreMax) < getInt(obj.player.score)) return false;
        if(filterScoreBuildingEnabled === '1' && getInt(filterScoreBuildingMin) > 0 && getInt(filterScoreBuildingMin) > getInt(obj.player.score_building)) return false;
        if(filterScoreBuildingEnabled === '1' && getInt(filterScoreBuildingMax) > 0 && getInt(filterScoreBuildingMax) < getInt(obj.player.score_building)) return false;
        if(filterScoreScienceEnabled === '1' && getInt(filterScoreScienceMin) > 0 && getInt(filterScoreScienceMin) > getInt(obj.player.score_science)) return false;
        if(filterScoreScienceEnabled === '1' && getInt(filterScoreScienceMax) > 0 && getInt(filterScoreScienceMax) < getInt(obj.player.score_science)) return false;
        if(filterScoreFleetEnabled === '1' && getInt(filterScoreFleetMin) > 0 && getInt(filterScoreFleetMin) > getInt(obj.player.score_military)) return false;
        if(filterScoreFleetEnabled === '1' && getInt(filterScoreFleetMax) > 0 && getInt(filterScoreFleetMax) < getInt(obj.player.score_military)) return false;
        if(filterScoreDefenseEnabled === '1' && getInt(filterScoreDefenseMin) > 0 && getInt(filterScoreDefenseMin) > getInt(obj.player.score_defense)) return false;
        if(filterScoreDefenseEnabled === '1' && getInt(filterScoreDefenseMax) > 0 && getInt(filterScoreDefenseMax) < getInt(obj.player.score_defense)) return false;
        if(filterInactiveSinceEnabled === '1' && getInt(filterInactiveSinceMin) > 0 && getInt(filterInactiveSinceMin) > getInt(obj.inactive_since)) return false;
        if(filterInactiveSinceEnabled === '1' && getInt(filterInactiveSinceMax) > 0 && getInt(filterInactiveSinceMax) < getInt(obj.inactive_since)) return false;
        if(filterLastBattleReportEnabled === '1' && getInt(filterLastBattleReportMin) > 0 && getInt(filterLastBattleReportMin) > getInt(obj.last_battle_report_hours)) return false;
        if(filterLastBattleReportEnabled === '1' && getInt(filterLastBattleReportMax) > 0 && getInt(filterLastBattleReportMax) < getInt(obj.last_battle_report_hours)) return false;
        if(filterLastSpyReportEnabled === '1' && getInt(filterLastSpyReportMin) > 0 && getInt(filterLastSpyReportMin) > getInt(obj.last_spy_report_hours)) return false;
        if(filterLastSpyReportEnabled === '1' && getInt(filterLastSpyReportMax) > 0 && getInt(filterLastSpyReportMax) < getInt(obj.last_spy_report_hours)) return false;
        if(filterMetalEnabled === '1' && getInt(filterMetalMin) > 0 && getInt(filterMetalMin) > getInt(obj.last_spy_metal)) return false;
        if(filterMetalEnabled === '1' && getInt(filterMetalMax) > 0 && getInt(filterMetalMax) < getInt(obj.last_spy_metal)) return false;
        if(filterCrystalEnabled === '1' && getInt(filterCrystalMin) > 0 && getInt(filterCrystalMin) > getInt(obj.last_spy_crystal)) return false;
        if(filterCrystalEnabled === '1' && getInt(filterCrystalMax) > 0 && getInt(filterCrystalMax) < getInt(obj.last_spy_crystal)) return false;
        if(filterDeuteriumEnabled === '1' && getInt(filterDeuteriumMin) > 0 && getInt(filterDeuteriumMin) > getInt(obj.last_spy_deuterium)) return false;
        if(filterDeuteriumEnabled === '1' && getInt(filterDeuteriumMax) > 0 && getInt(filterDeuteriumMax) < getInt(obj.last_spy_deuterium)) return false;

        return true;
    }

    window.savePhOption = function(key, value) {
        GM_setValue(key, value);
        overviewPage.renderHtml();
    };

    parseUrl();
})();

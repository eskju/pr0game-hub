// ==UserScript==
// @name         pr0game Hub (aka hornyHub)
// @namespace    http://tampermonkey.net/
// @version      0.2.8
// @description  alliance hub using cloud
// @author       esKju <info@sq-webdesign.de>
// @match        https://pr0game.com/game.php?page=statistics
// @match        https://www.pr0game.com/game.php?page=statistics
// @match        https://pr0game.com/game.php?page=playerCard&*
// @match        https://www.pr0game.com/game.php?page=playerCard&*
// @match        https://pr0game.com/game.php
// @match        https://www.pr0game.com/game.php
// @match        https://pr0game.com/game.php?page=overview
// @match        https://www.pr0game.com/game.php?page=overview
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

// == feature requests / ideas ==
// Hyman         click at a system should link to the galaxy view
// Klarname      add a simulator link to spy report history
// ???           exploration counter
// ???           exploration tracker/stats
// eichhorn      green background for ally members
// eichhorn      flying times in overview
// eichhorn      mileage in overview
// eichhorn      resource production in overview
// eichhorn      dynamic config (input form for thresholds)
// Hyman         crawl & show last attack
// Klarname      show last spy, last attack, etc. in galaxy view
// Redstar       filters for score (hide players below ... points)

(function () {
    'use strict';

    // API settings
    let apiUrl = 'https://pr0game-hub.esKju.net/';
    let apiKey = '';

    // display settings
    let scoreThreshold = GM_getValue('scoreThreshold') || 1000; // limit for maximum blue color highlighting (total score)
    let buildingThreshold = GM_getValue('buildingThreshold') || 500; // limit for maximum green color highlighting (building score)
    let scienceThreshold = GM_getValue('scienceThreshold') || 250; // limit for maximum yellow color highlighting (science score)
    let militaryThreshold = GM_getValue('militaryThreshold') || 250; // limit for maximum red color highlighting (fleet score)
    let defenseThreshold = GM_getValue('defenseThreshold') || 50; // limit for maximum yellow color highlighting (defense score)

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
    var ownPlayer = null;

    // internal vars
    let playerUpdateQueue = [];
    const version = '0.2.8';
    const debug = true;

    // regex
    const rxNumber = '([.0-9]+)';


    window.getJSON = function (url, callback) {
        url = apiUrl + url + '?api_key=' + apiKey + '&version=' + version;

        if (debug) {
            console.log('GET', url);
        }

        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function (response) {
                if (debug) {
                    console.log(response.responseText);
                }

                callback(response);
            }
        });
    };
    window.postJSON = function (url, data, callback) {
        url = apiUrl + url + '?api_key=' + apiKey + '&version=' + version;

        if (debug) {
            console.log('POST', url, data);
        }

        GM_xmlhttpRequest({
            method: 'POST',
            data: JSON.stringify(data),
            url: url,
            headers: {
                'Content-Type': 'application/json'
            },
            onload: function (response) {
                if (debug) {
                    console.log(response.status);
                }

                callback(response);
            },
            onerror: function (response) {
                if (debug) {
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
            parsePageOverview();
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
    };

    window.parsePageOverview = function () {
        var galaxyBox = $('.infos:last-child');
        var html = '<table width="100%" style="max-width: 100% !important" class="table519"><tr>';
        var showNoobs = GM_getValue('showNoobs');
        var showInactive = GM_getValue('showInactive');
        var ownScore = getInt($($('.infos')[0]).html().match(new RegExp('Punkte ' + rxNumber))[1]);

        $('.infos:nth-child(4)').hide();
        $('.infos:nth-child(5)').hide();
        $('.infos:last-child').css('margin-top', '-17px');

        html += '<th style="text-align: center;">#</th>';
        html += '<th class="sortable" data-sort="name" data-direction="ASC">Spieler</th>';
        html += '<th class="sortable" data-sort="distance" title="Distanz" data-direction="ASC" style="text-align: center;" id="sortByDistance" colspan="3"><i class="fa fa-map-marker-alt"></i></th>';
        html += '<th class="sortable" data-sort="score" title="Punkte" data-direction="DESC" style="text-align: center; color: #aaaaff" id="sortByScore"><i class="fa fa-chart-line"></i></th>';
        html += '<th class="sortable" data-sort="score_building" title="GebÃ¤udepunkte" data-direction="DESC" style="text-align: center; color: #aaffaa" id="sortByScoreBuilding"><i class="fa fa-home"></i></th>';
        html += '<th class="sortable" data-sort="score_science" title="Forschungspunkte" data-direction="DESC" style="text-align: center; color: #ffaaff" id="sortByScoreScience"><i class="fa fa-flask"></i></th>';
        html += '<th class="sortable" data-sort="score_military" title="MilitÃ¤rpunkte" data-direction="DESC" style="text-align: center; color: #ffaaaa" id="sortByScoreMilitary"><i class="fa fa-fighter-jet"></i></th>';
        html += '<th class="sortable" data-sort="score_defense" title="Verteidigungspunkte" data-direction="DESC" style="text-align: center; color: #ffffaa" id="sortByScoreDefense"><i class="fa fa-shield"></i></th>';
        html += '<th class="sortable" data-sort="last_attack" title="Letzter Angriff" data-direction="ASC" style="text-align: right;">Attack <i class="fa fa-crosshairs"></i></th>';
        html += '<th class="sortable" data-sort="last_spy_report" title="Letze Spionage" data-direction="DESC" style="text-align: right;">Spy <i class="fa fa-user-secret"></i></th>';
        html += '<th style="text-align: center;">Actions</th>';
        html += '<th class="sortable" data-sort="last_spy_metal" data-direction="DESC" title="Metall (Letzte Spionage)" style="text-align: right;" id="sortBySpioMet">MET</th>';
        html += '<th class="sortable" data-sort="last_spy_crystal" data-direction="DESC" title="Kristall (Letzte Spionage)" style="text-align: right;" id="sortBySpioCry">CRY</th>';
        html += '<th class="sortable" data-sort="last_spy_deuterium" data-direction="DESC" title="Deuterium (Letzte Spionage)" style="text-align: right;" id="sortBySpioDeu">DEU</th></tr>';

        $(galaxyBox).html('<div style="padding: 15px"><i class="fa fa-spinner fa-spin"></i> Loading overview...</div>');
        postJSON('players/overview', {
            galaxy: ownGalaxy,
            system: ownSystem,
            planet: ownPlanet,
            showInactive: showInactive,
            showNoobs: showNoobs,
            order_by: GM_getValue('orderBy'),
            order_direction: GM_getValue('orderDirection')
        }, function (response) {
            response = JSON.parse(response.responseText);

            if (response.player !== null) {
                ownPlayer = response.player;
            }

            if (isNewerVersionAvailable(response.version)) {
                $('body').prepend('<div style="padding: 10px 15px; background: rgba(200, 50, 0); color: #ffddaa; z-index: 10000; position: fixed; top: 0; left: 0; right: 0;" id="progress-bar"><i class="fa fa-exclamation-triangle"></i>  Eine neue Plugin-Version v<a href="https://pr0game-hub.eskju.net/download/releases/pr0game-hub.v' + response.version + '.js" target="_blank" download>' + response.version + '</a> ist verf&uuml;gbar.</div>');
            }

            $(response.players).each(function (key, obj) {
                html += '<tr id="row' + obj.id + '">';
                html += '<td>' + (key + 1) + '</td>';
                html += '<td style="text-align: left">';

                if (obj.inactive_since !== null && obj.inactive_since < 48) {
                    html += '<span style="padding: 0 3px; background: rgb(255, 0, 0); color: #fff; border-radius: 2px; margin-right: 5px">' + obj.inactive_since + ' STD</span>';
                }

                html += '<a href="/game.php?page=playerCard&id=' + obj.player.id + '">' + obj.player.name + '</a>';
                html += '</td>';
                html += '<td id="row' + obj.id + 'Galaxy">' + (obj.galaxy || '---') + '</td>';
                html += '<td id="row' + obj.id + 'System">' + (obj.system || '---') + '</td>';
                html += '<td id="row' + obj.id + 'Planet">' + (obj.planet || '---') + '</td>';
                html += '<td id="row' + obj.id + 'Score">' + (obj.player.score || '') + '</td>';
                html += '<td id="row' + obj.id + 'ScoreBuilding">' + (obj.player.score_building || '') + '</td>';
                html += '<td id="row' + obj.id + 'ScoreScience">' + (obj.player.score_science || '') + '</td>';
                html += '<td id="row' + obj.id + 'ScoreMilitary">' + (obj.player.score_military || '') + '</td>';
                html += '<td id="row' + obj.id + 'ScoreDefense">' + (obj.player.score_defense || '') + '</td>';
                html += '<td style="text-align: right">' + (obj.last_attack || '') + ' </td>';
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
                html += '<td style="text-align: right;">' + (obj.last_spy_deuterium || '') + '</td>';
                html += '</tr>';
            });

            galaxyBox.html(getOverviewHeader() + html + '</table>');

            $(response.players).each(function (key, obj) {
                $('#row' + obj.id).css(getPlayerRowStyle(obj.player, ownScore));
                $('#row' + obj.id + 'Score').css(getPlayerScoreStyle(obj.player));
                $('#row' + obj.id + 'ScoreBuilding').css(getPlayerScoreBuildingStyle(obj.player));
                $('#row' + obj.id + 'ScoreScience').css(getPlayerScoreScienceStyle(obj.player));
                $('#row' + obj.id + 'ScoreMilitary').css(getPlayerScoreMilitaryStyle(obj.player));
                $('#row' + obj.id + 'ScoreDefense').css(getPlayerScoreDefenseStyle(obj.player));
                $('#row' + obj.id + ' td, #row' + obj.id + ' td a').css(getPlayerRowTdStyle(obj.player));
                $('#row' + obj.id + ' td, #row' + obj.id + ' td a').css(getPlayerRowTdStyle(obj.player, ownScore));
                $('#lastSpyReport' + obj.id).click(function () {
                    getJSON('spy-reports/' + obj.galaxy + '/' + obj.system + '/' + obj.planet, function (spyReports) {
                        spyReports = JSON.parse(spyReports.responseText);
                        showSpyReportHistory(spyReports);
                    });
                });
            });

            $('th.sortable').each(function (key, obj) {
                $(obj).css('cursor', 'pointer');

                if ($(obj).attr('data-sort') == (GM_getValue('orderBy') || 'distance') && $(obj).attr('data-direction') == (GM_getValue('orderDirection') || 'ASC')) {
                    $(obj).prepend('<i class="fa fa-caret-down"></i> ');
                }

                $(obj).click(function () {
                    orderBy($(obj).attr('data-sort'), $(obj).attr('data-direction'));
                });
            });
            $('.spio-link').click(function () {
                $.getJSON("game.php?page=fleetAjax&ajax=1&mission=6&planetID=" + $(this).attr('data-id'), function (data) {
                    alert(data.mess);
                });
            });

            // updatable IDs
            if (response.outdated_ids.length > 0 && false) {
                galaxyBox.prepend('<button id="fetchMissingIdsBtn">Fetch ' + response.outdated_ids.length + ' outdated IDs</button>');
                $('#fetchMissingIdsBtn').click(function () {
                    playerUpdateQueue = response.outdated_ids;

                    $('#fetchMissingIdsBtn').remove();
                    processQueue();
                });
            }
        });
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
                $('#row' + obj.id).append('<td id="row' + obj.id + 'Coordinates">' + (obj.main_coordinates || '---') + '</td>');
                $('#row' + obj.id).append('<td id="row' + obj.id + 'ScoreBuilding">' + (obj.score_building || '') + '</td>');
                $('#row' + obj.id).append('<td id="row' + obj.id + 'ScoreScience">' + (obj.score_science || '') + '</td>');
                $('#row' + obj.id).append('<td id="row' + obj.id + 'ScoreMilitary">' + (obj.score_military || '') + '</td>');
                $('#row' + obj.id).append('<td id="row' + obj.id + 'ScoreDefense">' + (obj.score_defense || '') + '</td>');

                $('#row' + obj.id).css(getPlayerRowStyle(obj));
                $('#row' + obj.id + ' td:nth-child(5)').css(getPlayerScoreStyle(obj));
                $('#row' + obj.id + 'ScoreBuilding').css(getPlayerScoreBuildingStyle(obj));
                $('#row' + obj.id + 'ScoreScience').css(getPlayerScoreScienceStyle(obj));
                $('#row' + obj.id + 'ScoreMilitary').css(getPlayerScoreMilitaryStyle(obj));
                $('#row' + obj.id + 'ScoreDefense').css(getPlayerScoreDefenseStyle(obj));
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

        $('content').prepend('<br><br>');
        $('content').prepend('<span style="background: -webkit-linear-gradient(left, #fff, #ff0000); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">' + militaryThreshold + '+ military score</span> ');
        $('content').prepend('<span style="background: -webkit-linear-gradient(left, #fff, #ff00ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">' + scienceThreshold + '+ science score</span> ');
        $('content').prepend('<span style="background: -webkit-linear-gradient(left, #fff, #ffff00); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">' + defenseThreshold + '+ defense score</span> ');
        $('content').prepend('<span style="background: -webkit-linear-gradient(left, #fff, #00ff00); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">' + buildingThreshold + '+ builing score</span> ');
    };
    window.parsePageMessages = function () {
        var messages = $($('#messagestable tr').get().reverse());
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

                labels.each(function (key, label) {
                    resources[($(label).find('a').attr('onclick') || '').match(/\(([0-9]+)\)/)[1]] = getInt($(values[key]).html());
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
                var dateTime = $(messages[key - 1]).find('td:nth-child(2)').html();
                var parseResult = getCoordinates($(obj).find('.raportMessage').html());
                var galaxy = parseResult[1];
                var system = parseResult[2];
                var planet = parseResult[3];
                var coords = galaxy + ':' + system + ':' + planet;

                GM_setValue('attack_' + coords, dateTime);
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

        console.log($('#content tr:nth-child(3) a').html());
        postJSON('players/' + window.location.href.match(/[\?\&]id=([(0-9]+)/i)[1], {
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
        }, function (response) {

        });
    }

    window.getPlayerRowStyle = function (obj, ownScore) {
        if (obj.on_vacation === 1) {
            return {background: 'rgb(0, 0, 255)', opacity: 0.75};
        } else if (ownPlayer !== null && ownPlayer.alliance_id === obj.alliance_id) {
            return {background: 'rgb(0, 255, 0)', opacity: 0.75};
        } else if (obj.is_inactive === 1) {
            return {background: 'rgb(0, 255, 255)', opacity: 0.75};
        } else if (getInt(obj.score) < ownScore / 5) {
            return {background: 'rgb(50, 50, 50)'};
        } else if (getInt(obj.score) > ownScore * 5) {
            return {background: 'rgb(255, 50, 0)', opacity: 0.75};
        } else if (obj.score_military === 0 && obj.score_defense === 0) {
            return {background: 'rgb(0, 255, 0)'};
        }

        return {};
    }
    window.getPlayerRowTdStyle = function (obj, ownScore) {
        if (obj.on_vacation === 1) {
            return {color: 'rgb(100, 150, 200)'};
        } else if (ownPlayer !== null && ownPlayer.alliance_id === obj.alliance_id) {
            return {color: 'rgb(0, 255, 0)'};
        } else if (obj.is_inactive === 1) {
            return {color: 'rgb(0, 255, 255)'};
        } else if (getInt(obj.score) < ownScore / 5) {
            return {color: 'rgb(50, 50, 50)'};
        } else if (getInt(obj.score) > ownScore * 5) {
            return {color: 'rgb(255, 50, 0)'};
        } else if (obj.score_military === 0 && obj.score_defense === 0) {
            return {color: 'rgb(0, 255, 0)'};
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
        var w2 = 1 - w1;
        var rgb = [Math.round(color1[0] * w1 + color[0] * w2),
            Math.round(color1[1] * w1 + color[1] * w2),
            Math.round(color1[2] * w1 + color[2] * w2)];
        return 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';
    };
    window.getPlayerScoreStyle = function (obj) {
        return {color: getColor([0, 0, 255], getInt(obj.score) / scoreThreshold)};
    }
    window.getPlayerScoreBuildingStyle = function (obj) {
        return {color: getColor([0, 255, 0], getInt(obj.score_building) / buildingThreshold)};
    }
    window.getPlayerScoreScienceStyle = function (obj) {
        return {color: getColor([255, 0, 255], getInt(obj.score_science) / scienceThreshold)};
    }
    window.getPlayerScoreMilitaryStyle = function (obj) {
        return {color: getColor([255, 0, 0], getInt(obj.score_military) / militaryThreshold)};
    }
    window.getPlayerScoreDefenseStyle = function (obj) {
        return {color: getColor([255, 255, 0], getInt(obj.score_defense) / defenseThreshold)};
    }

    window.getProgressBar = function () {
        const progressBar = $('#progress-bar');

        if (progressBar.length === 1) {
            return progressBar;
        }

        $('body').prepend('<div style="padding: 10px 15px; background: rgba(0, 200, 200); color: #fff; z-index: 10000; position: fixed; top: 0; left: 0; right: 0;" id="progress-bar"></div>');
        return $('#progress-bar');
    };
    window.processQueue = function () {
        if (playerUpdateQueue.length > 0) {
            getProgressBar().html('Updating ' + playerUpdateQueue.length + ' items ...');
            var id = playerUpdateQueue.shift();
            $('content').append('<iframe class="player-iframe" id="iframe' + id + '" width="1" height="1" src="/game.php?page=playerCard&id=' + id + '"></iframe>');
            $('#iframe' + id).on('load', processQueue);
        } else {
            getProgressBar().html('Save & reload');
            $('body').animate({opacity: 0}, 1000, function () {
                window.location.reload();
            });
        }
    };

    window.orderBy = function (orderBy, direction) {
        GM_setValue('orderBy', orderBy);
        GM_setValue('orderDirection', direction);
        window.location.reload();
    };

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
                    html += ' <span style="color: red; position: absolute; right: 15px">' + value.difference + '</span>';
                } else {
                    html += ' <span style="color: green; position: absolute; right: 15px">+' + value.difference + '</span>';
                }

                html += '</td>';
            });

            html += '</tr>';
        });

        html += '</table>';

        return html;
    };
    window.getInt = function (intOrString) {
        return parseInt((intOrString !== null ? intOrString : 0).toString().replace(/\./, ''));
    }

    window.getOverviewHeader = function() {
        let header = '<table cellspacing="0"><tr><td style="text-align: left; padding: 5px 10px">';
        header += '<a href="https://pr0game-hub.eskju.net/download/legend.png" target="_blank"><i class="fa fa-info-circle"></i> Legende</a>';
        header += ' // ';
        header += '<a href="https://pr0game-hub.eskju.net/download/faq.txt" target="_blank"><i class="fa fa-question-circle"></i> FAQ</a>';
        header += '</td>';
        header += '<td style="text-align: right; padding: 5px 10px"><i class="fa fa-cogs"></i> Einstellungen</td>';
        header += '</tr></table>';

        return header;
    }

    var setupMessage = '';
    window.checkRequirements = function() {
        if(!GM_getValue('api_key')) {
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

    parseUrl();
})();

// ==UserScript==
// @name         pr0game Hub
// @namespace    http://tampermonkey.net/
// @version      0.2.0
// @description  alliance hub using cloud
// @author       You
// @match        https://pr0game.com/game.php?page=statistics
// @match        https://pr0game.com/game.php?page=playerCard&*
// @match        https://pr0game.com/game.php
// @match        https://pr0game.com/game.php?page=overview
// @match        https://pr0game.com/game.php?page=messages&category=*
// @match        https://pr0game.com/game.php?page=galaxy
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==
// 0.1.1         fixed player highlighting for noob/superior users (reported by Hyman)
// 0.1.2         added legend to overview page (requested by Hyman)
// 0.1.3         version check & update notification
// 0.2.0         spy report history and minor bugfixes

(function () {
    'use strict';

    // API settings
    var apiUrl = 'https://pr0game-hub.esKju.net/';
    var apiKey = '';

    // display settings
    var ownGalaxy = GM_getValue('ownGalaxy') || 1; // used for color highlighting
    var ownSystem = GM_getValue('ownSystem') || 1; // used for sorting
    var scoreThreshold = GM_getValue('scoreThreshold') || 1000; // limit for maximum blue color highlighting (total score)
    var buildingThreshold = GM_getValue('buildingThreshold') || 500; // limit for maximum green color highlighting (building score)
    var scienceThreshold = GM_getValue('scienceThreshold') || 250; // limit for maximum yellow color highlighting (science score)
    var militaryThreshold = GM_getValue('militaryThreshold') || 250; // limit for maximum red color highlighting (fleet score)
    var defenseThreshold = GM_getValue('defenseThreshold') || 50; // limit for maximum yellow color highlighting (defense score)
    var updateThreshold = 3600 * 6; // time in seconds before fetched data is classified as outdated

    // internal vars
    var authError = false;
    var apiMessage = {text: null, status: null};
    var apiMessageError = false;
    var playerCount = 1600;
    var playerUpdateQueue = [];
    var version = '0.2.0';
    var debug = false;

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

        // overview page
        if (window.location.href === 'https://pr0game.com/game.php' || window.location.href === 'https://pr0game.com/game.php?page=overview') {
            parsePageOverview();
        }

        // stats page
        else if (window.location.href === 'https://pr0game.com/game.php?page=statistics') {
            parsePageStatistics();
        }

        // message page
        else if (window.location.href.search(/https\:\/\/pr0game\.com\/game\.php\?page\=messages/) === 0) {
            parsePageMessages();
        }

        // galaxy page
        else if (window.location.href === 'https://pr0game.com/game.php?page=galaxy') {
            parsePageGalaxy();
        }

        // player page
        else if (window.location.href.search(/https\:\/\/pr0game\.com\/game\.php\?page\=playerCard/) === 0) {
            parsePagePlayerCard();
        }
    };

    window.parsePageOverview = function () {
        var updatableIds = [];
        var galaxyBox = $('.infos:last-child');
        var html = '<table width="100%" style="max-width: 100% !important" class="table519"><tr>';
        var showNoobs = GM_getValue('showNoobs');
        var showInactive = GM_getValue('showInactive');
        var ownScore = parseInt($('.infos:nth-child(1)').html().match(/Punkte ([.0-9]+) /)[1].replace(/\./, ''));

        $('.infos:nth-child(4)').hide();
        $('.infos:nth-child(5)').hide();
        $('.infos:last-child').css('margin-top', '-17px');

        html += '<th style="text-align: center;">#</th>';
        html += '<th class="sortable" data-sort="name" data-direction="ASC">Spieler</th>';
        html += '<th class="sortable" data-sort="distance" title="Distanz" data-direction="ASC" style="text-align: center;" id="sortByDistance" colspan="3"><i class="fa fa-map-marker-alt"></i></th>';
        html += '<th class="sortable" data-sort="score" title="Punkte" data-direction="DESC" style="text-align: center; color: #aaaaff" id="sortByScore"><i class="fa fa-chart-line"></i></th>';
        html += '<th class="sortable" data-sort="score_building" title="Gebäudepunkte" data-direction="DESC" style="text-align: center; color: #aaffaa" id="sortByScoreBuilding"><i class="fa fa-home"></i></th>';
        html += '<th class="sortable" data-sort="score_science" title="Forschungspunkte" data-direction="DESC" style="text-align: center; color: #ffaaff" id="sortByScoreScience"><i class="fa fa-flask"></i></th>';
        html += '<th class="sortable" data-sort="score_military" title="Militärpunkte" data-direction="DESC" style="text-align: center; color: #ffaaaa" id="sortByScoreMilitary"><i class="fa fa-fighter-jet"></i></th>';
        html += '<th class="sortable" data-sort="score_defense" title="Verteidigungspunkte" data-direction="DESC" style="text-align: center; color: #ffffaa" id="sortByScoreDefense"><i class="fa fa-shield"></i></th>';
        html += '<th class="sortable" data-sort="last_attack" title="Letzter Angriff" data-direction="ASC" style="text-align: right;">Attack <i class="fa fa-crosshairs"></i></th>';
        html += '<th class="sortable" data-sort="last_spy_report" title="Letze Spionage" data-direction="DESC" style="text-align: right;">Spy <i class="fa fa-user-secret"></i></th>';
        html += '<th style="text-align: center;">Actions</th>';
        html += '<th class="sortable" data-sort="last_spy_metal" data-direction="DESC" title="Metall (Letzte Spionage)" style="text-align: right;" id="sortBySpioMet">MET</th>';
        html += '<th class="sortable" data-sort="last_spy_crystal" data-direction="DESC" title="Kristall (Letzte Spionage)" style="text-align: right;" id="sortBySpioCry">CRY</th>';
        html += '<th class="sortable" data-sort="last_spy_deuterium" data-direction="DESC" title="Deuterium (Letzte Spionage)" style="text-align: right;" id="sortBySpioDeu">DEU</th></tr>';
        var sortBy = GM_getValue('sortBy') || 'distance';

        postJSON('players/overview', {
            galaxy: ownGalaxy,
            system: ownSystem,
            showInactive: showInactive,
            showNoobs: showNoobs,
            order_by: GM_getValue('orderBy'),
            order_direction: GM_getValue('orderDirection')
        }, function (response) {
            response = JSON.parse(response.responseText);

            if(response.version !== version) {
                $('body').prepend('<div style="padding: 10px 15px; background: rgba(200, 50, 0); color: #ffddaa; z-index: 10000; position: fixed; top: 0; left: 0; right: 0;" id="progress-bar"><i class="fa fa-exclamation-triangle"></i>  Eine neue Plugin-Version v<a href="https://pr0game-hub.eskju.net/download/releases/pr0game-hub.v' + response.version + '.js" target="_blank" download>' + response.version + '</a> ist verfügbar.</div>');
            }

            $(response.players).each(function (key, obj) {
                html += '<tr id="row' + obj.id + '">';
                html += '<td>' + (key + 1) + '</td>';
                html += '<td style="text-align: left"><a href="/game.php?page=playerCard&id=' + obj.player.id + '">' + obj.player.name + '</a></td>';
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

            galaxyBox.html('<p><a href="https://pr0game-hub.eskju.net/download/legend.png" target="_blank">Legende</a> // <a href="https://pr0game-hub.eskju.net/download/faq.txt" target="_blank">FAQ</a></p>' + html + '</table>');

            $(response.players).each(function (key, obj) {
                $('#row' + obj.id).css(getPlayerRowStyle(obj.player, ownScore));
                $('#row' + obj.id + 'Score').css(getPlayerScoreStyle(obj.player));
                $('#row' + obj.id + 'ScoreBuilding').css(getPlayerScoreBuildingStyle(obj.player));
                $('#row' + obj.id + 'ScoreScience').css(getPlayerScoreScienceStyle(obj.player));
                $('#row' + obj.id + 'ScoreMilitary').css(getPlayerScoreMilitaryStyle(obj.player));
                $('#row' + obj.id + 'ScoreDefense').css(getPlayerScoreDefenseStyle(obj.player));
                $('#row' + obj.id + ' td, #row' + obj.id + ' td a').css(getPlayerRowTdStyle(obj.player));
                $('#row' + obj.id + ' td, #row' + obj.id + ' td a').css(getPlayerRowTdStyle(obj.player, ownScore));
                $('#lastSpyReport' + obj.id).click(function() {
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
                    resources[($(label).find('a').attr('onclick') || '').match(/\(([0-9]+)\)/)[1]] = parseInt($(values[key]).html().replace(/\./, ''));
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
                var parseResult = $(obj).find('.raportMessage').html().match(/\[([0-9]+)\:([0-9]+)\:([0-9]+)\]/);
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

        postJSON('players/' + window.location.href.match(/[\?\&]id=([(0-9]+)/i)[1], {
            name: $('#content tr:nth-child(2) td:nth-child(2)').html(),
            alliance_id: allianceId ? allianceId[1] : null,
            alliance_name: $('#content tr:nth-child(4) a').html() || null,
            main_coordinates: $('#content tr:nth-child(3) a').html().replace(/\[(.*)\]/, '$1'),
            score_building: $('#content tr:nth-child(6) td:nth-child(2)').html().replace(/\./, ''),
            score_science: $('#content tr:nth-child(7) td:nth-child(2)').html().replace(/\./, ''),
            score_military: $('#content tr:nth-child(8) td:nth-child(2)').html().replace(/\./, ''),
            score_defense: $('#content tr:nth-child(9) td:nth-child(2)').html().replace(/\./, ''),
            score: $('#content tr:nth-child(10) td:nth-child(2)').html().replace(/\./, ''),
            combats_won: $('#content tr:nth-child(13) td:nth-child(2)').html().replace(/\./, ''),
            combats_draw: $('#content tr:nth-child(14) td:nth-child(2)').html().replace(/\./, ''),
            combats_lost: $('#content tr:nth-child(15) td:nth-child(2)').html().replace(/\./, ''),
            combats_total: $('#content tr:nth-child(16) td:nth-child(2)').html().replace(/\./, ''),
            units_shot: $('#content tr:nth-child(18) td:nth-child(2)').html().replace(/\./, ''),
            units_lost: $('#content tr:nth-child(19) td:nth-child(2)').html().replace(/\./, ''),
            rubble_metal: $('#content tr:nth-child(20) td:nth-child(2)').html().replace(/\./, ''),
            rubble_crystal: $('#content tr:nth-child(21) td:nth-child(2)').html().replace(/\./, ''),
        }, function (response) {

        });
    }

    window.getPlayerRowStyle = function (obj, ownScore) {
        obj.score = (obj.score || 0).toString();

        if (obj.on_vacation === 1) {
            return {background: 'rgb(0, 0, 255)', opacity: 0.75};
        } else if (obj.is_inactive === 1) {
            return {background: 'rgb(0, 255, 255)', opacity: 0.75};
        } else if (parseInt(obj.score.replace(/\./,'')) < ownScore / 5) {
            return {background: 'rgb(50, 50, 50)'};
        } else if (parseInt(obj.score.replace(/\./,'')) > ownScore * 5) {
            return {background: 'rgb(255, 50, 0)', opacity: 0.75};
        } else if (obj.score_military === 0 && obj.score_defense === 0) {
            return {background: 'rgb(0, 255, 0)'};
        }

        return {};
    }

    window.getPlayerRowTdStyle = function (obj, ownScore) {
        obj.score = (obj.score || 0).toString();

        if (obj.on_vacation === 1) {
            return {color: 'rgb(100, 150, 200)'};
        } else if (obj.is_inactive === 1) {
            return {color: 'rgb(0, 255, 255)'};
        } else if (parseInt(obj.score.replace(/\./,'')) < ownScore / 5) {
            return {color: 'rgb(50, 50, 50)'};
        } else if (parseInt(obj.score.replace(/\./,'')) > ownScore * 5) {
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
        return {color: getColor([0, 0, 255], obj.score / scoreThreshold)};
    }

    window.getPlayerScoreBuildingStyle = function (obj) {
        return {color: getColor([0, 255, 0], obj.score_building / buildingThreshold)};
    }

    window.getPlayerScoreScienceStyle = function (obj) {
        return {color: getColor([255, 0, 255], obj.score_science / scienceThreshold)};
    }

    window.getPlayerScoreMilitaryStyle = function (obj) {
        return {color: getColor([255, 0, 0], obj.score_military / militaryThreshold)};
    }

    window.getPlayerScoreDefenseStyle = function (obj) {
        return {color: getColor([255, 255, 0], obj.score_defense / defenseThreshold)};
    }

    window.getProgressBar = function () {
        var progressBar = $('#progress-bar');

        if (progressBar.length === 1) {
            return progressBar;
        }

        $('body').prepend('<div style="padding: 10px 15px; background: rgba(0, 200, 200); color: #fff; z-index: 10000; position: fixed; top: 0; left: 0; right: 0;" id="progress-bar"></div>');
        return $('#progress-bar');
    };

    window.orderBy = function (orderBy, direction) {
        GM_setValue('orderBy', orderBy);
        GM_setValue('orderDirection', direction);
        window.location.reload();
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

    window.showSpyReportHistory = function(spyReportHistory) {
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
        $(window).keydown(function(event) {
            if(event.key === 'Escape') {
                $('#spyReportOverlay').remove();
                $('#spyReportBackdrop').remove();
            }
        });

        $('#spyReportBackdrop').click(function() {
            $('#spyReportOverlay').remove();
            $('#spyReportBackdrop').remove();
        });
    };

    window.showSpyReportHistoryBox = function(spyReportHistory, offset) {
        var html = '<table width="100%" style="max-width: 100% !important" class="table519"><tr>';
        html += '<th style="text-align: left; width: 250px" width="200">Zeit</th>';

        $(spyReportHistory[offset].data[0].values).each(function(key, obj) {
            html += '<th style="text-align: center;">' + obj.name + '</th>';
        });

        html += '</tr>';

        $(spyReportHistory[offset].data).each(function(key, obj) {
            html += '<tr>';
            html += '<td style="text-align: left;">' + obj.timestamp + '</td>';

            $(obj.values).each(function(key, value) {
                value.value = value.value === null ? '---' : value.value;
                html += '<td style="position: relative; ' + (value.value.toString() !== '0' && value.value.toString() !== '---' ? 'color: #fff' : 'color: #444' ) + '">';
                html += value.value;

                if(value.difference === null || value.difference === 0 || value.valueBefore == value.value) {
                }
                else if(value.valueBefore && value.valueBefore > value.value) {
                    html += ' <span style="color: red; position: absolute; right: 15px">' + value.difference + '</span>';
                }
                else {
                    html += ' <span style="color: green; position: absolute; right: 15px">+' + value.difference + '</span>';
                }

                html += '</td>';
            });

            html += '</tr>';
        });

        html += '</table>';

        return html;
    };

    parseUrl();
})();

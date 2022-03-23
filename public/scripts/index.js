// == feature requests / ideas ==
// Klarname      add a simulator link to spy report history
// ???           exploration counter
// eichhorn      flying times in overview
// eichhorn      mileage in overview
// Klarname      show last spy, last attack, etc. in galaxy view
// Redstar       filter for coordinates (start / end)
// Redstar       colorize ally partners in green
// Redstar       colorize players from buddylist

import './config.colors';
import './util.anonymize-battle-report';
import './util.csv-to-array';
import './util.display-alliance-chart';
import './util.display-chart';
import './util.display-overview-settings';
import './util.display-overview-settings-highlight';
import './util.display-overview-settings-playervar';
import './util.display-overview-settings-select';
import './util.display-overview-settings-range';
import './util.format-time';
import './util.get-color';
import './util.get-color-alt';
import './util.get-color-intensity';
import './util.get-coordinates';
import './util.get-hotkey-icon';
import './util.get-int';
import './util.get-max-value';
import './util.get-player-attribute-style';
import './util.get-player-row-id-style';
import './util.get-player-row-style';
import './util.get-rgb';
import './util.get-style';
import './util.hotkeys';
import './util.number-format';
import './util.planet-resource-notification';
import './util.replace-fix-colors';
import './util.resources';
import './util.save-ph-value';
import './util.show-message';
import './util.show-spy-report-history';
import './util.show-spy-report-history-box';
import './util.version-check';
import './xhr.get-json';
import './xhr.post-json';
import './component.changelog';
import './component.menu';
import './page.alliance';
import './page.buildings';
import './page.fleet';
import './page.galaxy';
import './page.hangar';
import './page.hub';
import './page.imperium';
import './page.messages';
import './page.overview';
import './page.playercard';
import './page.research';
import './page.resources';
import './page.stats';
import './queue.process';
import './queue.progressbar';

window.updateConfigVars = function () {
    cfgHighlight = {
        score: {
            enabled: (getValue('highlight_score_enable') || '0') === '1',
            threshold: getInt(getValue('highlight_score_value') || '')
        },
        score_building: {
            enabled: (getValue('highlight_score_building_enable') || '0') === '1',
            threshold: getInt(getValue('highlight_score_building_value') || '')
        },
        score_science: {
            enabled: (getValue('highlight_score_science_enable') || '0') === '1',
            threshold: getInt(getValue('highlight_score_science_value') || '')
        },
        score_military: {
            enabled: (getValue('highlight_score_military_enable') || '0') === '1',
            threshold: getInt(getValue('highlight_score_military_value') || '')
        },
        score_defense: {
            enabled: (getValue('highlight_score_defense_enable') || '0') === '1',
            threshold: getInt(getValue('highlight_score_defense_value') || '')
        }
    };

    filterInactive = getValue('filter_inactive') || 'ALL';
    filterNoobs = getValue('filter_noobs') || 'ALL';
    filterVacation = getValue('filter_vacation') || 'ALL';
    filterAlliance = getValue('filter_alliance') || 'ALL';
    filterSpyReport = getValue('filter_spy_report') || 'ALL';
    filterBattleReport = getValue('filter_last_battle_report') || 'ALL';
    filterScoreEnabled = getValue('filter_score_enable') || '0';
    filterScoreMin = getValue('filter_score_min') || '';
    filterScoreMax = getValue('filter_score_max') || '';
    filterScoreBuildingEnabled = getValue('filter_score_building_enable') || '0';
    filterScoreBuildingMin = getValue('filter_score_building_min') || '';
    filterScoreBuildingMax = getValue('filter_score_building_max') || '';
    filterScoreScienceEnabled = getValue('filter_score_science_enable') || '0';
    filterScoreScienceMin = getValue('filter_score_science_min') || '';
    filterScoreScienceMax = getValue('filter_score_science_max') || '';
    filterScoreFleetEnabled = getValue('filter_score_fleet_enable') || '0';
    filterScoreFleetMin = getValue('filter_score_fleet_min') || '';
    filterScoreFleetMax = getValue('filter_score_fleet_max') || '';
    filterScoreDefenseEnabled = getValue('filter_score_defense_enable') || '0';
    filterScoreDefenseMin = getValue('filter_score_defense_min') || '';
    filterScoreDefenseMax = getValue('filter_score_defense_max') || '';
    filterInactiveSinceEnabled = getValue('filter_inactive_since_enable') || '0';
    filterInactiveSinceMin = getValue('filter_inactive_since_min') || '';
    filterInactiveSinceMax = getValue('filter_inactive_since_max') || '';
    filterLastBattleReportEnabled = getValue('filter_last_battle_report_enable') || '0';
    filterLastBattleReportMin = getValue('filter_last_battle_report_min') || '';
    filterLastBattleReportMax = getValue('filter_last_battle_report_max') || '';
    filterLastSpyReportEnabled = getValue('filter_last_spy_report_enable') || '0';
    filterLastSpyReportMin = getValue('filter_last_spy_report_min') || '';
    filterLastSpyReportMax = getValue('filter_last_spy_report_max') || '';
    filterMetalEnabled = getValue('filter_metal_enable') || '0';
    filterMetalMin = getValue('filter_metal_min') || '';
    filterMetalMax = getValue('filter_metal_max') || '';
    filterCrystalEnabled = getValue('filter_crystal_enable') || '0';
    filterCrystalMin = getValue('filter_crystal_min') || '';
    filterCrystalMax = getValue('filter_crystal_max') || '';
    filterDeuteriumEnabled = getValue('filter_deuterium_enable') || '0';
    filterDeuteriumMin = getValue('filter_deuterium_min') || '';
    filterDeuteriumMax = getValue('filter_deuterium_max') || '';
}

window.GetRestTimeFormat = function (seconds) {
    return formatTimeDiff(new Date().getTime() / 1000 + seconds);
};

window.getOverviewHeader = function () {
    let header = '<table cellspacing="0"><tr><td width="50%%" style="text-align: left; padding: 5px 10px">';
    header += '<a href="https://pr0game-hub.eskju.net/download/legend.png" target="_blank"><i class="fa fa-info-circle"></i> Legende</a>';
    header += ' // ';
    header += '<a href="https://pr0game-hub.eskju.net/download/faq.txt" target="_blank"><i class="fa fa-question-circle"></i> FAQ</a>';
    header += '</td>';

    if (getValue('hideSettings') === '1') {
        header += '<td id="showSettings" style="text-align: right; padding: 5px 10px; cursor: pointer;"><i class="fa fa-cogs fa"></i> Einstellungen anzeigen</td>';
    } else {
        header += '<td id="hideSettings" style="text-align: right; padding: 5px 10px; cursor: pointer;"><span style="color: lightgreen"><i class="fa fa-cogs"></i> Einstellungen ausblenden</span></td>';
    }

    header += '</tr></table>';

    header += displayOverviewSettings();

    return header;
}

window.filterTableRow = function (obj, player) {
    // selects
    if (filterInactive === 'HIDE' && obj.player.is_inactive === 1) return false;
    if (filterInactive === 'ONLY' && obj.player.is_inactive === 0) return false;

    if (player !== null) {
        if (filterNoobs === 'HIDE' && obj.player.is_inactive === 0 && getInt(obj.player.score) < 5000 && getInt(obj.player.score) < getInt(player.score) / 5) return false;
        if (filterNoobs === 'ONLY' && obj.player.is_inactive === 0 && (getInt(obj.player.score) >= 5000 || getInt(obj.player.score) >= getInt(player.score) / 5)) return false;
    }
    if (filterVacation === 'HIDE' && obj.player.on_vacation === 1) return false;
    if (filterVacation === 'ONLY' && obj.player.on_vacation === 0) return false;

    if (player) {
        if (filterAlliance === 'HIDE' && obj.player.alliance_id !== null && (obj.alliance_id === 12 || obj.alliance_id === 95)) return false;
        if (filterAlliance === 'ONLY' && (obj.player.alliance_id === null || (obj.alliance_id !== 12 && obj.alliance_id !== 95))) return false;
    }
    if (filterSpyReport === 'HIDE' && obj.last_spy_report !== '') return false;
    if (filterSpyReport === 'ONLY' && obj.last_spy_report === '') return false;
    if (filterBattleReport === 'HIDE' && obj.last_battle_report !== '') return false;
    if (filterBattleReport === 'ONLY' && obj.last_battle_report === '') return false;
    if (filterScoreEnabled === '1' && getInt(filterScoreMin) > 0 && getInt(filterScoreMin) > getInt(obj.player.score)) return false;
    if (filterScoreEnabled === '1' && getInt(filterScoreMax) > 0 && getInt(filterScoreMax) < getInt(obj.player.score)) return false;
    if (filterScoreBuildingEnabled === '1' && getInt(filterScoreBuildingMin) > 0 && getInt(filterScoreBuildingMin) > getInt(obj.player.score_building)) return false;
    if (filterScoreBuildingEnabled === '1' && getInt(filterScoreBuildingMax) > 0 && getInt(filterScoreBuildingMax) < getInt(obj.player.score_building)) return false;
    if (filterScoreScienceEnabled === '1' && getInt(filterScoreScienceMin) > 0 && getInt(filterScoreScienceMin) > getInt(obj.player.score_science)) return false;
    if (filterScoreScienceEnabled === '1' && getInt(filterScoreScienceMax) > 0 && getInt(filterScoreScienceMax) < getInt(obj.player.score_science)) return false;
    if (filterScoreFleetEnabled === '1' && getInt(filterScoreFleetMin) > 0 && getInt(filterScoreFleetMin) > getInt(obj.player.score_military)) return false;
    if (filterScoreFleetEnabled === '1' && getInt(filterScoreFleetMax) > 0 && getInt(filterScoreFleetMax) < getInt(obj.player.score_military)) return false;
    if (filterScoreDefenseEnabled === '1' && getInt(filterScoreDefenseMin) > 0 && getInt(filterScoreDefenseMin) > getInt(obj.player.score_defense)) return false;
    if (filterScoreDefenseEnabled === '1' && getInt(filterScoreDefenseMax) > 0 && getInt(filterScoreDefenseMax) < getInt(obj.player.score_defense)) return false;
    if (filterInactiveSinceEnabled === '1' && getInt(filterInactiveSinceMin) > 0 && getInt(filterInactiveSinceMin) > getInt(obj.inactive_since)) return false;
    if (filterInactiveSinceEnabled === '1' && getInt(filterInactiveSinceMax) > 0 && getInt(filterInactiveSinceMax) < getInt(obj.inactive_since)) return false;
    if (filterLastBattleReportEnabled === '1' && getInt(filterLastBattleReportMin) > 0 && getInt(filterLastBattleReportMin) > getInt(obj.last_battle_report_hours)) return false;
    if (filterLastBattleReportEnabled === '1' && getInt(filterLastBattleReportMax) > 0 && getInt(filterLastBattleReportMax) < getInt(obj.last_battle_report_hours)) return false;
    if (filterLastSpyReportEnabled === '1' && getInt(filterLastSpyReportMin) > 0 && getInt(filterLastSpyReportMin) > getInt(obj.last_spy_report_hours)) return false;
    if (filterLastSpyReportEnabled === '1' && getInt(filterLastSpyReportMax) > 0 && getInt(filterLastSpyReportMax) < getInt(obj.last_spy_report_hours)) return false;
    if (filterMetalEnabled === '1' && getInt(filterMetalMin) > 0 && getInt(filterMetalMin) > getInt(obj.last_spy_metal)) return false;
    if (filterMetalEnabled === '1' && getInt(filterMetalMax) > 0 && getInt(filterMetalMax) < getInt(obj.last_spy_metal)) return false;
    if (filterCrystalEnabled === '1' && getInt(filterCrystalMin) > 0 && getInt(filterCrystalMin) > getInt(obj.last_spy_crystal)) return false;
    if (filterCrystalEnabled === '1' && getInt(filterCrystalMax) > 0 && getInt(filterCrystalMax) < getInt(obj.last_spy_crystal)) return false;
    if (filterDeuteriumEnabled === '1' && getInt(filterDeuteriumMin) > 0 && getInt(filterDeuteriumMin) > getInt(obj.last_spy_deuterium)) return false;
    if (filterDeuteriumEnabled === '1' && getInt(filterDeuteriumMax) > 0 && getInt(filterDeuteriumMax) < getInt(obj.last_spy_deuterium)) return false;

    return true;
}

window.parseUrl = function () {
    const url = window.location.href.replace('www.', '');

    // custom pages
    if (location.hash && location.hash.length > 0) {
        const hash = location.hash.split('.');

        switch (hash[0]) {
            case '#hub':
                pageHub = new PageHub();
                pageHub.loadPage(hash[1]);
                return;
        }
    }

    // overview page
    else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=raport/) === 0) {
        $('body').prepend('<button id="anonymize">Anonymisieren</button>');
        $('#anonymize').click(function () {
            window.anonymizeBattleReport();
        });
    }

    // overview page
    else if (url === 'https://pr0game.com/game.php' || url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=overview/) === 0) {
        window.pageOverview = new PageOverview();
        pageOverview.init();
    }

    // stats page
    else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=statistics/) === 0) {
        parsePageStatistics();
    }

    // message page
    else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=imperium/) === 0) {
        window.pageImperium = new PageImperium();
        pageImperium.init();
    }

    // message page
    else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=messages/) === 0) {
        window.pageMessages = new PageMessages();
        pageMessages.init();
    }

    // galaxy page
    else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=galaxy/) === 0) {
        window.pageGalaxy = new PageGalaxy();
        pageGalaxy.init();
    }

    // player page
    else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=playerCard/) === 0) {
        parsePagePlayerCard();
    }

    // player page
    else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=alliance/) === 0) {
        parsePageAlliance();
    }

    // buildings page
    else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=buildings/) === 0) {
        window.pageBuildings = new PageBuildings();
        pageBuildings.init();
    }

    // buildings page
    else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=shipyard/) === 0) {
        window.pageHangar = new PageHangar();
        pageHangar.init();
    }

    // research page
    else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=research/) === 0) {
        window.pageResearch = new PageResearch();
        pageResearch.init();
    }

    // fleet page
    else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=fleetTable/) === 0) {
        window.pageFleet = new PageFleet();
        pageFleet.init();
    }

    // fleet steps
    else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=fleetStep/) === 0) {
        $(window).keyup(function (e) {
            if ($('content form').length === 1 && $('*:focus').length === 0) {
                if (e.key === 'Enter') {
                    $('content .table519 form').submit();
                }
            }
        });

        if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=fleetStep1/) === 0) {
            let destination = getValue(ownCoords[0] + '_fleet_destination');

            if (destination) {
                destination = getCoordinates(destination);
                $('content').prepend('<a id="setDestination" href="#" style="padding: 10px; color: ' + getRgb(cYellow) + ';">Preset-Destination ' + destination[0] + ' auswählen</a>');

                $('#setDestination').click(function () {
                    $('#galaxy').val(destination[1]);
                    $('#system').val(destination[2]);
                    $('#planet').val(destination[3]);
                    updateVars();
                });
            }
        }

        if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=fleetStep2/) === 0) {
            let metal = getValue(ownCoords[0] + '_fleet_metal');
            let crystal = getValue(ownCoords[0] + '_fleet_crystal');
            let deuterium = getValue(ownCoords[0] + '_fleet_deuterium');

            if (metal || crystal || deuterium) {
                $('content').prepend('<a id="setResources" href="#" style="padding: 10px; color: ' + getRgb(cYellow) + ';">Preset-Ressourcen setzen</a>');

                $('#setResources').click(function () {
                    $('input[name=metal]').val(metal);
                    $('input[name=crystal]').val(crystal);
                    $('input[name=deuterium]').val(deuterium);

                    if ($('input[name=mission]:checked').length === 0) {
                        $('#radio_4').attr('checked', 'checked');
                    }

                    calculateTransportCapacity();
                });
            }
        }
    }

    // fleet page
    else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=resources/) === 0) {
        window.pageResources = new PageResources();
        pageResources.init();
    }
};

// colors
window.cBlack = [22, 22, 24];
window.cWhite = [242, 245, 244];
window.cRed = [238, 77, 46];
window.cGray = [136, 136, 136];
window.cPink = [255, 0, 130];
window.cGreen = [92, 184, 92];
window.cBlue = [0, 143, 255];
window.cYellow = [247, 197, 22];
window.cCyan = [0, 255, 255];

window.ownCoords = getCoordinates($('#planetSelector option:selected').html());
window.ownGalaxy = ownCoords[1];
window.ownSystem = ownCoords[2];
window.ownPlanet = ownCoords[3];
window.showGalaxy = ownGalaxy;
window.ownPlayer = null;
window.menu = null;
window.pageHub = null;
window.pageOverview = null;
window.pageBuildings = null;
window.pageHangar = null;
window.pageImperium = null;
window.pageDefense = null;
window.pageResearch = null;
window.pageGalaxy = null;
window.pageFleet = null;
window.pageMessages = null;
window.pageTechnologies = null;
window.pageResources = null;
window.rxNumber = '([.0-9]+)';
window.cfgHighlight = {};

let filterInactive = getValue('filter_inactive') || 'ALL';
let filterNoobs = getValue('filter_noobs') || 'ALL';
let filterVacation = getValue('filter_vacation') || 'ALL';
let filterAlliance = getValue('filter_alliance') || 'ALL';
let filterSpyReport = getValue('filter_spy_report') || 'ALL';
let filterBattleReport = getValue('filter_last_battle_report') || 'ALL';
let filterScoreEnabled = getValue('filter_score_enable') || '0';
let filterScoreMin = getValue('filter_score_min') || '';
let filterScoreMax = getValue('filter_score_max') || '';
let filterScoreBuildingEnabled = getValue('filter_score_building_enable') || '0';
let filterScoreBuildingMin = getValue('filter_score_building_min') || '';
let filterScoreBuildingMax = getValue('filter_score_building_max') || '';
let filterScoreScienceEnabled = getValue('filter_score_science_enable') || '0';
let filterScoreScienceMin = getValue('filter_score_science_min') || '';
let filterScoreScienceMax = getValue('filter_score_science_max') || '';
let filterScoreFleetEnabled = getValue('filter_score_fleet_enable') || '0';
let filterScoreFleetMin = getValue('filter_score_fleet_min') || '';
let filterScoreFleetMax = getValue('filter_score_fleet_max') || '';
let filterScoreDefenseEnabled = getValue('filter_score_defense_enable') || '0';
let filterScoreDefenseMin = getValue('filter_score_defense_min') || '';
let filterScoreDefenseMax = getValue('filter_score_defense_max') || '';
let filterInactiveSinceEnabled = getValue('filter_inactive_since_enable') || '0';
let filterInactiveSinceMin = getValue('filter_inactive_since_min') || '';
let filterInactiveSinceMax = getValue('filter_inactive_since_max') || '';
let filterLastBattleReportEnabled = getValue('filter_last_battle_report_enable') || '0';
let filterLastBattleReportMin = getValue('filter_last_battle_report_min') || '';
let filterLastBattleReportMax = getValue('filter_last_battle_report_max') || '';
let filterLastSpyReportEnabled = getValue('filter_last_spy_report_enable') || '0';
let filterLastSpyReportMin = getValue('filter_last_spy_report_min') || '';
let filterLastSpyReportMax = getValue('filter_last_spy_report_max') || '';
let filterMetalEnabled = getValue('filter_metal_enable') || '0';
let filterMetalMin = getValue('filter_metal_min') || '';
let filterMetalMax = getValue('filter_metal_max') || '';
let filterCrystalEnabled = getValue('filter_crystal_enable') || '0';
let filterCrystalMin = getValue('filter_crystal_min') || '';
let filterCrystalMax = getValue('filter_crystal_max') || '';
let filterDeuteriumEnabled = getValue('filter_deuterium_enable') || '0';
let filterDeuteriumMin = getValue('filter_deuterium_min') || '';
let filterDeuteriumMax = getValue('filter_deuterium_max') || '';

window.alert = function (msg) {
    window.location.reload();
};

$(window).on('hashchange', function () {
    parseUrl();
});

window.pageHub = new PageHub();
pageHub.init();

window.menu = new Menu();
menu.init();

hotkeys();

replaceFixColors();

let resources = new Resources();
resources.init();

$('head').append('<link rel="stylesheet" href="https://pro.fontawesome.com/releases/v5.10.0/css/all.css" integrity="sha384-AYmEC3Yw5cVb3ZcuHtOA93w35dYTsvhLPVnYs9eStHfGJvOvKxVfELGroGkvsg+p" crossorigin="anonymous"/>');

parseUrl();

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
        order_by: getValue('orderBy')
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

            $('#row' + obj.id + ' td:nth-child(2)').css(getPlayerRowTdStyle(obj, response.player));
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

window.showSpyReportHistoryBox = function (spyReportHistory, offset) {
    var html = '<table width="100%" style="max-width: 100% !important" class="table519"><tr>';
    html += '<th style="text-align: left; width: 250px" width="200">Zeit</th>';

    $(spyReportHistory[offset].data[0].values).each(function (key, obj) {
        html += '<th style="text-align: center;">' + obj.name + '</th>';
    });

    html += '</tr>';

    $(spyReportHistory[offset].data).each(function (key, obj) {
        html += '<tr>';
        html += '<td style="text-align: left;" class="tooltip" data-tooltip-content="' + obj.dateTime + '">' + obj.timestamp + ' (' + ((obj.reporter ? obj.reporter.name : '???') || '???') + ')</td>';

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

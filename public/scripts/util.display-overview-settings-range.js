window.displayOverviewSettingsRange = function(label, alias) {
    let html = '<tr class="settings-filter settings-filter-thresholds">';
    html += '<td width="50%" style="text-align: left">' + label + '</td>';
    html += '<td width="4%">';
    html += '<input id="' + alias + '_enable" class="phFilter" data-alias="' + alias + '_enable" value="1" type="checkbox" ' + (getValue(alias + '_enable') === '1' ? 'checked' : '') + '>';
    html += '</td>';
    html += '<td width="23%">';
    html += '<input id="' + alias + '_min" class="phFilter" data-alias="' + alias + '_min" style="width: 100%" placeholder="min" value="' + (getValue(alias + '_min') || '') + '">';
    html += '</td>';
    html += '<td width="23%">';
    html += '<input id="' + alias + '_max" class="phFilter" data-alias="' + alias + '_max" style="width: 100%" placeholder="max" value="' + (getValue(alias + '_max') || '') + '">';
    html += '</td>';
    html + '</tr>';

    return html;
};


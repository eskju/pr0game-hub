window.displayOverviewSettingsPlayerVar = function(label, alias, className) {
    let html = '<tr class="settings-filter settings-filter-' + className + '">';
    html += '<td width="50%" style="text-align: left">' + label + '</td>';
    html += '<td width="50%">';
    html += '<input id="' + alias + '" class="phFilter" data-alias="' + alias + '" style="width: 100%" placeholder="' + label + '" value="' + (getValue(alias) || '') + '">';
    html += '</td>';
    html + '</tr>';

    return html;
};


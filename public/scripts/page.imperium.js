window.PageImperium = function () {
    this.init = function () {
        let coords;
        let item;
        let itemName;
        let tds;
        let tdItemName;
        let maxLevel;

        $('span.text-green').css('display', 'block');

        $('tr').each(function (key, obj) {
            tds = $(obj).find('td');
            tdItemName = $(tds[0]).find('a').html();

            $.each(tds, function (sKey, sObj) {
                $(tds[sKey]).addClass(sKey === 0 ? 'text-left' : 'text-right');
            });

            if (key === 2) {
                $('#planetSelector option').each(function (sKey, sObj) {
                    $(tds[sKey + 2]).html('<div style="width: ' + ($(tds[sKey + 2]).offsetWidth + 'px') + '; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + $(tds[sKey + 2]).html() + '</div>');
                });
            }

            if (key > 10 && key < 30) {
                maxLevel = 0;
                $.each(tds, function (sKey, sObj) {
                    if (sKey > 1) {
                        maxLevel = getInt($(sObj).html()) > maxLevel ? getInt($(sObj).html()) : maxLevel;
                    }
                });
            }

            $('#planetSelector option').each(function (sKey, sObj) {
                coords = getCoordinates(sObj.innerHTML);
                item = getValue(coords[1] + ':' + coords[2] + ':' + coords[3] + '_building_item');
                itemName = item.match(/(.*) \(([0-9]+)\)/);
                itemName = itemName ? itemName[1] : '';

                if (key > 10 && key < 30) {
                    $(tds[sKey + 2]).css('color', getColorAlt(cGreen, getInt($(tds[sKey + 2]).html()) / maxLevel, cRed));
                }

                if ($(tds[sKey + 2]).html() === '0') {
                    $(tds[sKey + 2]).css('color', 'rgba(255, 255, 255, 0.15)');
                }

                if (tdItemName === itemName) {
                    $(tds[sKey + 2]).prepend('<i class="fa fa-arrow-up"></i> ');
                }
            });
        });
    }
}

window.numberFormat = function (number, toUnit = false) {
    if(number === null) {
        return '';
    }

    number = getInt(number);

    if (toUnit) {
        let unit = 'K';

        if (number === 0) {
            return '0';
        }

        if(number > 1000000) {
            number = number / 1000;
            unit = 'KK';
        }

        return (Math.round(number / 100) / 10).toFixed(1) + unit;
    }


    return Math.floor(number || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

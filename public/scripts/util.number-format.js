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

        return (Math.round(number / 100) / 10).toFixed(1) + unit;
    }


    return Math.floor(number || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

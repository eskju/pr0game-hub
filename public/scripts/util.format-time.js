window.formatTimeDiff = function (timestamp) {
    if (getInt(timestamp) === 0) {
        return '---';
    }

    const diffInSeconds = Math.ceil(timestamp - new Date().getTime() / 1000);

    if(diffInSeconds < 0) {
        return 'BEREIT';
    }

    let returnString = '';
    const hours = Math.floor(diffInSeconds / 3600);
    const hoursDiff = diffInSeconds % 3600;

    const minutes = Math.floor(hoursDiff / 60);
    const seconds = hoursDiff % 60;

    return addTrailingZeros(hours) + ':' + addTrailingZeros(minutes) + ':' + addTrailingZeros(seconds);
};

window.addTrailingZeros = function (value) {
    if (value <= 0) {
        return '00';
    }

    if (value < 10) {
        return '0' + value;
    }

    return value;
}

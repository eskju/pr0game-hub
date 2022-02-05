window.getStyle = function (value) {
    if (getInt(value) === 0) {
        return 'text-gray';
    }

    if (getInt(value) < 0) {
        return 'text-red';
    }

    return 'text-green';
}

window.getCoordinates = function (string) {
    const isMoon = string.replace('(Mond)', '') !== string;
    const match = string ? string.match(/([0-9]+)\:([0-9]+)\:([0-9]+)/) : false;

    return !match ? false : [
        match[0] + (isMoon ? 'M' : ''),
        match[1],
        match[2],
        match[3],
        isMoon
    ];
}

define([], function () {
    "use strict";
    function hexKeyFromCodePoint (charCode) {
        var hex = charCode.toString(16).toUpperCase();
        // it's only 0 padded when shorter than 4 chars
        return '0000'.slice(hex.length) + hex;
    }

    return hexKeyFromCodePoint;
});

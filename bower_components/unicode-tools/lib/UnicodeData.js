define([
    'require/text!./ucd/UnicodeData.txt'
  , './UnicodeChar'
  , './tools/hexKeyFromCodePoint'
], function (
    unicodeData
  , UnicodeChar
  , hexKeyFromCodePoint
) {
    "use strict";

    /**
     * This acts as a placeholder, the Char is initialized when first
     * requested.
     */
    function CharDataPointer(lineStart, lineEnd) {
        this._start = lineStart;
        this._end = lineEnd;
    }
    CharDataPointer.prototype = Object.create(null);
    CharDataPointer.prototype.getData = function() {
        return unicodeData.slice(this._start, this._end).trim();
    };

    function UnicodeData() {
        this._chars = this._initChars(unicodeData);
    }
    var _p = UnicodeData.prototype;

    // factory or constructor, must return or create a new Object
    _p._CharConstructor = UnicodeChar.FromString;

    _p._initChars = function (unicodeData) {
        var chars = Object.create(null)
          , index = 0
          , lbr, line, data
          , key
          , pointer
          ;

        while(true) {
            lbr = unicodeData.indexOf('\n', index);
            if(lbr === -1)
                break;
             if(index === lbr || unicodeData[index] === '#')
                continue;

            pointer = new CharDataPointer(index, lbr);

            // prepare next iteration
            index = lbr + 1;

            line = pointer.getData();
            key = line.slice(0, line.indexOf(';')).trim();
            // Assertion, turned of because it did not yield. Turn on when in doubt.
            // This basically tests the hexKeyFromCodePoint function to create the
            // same keys as unicode uses
            //if(key !== hexKeyFromCodePoint(parseInt(key, 16)))
            //    throw new Error('hexKeyFromCodePoint is broken: '
            //                + key + ' => '
            //                + parseInt(key, 16) + ' => '
            //                + hexKeyFromCodePoint(parseInt(key, 16)));
            chars[key] = pointer;
        }

        return chars;
    };

    _p.get = function(codePoint, fallback) {
        var key, data;
        key = hexKeyFromCodePoint(codePoint)
        data = this._chars[key];
        if(data === undefined) {
            if(typeof codePoint !== 'number' || codePoint < 0
                            || codePoint !== (codePoint | 0))
                // TypeError
                throw new Error('codePoint must be a positive integer, it\'s: '
                                    + (typeof codePoint) + ' ' + codePoint);
            if(arguments.length >= 2)
                return fallback;
            // KeyError
            throw new Error('codePoint  ' + codePoint + ' (U+' + key + ') not found.');
        }
        // FIXME: are there use cases where we rather don't want to persist
        // the Char object, e.g. because of memory usage?
        if(data instanceof CharDataPointer)
            // initialize the Char
            this._chars[key] = data = new this._CharConstructor(data.getData());

        return data;
    };

    return UnicodeData;
});

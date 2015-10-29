define([], function () {
    "use strict";
    function UnicodeBlock(name, lower, upper) {
        // assert lower <= upper
        if(lower > upper)
            // ValueError
            throw new Error('`lower` ' + lower + ' is bigger than `upper` ' + upper);

        Object.defineProperties(this, {
            name: {
                value: name
              , enumerable: true
            }
          , lower: {
                value: lower
              , enumerable: true
            }
          , upper: {
                value: upper
              , enumerable: true
            }
            // Binary Tree Item API
          , left: {
                value: null
              , writable: true
              , enumerable: false
            }
          , right: {
                value: null
              , writable: true
              , enumerable: false
            }
        });
    }
    var _p = UnicodeBlock.prototype;

    _p.compare = function(other) {
        if(other.lower > this.upper)
            // other is bigger
            return 1;
        else if(other.upper < this.lower)
            // other is smaller
            return -1;
        else
            // unless this is the same, it should not happen
            return 0;
    };

    _p.contains = function(unicode) {
        if(unicode > this.upper)
            // unicode is bigger
            return 1;
        else if(unicode < this.lower)
            // unicode is smaller
            return -1;
        else
            // this is contained
            return 0;
    };

    return UnicodeBlock;
});

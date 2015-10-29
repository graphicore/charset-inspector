define([
    'require/text!./ucd/Blocks.txt'
  , './tools/BinarySearchTree'
  , './UnicodeBlock'
], function(
    blocksData
  , BinarySearchTree
  , UnicodeBlock
) {
    "use strict";

    function _parseHex(text){return parseInt(text, 16);}

    function initBlocks(blocksData, BlockConstructor) {
        var blocks = []
          , index = 0
          , parseHex = _parseHex
          , lbr, line, blockData, range, name
          ;

        while(true) {
            lbr = blocksData.indexOf('\n', index);
            if(lbr === -1)
                break;

            line = blocksData.slice(index, lbr);
            index = lbr+1;
            if(line.length === 0 || line[0] === '#')
                continue;

            blockData = line.split(';');
            range = blockData[0].split('..').map(parseHex);
            name = blockData[1].trim();
            blocks.push(new BlockConstructor(name, range[0], range[1]));
        }
        return blocks;
    }

    function UnicodeBlocks() {
        Object.defineProperty(this, 'blocks', {
            value: initBlocks(blocksData, this._BlockConstructor)
          , enumerable: true
        });

        var binTree = BinarySearchTree.FromOrderedListFactory(this.blocks);
        Object.defineProperty(this, 'findBlock', {
            value: binTree.findBlock.bind(binTree)
          , enumerable: true
        });
    }

    var _p = UnicodeBlocks.prototype;

    // factory or constructor, must return or create a new Object
    _p._BlockConstructor = UnicodeBlock;

    UnicodeBlocks.initBlocks = initBlocks;

    return UnicodeBlocks;
});

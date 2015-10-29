define([
    'unicode-tools/UnicodeBlocks'
  , 'unicode-tools/UnicodeData'
  , 'unicode-tools/tools/hexKeyFromCodePoint'
  , 'charset-inspector/dom-tool'
], function(
    UnicodeBlocks
  , UnicodeData
  , hexKeyFromCodePoint
  , dom
) {
    "use strict";
    var unicodeBlocks = new UnicodeBlocks()
      , unicodeData = new UnicodeData()
      ;

    function charsFromNam(nam) {
        var data = nam.split('\n')
          , i,l,hex,codePoint
          , result = []
          ;
        for(i=0,l=data.length;i<l;i++) {
            if(data[i].indexOf('0x') !== 0)
                continue;
            hex = data[i].slice(2, data[i].indexOf(' ')).trim();
            codePoint = parseInt(hex, 16);
            if(codePoint!==codePoint)//NaN
                continue;
            result.push(codePoint);
        }
        return result;
    }

    function charsFromGlyphs(glyphs) {
        var data = glyphs.split('\n')
          , i,l,hex,codePoint
          , result = []
          ;
        for(i=0,l=data.length;i<l;i++) {
            hex = data[i].split(';')[0].trim();
            codePoint = parseInt(hex, 16);
            if(codePoint!==codePoint)//NaN
                continue;
            result.push(codePoint);
        }
        return result;
    }

    function makeCell(codePoint) {
        var notDefChar = null
          , char = unicodeData.get(codePoint, notDefChar)
          , cell, showChar, hex, content
          ;
        if(char === notDefChar) {
            cell = dom.createElement('td', {'class':'not-def', title: '<not defined>'});
            showChar =  String.fromCodePoint(codePoint);
            hex = hexKeyFromCodePoint(codePoint);
        }
        else {
            cell = dom.createElement('td', {title: char.name});
            showChar = char.name[0] !== '<' ? char.char : '[-]';
            hex = char.hex;
        }
        content = '<strong class="char-view">'+ showChar +'</strong><em>'+ hex +'</em>';
        dom.appendHTML(cell, content);
        return cell;
    }

    function _makeVerticalLayout (block, headerRow, tbody) {
        var codePoint, upper, row, hex, cell;

        // empty first item, because of row headers
        dom.createChildElement(headerRow, 'th');

        // row headers
        for(row=0x0;row<0x10;row++) {
            dom.createChildElement(tbody, 'tr');
            dom.createChildElement(tbody.children[row], 'th', null, row.toString(16).toUpperCase());
        }

        for(codePoint=block.lower,upper=block.upper;codePoint<=upper;codePoint++) {
            hex = hexKeyFromCodePoint(codePoint);
            row = codePoint % 0x10;

            if(row === 0)
                 dom.createChildElement(headerRow, 'th', null, hex.slice(0,-1));

            cell = makeCell(codePoint);
            tbody.children[row].appendChild(cell);
        }
    }

    function _makeHorizontalLayout (block, headerRow, tbody) {
        var codePoint, upper, col, row, hex, cell;

        // empty first item, because of row headers
        dom.createChildElement(headerRow, 'th');


        // columnHeaders
        for(col=0x0;col<0x10;col++)
            dom.createChildElement(headerRow, 'th', null, col.toString(16).toUpperCase());

        for(codePoint=block.lower,upper=block.upper;codePoint<=upper;codePoint++) {
            hex = hexKeyFromCodePoint(codePoint);
            col = codePoint % 0x10;

            if(col === 0) {
                row = dom.createChildElement(tbody, 'tr');
                // row header
                dom.createChildElement(row, 'th', null, hex.slice(0,-1));
            }

            cell = makeCell(codePoint);
            row.appendChild(cell);
        }
    }

    function makeBlockTable(block, horizontal) {
        var table = dom.createElement('table', {'class': 'code-block'})
          , thead = dom.createChildElement(table, 'thead')
          , headerRow = dom.createChildElement(thead, 'tr')
          , tbody = dom.createChildElement(table, 'tbody')
          ;
        dom.createChildElement(table, 'caption', null, block.name);

        if(horizontal)
            _makeHorizontalLayout(block, headerRow, tbody);
        else
            _makeVerticalLayout(block, headerRow, tbody);

        return table;
    }



    function UnicodeBlockRenderer(horizontal) {
        this._horizontal = true;
        this._blocks = null;
        this._blockRegistry = null;
        this._blockTables = null;
        this._blockCache = null;
        this.reset();
    }

    var _p = UnicodeBlockRenderer.prototype;

    _p._getBlock = function (codePoint) {
        var block = unicodeBlocks.findBlock(codePoint);


        if(!(block.lower in this._blockRegistry)) {
            this._blockRegistry[block.lower] = true;
            this._blocks.push(block);
        }

        return block;
    };

    _p._getBlockTable = function (block) {
        var table = this._blockTables[block.lower];
        if(!table)
            this._blockTables[block.lower] = table = makeBlockTable(block, this._horizontal);
        return table;
    };

    _p._getBlockTableCharItem = function (codePoint, blockHistory) {
        var block = this._getBlock(codePoint, blockHistory)
          , table = this._getBlockTable(block)
          , body = table.getElementsByTagName('tbody')[0]
          , row, column, hf, lf // `high frequency` and `low frequency`
          ;

        hf = codePoint % 0x10;
        lf = ((codePoint - block.lower) / 0x10) | 0;


        if(this._horizontal) {
            // the high freqency of change is in the horizontal axis
            row = lf;
            column = hf;
        }
        else {
            // the high freqency of change is in the vertical axis
            row = hf;
            column = lf;
        }
        // column + 1 offset because of initial th
        return body.children[row].children[column + 1];
    };

    _p.markChars = function (marker, characterSet) {
        var field,i,l,codePoint, blockHistory=[];

        for(i=0,l=characterSet.length;i<l;i++) {
            codePoint = characterSet[i];
            field = this._getBlockTableCharItem(codePoint, blockHistory);
            field.classList.add(marker);
        }
    };

    _p.appendTo = function (elem) {
        var i,l,table;

        this._blocks.sort(function(a,b){return b.compare(a);});

        for(i=0,l=this._blocks.length;i<l;i++) {
            table = this._getBlockTable(this._blocks[i]);
            elem.appendChild(table);
        }
    };

    _p.reset = function() {
        var k, table, tables = this._blockTables || {};

        for(k in tables) {
            table = tables[k];
            if(table.parentElement)
                table.parentElement.removeChild(table);
        }
        this._blockRegistry = Object.create(null);
        this._blocks = [];
        this._blockTables = Object.create(null);
    };

    return UnicodeBlockRenderer;
});

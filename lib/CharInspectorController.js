define([
    'charset-inspector/dom-tool'
  , 'charset-inspector/UnicodeBlockRenderer'
  , 'opentype'
], function(
    dom
  , UnicodeBlockRenderer
  , opentype
) {
    "use strict";
    /*global FileReader document*/

    // todo : predefined ufo -> needs io (is in ufojs!) useful for git based ufo projects
    // todo : ufoz: needs ziputil/memoryio/ufojs
    // todo : glyphs [NEEDS nsplist-js]
    // todo : sfd, sfdir, sfdirz
    function charsFromNam(nam) {
        var data = nam.split('\n')
          , i,l,hex,codePoint, char
          , result = []
          ;
        for(i=0,l=data.length;i<l;i++) {
            char = data[i].split('#')[0];
            if(char.indexOf('0x') !== 0)
                continue;
            hex = char.slice(2).trim();
            codePoint = parseInt(hex, 16);
            if(codePoint!==codePoint)//NaN
                continue;
            result.push(codePoint);
        }
        return result;
    }

    function charsFromUCDFile(str) {
        var data = str.split('\n')
          , result = []
          , i,l,item,range,codePoint,upper
          ;

        function parseHex(str){return parseInt(str, 16);}
        function filterNaN(codepoint){ return codepoint === codepoint; }
        // TODO:
        // and add each char for that block
        for(i=0,l=data.length;i<l;i++) {
            item = data[i].split(';')[0].trim();
            // detect single chars, like "004A;J"
            // detect blocks as in "0080..00FF; Latin-1 Supplement"
            range = item.split('..')
                .slice(0, 2)
                .map(parseHex)
                .filter(filterNaN)
                ;

            if(range.length === 1)
                result.push(range[0]);
            else
                for(codePoint=range[0],upper=range[1];codePoint<=upper;codePoint++)
                    result.push(codePoint);
        }
        return result;
    }

    function charsFromFontFile(arrBuf) {
        var font = opentype.parse(arrBuf)
          , i,l,unicode
          , result =[]
          ;
        for(i=0,l=font.glyphs.length;i<l;i++)
            Array.prototype.push.apply(result, font.glyphs.get(i).unicodes);
        return result;
    }

    function getCharset(dataType, data) {
        switch(dataType) {
            case('ucd'):
                return charsFromUCDFile(data);
            case('nam'):
                return charsFromNam(data);
            case('ttf'):
            case('otf'):
            case('woff'):
                return charsFromFontFile(data);
            default:
                throw new Error('Unknown dataType:' + dataType);
        }
    }

    function makeLegend(arr) {
        var container = dom.createElement('aside', {'class': 'legend'})
          , heading = dom.createChildElement(container, 'h2', {'class': 'heading'}, 'Legend')
          , parent = dom.createChildElement(container, 'dl')
          , i, l, item
          ;
        heading.addEventListener('click', function(evt){container.classList.toggle('hidden');});
        for(i=0,l=arr.length;i<l;i++) {
            item = arr[i];
            dom.createChildElement(parent, 'dt', {'class': item[0]}, item[1]);
            dom.createChildElement(parent, 'dd', null, item[2]);
        }
        return container;
    }

    function CharInspectorController(predefined) {
        this._blockRenderer = new UnicodeBlockRenderer(true);
        this.blocksContainer = dom.createElement('article', null, [
            dom.createElement('header', null, [
                dom.createElement('h1', null, 'Unicode Blocks')
            ])
        ]);

        // todo: hide only when autoloading
        this.menu = dom.createElement('aside', {'class':'ctrl'});

        var toggle = dom.createChildElement(this.menu, 'h2', {'class':'heading'}, 'Change Charsets')
          , menuContainer = dom.createChildElement(this.menu, 'div', {'class':'form'})
          ;

        toggle.addEventListener('click', (function(){this.classList.toggle('hidden');}).bind(this.menu));

        dom.createChildElement(menuContainer, 'p', null, 'Configure the charsets for comparison.');

        this._sources = {
                credit: {data: {}}
              , debit: {data: {}}
        };

        var k, pre, labels = {credit: 'Required Charset', debit: 'Provided Charset'}, result;

        for(k in this._sources) {
            pre = predefined && predefined[k] || [];
            result = this._makeSourceForm(k, labels[k], pre[0], pre[1]);
            this._sources[k].elem = result[0];
            this._sources[k].radios = result[1];
            menuContainer.appendChild(this._sources[k].elem);
        }
        menuContainer.appendChild(this._sources[k].elem);

        var update = dom.createChildElement(menuContainer, 'button', {'class': 'update'}, 'update');
        update.addEventListener('click', this.update.bind(this));

        this.legend = makeLegend(this._legend);
    }

    var _p = CharInspectorController.prototype;

    _p._legend = [
          ['', 'unicode', 'This is in Unicode but neither requested nor required.']
        , ['debit', 'surplus', 'This is provided but not required.']
        , ['credit', 'missing', 'This is required but not provided. Bad.']
        , ['debit credit', 'good', 'This is required and provided. Good.']
        , ['not-def', 'not defined', 'This is not defined in Unicode OR not yet supported by the Unicode library (like PUA or CJK).']
        , ['not-def debit', 'not defined + surplus', 'May be an error on the side of the fulfilment.']
        , ['not-def credit', 'not defined + missing', 'May be an error on the side of the request.']
        , ['not-def debit credit', 'not defined + good', 'Probably not yet supported by the unicode library (like PUA or CJK).']
    ];

    _p.showCharsetsControl = function(show) {
        this.menu.classList[show || show===undefined ? 'remove' : 'add']('hidden');
    };

    _p.showLegend = function(show){
        this.legend.classList[show || show===undefined ? 'remove' : 'add']('hidden');
    }

    _p.update = function() {
        // load charsets from all sources
        var k, data
            // initially 1 to block not asunchronous callbacks from
            // calling this._update to early
          , counter=1
          , done
          ;

        done = function () {
            /*jshint validthis:true*/
            counter -= 1;
            if(counter === 0)
                this._update();
        }.bind(this);

        for(k in this._sources) {
            data = this._getActiveSourceData(k);
            if(typeof data === 'function') {
                counter++;
                data(done);
            }
        }

        // unblock and run this._update immediateley if counter === 0
        done();
    };

    _p._update = function update() {
        this._blockRenderer.reset();
        for(var k in this._sources)
            this._blockRenderer.markChars(k, this._getCharsetFromSource(k));

        // place the tables into the document
        var frag = document.createDocumentFragment();
        this._blockRenderer.appendTo(frag);
        this.blocksContainer.appendChild(frag);
    };

    _p._makeSourceRadio = function(name, value) {
        return dom.createElement('input', {type: 'radio', name: name, value:  value});
    };

    _p._makeSourcePredefinedInput = function(items, selected, callback, activate) {
        var select = dom.createElement('select')
          , i,l,attr,label
          ;

        for(i=0,l=items.length;i<l;i++) {
            attr = {value:items[i]};
            if(i === selected)
                attr.selected = 'selected';
            label = items[i].slice(items[i].lastIndexOf('/') + 1);
            dom.createChildElement(select, 'option', attr, label);
        }

        function delayedLoading(fileName, done) {
            var type = fileName.slice(fileName.lastIndexOf('.')+1);
            require(['require/text!' + fileName], function(data) {
                callback(type, data);
                done();
            });
        }

        function onChange(e) {
            /*jshint validthis:true*/
            if(e) activate();
            var fileName = this.value;
            callback(delayedLoading.bind(null, fileName));
        }

        select.addEventListener('change', onChange);

        if(select.selectedIndex === selected)
            onChange.call(select, false);

        return select;
    };

    _p._makeSourceFileInput = function(callback, activate) {
        var container = dom.createElement('div', {'class': 'file-input'},[
                    dom.createElement('p',{'class': 'label'},'Drop a file or click to load '
                                +'one (*.ttf, *.otf, *.woff, *.nam, *.ucd).')
                ])
          , noFile =  '(empty)'
          , report = dom.createChildElement(container, 'p', {'class': 'current'}, 'Current: ')
          , status = dom.createChildElement(report, 'em', null, noFile)
          , fileInput = dom.createChildElement(container, 'input', {type: 'file'})
          , binaryTypes = {woff:true, otf:true, ttf:true}
          , textTypes = {nam:true, ucd:true}
          ;
        fileInput.style.display = 'none'; // can be hidden!

        function getType(file) {
            // TODO: use MIME file.type when available
            var type = file.name.slice(file.name.lastIndexOf('.')+1);
            if(!(type in binaryTypes) && !(type in textTypes))
                return null;
            return type;
        }

        function delayedLoading(files, done) {
            var file = files[0]
              , reader = new FileReader()
              , type = getType(file)
              ;
            reader.onload = function(e) {
                callback(type, reader.result);
                done();
            };

            if(!type)
                throw new Error('Type must be validated at this point: ' + file.name + ' ' + type);
            else if(type in binaryTypes)
                reader.readAsArrayBuffer(file);
            else if(type in textTypes)
                reader.readAsText(file);
            else
                throw new Error('Can\'t read ' + type);
        }

        function handleFiles(files) {
            // TODO: if this fails, unset the data

            // TODO: we should allow multiple selection
            // so we could make a super set from many sources
            var file, type;
            if(!files.length) {
                callback(false);
                status.textContent = noFile;
                return;
            }

            file = files[0];
            type = getType(file);
            if(!type) {
                callback(false);
                status.textContent = 'unsupported type: ' +file.name;
                return;
            }
            activate();
            status.textContent = file.name;
            callback(delayedLoading.bind(null, files));
        }

        // for the file dialogue
        function fileInputChange(e) {
            /*jshint validthis:true*/
            handleFiles(this.files);
        }
        function forwardClick(e) {
            // forward the click => opens the file dialogue
            fileInput.click();
        }

        // for drag and drop
        function noAction(e) {
            e.stopPropagation();
            e.preventDefault();
        }
        function drop(e) {
            e.stopPropagation();
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
        }

        fileInput.addEventListener('change', fileInputChange);
        container.addEventListener('click', forwardClick);
        container.addEventListener("dragenter", noAction);
        container.addEventListener("dragover", noAction);
        container.addEventListener("drop", drop);

        return container;
    };

    _p._makeSourceForm = function(type, label, predefinedSources, selected) {
        var form = dom.createElement('div', {'class':'source '+type}, [
                    dom.createElement('h3',null,label)
            ])
          , radioName = type + 'Source'
          , radio, input
          , radios= []
          , sources = []
          , i,l,sourceType,item
          , hasChecked = false
          , result = [form, radios]
          ;

        if(predefinedSources && predefinedSources.length) {
            sourceType = 'predefined';
            input = this._makeSourcePredefinedInput(predefinedSources, selected
                            , this._dataSourceSetter.bind(this, type,  sourceType)
                            , this._activateSource.bind(this, type, sourceType)
                    );
            sources.push([sourceType, input
                    // if hasChecked is already true, don't check. Otherwiese
                    // if selectedIndex is selected check and set hasChecked to true
                    , (hasChecked ? false : (hasChecked = input.selectedIndex === selected))
                    ]);
        }

        sourceType = 'file';
        input = this._makeSourceFileInput(
                        this._dataSourceSetter.bind(this, type, sourceType)
                      , this._activateSource.bind(this, type, sourceType)
            );

        sources.push([sourceType, input, !hasChecked]);
        sources.push(['none', dom.createElement('p', null, 'no charset')]);

        for(i=0,l=sources.length;i<l;i++) {
            item = sources[i];
            sourceType = item[0];
            input = item[1];
            radio = this._makeSourceRadio(radioName, sourceType);
            if(item[2])
                radio.checked = true;
            radios.push(radio);
            dom.createChildElement(form, 'div', {'class': 'source-type '+sourceType}
                                , [radio, input]);
        }

        return result;
    };

    _p._activateSource = function(source, key) {
        var item = this._sources[source]
          , i,l
          ;
        for(i=0,l=item.radios.length;i<l;i++) {
            if(item.radios[i].value === key) {
                item.radios[i].checked = true;
                return;
            }
        }
    };

    _p._dataSourceSetter = function (type, key, dataType, data) {
        var charset;
        if(typeof dataType === 'function')
            // delayed loading
            charset = dataType;
        else if(dataType !== false)
            charset = getCharset(dataType, data);
        else
            charset = [];
        this._sources[type].data[key] = charset;
    };

    _p._getActiveSourceKey = function(source) {
        var item = this._sources[source]
          , i,l,key,value
          ;
        for(i=0,l=item.radios.length;i<l;i++) {
            if(!item.radios[i].checked)
                continue;
            return item.radios[i].value;
        }
        return null;
    };

    _p._getActiveSourceData = function(source) {
        var key = this._getActiveSourceKey(source), value;
        if(!key)
            return null;
        return this._sources[source].data[key];
    };

    _p._getCharsetFromSource = function(source) {
        var value = this._getActiveSourceData(source);
        if(!value)
            return [];

        if(typeof value === 'function')
            throw new Error('Delayed loading was required by ' + source
                        + ':'+ this._getActiveSourceKey(source)
                        + ' but not performed');
        return value;
    };

    return CharInspectorController;
});

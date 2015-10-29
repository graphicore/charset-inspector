require.config({
    baseUrl: './'
  , paths: {
        'require/domReady': 'bower_components/requirejs-domready/domReady'
      , 'require/text': 'bower_components/text/text'
      , 'require/domready': 'bower_components/requirejs-domready/domReady'
      , 'unicode-tools': 'bower_components/unicode-tools/lib'
      , 'marked': 'bower_components/marked/lib/marked'
      , 'charset-inspector': 'lib'
      , 'opentype': 'bower_components/opentype.js/dist/opentype.min'
    }
});

if(!require.specified('setup'))
    define('setup', [], function() {return {};});
    // example setup
    //return {
    //    showControls: false
    //  , showLegend: false
    //  , dropDownFiles: {}
    //}



require([
    'require/domready'
  , 'charset-inspector/CharInspectorController'
  , 'setup'
], function(
    domReady
  , CharInspectorController
  , setup
) {
    "use strict";
    domReady(function() {
        var ctrl = new CharInspectorController(setup.dropDownFiles)
          , host = document.getElementsByTagName('main')[0]
          ;
        host.appendChild(ctrl.menu);
        host.appendChild(ctrl.legend);

        host.appendChild(ctrl.blocksContainer);

        ctrl.showCharsetsControl(setup.showControls);
        ctrl.showLegend(setup.showLegend);
        // if there is a preset we can show it right away
        setTimeout(ctrl.update.bind(ctrl));
    });
});

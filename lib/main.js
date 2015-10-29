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

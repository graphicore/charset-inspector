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
/* example setup
    return {
        showControls: false
      , showLegend: false
      , dropDownFiles: {
            // [[array of filenames], slected index]
            credit: [
                [
                    'example-encodings/arabic_unique-glyphs.nam'
                  , 'example-encodings/cyrillic-ext_unique-glyphs.nam'
                  , 'example-encodings/cyrillic_unique-glyphs.nam'
                  , 'example-encodings/devanagari_unique-glyphs.nam'
                  , 'example-encodings/greek-ext_unique-glyphs.nam'
                  , 'example-encodings/greek_unique-glyphs.nam'
                  , 'example-encodings/hebrew_unique-glyphs.nam'
                  , 'example-encodings/khmer_unique-glyphs.nam'
                  , 'example-encodings/lao_unique-glyphs.nam'
                  , 'example-encodings/latin-ext_unique-glyphs.nam'
                  , 'example-encodings/latin_unique-glyphs.nam'
                  , 'example-encodings/myanmar_unique-glyphs.nam'
                  , 'example-encodings/telugu_unique-glyphs.nam'
                  , 'example-encodings/vietnamese_unique-glyphs.nam'
                ]
              , 0 //selected item, if one should be selected, else leave blank
            ]
            // same structure as credit
            , debit: [
                [
                    'example-encodings/block.ucd'
                  , 'example-encodings/amiri.ucd'

                ]
              , 1
            ]
        }
    };
*/

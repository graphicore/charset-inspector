# Character Set Inspector
Visualize and compare unicode encoded character sets.

Drop the fonts/files into the browser and render unicode charts for them. **The tool is 100% client side, so your data stays on your computer.**

### Disclaimer

This is early stage. So things may not be as easy as they could be and some things don't work at all right now. Contributions are welcome!

## Install

You probably wont need to install this because there is a [version online](http://graphicore.github.io/charset-inspector/).

However, there are different ways how **C**haracter **S**et **I**nspector can be deployed. See:

 * [index.html](https://github.com/graphicore/charset-inspector/blob/master/index.html) for the simplest example: [online](http://graphicore.github.io/charset-inspector/)
 * [setup-example.html](https://github.com/graphicore/charset-inspector/blob/master/setup-example.html) has predefined charsets available via select menus: [online](http://graphicore.github.io/charset-inspector/setup-example.html)
 * [Mirza Character Set](https://github.com/graphicore/Mirza/blob/gh-pages/html/character-set.html) installation via `bower install charset-inspector` with some custom setup:  [online](http://graphicore.github.io/Mirza/html/character-set.html)

## Supported Files / Character Set Source Formats

`*.woff`, `*.otf`, `*.ttf` are supported via drag & drop,

`*.nam`, `*.ucd` are supported as presets and as drag & drop.


### Format `*.ucd`

I made this suffix up for **U**nicode **C**haracter **D**atabase which has a similar format [browse here](http://www.unicode.org/Public/UCD/latest/ucd/)

* lines that start with # are skipped
* lines that are empty are skipped
* everything after `;` in a line is skipped

You can specify code-points or ranges using hexadecimal characters:

* *code-point* `0041` as in e.g. [Jamo.txt](http://www.unicode.org/Public/UCD/latest/ucd/Jamo.txt)
* *range* `0041..0052` as in e.g. [Blocks.txt](http://www.unicode.org/Public/UCD/latest/ucd/Blocks.txt)

example:

```
03A8;GREEK CAPITAL LETTER PSI;Lu;0;L;;;;;N;;;;03C8;
0000..007F; Basic Latin
0080..00FF; Latin-1 Supplement
0530..058F; Armenian
0590..05FF; Hebrew
0600..06FF; Arabic
1200..137F
0600
0601
0602
;this line is skipped, it has no code point
```

### Format `*.nam`
These files usually come from [google/fonts/tools/encodings](https://github.com/google/fonts/tree/master/tools/encodings)

and look like this:

```
0x0600 # ARABIC NUMBER SIGN
0x0601 # ARABIC SIGN SANAH
0x0602 # ARABIC FOOTNOTE MARKER
```

i.e. line separated, a code point is the first thing in a line and starts with `0x` then some hexadecimal characters.


Most minimal would be:

```
0x0600
0x0601
0x0602
```

If you need information after the code point use `#`.

## TODO:

* Support all character set source formats as preset and as drag and drop. [easy]
* Support editor formats as sources: `ufo`, `ufoz`, `glyphs`, `sfd`, `sfdir`
* Use provided fonts to render available glyphs.
* Use maybe some fallback font like [GNU Unifont](http://unifoundry.com/unifont.html)



## License

This Software is GPLv3. (C) 2015 Lasse Fister


The most files from the `example-encodings` directory belong to https://github.com/google/fonts [here](https://github.com/google/fonts/tree/master/tools/encodings)

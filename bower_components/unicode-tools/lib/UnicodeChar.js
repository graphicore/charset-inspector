define([
    './tools/hexKeyFromCodePoint'
], function (
    hexKeyFromCodePoint
) {
    "use strict";

    // FIXME: this incomplete, I only implemented what I needed


    function UnicodeCharFromUnicodeDataLine(data) {
        return UnicodeChar.FromArray(data.split(';'));
    }

    function UnicodeCharFromUnicodeDataArray(data) {
        var char = Object.create(UnicodeChar.prototype);
        UnicodeChar.apply(char, data);
        return char;
    }

    /**
     * See: http://unicode.org/reports/tr44
     *
     * Second Column:
     *
     * Catalog           C     e.g. Age, Block
     *                         Catalog properties have enumerated values which are expected to be regularly extended in successive versions of the Unicode Standard. This distinguishes them from Enumeration properties.
     * Enumeration       E     e.g. Joining_Type, Line_Break
     *                         Enumeration properties have enumerated values which constitute a logical partition space; new values will generally not be added to them in successive versions of the standard.
     * Binary            B     e.g. Uppercase, White_Space
     *                         Binary properties are a special case of Enumeration properties, which have exactly two values: Yes and No (or True and False).
     * String            S     e.g. Uppercase_Mapping, Case_Folding
     *                         String properties are typically mappings from a Unicode code point to another Unicode code point or sequence of Unicode code points; examples include case mappings and decomposition mappings.
     * Numeric           N     e.g. Numeric_Value
     *                         Numeric properties specify the actual numeric values for digits and other characters associated with numbers in some way.
     * Miscellaneous     M     e.g. Name, Jamo_Short_Name
     *                         Miscellaneous properties are those properties that do not fit neatly into the other property categories; they currently include character names, comments about characters, the Script_Extensions property, and the Unicode_Radical_Stroke property (a combination of numeric values) documented in Unicode Standard Annex #38, "Unicode Han Database (Unihan)" [UAX38].
     *
     * Third Column:
     *
     * This column indicates the status of the property:
     *      [N]ormative
     *      [I]nformative
     *      [C]ontributory
     *      [P]rovisional.
     *
     *
     *
     * Each line of data consists of fields separated by semicolons. The fields are numbered starting with zero.
     * The first field (0) of each line in the Unicode Character Database files represents a code point or range. The remaining fields (1..n) are properties associated with that code point.
     *
     * Table 9. Property Table for UnicodeData.txt
     * http://unicode.org/reports/tr44/#UnicodeData.txt
     *
     * Name                         M       N   (1) These names match exactly the names published in the code charts of the Unicode Standard. The derived Hangul Syllable names are omitted from this file; see Jamo.txt for their derivation.
     * General_Category             E       N   (2) This is a useful breakdown into various character types which can be used as a default categorization in implementations. For the property values, see General Category Values.
     * Canonical_Combining_Class    N       N   (3) The classes used for the Canonical Ordering Algorithm in the Unicode Standard. This property could be considered either an enumerated property or a numeric property: the principal use of the property is in terms of the numeric values. For the property value names associated with different numeric values, see DerivedCombiningClass.txt and Canonical Combining Class Values.
     * Bidi_Class                   E       N   (4) These are the categories required by the Unicode Bidirectional Algorithm. For the property values, see Bidirectional Class Values. For more information, see Unicode Standard Annex #9, "Unicode Bidirectional Algorithm" [UAX9]. The default property values depend on the code point, and are explained in DerivedBidiClass.txt
     * Decomposition_Type,
     * Decomposition_Mapping        E, S    N   (5) This field contains both values, with the type in angle brackets. The decomposition mappings exactly match the decomposition mappings published with the character names in the Unicode Standard. For more information, see Character Decomposition Mappings.
     * Numeric_Type,
     * Numeric_Value                E, N    N   (6) If the character has the property value Numeric_Type=Decimal, then the Numeric_Value of that digit is represented with an integer value (limited to the range 0..9) in fields 6, 7, and 8. Characters with the property value Numeric_Type=Decimal are restricted to digits which can be used in a decimal radix positional numeral system and which are encoded in the standard in a contiguous ascending range 0..9. See the discussion of decimal digits in Chapter 4, Character Properties in [Unicode].
     *                              E, N    N   (7) If the character has the property value Numeric_Type=Digit, then the Numeric_Value of that digit is represented with an integer value (limited to the range 0..9) in fields 7 and 8, and field 6 is null. This covers digits that need special handling, such as the compatibility superscript digits.
     *                                              Starting with Unicode 6.3.0, no newly encoded numeric characters will be given Numeric_Type=Digit, nor will existing characters with Numeric_Type=Numeric be changed to Numeric_Type=Digit. The distinction between those two types is not considered useful.
     *                              E, N    N   (8) If the character has the property value Numeric_Type=Numeric, then the Numeric_Value of that character is represented with a positive or negative integer or rational number in this field, and fields 6 and 7 are null. This includes fractions such as, for example, "1/5" for U+2155 VULGAR FRACTION ONE FIFTH.
     *                                              Some characters have these properties based on values from the Unihan data files. See Numeric_Type, Han.
     * Bidi_Mirrored                B       N   (9) If the character is a "mirrored" character in bidirectional text, this field has the value "Y"; otherwise "N". See Section 4.7, Bidi Mirrored of [Unicode]. Do not confuse this with the Bidi_Mirroring_Glyph property.
     * Unicode_1_Name
     * (Obsolete as of 6.2.0)       M       I   (10) Old name as published in Unicode 1.0 or ISO 6429 names for control functions. This field is empty unless it is significantly different from the current name for the character. No longer used in code chart production. See Name_Alias.
     * ISO_Comment (Obsolete as
     * of 5.2.0; Deprecated and
     * Stabilized as of 6.0.0)      M       I   (11) ISO 10646 comment field. It was used for notes that appeared in parentheses in the 10646 names list, or contained an asterisk to mark an Annex P note.
     *                                               As of Unicode 5.2.0, this field no longer contains any non-null values.
     * Simple_Uppercase_Mapping     S       N   (12) Simple uppercase mapping (single character result). If a character is part of an alphabet with case distinctions, and has a simple uppercase equivalent, then the uppercase equivalent is in this field. The simple mappings have a single character result, where the full mappings may have multi-character results. For more information, see Case and Case Mapping.
     * Simple_Lowercase_Mapping     S       N   (13) Simple lowercase mapping (single character result).
     * Simple_Titlecase_Mapping     S       N   (14) Simple titlecase mapping (single character result).
     *                                               Note: If this field is null, then the Simple_Titlecase_Mapping is the same as the Simple_Uppercase_Mapping for this character.
     *
     *
     * Table 4. Default Values for Properties
     *
     * Property Name                Default Value(s)
     * Age                          unassigned
     * Bidi_Class                   L, AL, R, BN, ET
     * Block                        No_Block
     * Canonical_Combining_Class    Not_Reordered (= 0)
     * Decomposition_Type           None
     * East_Asian_Width             Neutral (= N), Wide (= W)
     * General_Category             Cn
     * Line_Break                   Unknown (= XX), ID, PR
     * Numeric_Type                 None
     * Numeric_Value                NaN
     * Script                       unknown (= Zzzz)
     *
     */
    function UnicodeChar(code, name, generalCategory, canonicalCombiningClass
                        , bidiClass, decomposition, numeric_6,numeric_7,numeric_8
                        , bidiMirrored, _unicode1Name, _ISOComment
                        , simpleUppercaseMapping, simpleLowercaseMapping
                        , simpleTitlecase_Mapping
    ) {
        Object.defineProperties(this, {
            codePoint: {
                value: parseInt(code, 16)
              , enumerable: true
            }
          , name: {
                value: name
              , enumerable: true
            }
        });
    }

    var _p = UnicodeChar.prototype;

    UnicodeChar.FromString = UnicodeCharFromUnicodeDataLine;
    UnicodeChar.FromArray = UnicodeCharFromUnicodeDataArray;

    Object.defineProperties(_p, {
        char: {
            get: function(){ return String.fromCodePoint(this.codePoint);}
          , enumerable: true
        }
      , hex: {
            get: function(){ return hexKeyFromCodePoint(this.codePoint);}
          , enumerable: true
        }
        // Numeric Character Reference for HTML, hex in this case
      , ncr: {
            get: function(){ return '&#x' + hexKeyFromCodePoint(this.codePoint) +';';}
          , enumerable: true
        }
    });

    return UnicodeChar;
});

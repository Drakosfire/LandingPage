# Fantasy Fonts for Map Generator

Download WOFF2 versions of these fonts from Google Fonts and place them in this directory:

## Required Fonts

| Font | Download Link |
|------|---------------|
| MedievalSharp | https://fonts.google.com/specimen/MedievalSharp |
| Pirata One | https://fonts.google.com/specimen/Pirata+One |
| Uncial Antiqua | https://fonts.google.com/specimen/Uncial+Antiqua |
| Cinzel | https://fonts.google.com/specimen/Cinzel |
| IM Fell English | https://fonts.google.com/specimen/IM+Fell+English |

## Expected Files

After downloading, rename files to match these names:
- `MedievalSharp-Regular.woff2`
- `PirataOne-Regular.woff2`
- `UncialAntiqua-Regular.woff2`
- `Cinzel-Regular.woff2`
- `IMFellEnglish-Regular.woff2`

## Usage

These fonts are loaded via `/src/styles/map-fonts.css` using `@font-face` declarations.
The `useMapFonts` hook ensures fonts are loaded before rendering text labels.

## License

All fonts are licensed under the Open Font License (OFL).

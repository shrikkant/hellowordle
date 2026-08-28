# Wordbaazi — launch asset masters

All PNGs are sRGB. Source of truth for the mark: `logo_mark.svg` (pure vector, no type).

| File | Size | Notes |
|---|---|---|
| icon_master_1024.png | 1024² | Full-bleed, opaque, square corners, no edge shadow. Glyph inside central 66%. |
| icon_adaptive_foreground.png | 1024², α | Glyph only, within central 66%. |
| icon_adaptive_background.png | 1024² | Solid **#0E7C86** (use the hex directly if you prefer). |
| icon_monochrome.png | 1024², α | Flat white silhouette, W knocked out, same safe zone. |
| splash_logo.png | 1152², α | Teal tile mark for white splash (#FFFFFF). |
| splash_logo_dark.png | 1152², α | Light mark for dark splash (#1E293B). |
| wordmark.svg | vector | Two-tone wordmark, Outfit ExtraBold (SIL Open Font License). Webfont is @imported — outline it before print/embed use. |
| wordmark.png | 2700×612, α | Raster fallback of the same wordmark. |
| feature_graphic_1024x500.png | 1024×500 | Play feature graphic, opaque, content inside inner 80%. |
| logo_mark.svg / logo_mark_light.svg | vector | Mark for light / dark surfaces. |

**Type:** Outfit (Google Fonts, OFL) — geometric sans, ExtraBold for the wordmark, letter-spacing -0.035em.

**Colour-blind safety:** state coding is teal (L≈46) / marigold (L≈72) / charcoal (L≈30) / empty (L≈96) — separated by lightness and by orange↔blue, never by hue alone. No red or green anywhere.

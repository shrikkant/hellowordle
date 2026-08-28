# Wordbaazi — Brand Asset Handoff (Logo, Icons, Splash, Store Graphics)

You are designing the launch assets for **Wordbaazi**, a daily word-guessing game
(iOS + Android + web). Everything below is the brief; the **Deliverables** section
lists the exact files and sizes to hand back.

---

## 1. The product

Wordbaazi is a free daily word puzzle: guess a 5-letter word in 6 tries, letters
flip to reveal how close you are. It has its own identity and word lists — it is
**not** affiliated with Wordle/NYT, and the branding must not imitate theirs
(no serif wordmark, no green/yellow/gray Wordle look, no grid-of-gray-squares clichés
that read as a Wordle clone).

"Baazi" is Hindi/Urdu for a game, a play, a bet — the brand has a warm, playful,
lightly desi personality. In-app win messages are Hinglish: "Chha gaye!",
"Zabardast!", "Shabash!". Think confident and fun, not childish; premium-casual,
like a well-made modern puzzle game.

## 2. Visual identity (already in the product — follow it)

**Palette — "Peacock & Marigold":**

| Role | Color | Hex |
|---|---|---|
| Primary / "correct" | Peacock teal | `#0E7C86` |
| Accent / "present" | Marigold | `#E8A020` |
| Dark neutral / "absent" | Charcoal slate | `#3D4451` |
| Ink (text) | Slate 800 | `#1E293B` |
| Background | White | `#FFFFFF` |

**Core motifs already in the app:**
- Rounded letter tiles (10px-radius rounded squares, solid fill, bold white
  uppercase letter, soft drop shadow).
- Wordmark: bold geometric **sans-serif**, two-tone — "Word" in ink `#1E293B`,
  "baazi" in peacock teal `#0E7C86`. Lowercase "baazi". Never serif.
- The 3D tile-flip reveal animation is the signature moment of the game.

**Suggested logo directions (pick/blend, or propose better):**
1. A single rounded teal tile with a bold white **W**, with a marigold corner
   accent or a second smaller marigold tile tucked behind it.
2. A stylized peacock-feather "eye" formed from rounded tiles in teal + marigold
   + charcoal.
3. A mid-flip tile (slight 3D perspective) showing the reveal moment.

**Accessibility constraint (hard requirement):** the founder and many players are
red-green colour-blind. States and elements must be distinguishable by
**lightness contrast or orange↔blue**, never by hue alone. Teal vs marigold vs
charcoal already works because they differ strongly in lightness — keep that
property in any composition. Avoid red/green pairings entirely.

## 3. Deliverables

All raster files: PNG, sRGB. Use exactly these file names. Vector sources
(SVG or Figma/AI) for the logo and wordmark are strongly appreciated.

### A. App icon
| File | Size | Notes |
|---|---|---|
| `icon_master_1024.png` | 1024×1024 | Full-bleed square, **no transparency, no rounded corners, no drop shadow at the edges** — Apple and Google apply their own masks. Design must survive both a rounded-square (iOS) and circle (Android) crop: keep the glyph well inside the middle ~66%. Must read clearly at 48×48. No word "Wordbaazi" inside the icon — glyph only. |
| `icon_adaptive_foreground.png` | 1024×1024, transparent | Android adaptive icon foreground layer: glyph only, centered, contained within the central 66% (outer 17% per side may be cropped or parallax-shifted). |
| `icon_adaptive_background` | 1024×1024 PNG **or** just a hex value | Solid color preferred (likely `#0E7C86` or white — your call, must contrast the foreground). |
| `icon_monochrome.png` | 1024×1024, transparent | Android 13 themed icon: the glyph as a **single flat white silhouette**, same safe zone as the foreground. |

### B. Splash screen
| File | Size | Notes |
|---|---|---|
| `splash_logo.png` | 1152×1152, transparent | Logo mark (glyph, optionally with wordmark below) for a **centered-logo-on-solid-background** splash. On Android 12+ the OS shows only the icon inside a circle mask — so the mark alone must work; don't rely on the wordmark. Background color for the splash: white `#FFFFFF`. |
| `splash_logo_dark.png` | 1152×1152, transparent | Variant for dark splash background `#1E293B` (usually = light-colored version of the same mark). |
| `wordmark.svg` (or PNG ≥2000px wide) | — | The two-tone "Wordbaazi" wordmark on transparent, for splash/web/marketing reuse. |

### C. Store graphics
| File | Size | Notes |
|---|---|---|
| `feature_graphic_1024x500.png` | 1024×500 | Google Play feature graphic. Wordmark + tiles motif on brand background. **No transparency.** Keep text away from the outer ~10% (it gets cropped/overlaid in some placements). Optionally include the tagline. |

Tagline (feel free to improve): **"Ek din, ek word."** or English: **"One word a day. Six shots."**

### D. Optional (phase 2 — nice to have)
- Screenshot background/frame template (portrait, brandable header + device frame)
  — actual screenshots will be captured from the app. Store specs for reference:
  Play phone screenshots 1080×1920+ (16:9–9:16), iOS 6.9" 1320×2868 and 6.5" 1284×2778.
- Promo/social square 1080×1080.

## 4. What NOT to do
- No resemblance to Wordle/NYT branding, colors (their green `#6AAA64` /
  yellow `#C9B458`), serif type, or logo.
- No gradients-of-many-hues, no glossy 2010s icon style, no photorealism.
- No red/green color coding anywhere.
- No text in the app icon.
- No trademarked assets, fonts without licenses, or stock clip-art peacocks.

## 5. Delivery
Drop all files into the `design/assets/` folder of this project using the exact
file names above. The engineering side will handle generating every platform
size (iOS icon set, Android mipmaps, splash configs) from these masters.

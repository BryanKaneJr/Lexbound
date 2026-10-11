# Art direction

Lexbound looks like a **painted storybook**: soft gouache light, deep air, warm skin and fur, cool shade. Art is still drawn in code (`app/src/art`, react-native-svg, no image files), but it should read as an illustration, never as clipart. The reference pieces are the stream (`forest_stream` in `backgrounds.tsx`) and Milo (`Milo.tsx`): match them.

Open **Developer tools, Art lab** (route `/artlab`) to see every scene with actors in it, every actor in every mood, and every prop.

## Light

- **One light per scene, from the upper left** unless the scene says otherwise (a lamp, a fire). Forms are lit on their upper-left side and shaded on the lower right.
- **Warm light, cool shade.** Light leans gold or cream, shade leans blue, teal or violet. Never shade with grey or black.
- **Show the light source**: a `Glow` for the sun or a lamp, `Shafts` falling from it, dappled light patches on the ground, glints on water.

## Depth

- Build each scene in **4 to 6 layers**: sky, far silhouettes, middle ground, the stage (where actors stand, y about 0.84 to 0.93), foreground framing.
- **Atmospheric perspective**: far layers are lighter, cooler and lower contrast (`mix(color, haze, 0.5..0.7)`); near layers darker and more saturated. Put a `Fog` band between far and middle layers.
- **Frame the stage**: dark foreground shapes at the edges (trunks, overhanging leaves, ferns, a doorframe, rocks) so the eye falls on the middle. Keep the middle third clear for actors and speech bubbles.

## Shapes

- **No perfect circles or rectangles for natural things.** Use `ridge` (hill and tree lines; draw two overlapping lines in one colour for a natural tree line), `blob` (foliage, bushes, rocks, clouds), `tuft` and `blade` (grass, ferns). Man-made things can be straight, but give them wear: a sag, a chip, an uneven plank.
- **Foliage has volume**: a lighter lobed blob offset up-left, the main blob, a darker blob offset down-right (see `leaves` in the stream).
- **Big, simple masses first, small detail only where the eye lands.** At phone size a scene is 390 px wide.

## Colour

- A limited palette per scene: about 3 hues plus their light and shade, harmonised by the scene's light. No pure black (#000), no pure white except highlights and foam, no raw primaries.
- Element colours (`elements.json`) stay recognisable on creatures and effects; push them slightly toward the scene's light, not away from their identity.

## Characters and props

- Shade every form with the **two-tone cel technique** in `Milo.tsx` (`Shaded`): the form in its shade colour, a mid tone offset (-6, -6), the lit colour offset (-12, -11), all clipped to the form, then a soft white rim stroke offset (4, 4) and the outline on top.
- **Outlines are a darker, warmer version of the local colour**, about 2.4 units in a 200-unit box, never black. Inner lines (toes, mouths, folds) are thinner.
- **Eyes carry life**: a dark eye, a lighter iris low in it, two highlights (big upper right, small lower left).
- **Ground everything**: a soft radial contact shadow under feet and props, not a flat ellipse.
- Keep each piece's viewBox, facing (right) and feet-on-the-bottom-edge so scenes, `ASPECT` (`Actor.tsx`) and `ids.ts` stay valid.

## Air and surface

`LOOKS` in `backgrounds.tsx` sets, per scene:

- `light` and `shade`: a colour grade laid over the whole scene, actors included, so they stand in its light;
- `vignette`;
- `motes`: specks drifting in the light (pollen by day, fireflies or embers at night, dust indoors);
- `apron`: the ground continuing below the picture, under the dialogue box, with an edge of grass, moss, stone or floorboards.

`SceneGrade` (in `atmosphere.tsx`) adds a fine paper grain over everything.

## Type and UI

- **Fraunces** (a soft storybook serif) for titles, creature speech, command tiles and narration (in italic); **Atkinson Hyperlegible** for interface text, chosen for readability. Both are bundled (`@expo-google-fonts`), so the game stays offline.
- The scene fills the screen; dialogue sits in a parchment box on the scene's own ground, not in an app panel.
- Respect Reduce Motion: motes, shafts and idle motion stop; nothing information-bearing is lost.

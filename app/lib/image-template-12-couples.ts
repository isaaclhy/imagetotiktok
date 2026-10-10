/** White paper behind the empty Template 12 frame. */
export const IMAGE_TEMPLATE12_FRAME_BG = '#FFFFFF';
export const IMAGE_TEMPLATE12_SLIDE_COUNT = 6;

export const IMAGE_TEMPLATE12_STYLE = {
  style_name: "Rough Hand-Drawn Crayon Couple Illustrations",
  art_style: {
    medium:
      "A few wax-crayon strokes of two people on an otherwise empty white page",
    linework:
      "Very thick, blunt crayon outlines. Heavy, wobbly, uneven strokes, like a chunky wax crayon pressed hard. No thin lines and no fine contours.",
    coloring:
      "Rough, unfinished crayon coloring. Big messy strokes, large white gaps, color spilling outside the outlines, and almost no blending. Clothes and skin are a few crude patches of color, not carefully filled shapes.",
    texture:
      "Chunky wax-crayon marks. Thick pigment, visible individual strokes, and rough edges. Not fine pencil detail.",
    overall_look:
      "Cute, intimate, innocent, romantic, emotionally expressive, nostalgic, warm, simple, and handmade. Looks like a real illustration drawn by hand on paper rather than computer-generated artwork.",
    complexity:
      "Extremely simple. Two people made of a few crayon shapes, stick-like limbs, and almost no detail. No scenery, no furniture, no props, and no extra objects.",
  },
  characters: {
    style:
      "Simple cute cartoon couple with slightly exaggerated heads, small facial features, rounded faces, and natural, slightly awkward proportions.",
    faces:
      "A peach crayon patch, two dots for eyes, a tiny mouth, and a rough pink blush. No nose detail, no eyelashes, no teeth.",
    hair:
      "One thick scribbled mass of dark crayon. No individual strands.",
    bodies:
      "Simple bodies, natural affectionate poses, relaxed shoulders, and expressive gestures. Use loosely drawn limbs and imperfect anatomy consistent with a charming handmade cartoon.",
    clothing:
      "Plain shirts, hoodies, trousers, or skirts filled with a few thick crayon strokes. No patterns, pockets, seams, or small clothing details.",
    expressions:
      "Blushing, smiling, laughing, crying, comforting, hugging, kissing, leaning together, or looking lovingly at one another.",
    consistency:
      "Maintain the same recognizable character designs, facial proportions, drawing technique, line thickness, and crayon texture across every image in a series.",
  },
  color_palette: {
    background: "#FFFFFF",
    outlines: "#171311",
    hair: ["#171311", "#382720"],
    skin: ["#FFD29B", "#F7B96E", "#FCE2B7"],
    blush: ["#F05A65", "#F58A91"],
    clothing: ["#E83D42", "#278B50", "#2479D8", "#F5C92E", "#E75A9B", "#795039"],
    color_usage:
      "A few bright crayon colors laid on roughly. Leave white paper showing through. Never fill a shape neatly.",
  },
  composition: {
    background:
      "Empty white. The environment is not drawn. No room, floor, sky, furniture, plants, lamps, windows, or props.",
    layout:
      "The only graphics are the two people and the handwritten words. Everything else on the page stays blank white.",
    framing:
      "Portrait page. Draw the couple and stop. Do not fill the space around them.",
    text_placement: "Place the supplied message at the top center, separated from the characters.",
    visual_balance:
      "Minimalist, uncluttered, emotionally focused, with the couple as the primary focal point.",
  },
  typography: {
    font_style:
      "Casual handwritten lettering that looks drawn directly onto paper with a dark crayon or soft black pencil.",
    lettering:
      "Slightly irregular handwritten lowercase and uppercase letters, imperfect spacing, subtle baseline variations, rounded organic forms, and a rough pencil-like texture.",
    text_color: "#171311",
    alignment: "Centered",
    appearance:
      "Natural, legible, slightly imperfect, and consistent with the handmade illustration.",
    rule:
      "Render the supplied text exactly as written, preserving punctuation, capitalization, and line breaks. Do not invent additional words.",
  },
  rendering_rules: {
    preserve_handmade_texture: true,
    allow_imperfect_lines: true,
    allow_visible_crayon_strokes: true,
    allow_uneven_coloring: true,
    allow_small_anatomical_imperfections: true,
    avoid_photorealism: true,
    avoid_vector_art: true,
    avoid_smooth_digital_shading: true,
    avoid_gradients: true,
    avoid_glossy_finishes: true,
    avoid_3d_rendering: true,
    avoid_anime_style: true,
    avoid_watercolor_style: true,
    avoid_perfect_symmetry: true,
    avoid_excessive_details: true,
  },
  negative_prompt: [
    "polished vector illustration",
    "clean digital line art",
    "smooth black outlines",
    "thin lines",
    "fine detail",
    "neat coloring",
    "carefully filled shapes",
    "flat digital coloring",
    "airbrushed shading",
    "gradient backgrounds",
    "3D characters",
    "photorealistic people",
    "anime or manga aesthetics",
    "glossy cartoon rendering",
    "perfect geometric shapes",
    "smooth plastic-looking hair",
    "watercolor washes",
    "oil painting",
    "highly detailed backgrounds",
    "rooms",
    "furniture",
    "kitchens",
    "lamps",
    "plants",
    "tables",
    "props",
    "background objects",
    "busy scenes",
    "realistic skin texture",
    "professional corporate illustration",
    "stock vector artwork",
    "overly sophisticated anatomy",
    "neon colors",
    "drop shadows",
    "decorative graphic design elements",
  ],
  generation_instructions: {
    scene: "",
    text: "",
    aspect_ratio: "4:5",
    quality_priority:
      "Thick crayon, rough unfinished color, and almost no detail. A blank page, two simply drawn people, and the handwritten line.",
    final_instruction:
      "The picture contains exactly two people and the supplied text. Draw them with a thick crayon and rough, patchy color. Do not draw an environment. Do not add fine detail.",
  },
} as const;

export type Template12Scene = {
  setting: string;
  action: string;
};

/** One plain pose per slide. No rooms, furniture, or props. */
export const IMAGE_TEMPLATE12_SCENES: readonly Template12Scene[] = [
  {
    setting: 'blank white paper, no background and no objects',
    action: 'standing and kissing, arms around each other',
  },
  {
    setting: 'blank white paper, no background and no objects',
    action: 'sitting on nothing, facing each other and talking',
  },
  {
    setting: 'blank white paper, no background and no objects',
    action: 'a close hug, one resting their head on the other’s shoulder',
  },
  {
    setting: 'blank white paper, no background and no objects',
    action: 'one hugging the other from the side',
  },
  {
    setting: 'blank white paper, no background and no objects',
    action: 'standing and looking at each other, both smiling',
  },
  {
    setting: 'blank white paper, no background and no objects',
    action: 'a hug from behind',
  },
  {
    setting: 'blank white paper, no background and no objects',
    action: 'standing, holding both hands',
  },
  {
    setting: 'blank white paper, no background and no objects',
    action: 'foreheads touching, eyes closed',
  },
  {
    setting: 'blank white paper, no background and no objects',
    action: 'sitting side by side, one leaning on the other’s shoulder',
  },
  {
    setting: 'blank white paper, no background and no objects',
    action: 'one kneeling to hug the other around the waist',
  },
  {
    setting: 'blank white paper, no background and no objects',
    action: 'standing with an arm around the other’s shoulders',
  },
  {
    setting: 'blank white paper, no background and no objects',
    action: 'sitting cross-legged, facing each other and laughing',
  },
  {
    setting: 'blank white paper, no background and no objects',
    action: 'a full front hug, eyes closed',
  },
  {
    setting: 'blank white paper, no background and no objects',
    action: 'one sitting, the other leaning down into a hug',
  },
  {
    setting: 'blank white paper, no background and no objects',
    action: 'standing close, one hand on the other’s cheek',
  },
  {
    setting: 'blank white paper, no background and no objects',
    action: 'sitting and facing each other, one gently pointing as they talk',
  },
];

function shuffleScenes(scenes: readonly Template12Scene[]): Template12Scene[] {
  const next = [...scenes];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = next[i]!;
    next[i] = next[j]!;
    next[j] = tmp;
  }
  return next;
}

/** Six unique scenes for one slideshow. A later set avoids the scenes just used. */
export function pickTemplate12Scenes(
  count: number,
  avoid: readonly Template12Scene[] = []
): Template12Scene[] {
  const avoided = new Set(avoid.map((scene) => scene.action));
  let deck = shuffleScenes(IMAGE_TEMPLATE12_SCENES.filter((scene) => !avoided.has(scene.action)));
  if (deck.length < count) {
    deck = shuffleScenes(IMAGE_TEMPLATE12_SCENES);
  }
  const picked: Template12Scene[] = [];
  while (picked.length < count) {
    if (deck.length === 0) deck = shuffleScenes(IMAGE_TEMPLATE12_SCENES);
    const scene = deck.pop()!;
    if (picked.some((item) => item.action === scene.action)) continue;
    picked.push(scene);
  }
  return picked;
}

export function buildTemplate12ImagePrompt(slideText: string, scene: Template12Scene): string {
  const sceneDescription = `Pose only: ${scene.action}. The two people float on empty white. Do not draw where they are.`;
  const spec = {
    ...IMAGE_TEMPLATE12_STYLE,
    generation_instructions: {
      ...IMAGE_TEMPLATE12_STYLE.generation_instructions,
      scene: sceneDescription,
      text: slideText,
    },
  };
  return `Generate a vertical image of only two people and the supplied text.

Do not draw an environment. No room, no floor, no sky, no furniture, no plants, no objects, and no extra graphics around them. The rest of the page is blank white.

Use a thick wax crayon. Keep the drawing crude and lightly detailed. Color in rough patches, with white paper showing through. Do not use thin lines or neat fills.

Follow this visual style specification:
${JSON.stringify(spec, null, 2)}

The text must be rendered exactly as supplied. Do not add any other words.
`;
}

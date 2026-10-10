/** White paper behind the empty Template 12 frame. */
export const IMAGE_TEMPLATE12_FRAME_BG = '#FFFFFF';
export const IMAGE_TEMPLATE12_SLIDE_COUNT = 6;

export const IMAGE_TEMPLATE12_STYLE = {
  style_name: "Rough Hand-Drawn Crayon Couple Illustrations",
  art_style: {
    medium:
      "Traditional children's book illustration drawn with wax crayons and coloured pencils on textured white paper",
    linework:
      "Rough, scratchy, irregular black outlines with visible hand-drawn imperfections. Lines should be wobbly, uneven, and occasionally overlapping. Avoid clean contours.",
    coloring:
      "Loose crayon scribbling with dense, directional strokes. Uneven color coverage, visible white gaps between strokes, overlapping marks, and imperfect coloring outside the outlines.",
    texture:
      "Highly visible grainy wax crayon texture, dry colored-pencil scratches, rough pigment deposits, subtle paper grain, and authentic handmade imperfections.",
    overall_look:
      "Cute, intimate, innocent, romantic, emotionally expressive, nostalgic, warm, simple, and handmade. Looks like a real illustration drawn by hand on paper rather than computer-generated artwork.",
    complexity:
      "Simple cartoon characters with expressive body language, minimal facial details, recognizable silhouettes, and loosely sketched clothing.",
  },
  characters: {
    style:
      "Simple cute cartoon couple with slightly exaggerated heads, small facial features, rounded faces, and natural, slightly awkward proportions.",
    faces:
      "Warm peach skin colored with rough orange and pale yellow crayon strokes. Small black eyes, simple curved noses, tiny smiling mouths, and prominent pink or red scribbled blush on the cheeks.",
    hair:
      "Thick, messy, heavily scribbled dark hair. Use many overlapping black and dark brown strokes to create irregular silhouettes, visible individual marks, and a dense crayon texture. Hair must look hand-sketched, not like a smooth solid shape.",
    bodies:
      "Simple bodies, natural affectionate poses, relaxed shoulders, and expressive gestures. Use loosely drawn limbs and imperfect anatomy consistent with a charming handmade cartoon.",
    clothing:
      "Casual everyday outfits, such as oversized sweaters, T-shirts, hoodies, trousers, and skirts. Fill clothing areas with vivid, rough crayon strokes.",
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
      "Use a small palette of bright, warm crayon colors. Colors should be textured, imperfect, and slightly uneven, never smooth or digitally blended.",
  },
  composition: {
    background:
      "Plain off-white or white paper with extremely subtle natural paper texture. No scenery, no decorative borders, no background objects unless explicitly requested.",
    layout:
      "A centered illustration of the couple occupying the middle and lower portions of the canvas, with generous empty white space above for a short handwritten message.",
    framing:
      "Portrait 4:5 composition, showing the characters from head to toe when appropriate. Adjust framing naturally for close-up hugs, kisses, or other intimate poses.",
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
      "Authentic rough crayon texture, recognizable cute couple characters, expressive body language, and close adherence to the supplied visual references.",
    final_instruction:
      "Reproduce the handmade visual language of a simple romantic drawing made with black, red, blue, green, and yellow wax crayons on white paper. Every stroke should retain visible pigment grain and irregularity. The illustration should feel personal, imperfect, tender, and genuinely hand-drawn. Do not make it look like polished digital art.",
  },
} as const;

export type Template12Scene = {
  setting: string;
  action: string;
};

/** One scene per slide. None of these is a couple sitting on a sofa. */
export const IMAGE_TEMPLATE12_SCENES: readonly Template12Scene[] = [
  {
    setting: 'a small kitchen at night, warm lamp over the stove',
    action: 'standing at the counter, one feeding the other a taste from a wooden spoon',
  },
  {
    setting: 'a softly lit bedroom, rumpled blankets and a bedside lamp',
    action: 'lying on their sides facing each other, talking quietly under the blanket',
  },
  {
    setting: 'a rainy city sidewalk at night',
    action: 'walking close together under one shared umbrella',
  },
  {
    setting: 'a quiet cafe window seat',
    action: 'leaning toward each other across a small table, hands around two mugs',
  },
  {
    setting: 'a park path at dusk, trees and a low sky',
    action: 'walking side by side, one turning to look at the other',
  },
  {
    setting: 'the front seat of a parked car at night, city lights outside the windows',
    action: 'turned toward each other in their seats, mid-conversation',
  },
  {
    setting: 'a narrow bookstore aisle',
    action: 'standing, one holding an open book toward the other',
  },
  {
    setting: 'a balcony overlooking a city in the evening',
    action: 'standing at the railing with their shoulders touching, looking outward',
  },
  {
    setting: 'a living room with the lights low, no sofa in frame',
    action: 'slow dancing, one hand at the other’s waist, feet mid-step',
  },
  {
    setting: 'a picnic blanket in an open field late in the day',
    action: 'one lying back, the other propped on an elbow beside them',
  },
  {
    setting: 'a train seat beside a window',
    action: 'one resting their head on the other’s shoulder while the scenery passes',
  },
  {
    setting: 'an apartment doorway, coats and a bag still in hand',
    action: 'standing in a full hug, greeting or saying goodbye',
  },
  {
    setting: 'a laundromat with rows of machines',
    action: 'standing and folding a sheet together between them',
  },
  {
    setting: 'a beach at blue hour, wet sand and a dim sky',
    action: 'walking in the shallow water, holding hands',
  },
  {
    setting: 'a rooftop at night',
    action: 'standing close, one pointing something out in the distance',
  },
  {
    setting: 'a grocery aisle under fluorescent lights',
    action: 'one reaching for a shelf while the other leans in, laughing',
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
  const avoided = new Set(avoid.map((scene) => scene.setting));
  let deck = shuffleScenes(IMAGE_TEMPLATE12_SCENES.filter((scene) => !avoided.has(scene.setting)));
  if (deck.length < count) {
    deck = shuffleScenes(IMAGE_TEMPLATE12_SCENES);
  }
  const picked: Template12Scene[] = [];
  while (picked.length < count) {
    if (deck.length === 0) deck = shuffleScenes(IMAGE_TEMPLATE12_SCENES);
    const scene = deck.pop()!;
    if (picked.some((item) => item.setting === scene.setting)) continue;
    picked.push(scene);
  }
  return picked;
}

export function buildTemplate12ImagePrompt(
  slideText: string,
  scene: Template12Scene,
  options?: { leaveBottomClear?: boolean }
): string {
  const sceneDescription = `${scene.setting}. Action: ${scene.action}. Do not draw the couple sitting together on a sofa.`;
  const spec = {
    ...IMAGE_TEMPLATE12_STYLE,
    ...(options?.leaveBottomClear
      ? {
          composition: {
            ...IMAGE_TEMPLATE12_STYLE.composition,
            layout:
              'Handwritten message at the top. The couple sits in the upper half, well above the bottom edge. Leave the entire bottom third as empty white paper because another image covers that area.',
          },
        }
      : {}),
    generation_instructions: {
      ...IMAGE_TEMPLATE12_STYLE.generation_instructions,
      scene: sceneDescription,
      text: slideText,
    },
  };
  const bottomClear = options?.leaveBottomClear
    ? `
Keep every word and both people in the upper half of the image.
Leave the bottom third as empty white paper only. Do not put text, faces, or hands there.
`
    : '';
  return `Generate a vertical TikTok slideshow image.

Follow this visual style specification:
${JSON.stringify(spec, null, 2)}
${bottomClear}
Create a complete illustrated poster. The text must be rendered
exactly as supplied. Do not add any other words.
`;
}

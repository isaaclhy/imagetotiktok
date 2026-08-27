/** Dreamy, romantic filter for Pexels image (Image mode) – preview, carousel, and export */
export const ROMANTIC_IMAGE_FILTER =
  'brightness(0.82) contrast(0.88) saturate(0.72) sepia(0.18) hue-rotate(-8deg)';

/** Fantasy / magical grade for Couples Nature video background (preview + export). */
export const COUPLES_NATURE_VIDEO_FILTER =
  'brightness(1.12) contrast(0.88) saturate(1.55) sepia(0.32) hue-rotate(-22deg)';

/** Font for first-card title (TikTok-style clean sans-serif). */
export const TITLE_FONT = 'Inter, sans-serif';

/** Fallback background colors when no avgColor from image (e.g. AI cover). */
export const CARD_BG_FALLBACK_PALETTE = [
  '#1a1a2e',
  '#16213e',
  '#2d2d44',
  '#2c3e50',
  '#3d2c4a',
  '#2d3a4a',
  '#34495e',
  '#3d3d5c',
];

/** Pastel backgrounds for Spill It Image Template 2 (carousel). Mid-tone so white text stays readable. */
export const IMAGE_TEMPLATE2_PASTEL_COLORS = [
  '#D48A9C', // dusty rose
  '#A48BC4', // muted lilac
  '#7AADD0', // soft blue
  '#78B898', // sage green
  '#D4B45E', // muted gold
  '#D49A88', // terracotta blush
  '#68B8B4', // teal mist
  '#A088C0', // soft plum
  '#D09A78', // warm peach
  '#7AA0C8', // slate blue
  '#B888A8', // mauve
  '#8AA878', // olive mint
  '#C978A0', // berry pink
  '#8B9AD4', // periwinkle
  '#5FB8C8', // aqua
  '#9BC478', // soft lime
  '#E0A868', // apricot
  '#C88A78', // coral clay
  '#78A8C0', // powder blue
  '#B878B0', // orchid
  '#C8A078', // sand
  '#6898B8', // denim soft
  '#A87898', // dusty berry
  '#88B890', // seafoam
  '#D498B0', // blush orchid
  '#9890C8', // lavender blue
  '#58A8A0', // jade
  '#C8B070', // honey
  '#B89078', // warm taupe
  '#7088B8', // steel blue
  '#C07090', // raspberry
  '#90C0A8', // mint fog
] as const;

/** Cover slide background — matches template-2-cover.jpg picker thumbnail. */
export const IMAGE_TEMPLATE2_COVER_BACKGROUND = IMAGE_TEMPLATE2_PASTEL_COLORS[0];

/** Default off while testing — skips highlight-word API and cover squiggle when false. */
export const IMAGE_TEMPLATE2_COVER_SQUIGGLE_ENABLED_DEFAULT = false;

export const IMAGE_TEMPLATE2_APP_FOOTER = 'Spill It - Couples Questions';

export const IMAGE_TEMPLATE2_TYPE_LABELS: Record<
  'funny' | 'flirty' | 'me_or_you' | 'brave',
  string
> = {
  funny: 'Funny Questions',
  flirty: 'Flirty Questions',
  me_or_you: 'Me or You',
  brave: 'Brave Questions',
};

/** Lowercase TikTok labels for Image Template 3 cover (question type line). */
export const IMAGE_TEMPLATE3_TYPE_PILL_LABELS: Record<
  'funny' | 'flirty' | 'me_or_you' | 'brave',
  string
> = {
  funny: 'funny questions',
  flirty: 'flirty questions',
  me_or_you: 'me or you',
  brave: 'brave questions',
};

/** Cover image prompt IDs for automate flow. Keys are display names. */
export const COVER_IMAGE_PROMPTS = {
  boards: 'pmpt_6991006af1cc8195a60c91937fc07b7100c73c923d7ad252',
  'paper style': 'pmpt_6990f9a317588194827b173df4b3d6a30d4beef4679a5add',
  creative: 'pmpt_697bd67b55d48190ba24de5df8a84f3c0e7de9c8192b5cdc',
} as const;

export type CoverImageStyle = keyof typeof COVER_IMAGE_PROMPTS;

/** Couples-level categories only (case-insensitive). Default automate selection uses these. */
export const COUPLES_CATEGORIES = [
  'after dark',
  'deeper conversations',
  'first impressions',
  'how well do you know me',
  'spicy',
  'travelling',
];

export function getDefaultAutomateCategories(categories: string[]): string[] {
  const couplesSet = new Set(COUPLES_CATEGORIES);
  return categories.filter((c) => couplesSet.has(c.toLowerCase().trim()));
}

/** Spill It Prompt-tab cover / first-template image prompts only. */
export const PROMPT_PROJECTOR_COUPLE = `Ultra realistic candid photo of a real couple watching a projector movie late at night in a small apartment living room.

Shot from behind the couch at eye level. We only see the backs of the couple. The woman is leaning on the man’s shoulder naturally.

A real projector on the coffee table projects onto a slightly wrinkled white bedsheet hanging on the wall.

The projected text is the main focus and reads exactly:

"{x}"

Large bold condensed black sans-serif text on a bright white projection, perfectly legible and centered.

Natural low-light photography, realistic apartment, imperfect couch fabric, subtle room clutter, authentic shadows, slight sensor noise, soft projector glow, visible light beam particles.

Looks like a candid photo taken on a DSLR camera, not AI art, not a digital illustration.

Realistic skin texture, realistic hair, natural posture, believable proportions, documentary photography style.

No front-facing people, no fake cinematic lighting, no surrealism, no glossy surfaces, no perfect furniture, no extra text, no distorted letters, no watermark.`;

export const PROMPT_POTTERY_PLATE =
  'Girl holding a white pottery plate covering half of the face slightly smiling, on the plate it says "{x}"';

export const PROMPT_CONDOM_WRAPPER_NYC =
  'In a bright NYC coffee shop, a female hand holding a condom wrapper with the text "{x}" on it. Make it very realistic';

export const SPILL_IT_TEMPLATE_COVER_PROMPTS = [
  PROMPT_PROJECTOR_COUPLE,
  PROMPT_POTTERY_PLATE,
  PROMPT_CONDOM_WRAPPER_NYC,
] as const;

/** Image prompts with {x} placeholder for dynamic text. */
export const PROMPTS = [
  'A baseball cap, a bit worn out but the cap is in red, the text "{x}" embroidered on it. the text should be in white and the text should occupy only the center 70% of the screen space, leave some padding on the side. No need to show the entire cap, the text should be in the center',
  `First-person POV inside a bright modern coffee shop during daytime, a feminine woman's hand holding an iPhone while viewing an Instagram story. Natural daylight pours through large windows, creating soft bright lighting and realistic shadows. A few people are sitting and casually talking in the background, slightly blurred and out of focus so they add atmosphere without distracting from the main subject. The scene feels natural and candid, like a real smartphone photo. The hand has feminine features with slender fingers, natural nails, and realistic skin texture. The phone screen is very bright and visually striking, emitting a vivid saturated bright red glow that immediately draws attention while still looking like a real phone display. On the Instagram story is a solid bright red background with la  rge centered bold white text: "{x}" Shallow depth of field, photorealistic, realistic iPhone proportions, authentic coffee shop atmosphere, iPhone camera photo style, natural composition, no CGI appearance.`,
  'First person POV, holding a white canvas with 2 hand marks from paint, one should be sky blue and one should be pink and on the canvas, it should also have the text "{x}". The text is facing you directly',
  'Close up holding a piece of very very small torn paper, almost thumbnail size, on the paper it\'s written "{x}", it\'s like the text is typed using a type writer. Make it realistic. The text should be very clear on the piece of paper',
  `A finished puzzle viewed straight-on from directly above, centered in the frame so the puzzle edges appear square and parallel to the image borders (no perspective tilt or angled view). On the puzzle, there's a cartoon style text and some cartoon on it, the text reads:

"{x}"

The text is facing the viewer directly. The camera is positioned perfectly perpendicular to the puzzle surface, creating a flat front-facing view with no skew, foreshortening, or rotation. High-resolution, realistic puzzle texture, sharp focus, clean composition, professional product photography.`,
  PROMPT_PROJECTOR_COUPLE,
  'Picking ice cream among a bunch of flavors in the shop and on one of the flavor cards, it says "{x}". The text should be zoomed in and facing straight to you',
  'First person POV, making a heart pottery for girlfriend and on the pottery has the text "{x}" painted on it. The pottery is white and the text should be red',
  'A couple looking at a piece of art in a museum. we can only see their back and the girl\'s head is leaning slightly on the guy\'s shoulder. The art has the text "{x}" the art is very cartoony',
  'First person POV, in a drawing class. On the canvas, you painted a very simple image of a couple looking at the sunset, not fully colored yet, and below there\'s also this thick text: "{x}". You should be facing straight at the canvas, not at a angle. And zoom into the canvas',
  'First person POV, on the tube, youre sitting across a person reading a book, on the book cover, it should be cartoon style and the title should be "{x}". zoom in on the text',
  'First person POV, playing billiard and the text "{x}" is written with white chalk on the billiard table. Make it realistic and the text should be written on the table',
  'First person POV, you\'re in a pottery painting class. The pottery is half painted, on it has the text "{x}" painted on it. Make it realistic. The text should be facing you straight. The text should be painted in a color where there\'s huge contrast to the pottery',
  PROMPT_POTTERY_PLATE,
  'First person POV, In a record store with a lot of records, one of the records say "{x}" on the record cover',
  'First person POV, youre making a cake, on the top of the cake has the words "{x}" written in frosting. The cake and the frosting should have contrasting color. The text should not be cursive',
  'First person POV, you\'re in a packed theatre holding a theatre leaflet about the show, on the leaflet has the text "{x}" printed on the leaflet',
  `First-person POV sitting on grass in a park, painting on a white canvas directly in front of you. The camera/viewpoint is perfectly centered and perpendicular to the canvas surface. The canvas is perfectly upright, flat facing the viewer head-on (0° rotation), centered in frame, with no tilt, no perspective skew, symmetrical alignment. Hands holding paintbrush visible at bottom of frame. On the canvas is a red heart and the text: "{x}"`,
  'First person POV, you\'re doing a white tile drawing lesson. There are some stickers on it, there should be a text saying "{x}" painted on it with brush. The text should not be black. The tile should be facing you, the edges of the tile should be parallel to the frame',
  'First person POV, you\'re holding a cute polaroid image and on it has "{x}" written on it with marker and a heart. Focus on the text',
  'First person POV, with girlfriend on the beach (she\'s not in the picture), holding a cute polaroid, on the polaroid should be a couple and there\'s a text "{x}" written in marker with a heart',
  'First person POV, in a huge college lecture hall full of students, there\'s a professor in the center stage pointing at the lecture slides in presentation mode. Inside the slide the background should be red, it should say "{x}", make it realistic. Zoom into the slides where the text is since it should be the main focus',
  'Walking in a college town along frat row, on one of the flags it says "{x}". The flag should be red. It should be a very snowy day, the flag should occupy most of the screen space and the text should be the main focus',
  'On a highway bridge, there\'s a clean white poster hanging down with the text "{x}" spray painted in red, with a heart spray painted at the bottom as well. The poster should occupy the center 70% of the image and is the main focus',
  'On a snowy street in New York City, there\'s a restaurant red metal sign in a heart shape, on it there\'s text "{x}" painted on it in white, it should be in the center of the image. Must be realistic',
  PROMPT_CONDOM_WRAPPER_NYC,
  'You\'re on a bus in NYC, it\'s a sunny day, on the back of the seat in front of you there\'s a sticker with black background and white text, the text says "{x}". The sticker is a bit worn off',
  'You\'re opening a fortune cookie in a restaurant and the paper is still a bit in the cookie, the message on the paper says "{x}". Make it realistic, the message should be in the center of the image. The message should be at least 60% of the screen width',
  `First person POV from an airplane seat, looking directly out the airplane window. On the window glass, handwritten with a thick black marker in large bold letters:

"{x}"

The text must be the primary focus of the image and perfectly readable. Make the writing dark, high contrast, sharp, thick strokes, evenly spaced, centered on the window, and entirely inside the glass area. Keep a clean blue sky and soft clouds outside with a slightly blurred background so the text stands out clearly. No scenery or plane elements should overlap, distort, reflect, or obstruct any letters. The text should appear naturally written on the glass but remain crystal clear and highly legible, like a social media ad creative.`,
  'First person POV, you\'re sitting on a plane. Looking in front of you, on the pull-out table in front of you, it has the text "{x}", the text should be clearly visible and at eye level. The text should be written with a marker',
  'First person POV, you\'re at a fun fair holding a huge cotton candy, on it has a card and on the card has the text "{x}". Make the text the focus and visible and the card should be in the cotton candy',
  'First person POV, in a nice cafe holding a cup of iced matcha; on the outside of the cup the words "{x}" are printed in white as part of the cup design—not a digital overlay. Pull the cup toward the camera. Make the text the main focus, large and readable',
  'First person POV, you\'re holding your girlfriend\'s hand; on the back of her hand you\'re writing "{x}" with a black marker, with small hearts around it. Make the writing the main focus, sharp and readable. The back of the hand should be facing you.',
  'First person POV, you look at the fridge door: a polaroid photo of a couple is held by a magnet, and on the polaroid the text "{x}" is visible. The polaroid faces straight toward the camera, not at an angle. Other cute fridge magnets around it. Make the text the main focus',
  'First person POV, you\'re making a heart-shaped pizza; the words "{x}" are spelled out in red tomato sauce on the pizza. Make the words large, readable, and the main focus',
  'First person POV, you\'re in a couples drawing class with your boyfriend: on the canvas there\'s a simple colorful doodle portrait of him (intentionally a bit rough), and he\'s good-looking in the background behind the easel. Below the drawing on the canvas, bold text says "{x}". Make that text the main focus',
  'First person POV, you\'re wearing a skirt at a tennis court looking down at the ground; a few tennis balls and a racket are visible, and on the court or pavement the text "{x}" is written on the floor. Make the text the main focus, large and readable',
  'First person POV, on a sunny day you\'re walking down the street; outside a coffee shop there\'s a pink ad stand with only the words "{x}" printed on it and nothing else. The stand should be the main focus, facing straight toward you',
  'A wall full of white tiles, and on one tile there is text "{x}" written with black marker. Zoom in so the text is the main focus, and the tile should face the camera directly, not at an angle',
  'First person POV, you\'re near the front stage at Coachella during daytime with a huge crowd. On the stage big screen, the text "{x}" is shown on a pink background. Zoom in so the screen text is the main focus',
  'First person POV, you\'re walking down into a crowded tube station; you look at a station sign and it says "{x}". Make the sign text clear, readable, and the main focus',
  'At Coachella, a female hand is holding a condom wrapper with the text "{x}" on it. Make it very realistic and keep the text clear and readable',
  'First person POV, you\'re writing in a journal book; on the page there is text "{x}" with a heart next to it. The writing should not be cursive and should be done in single-color crayon. Make the text clear and the main focus',
  'First person POV, you\'re outdoors in the city holding a piece of pink sticky note; on it has the text "{x}" written with a thick marker. Make the text the main focus and zoom in',
  'First person POV, you\'re outdoors in the city holding a piece of pink sticky note; on it has the text "{x}" written with a thick marker. Make the text the main focus and zoom in',
  'You\'re in the coffee shop holding some light pink napkins; on the napkin has the text "{x}" written on it with marker. Zoom in on the text and make it visible',
  'In a bright NYC coffee shop, a female hand holding a condom wrapper with the text "{x}" on it.',
  'First person POV, It\'s a sunny day, you\'re sitting outside a cafe and reading a book, on the book cover it says "{x}". The cover should be cartoon style with some figures but the text should be easily and clearly legible. Focus on the text. Make it realistic',
  'First person POV, you\'re sitting down across your boyfriend in their 20s on the table. He is eating eggs. You (a female) holding onto your phone, you\'re on tiktok app and one of the post says "{x}". Focus on the phone text and zoom in.',
  'First person POV, inside a car, you\'re sitting across your boyfriend who is a blonde high schooler wearing a hoodie, he\'s holding a hard cover open book, on the cover, it says "{x}" in white. He\'s focused on reading the book. Make the text the focus.',
  'First person POV, you are on your phone, you have painted nails. sitting across your boyfriend who is in his 20s and is eating breakfast. on your phone, there\'s a text, saying "{x}", it\'s sent from your bestie. Zoom in on the text and and focus on it.',
  'First person POV, you are on your phone, sitting across your boyfriend who is eating breakfast. on your phone, there\'s a text, saying "{x}", it\'s sent from your bestie. Zoom in on the text and and focus on it.',
  'First person POV, you at the park with your boyfriend, you opened a book and started reading, and chapter 1 is titled "{x}". Zoom in and focus on the text',
  'First person POV, you\'re lying in bed under the covers, a projector is projecting to the wall in front, text "{x}". Focus and zoom in on the text.',
  'In London, on a sunny day, on a red wall, there\'s text "{x}" spray painted on it in white, with a heart below it as well.',
  'First person POV, walking down the street and looking down, you\'re holding a Starbucks hot drink. The lid is white, and on the lid there\'s text "{x}" written with black marker. Zoom in and focus on the text',
  'First person POV, you\'re a girl wearing baggy joggers with Adidas Sambas, looking down at the ground, and there\'s text "{x}" written with white chalk.',
  'First person POV, you\'re holding a flat white full of foam, but some of the foam is separated and the text "{x}" can be seen. Zoom in and focus on the text',
  'First person POV, you\'re having a cute date night, sitting on the floor in front of the coffee table with some wine and food; a cute cartoon and the text "{x}" are projected on the wall. Zoom in and focus on the text',
  `A realistic iPhone photo of a quiet suburban street during the day with bright natural sunlight. The asphalt road is slightly wet with small puddles, reflecting soft daylight. The scene includes simple houses, trees, and a few parked cars in the background. Shadows are soft and natural, like a normal sunny afternoon after light rain.

The photo is taken from a low, ground-level angle. On the pavement in the foreground, handwritten in rough, slightly messy chalk, the text reads: "{x}" with a small imperfect heart underneath. The writing looks natural, uneven, and slightly smudged in places from moisture. There are faint reflections of the text in the damp pavement.

Lighting is bright but not dramatic — natural sunlight, no cinematic effects. The image has slight grain, minor imperfections, and looks like a casual, unedited iPhone photo. Realistic colors, not oversaturated.`
] as const;

/** Funny relationship questions for games. */
export const FUNNY_QUESTIONS = [
  'If I have an identical twin sister, would you find her attractive?',
  'Am I pretty because you love me or do you love me because I\'m pretty?',
  'Would you kiss someone else for $10 million or me for $10?',
  'Would you rather never have met me or go and cheat on me right now?',
  'If I were gay would you still love me?',
  'If I broke up with you, would you move on?',
  'Date me and never have your favorite food again or still be able to have your fav food but I\'m gone?',
  'If I got into a fight with your mom, whose side would you pick?',
  'Would you rather have me cheat on you or would you cheat on me?',
  'Would you forgive me for cheating once if it saved your life?',
  'Would you help me cover up a body without asking any questions?',
  'Would you kiss another guy to save my life?',
  "Would you date me or Sydney Sweeney?",
  "If we are In Too Hot To Handle, would you still choose me?",
  'Would you rob the bank to pay for my hospital bills?',
  'If you have 60 seconds to make me cry for $1 mil, what would you do?',
  'If you\'re already in a relationship, would you leave them for me?',
  'Would you still stay with me if I get a year older every day?',
  'Would you still stay with me if I gain a pound of weight every day?',
  'If I were born a man with the same personality, would you still love me?',
  'Would you still date me if Im ugly but loyal or the prettiest girl in the world but a cheater?',
  'If I gain 50 pounds, would you still find me attractive?',
  'If me and you ex switch bodies, who would you be in love with?',
  'Would you stay with me if I loose both my arms and legs?',
  'Would you rather kiss another person or die in a plane crash?',
  'If I died and you remarry, what would the other person have that I don\'t?',
  'Would you let me start an OF if it gives us generational wealth?',
  'If I became a prostitute, would you still love me?',
  'Would you rather be the jealous one or the one causing jealousy?',
  'Would you rather get my name tattooed on your neck or free or your ex\'s for $1 mil?',
  'Would you rather have an open relationship for a month or no intimacy for 1 year?',
  'Would you rather see me get with another person once or no intimacy for a year?',
  'If one of us has to cheat, who would it be?',
  'Would you rather forget everything about our past or never be able to imagine a future with me?',
  'Would you spend a year without me for $1 mil?',
  'If we break up, who would hook up first?',
  'If you\'re in a room with ever person you\'ve ever been interested in, what\'s your first move?',
  'How long would I have to be in a coma for, before you to start dating other people?',
  'How long would I have to be in a coma for before you start using dating apps again?',
  'If you found a soulmate, would you leave me for them?',
  'Would you rather wake up tomorrow with zero memory of me or know everything about me but be forced to break up right now?',
  'Would you rather I become "too hot" or stay average?',
  'If I cheated once but confessed immediately, would you forgive me?',
  'What would you do if one of your friends ask me to go to a party with them, just me and them?',
  'Marry me right now or wait 10 years to be sure?',
  'Spend a night with your ex or lose $50,000?',
  'Would you rather see me flirt with someone or see someone flirt with me?',
  'When am I better looking, now or when we first met?',
  'Would you rather know my biggest turn on or my biggest turn off?',
  'Would you rather drop all your friends or the relationship?',
  'Is it cheating if I\'m still friends with a person I used to like?',
  'Would you still love me if I have a body count of over 100?',
  'Is it cheating if I sleep in the same bed with an opposite sex friend but they\'re gay?',
  'Would you rather cheat on me or never be able to see me again?',
  'Would you rather have 100 kids or no kids at all?',
  'Would you still love me if my lower body is paralyzed?',
  'Who do you love more, your mom or me?',
  'If my ex offered me $50,000 to meet them for dinner, would you let me go?',
  'Would you rather I have a wild past or a boring one?',
  'Is our relationship good or you\'ve just never had any better?',
  'Which one fits me best, intelligent but ugly or beautiful but dumb?',
  'Would you rather have 10 million dollars right now, but never see me again, or stay with me and be broke?',
  'If you had a one-time-use time machine to alter one thing about our relationship, what are you changing?',
  'Would you rather go back in time so you could know me longer, or spend more time with me now?',
  'If you\'re in a room with 30 other clones of me, how would you find me?',
  'If I got bit by a zombie, would you let me bite you?',
  'Be honest, who\'s more weird?',
  'If your dream girl walks in tomorrow, what would she have that I don\'t?',
  'Would you rather lose all our messages or photos together?',
  'If you lost me in a supermarket, where would you look for me first?',
  'Do you think you can do better than me?',
  'Would you rather date someone hotter than me or nicer than me',
  'Would you rather I read your mind or you read my mind',
  'Who wears the pants in the relationship?',
  'If you need to rename me, what rediculous name would you pick?',
  'Who gets more jeaous?',
  'Do you want our baby to look more like you or me?',
  'If I come with a warning label, what would it be?',
  'If I went missing, how would you describe me to the police?',
  'Would you change my personality or my looks?',
  'Do you actually listen to me when I speak or do you just wait until your turn?',
  'Would you rather I get horny only once a month or everyday?',
  'Would you have a girlfriend if I wasn\'t born?',
  'If I texted you "I f*cked up", what do you think I\'ve done?',
  'If Netflix has a series on our relationship, what would it be called?',
] as const;

/** Flirty relationship questions for games. */
export const FLIRTY_QUESTIONS = [
  'What would you do if I kissed you right now?',
  'What\'s your favorite part of my body?',
  'What\'s the most attractive thing I do without realizing?',
  'If we were alone right now, what would you want to do?',
  'What\'s something you want to try with me that we haven\'t yet?',
  'What\'s your favorite memory of us being close?',
  'Do you like it when I take the lead or when you do?',
  'What\'s one compliment you want from me more often?',
  'What\'s your favorite kind of kiss from me?',
  'What\'s something small I do that turns you on?',
  'What about me makes you lose focus',
  'What part of me is impossible to resist?',
  'Who is more likely to give in first if we tease each other?',
  'Have you ever wanted me the wrong time?',
  'Do you like being in control or losing it?',
  'When is the first time you\'ve ever fantasise about me?',
  'When do you fel the urge to touch me more',
  'What thought about us you kept replaying in your head?',
  'Rank our physical chemisty among your relationships',
  'What moment between us felt the hottest?',
  'What part of me distracts you the most?',
  'What do I do that gets you instantly?',
  'What would you want to hear me whisper?',
  'When did you first imagine kissing me?',
  'What something I wear that drives you crazy?',
  'What part of me do you imagine the most?',
  'What\'s something you want to do but acts innocent about?',
  'If I say "show me", what would you show first?',
  'What\'s one thing you want me to do next time we\'re alone?',
  'What\'s one thing I do that makes you feel weak in the best way?',
  'What do you think if the sexiest thing I\'ve ever done?',
  'What would you rate our last time?',
  'What do you secretly hope I\'m wearing when we cuddle?',
  'What does my scent remind you of?',
  'Where do you like me kissing you most, besides your lips?',
  'What\'s the least innocent thought you\'ve had about me in public?',
  'If I dare you to kiss me in front of your friends, would you do it?',
  'Do you ever replay our first kiss in your head?',
] as const;

/** "Me or you" questions for couples games. */
export const ME_OR_YOU_QUESTIONS = [
  'Who’s more in love right now?',
  'Who thinks more about the other person?',
  'Who would struggle more if this ended?',
  'Who’s settling and who’s reaching in this relationship?',
  'Who gets hit on more often?',
  'Who’s more likely to sleep in and miss an exam?',
  'Who would more likely be late and miss a flight?',
  'Who has a wilder past?',
  'Who would be a better parent?',
  'Who’s funnier?',
  'Who is more athletic?',
  'Who is more likely to become successful?',
  'Who is smarter?',
  'Who is more popular?',
  'Who is more tempted by lust?',
  'Who is more confident?',
  'Who is more toxic?',
  'Who is more likely to start a fight?',
  'Who makes no sense?',
  'Who is always right?',
  'Who has more friends?',
  'Who has a better body?',
  'Who is more likely to become sugar daddy / mama?',
  'Who is more likely to cheat?',
  'Who is more likely to lie?',
  'Who is more immature?',
  'Who is more fashionable?',
  'Who has better sense of humor?',
  'Who is better at flirting?',
  'Who is more likely to survive in deserted island?',
  'Who is more likely to win a fight against a kangaroo?',
  'Who is more likely to be famous?',
  'Who is more likely to be on the Forbes list?',
  'Who is more likely to have a one night stand?',
  'Who is more likely to have an onlyfans?',
] as const;

/** Brave / uncomfortable-but-healthy questions for couples. */
export const BRAVE_QUESTIONS = [
  'If someone else offered you what I never could, would you be tempted?',
  'What scares you most about how much you love me?',
  'When was the last time I disappointed you, but you stayed silent just to keep peace?',
  'Is there a part of yourself that you feel you have to suppress to make me happy?',
  'Do you love who I am right now, or are you in love with my potential?',
  'If someone from your past wanted a second chance with you, would you give it to them?',
  "What's one thing about our relationship that makes you feel completely secure?",
  "Have you ever doubted that I'm the one for you?",
  "What's a memory of us that you replay when you're alone?",
  "What's something you've realized about love because of me?",
  'What\'s the most "that\'s my girl" thing I\'ve ever done?',
  'When did you last look at me and think "damn, she\'s mine?"',
  'What do I do that gives you butterflies even now?',
  "What's your favorite thing about me that isn't physical?",
  'What moment made you realize I was different from everyone else?',
  "What's one difference between us that you love?",
  "What's the one thing I've changed your mind about?",
  'Is there a part of you that you feel you need to hide from me?',
  "What's the most supportive thing I've done for you that you'll never forget?",
  'If you could grant us one wish for our future together, what would it be?',
  "If someone asked why you're dating me, what would you tell them?",
  "What's one trait of mine you hope never changes?",
  'What is the one thing I do that makes you feel the most loved?',
  'What was the specific moment you knew you wanted to be with me?',
  'What makes you proud to introduce me as your partner?',
  "If someone told you I wasn't the right person for you, what would you say to defend us?",
  "What's one small thing I do that means so much more to you than I realize?",
  'If your mom asked what kind of girlfriend I am, what would you say?',
  "What's one thing I do that makes you roll your eyes but secretly love?",
  "What's the first thing you told your best friend about me?",
  'What would your younger self think if she saw you dating me?',
  "What do you love about us that other couples don't have?",
  "Who in your life didn't want us to date?",
  "What's the most difficult thing about being with me?",
  'Have you ever felt embarrassed by me in front of your friends?',
  "What's one thing you miss about your single life?",
  'What did you first tell your family about me?',
  "What's the one thing about our relationship that makes you the happiest?",
  'If we could start a new tradition together, what would you want it to be?',
  "What's a lesson about love that you've learned from us being together?",
  'What is the one thing about me that is hardest for you to understand?',
  'Do you feel like you can be 100% your unfiltered self around me?',
  'If I lost everything I have today, would you honestly look at me the same way?',
  'How do you feel when I cry?',
  'What do you find most difficult about me?',
  "If I woke up tomorrow and didn't remember us, would you try again?",
  "What's something you hold back from saying to protect me?",
  "What's one thing about me that made you stop looking for someone else?",
  'Am I actually your type or did I just grow on you?',
  'Who was the first person you told when you realized you really liked me?',
  'What was the first thing I did that made you realize you were really into me?',
  "What's something about me you never expected to become so attached to?",
  'If we met for the first time today, knowing everything you know about me now, would you still make the first move?',
  'If your ex texted you out of the blue saying "I miss you", would you reply, ignore it, or tell me right away?',
  "How would you react if your friends told you I wasn't good enough for you?",
  'If I felt uncomfortable with one of your friends, would you set boundaries or tell me I was overreacting?',
  'Do you ever think your life would be easier without me?',
  'Do you ever feel like you settled by choosing me?',
  'If you fell out of love with me, would you tell me or stay until I figured it out?',
  'Did you genuinely choose me or did I just make it easy for you to choose me?',
  'Have I ever done something that made you question whether we should still be together?',
] as const;

export type ConcreteQuestionType = 'funny' | 'flirty' | 'me_or_you' | 'brave';
export type AutomateQuestionType = ConcreteQuestionType | 'random';

export const CONCRETE_QUESTION_TYPES: readonly ConcreteQuestionType[] = [
  'funny',
  'flirty',
  'me_or_you',
  'brave',
] as const;

/** Google Drive folder for kawaii image-tab batch uploads. */
export const KAWAII_DRIVE_FOLDER_ID = '1UqY0kLtlBXLd6q8NGTtK6UYOquoOzmKb';

/** Google Drive folder for Couples Nature (video tab) image uploads. */
export const COUPLES_NATURE_DRIVE_FOLDER_ID = '1wStPbE2B6QytCh0yKbf7sNMzePwfP9PN';

/** Pexels search queries for video template 2 background regeneration. */
export const VIDEO_TEMPLATE2_PEXELS_QUERIES = [
  'sunrise couples',
  'couple sunset',
  'sunrise beach',
  'sunset beach',
  'sunset ocean',
  'mountains',
  'waves'
] as const;

/** Pexels search queries for Nighty Particle video background. */
export const NIGHTY_PARTICLE_PEXELS_QUERIES = [
  'particle simulation',
  'particle wave',
] as const;

/** Pexels background scenes for Nighty Rain template. */
export type NightyRainVideoId = 'rain' | 'ocean';

export type NightyRainVideoOption = {
  id: NightyRainVideoId;
  label: string;
  pexelsQuery: string;
};

export const NIGHTY_RAIN_VIDEO_OPTIONS: NightyRainVideoOption[] = [
  {
    id: 'rain',
    label: 'Rain',
    pexelsQuery: 'night rain trees',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    pexelsQuery: 'ocean',
  },
];

export const NIGHTY_RAIN_DEFAULT_VIDEO: NightyRainVideoId = 'rain';

export function nightyRainVideoOption(id: NightyRainVideoId): NightyRainVideoOption {
  return (
    NIGHTY_RAIN_VIDEO_OPTIONS.find((v) => v.id === id) ?? NIGHTY_RAIN_VIDEO_OPTIONS[0]!
  );
}

/** @deprecated Prefer nightyRainVideoOption(id).pexelsQuery */
export const NIGHTY_RAIN_PEXELS_QUERIES = ['night rain trees'] as const;

export const NIGHTY_RAIN_CAPTION = 'The only sound you need to fall asleep';
export const NIGHTY_RAIN_CAPTION_SUBLINE = 'Nighty - Sleep and Sound';

/**
 * Cinematic Rain atmosphere — lighter mist so the footage stays visible.
 */
export const NIGHTY_RAIN_MIST_WASH = 'rgba(18, 28, 48, 0.18)';
export const NIGHTY_RAIN_MIST_TOP =
  'linear-gradient(to bottom, rgba(12, 22, 42, 0.28) 0%, rgba(30, 50, 80, 0.1) 28%, rgba(40, 70, 100, 0) 50%)';
export const NIGHTY_RAIN_MIST_BOTTOM =
  'linear-gradient(to top, rgba(8, 14, 28, 0.3) 0%, rgba(25, 45, 75, 0.12) 35%, rgba(50, 80, 110, 0) 65%)';
export const NIGHTY_RAIN_MIST_VIGNETTE =
  'radial-gradient(ellipse 72% 68% at 50% 42%, rgba(10, 16, 32, 0) 0%, rgba(10, 18, 36, 0.12) 45%, rgba(4, 8, 18, 0.4) 100%)';
export const NIGHTY_RAIN_MIST_BLOOM =
  'radial-gradient(ellipse 55% 45% at 50% 46%, rgba(120, 150, 190, 0.08) 0%, rgba(90, 120, 160, 0.03) 40%, rgba(60, 90, 130, 0) 70%)';
export const NIGHTY_RAIN_MIST_TEAL =
  'linear-gradient(160deg, rgba(40, 90, 120, 0.1) 0%, rgba(20, 40, 70, 0) 45%, rgba(60, 40, 90, 0.05) 100%)';

/** @deprecated Prefer mist layers / drawNightyRainMistOverlay. */
export const NIGHTY_RAIN_DIM_OVERLAY = NIGHTY_RAIN_MIST_WASH;

export const NIGHTY_RAIN_MAX_DURATION_SEC = 10;

export const NIGHTY_RAIN_EXPORT_WIDTH = 1080;
export const NIGHTY_RAIN_EXPORT_HEIGHT = 1920;
export const NIGHTY_RAIN_EXPORT_VIDEO_BITRATE = 10_000_000;
/** Steadier encode than 30fps when decoding HD Pexels + canvas. */
export const NIGHTY_RAIN_EXPORT_FPS = 24;

export const NIGHTY_RAIN_CAPTION_SIZE_RATIO = 0.034;
/** Brand footer line — smaller than the main caption. */
export const NIGHTY_RAIN_SUBLINE_SIZE_RATIO = 0.022;
export const NIGHTY_RAIN_CAPTION_MAX_WIDTH_RATIO = 0.72;
export const NIGHTY_RAIN_CAPTION_FONT_WEIGHT = 500;
/** Vertical position of brand subline (from top of frame). */
export const NIGHTY_RAIN_SUBLINE_Y_RATIO = 0.75;
/** Rain caption fill — clean white, no shadow. */
export const NIGHTY_RAIN_CAPTION_COLOR = '#ffffff';

/** Background rain beds for Rain preview + export. */
export type NightyRainSoundId =
  | 'light-rain'
  | 'heavy-rain'
  | 'rain-on-trees'
  | 'rain-on-window'
  | 'rain-on-roof'
  | 'roaring-waves'
  | 'wave-on-rock'
  | 'wave-on-shore'
  | 'wave-on-lava-rock'
  | 'calm-waves'
  | 'small-waves';

export type NightyRainSoundKind = 'rain' | 'waves';

export type NightyRainSoundOption = {
  id: NightyRainSoundId;
  label: string;
  audioSrc: string;
  kind: NightyRainSoundKind;
};

export const NIGHTY_RAIN_SOUND_OPTIONS: NightyRainSoundOption[] = [
  {
    id: 'light-rain',
    label: 'Light rain',
    audioSrc: '/nighty-rain/light-rain.mp3',
    kind: 'rain',
  },
  {
    id: 'heavy-rain',
    label: 'Heavy rain',
    audioSrc: '/nighty-rain/heavy-rain.mp3',
    kind: 'rain',
  },
  {
    id: 'rain-on-trees',
    label: 'Rain on trees',
    audioSrc: '/nighty-rain/rain-on-trees.mp3',
    kind: 'rain',
  },
  {
    id: 'rain-on-window',
    label: 'Rain on window',
    audioSrc: '/nighty-rain/rain-on-window.mp3',
    kind: 'rain',
  },
  {
    id: 'rain-on-roof',
    label: 'Rain on roof',
    audioSrc: '/nighty-rain/rain-on-roof.mp3',
    kind: 'rain',
  },
  {
    id: 'calm-waves',
    label: 'Calm waves',
    audioSrc: '/nighty-rain/calm-waves.mp3',
    kind: 'waves',
  },
  {
    id: 'small-waves',
    label: 'Small waves',
    audioSrc: '/nighty-rain/small-waves.mp3',
    kind: 'waves',
  },
  {
    id: 'roaring-waves',
    label: 'Roaring waves',
    audioSrc: '/nighty-rain/roaring-waves.mp3',
    kind: 'waves',
  },
  {
    id: 'wave-on-rock',
    label: 'Wave on rock',
    audioSrc: '/nighty-rain/wave-on-rock.mp3',
    kind: 'waves',
  },
  {
    id: 'wave-on-shore',
    label: 'Wave on shore',
    audioSrc: '/nighty-rain/wave-on-shore.mp3',
    kind: 'waves',
  },
  {
    id: 'wave-on-lava-rock',
    label: 'Wave on lava rock',
    audioSrc: '/nighty-rain/wave-on-lava-rock.mp3',
    kind: 'waves',
  },
];

/** Default bed for Rain video (matches default video id). */
export const NIGHTY_RAIN_DEFAULT_SOUND: NightyRainSoundId = 'light-rain';
export const NIGHTY_RAIN_DEFAULT_OCEAN_SOUND: NightyRainSoundId = 'calm-waves';

export function nightyRainSoundOption(id: NightyRainSoundId): NightyRainSoundOption {
  return (
    NIGHTY_RAIN_SOUND_OPTIONS.find((s) => s.id === id) ?? NIGHTY_RAIN_SOUND_OPTIONS[0]!
  );
}

export function nightyRainSoundKindForVideo(
  videoId: NightyRainVideoId
): NightyRainSoundKind {
  return videoId === 'ocean' ? 'waves' : 'rain';
}

export function nightyRainSoundsForVideo(
  videoId: NightyRainVideoId
): NightyRainSoundOption[] {
  const kind = nightyRainSoundKindForVideo(videoId);
  return NIGHTY_RAIN_SOUND_OPTIONS.filter((s) => s.kind === kind);
}

export function nightyRainDefaultSoundForVideo(
  videoId: NightyRainVideoId
): NightyRainSoundId {
  return videoId === 'ocean'
    ? NIGHTY_RAIN_DEFAULT_OCEAN_SOUND
    : NIGHTY_RAIN_DEFAULT_SOUND;
}

export function nightyRainAudioSrc(soundId: NightyRainSoundId): string {
  return nightyRainSoundOption(soundId).audioSrc;
}

/**
 * Local test clip — skip Pexels while iterating on caption animation.
 * File lives at public/nighty-particle/test-background.mp4 (gitignored; large).
 */
export const NIGHTY_PARTICLE_USE_TEST_VIDEO = true;
export const NIGHTY_PARTICLE_TEST_VIDEO_SRC = '/nighty-particle/test-background.mp4';

/** Export canvas — fixed 9:16 so landscape sources are center-cropped. */
export const NIGHTY_PARTICLE_EXPORT_WIDTH = 1080;
export const NIGHTY_PARTICLE_EXPORT_HEIGHT = 1920;
/** ~8 Mbps — stable 1080p30 encode (4K realtime capture is too laggy). */
export const NIGHTY_PARTICLE_EXPORT_VIDEO_BITRATE = 8_000_000;

/** Primary white line — fades in first. */
export const NIGHTY_PARTICLE_LINE1 = 'Having trouble sleeping?';

/** Secondary accent line — fades in below line 1. */
export const NIGHTY_PARTICLE_LINE2 = 'try Triangle waves';

export const NIGHTY_PARTICLE_LINE2_COLOR = '#FF6BB5';

/** Wave bed options for Particle (caption copy + background audio). */
export type NightyParticleWaveId = 'triangle' | 'square' | 'gamma';

export type NightyParticleWaveOption = {
  id: NightyParticleWaveId;
  label: string;
  /** Accent line for beat 1 (“try …”). */
  line2: string;
  audioSrc: string;
};

export const NIGHTY_PARTICLE_WAVE_OPTIONS: NightyParticleWaveOption[] = [
  {
    id: 'triangle',
    label: 'Triangle wave',
    line2: 'try Triangle waves',
    audioSrc: '/nighty-particle/triangle-wave.mp3',
  },
  {
    id: 'square',
    label: 'Square wave',
    line2: 'try square waves',
    audioSrc: '/nighty-particle/square-wave.mp3',
  },
  {
    id: 'gamma',
    label: '35Hz Gamma waves',
    line2: 'Try 35Hz Gamma waves',
    audioSrc: '/nighty-particle/gamma-35hz.mp3',
  },
];

export const NIGHTY_PARTICLE_DEFAULT_WAVE: NightyParticleWaveId = 'triangle';

export function nightyParticleWaveOption(
  id: NightyParticleWaveId
): NightyParticleWaveOption {
  return (
    NIGHTY_PARTICLE_WAVE_OPTIONS.find((w) => w.id === id) ??
    NIGHTY_PARTICLE_WAVE_OPTIONS[0]!
  );
}

export function nightyParticleAudioSrc(waveId: NightyParticleWaveId): string {
  return nightyParticleWaveOption(waveId).audioSrc;
}

/** @deprecated Prefer nightyParticleAudioSrc(waveId). */
export const NIGHTY_PARTICLE_AUDIO_SRC = nightyParticleAudioSrc(
  NIGHTY_PARTICLE_DEFAULT_WAVE
);

/** Accent pinks for Particle captions — distinct hues (not near-identical shades). */
export const NIGHTY_PARTICLE_ACCENT_COLORS = [
  '#FF2D95', // hot magenta pink
  '#FF6BB5', // soft bubblegum
  '#FF1493', // deep neon pink
  '#F472B6', // rose
  '#FF5C8A', // coral pink
  '#E879F9', // orchid / pink-violet
  '#FF9ECF', // light candy pink
  '#DB2777', // raspberry
  '#FB7185', // salmon rose
  '#C026D3', // fuchsia
  '#FDA4AF', // blush
  '#FF0080', // electric pink
] as const;

export function pickNightyParticleAccentColor(exclude?: string): string {
  const pool =
    exclude && NIGHTY_PARTICLE_ACCENT_COLORS.length > 1
      ? NIGHTY_PARTICLE_ACCENT_COLORS.filter((c) => c.toLowerCase() !== exclude.toLowerCase())
      : [...NIGHTY_PARTICLE_ACCENT_COLORS];
  return pool[Math.floor(Math.random() * pool.length)] ?? NIGHTY_PARTICLE_LINE2_COLOR;
}

/** Second beat — white line after first pair fades out. */
export const NIGHTY_PARTICLE_LINE3 =
  "It's a pure tone that emits soft deep frequencies.";

/** Second beat — accent line below line 3. */
export const NIGHTY_PARTICLE_LINE4 =
  'Many find it helps them to relax, focus and sleep soundly.';

/** Third beat — white line after second pair fades out. */
export const NIGHTY_PARTICLE_LINE5 = 'Listen to it for 30 seconds.';

/** Third beat — accent line below line 5. */
export const NIGHTY_PARTICLE_LINE6 = 'See what it does to you';

/** Final CTA — three lines; middle brand line is accent color. */
export const NIGHTY_PARTICLE_LINE7 = 'Check out';
export const NIGHTY_PARTICLE_LINE8 = 'Nighty - Sleep and Sound';
export const NIGHTY_PARTICLE_LINE9 = 'for more calming sounds';

/** @deprecated Use NIGHTY_PARTICLE_LINE1 / LINE2. Kept for any leftover references. */
export const NIGHTY_PARTICLE_CAPTION = NIGHTY_PARTICLE_LINE1;

/** Horizontal padding each side (≥20%) → text uses at most 60% of frame width. */
export const NIGHTY_PARTICLE_CONTENT_MAX_WIDTH_RATIO = 0.6;

/** Caption size relative to frame width (smaller than default TikTok overlays). */
export const NIGHTY_PARTICLE_CAPTION_SIZE_RATIO = 0.038;

/** Inter-style geometric sans — matches Endel / clean sleep-content overlays. */
export const NIGHTY_PARTICLE_CAPTION_FONT_WEIGHT = 500;

export const NIGHTY_PARTICLE_FONT_STACK =
  'var(--font-inter), Inter, system-ui, -apple-system, sans-serif';

/** Canvas `font` family (CSS variables are not resolved in canvas). */
export const NIGHTY_PARTICLE_CANVAS_FONT_STACK = 'Inter, system-ui, -apple-system, sans-serif';

/**
 * Caption animation timeline (seconds).
 * Phase 1–3: white → wait gap → pink → hold → fade out
 * Phase 4: CTA block → hold → fade out
 */
export type NightyParticleTiming = {
  fadeInSec: number;
  fadeOutSec: number;
  /** Pause after white line before pink line in each phase. */
  gapAfterWhiteSec: number;
  phase1HoldSec: number;
  phase2HoldSec: number;
  phase3HoldSec: number;
  phase4HoldSec: number;
  /** Short beat of empty frame between phases. */
  betweenPhasesSec: number;
};

export const NIGHTY_PARTICLE_TIMING: NightyParticleTiming = {
  fadeInSec: 0.7,
  fadeOutSec: 0.8,
  gapAfterWhiteSec: 2,
  phase1HoldSec: 3,
  phase2HoldSec: 3,
  phase3HoldSec: 3,
  phase4HoldSec: 5,
  betweenPhasesSec: 0.25,
};

export type NightyParticleLines = {
  line1: string;
  line2: string;
  line3: string;
  line4: string;
  line5: string;
  line6: string;
  line7: string;
  line8: string;
  line9: string;
};

export const NIGHTY_PARTICLE_DEFAULT_LINES: NightyParticleLines = {
  line1: NIGHTY_PARTICLE_LINE1,
  line2: NIGHTY_PARTICLE_LINE2,
  line3: NIGHTY_PARTICLE_LINE3,
  line4: NIGHTY_PARTICLE_LINE4,
  line5: NIGHTY_PARTICLE_LINE5,
  line6: NIGHTY_PARTICLE_LINE6,
  line7: NIGHTY_PARTICLE_LINE7,
  line8: NIGHTY_PARTICLE_LINE8,
  line9: NIGHTY_PARTICLE_LINE9,
};

function nightyParticlePhaseDurationSec(
  timing: NightyParticleTiming,
  holdSec: number
): number {
  return (
    timing.fadeInSec +
    timing.gapAfterWhiteSec +
    timing.fadeInSec +
    holdSec +
    timing.fadeOutSec
  );
}

function nightyParticleCtaDurationSec(
  timing: NightyParticleTiming,
  holdSec: number
): number {
  // Three lines fade in one after another (fade + gap + fade + gap + fade), then hold, then fade out.
  return (
    timing.fadeInSec +
    timing.gapAfterWhiteSec +
    timing.fadeInSec +
    timing.gapAfterWhiteSec +
    timing.fadeInSec +
    holdSec +
    timing.fadeOutSec
  );
}

/** Preview / export loop length for the given timing. */
export function nightyParticleMaxDurationSec(timing: NightyParticleTiming): number {
  return (
    nightyParticlePhaseDurationSec(timing, timing.phase1HoldSec) +
    timing.betweenPhasesSec +
    nightyParticlePhaseDurationSec(timing, timing.phase2HoldSec) +
    timing.betweenPhasesSec +
    nightyParticlePhaseDurationSec(timing, timing.phase3HoldSec) +
    timing.betweenPhasesSec +
    nightyParticleCtaDurationSec(timing, timing.phase4HoldSec) +
    0.5
  );
}

/** @deprecated Prefer nightyParticleMaxDurationSec(timing). */
export const NIGHTY_PARTICLE_MAX_DURATION_SEC = nightyParticleMaxDurationSec(
  NIGHTY_PARTICLE_TIMING
);

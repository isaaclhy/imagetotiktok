/** Dreamy, romantic filter for Pexels image (Image mode) – preview, carousel, and export */
export const ROMANTIC_IMAGE_FILTER =
  'brightness(0.82) contrast(0.88) saturate(0.72) sepia(0.18) hue-rotate(-8deg)';

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

/** Image prompts with {x} placeholder for dynamic text. */
export const PROMPTS = [
  'A baseball cap, a bit worn out but the cap is in red, the text "{x}" embroidered on it. the text should be in white and the text should occupy only the center 70% of the screen space, leave some padding on the side. No need to show the entire cap, the text should be in the center',
  `First-person POV inside a bright modern coffee shop during daytime, a feminine woman's hand holding an iPhone while viewing an Instagram story. Natural daylight pours through large windows, creating soft bright lighting and realistic shadows. A few people are sitting and casually talking in the background, slightly blurred and out of focus so they add atmosphere without distracting from the main subject. The scene feels natural and candid, like a real smartphone photo. The hand has feminine features with slender fingers, natural nails, and realistic skin texture. The phone screen is very bright and visually striking, emitting a vivid saturated bright red glow that immediately draws attention while still looking like a real phone display. On the Instagram story is a solid bright red background with la  rge centered bold white text: "{x}" Shallow depth of field, photorealistic, realistic iPhone proportions, authentic coffee shop atmosphere, iPhone camera photo style, natural composition, no CGI appearance.`,
  'First person POV, holding a white canvas with 2 hand marks from paint, one should be sky blue and one should be pink and on the canvas, it should also have the text "{x}". The text is facing you directly',
  'Close up holding a piece of very very small torn paper, almost thumbnail size, on the paper it\'s written "{x}", it\'s like the text is typed using a type writer. Make it realistic. The text should be very clear on the piece of paper',
  'A finished puzzle, on the puzzle should have the text "{x}". Make the text cartoon style. The puzzle should be at an angle such that the text is directly facing me ',
  `Ultra realistic candid photo of a real couple watching a projector movie late at night in a small apartment living room.

Shot from behind the couch at eye level. We only see the backs of the couple. The woman is leaning on the man’s shoulder naturally.

A real projector on the coffee table projects onto a slightly wrinkled white bedsheet hanging on the wall.

The projected text is the main focus and reads exactly:

"{x}"

Large bold condensed black sans-serif text on a bright white projection, perfectly legible and centered.

Natural low-light photography, realistic apartment, imperfect couch fabric, subtle room clutter, authentic shadows, slight sensor noise, soft projector glow, visible light beam particles.

Looks like a candid photo taken on a DSLR camera, not AI art, not a digital illustration.

Realistic skin texture, realistic hair, natural posture, believable proportions, documentary photography style.

No front-facing people, no fake cinematic lighting, no surrealism, no glossy surfaces, no perfect furniture, no extra text, no distorted letters, no watermark.`,
  'Picking ice cream among a bunch of flavors in the shop and on one of the flavor cards, it says "{x}". The text should be zoomed in and facing straight to you',
  'First person POV, making a heart pottery for girlfriend and on the pottery has the text "{x}" painted on it. The pottery is white and the text should be red',
  'A couple looking at a piece of art in a museum. we can only see their back and the girl\'s head is leaning slightly on the guy\'s shoulder. The art has the text "{x}" the art is very cartoony',
  'First person POV, in a drawing class. On the canvas, you painted a very simple image of a couple looking at the sunset, not fully colored yet, and below there\'s also this thick text: "{x}". You should be facing straight at the canvas, not at a angle. And zoom into the canvas',
  'First person POV, on the tube, youre sitting across a person reading a book, on the book cover, it should be cartoon style and the title should be "{x}". zoom in on the text',
  'First person POV, playing billiard and the text "{x}" is written with white chalk on the billiard table. Make it realistic and the text should be written on the table',
  'First person POV, you\'re in a pottery painting class. The pottery is half painted, on it has the text "{x}" painted on it. Make it realistic. The text should be facing you straight. The text should be painted in a color where there\'s huge contrast to the pottery',
  'Girl holding a white pottery plate covering half of the face slightly smiling, on the plate it says "{x}"',
  'First person POV, In a record store with a lot of records, one of the records say "{x}" on the record cover',
  'First person POV, youre making a cake, on the top of the cake has the words "{x}" written in frosting. The cake and the frosting should have contrasting color. The text should not be cursive',
  'First person POV, you\'re in a packed theatre holding a theatre leaflet about the show, on the leaflet has the text "{x}" printed on the leaflet',
  'First person POV, you\'re ice skating with your girlfriend (can only see her arms), on the ice has the text "{x}" spray painted on the ice',
  `First-person POV sitting on grass in a park, painting on a white canvas directly in front of you. The camera/viewpoint is perfectly centered and perpendicular to the canvas surface. The canvas is perfectly upright, flat facing the viewer head-on (0° rotation), centered in frame, with no tilt, no perspective skew, symmetrical alignment. Hands holding paintbrush visible at bottom of frame. On the canvas is a red heart and the text: "{x}"`,
  'First person POV, you\'re doing a white tile drawing lesson. There are some stickers on it, there should be a text saying "{x}" painted on it with brush. The text should not be black. The tile should be facing you, the edges of the tile should be parallel to the frame',
  'First person POV, you\'re holding a cute polaroid image and on it has "{x}" written on it with marker and a heart. Focus on the text',
  'First person POV, with girlfriend on the beach (she\'s not in the picture), holding a cute polaroid, on the polaroid should be a couple and there\'s a text "{x}" written in marker with a heart',
  'First person POV, in a huge college lecture hall full of students, there\'s a professor in the center stage pointing at the lecture slides in presentation mode. Inside the slide the background should be red, it should say "{x}", make it realistic. Zoom into the slides where the text is since it should be the main focus',
  'Walking in a college town along frat row, on one of the flags it says "{x}". The flag should be red. It should be a very snowy day, the flag should occupy most of the screen space and the text should be the main focus',
  'On a highway bridge, there\'s a clean white poster hanging down with the text "{x}" spray painted in red, with a heart spray painted at the bottom as well. The poster should occupy the center 70% of the image and is the main focus',
  'On a snowy street in New York City, there\'s a restaurant red metal sign in a heart shape, on it there\'s text "{x}" painted on it in white, it should be in the center of the image. Must be realistic',
  'In a bright NYC coffee shop, a female hand holding a condom wrapper with the text "{x}" on it. Make it very realistic',
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
  'First person POV, you\'re standing on a crowded tube station platform and looking across the tracks at a big ad board. On the ad board, the text "{x}" is displayed. Make the text the main focus, zoom in on it, and face straight toward the ad. The text should be facing you directly.',
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
  'If someone offered you $1 mil to punch me in the face as hard as you can, would you do it?',
  'How long would I have to be in a coma for, before you to start dating other people?',
  'How long would I have to be in a coma for before you start using dating apps again?',
  'If you found a soulmate, would you leave me for them?',
  'If I have to spend a night at one of your friend\'s place, who\'s would you not let me spend it at?',
  'Would you rather I kiss your best friend once or stay loyal but never have sex with you again?',
  'Would you rather wake up tomorrow with zero memory of me or know everything about me but be forced to break up right now?',
  'Would you rather I become "too hot" or stay average?',
  'If I cheated once but confessed immediately, would you forgive me?',
  'What would you do if one of your friends ask me to go to a party with them, just me and them?',
  'Marry me right now or wait 10 years to be sure?',
  'Spend a night with your ex or lose $50,000?',
  'Would you rather see me flirt with someone or see someone flirt with me?',
  'When am I better looking, now or when we first met?',
  'If you have to pick between me or unlimited shopping forever, what would you pick?',
  'Would you rather know my biggest turn on or my biggest turn off?',
  'Would you rather drop all your friends or the relationship?',
  'Is it cheating if I\'m still friends with a person I used to like?',
  'Would you still love me if I have a body count of over 100?',
  'Is it cheating if I sleep in the same bed with an opposite sex friend but they\'re gay?',
  'Would you rather never kiss me again or argue with me everyday?',
  'Would you rather cheat on me or never be able to see me again?',
  'Would you rather have 100 kids or no kids at all?',
  'Would you still love me if my lower body is paralyzed?',
  'Would you rather forget me for a day or let me read all your DMs?',
  'Would you rather hook up with you ex or have my ex hook up with me?',
  'Would you rather get $1 mil but I can\'t celebrate your birthday with you or spend your birthday with me?',
  'Who do you love more, your mom or me?',
  'Would you rather I text my ex once or you stop using TikTok?',
  'If my ex offered me $50,000 to meet them for dinner, would you let me go?',
  'Would you rather I have a wild past or a boring one?',
  'Is our relationship good or you\'ve just never had any better?',
  'Which one fits me best, intelligent but ugly or beautiful but dumb?',
  'Would you rather give up video games for a year or give up complaining for a year?',
  'Who from my friend group do you think is secretly into you?',
  'Would you rather have 10 million dollars right now, but never see me again, or stay with me and be broke?',
  'If you had a one-time-use time machine to alter one thing about our relationship, what are you changing?',
  'Would you rather go back in time so you could know me longer, or spend more time with me now?',
  'Would you rather hold my hand for four hours straight every day or never hold it again?',
  'Would you rather TikTok Live all our arguments, or never use the Internet again?',
  'If we are in Beauty and the Beast, who\'s the beauty and who\'s the beast?',
  'Would you rather be paralyzed from the neck down or hug another woman?',
  'Would you rather kiss another woman or fight a grizzly bear?',
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
  'Would you rather eay my cooking daily or always have takeaway?',
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

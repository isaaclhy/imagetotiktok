/** OpenAI cover variant for Image Template 3 — overhead-in-bed shot. */
export const IMAGE_TEMPLATE3_OPENAI_COVER_PROMPT = `Photorealistic candid smartphone photo of a beautiful brunette woman in her early 20s lying comfortably on her back in bed at night. The camera is positioned directly above her, looking straight down at her from a natural phone-camera distance. The perspective should feel casual and spontaneous, not like a professional portrait.

She is not holding the phone, and no phone or hands are visible anywhere in the frame.

She has the appearance of a pretty, feminine American college girl with long naturally tousled brunette hair spread loosely across the pillow. She has healthy natural skin, soft feminine features, subtle everyday makeup, lightly defined lashes and brows, and a fresh, youthful appearance.

She is wearing a very oversized soft pastel pink hoodie. The hoodie fabric is loosely pulled upward around her lower face so that it naturally covers her mouth, while her nose, cheeks and eyes remain visible. The fabric should look soft and slightly messy rather than tightly wrapped around her face.

Her body is relaxed and slightly imperfectly positioned on the bed. Her shoulders are not perfectly symmetrical, her head is turned just a tiny amount to one side, and her hair is naturally messy against the pillow. Her posture should look like she has been lying in bed for a while, not like she deliberately posed for a photograph.

Her facial expression should be soft, relaxed and subtly amused, as if she just noticed the camera. She has a very slight natural smile visible through her cheeks and eyes. Her eyelids are relaxed, her eyebrows are neutral, and her gaze is soft rather than intense. She should look comfortable, cozy and approachable — never scared, startled, sad, exhausted, creepy or overly serious.

Avoid a perfectly symmetrical face-forward pose. Her expression should have the tiny imperfections of a spontaneous photo: relaxed eyes, slightly uneven expression, naturally positioned head and subtly messy hair.

The bedroom is genuinely dark at night. All artificial lights are OFF. No bedside lamp, fairy lights, LEDs or ceiling lights are illuminated. Only extremely faint ambient light from outside the room softly illuminates the scene. Keep the lighting understated and realistic.

The image should look like a completely unedited photo taken casually on a real smartphone in low light. Natural skin texture, realistic shadows, mild high-ISO grain, subtle sensor noise, slight softness and imperfect exposure. No beauty filter, no cinematic lighting, no color grading, no artificial glow, no HDR, no skin smoothing and no polished influencer aesthetic.

The bedroom should feel cute and feminine but realistically lived-in: slightly rumpled cream bedding, soft pillows and a few subtle personal details. Keep the background dark and secondary.

The overall feeling should be: a pretty college girl lazily lying in bed late at night, cozy in her oversized pink hoodie, casually glancing toward the camera. It should feel accidental, intimate and completely natural rather than posed.

IMPORTANT: She is lying on her BACK, not her side. Her hands must remain completely out of frame. The hoodie fabric, not her hands, covers her mouth. Do not show the phone. No camera UI, REC indicator, shutter button, status bar, icons, text, borders or overlays.`;

/** Tallest portrait size the images endpoint offers. */
export const IMAGE_TEMPLATE3_OPENAI_COVER_SIZE = '1024x1536' as const;

/** Cover generator picker shown above the question type on Template 3. */
export type ImageTemplate3CoverModel = 'claude' | 'openai';

export const IMAGE_TEMPLATE3_COVER_MODEL_DEFAULT: ImageTemplate3CoverModel = 'claude';

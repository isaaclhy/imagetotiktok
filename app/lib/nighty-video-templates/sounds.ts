/**
 * Audio for the new Nighty compositions only.
 * Files are the GoSleep/Nighty tracks from isaaclhy/nighty commit 2a2f6feb,
 * copied under public/nighty-source so public/nighty-rain (Particle and Rain)
 * stays untouched. Display names are the in-app labels. ID3 on these files is
 * an encoder tag only. No license was found in the source, so this is not a
 * royalty-free claim.
 */
export type NightySourceSoundId =
  | 'light-rain'
  | 'heavy-rain'
  | 'downpour'
  | 'rain-on-window'
  | 'rain-on-roof'
  | 'rain-on-leaves'
  | 'rain-on-banana-trees'
  | 'gentle-waves'
  | 'shore-waves'
  | 'waves-on-rocks'
  | 'waves-on-lava-rocks'
  | 'waves-on-cliffs'
  | 'brown-noise'
  | 'white-noise';

export type NightySourceSoundKind = 'rain' | 'waves' | 'noise';

export type NightySourceSound = {
  id: NightySourceSoundId;
  /** In-app display name from Nighty constants/sounds.ts. */
  label: string;
  audioSrc: string;
  kind: NightySourceSoundKind;
  sourcePath: string;
  sha256: string;
};

export const NIGHTY_SOURCE_COMMIT = '2a2f6febda6d80ed8d07b23965a4efcadb4a4b4e';

export const NIGHTY_SOURCE_SOUND_OPTIONS: readonly NightySourceSound[] = [
  {
    id: 'light-rain',
    label: 'Light rain on cement',
    audioSrc: '/nighty-source/light-rain.mp3',
    kind: 'rain',
    sourcePath: 'assets/sounds/light-rain.mp3',
    sha256: '149b7125e8dc507f1f1a25c9b4dc8e95d274e61f8e802d905d0dea31a04aed66',
  },
  {
    id: 'heavy-rain',
    label: 'Heavy Rain',
    audioSrc: '/nighty-source/heavy-rain.mp3',
    kind: 'rain',
    sourcePath: 'assets/sounds/heavy-rain.mp3',
    sha256: 'e52304f9739e0e60e1d351ed41fb5696bb559578dd4c42d2b8952dd0cb6256be',
  },
  {
    id: 'downpour',
    label: 'Downpour',
    audioSrc: '/nighty-source/downpour.mp3',
    kind: 'rain',
    sourcePath: 'assets/sounds/downpour.mp3',
    sha256: '94448e95804258f981cfe4d5bf00a82008382d7175c091c67c3e110c106babaf',
  },
  {
    id: 'rain-on-window',
    label: 'Rain on window',
    audioSrc: '/nighty-source/rain-on-window.mp3',
    kind: 'rain',
    sourcePath: 'assets/sounds/rain-on-window.mp3',
    sha256: '3c16f61faefc5f4a6381febb375250a5037b98efe5b4a8cadceed78f174a2872',
  },
  {
    id: 'rain-on-roof',
    label: 'Rain on roof',
    audioSrc: '/nighty-source/rain-on-roof.mp3',
    kind: 'rain',
    sourcePath: 'assets/sounds/rain-on-roof.mp3',
    sha256: '7308ccdcacc2ffbdaae676fc45b763e3a8590343ecb4085496e3b4b240a5720f',
  },
  {
    id: 'rain-on-leaves',
    label: 'Rain on Leaves',
    audioSrc: '/nighty-source/rain-on-leaves.mp3',
    kind: 'rain',
    sourcePath: 'assets/sounds/rain-on-leaves.mp3',
    sha256: '08c94728f4d47e40138ae08a1275c9df323d5b78b715d9fdbd7c85663f8dfd35',
  },
  {
    id: 'rain-on-banana-trees',
    label: 'Rain on banana trees',
    audioSrc: '/nighty-source/rain-on-banana-trees.mp3',
    kind: 'rain',
    sourcePath: 'assets/sounds/rain-on-banana-trees.mp3',
    sha256: '25e5aa1b8b0fdd136fdfb43993595e07bc63e99e51c2af4e8d60c559c7a8cb65',
  },
  {
    id: 'gentle-waves',
    label: 'Gentle Waves',
    audioSrc: '/nighty-source/gentle-waves.mp3',
    kind: 'waves',
    sourcePath: 'assets/sounds/gentle-waves.mp3',
    sha256: 'e6afaae6584821dd299403acb73b813a9cacb41bd9de52e62cf082c89044468c',
  },
  {
    id: 'shore-waves',
    label: 'Shore Waves',
    audioSrc: '/nighty-source/shore-waves.mp3',
    kind: 'waves',
    sourcePath: 'assets/sounds/shore-waves.mp3',
    sha256: '252e7ed6949771a2f849dfaea7461d8ef965d26f29f9801e68fd9f2218fd849f',
  },
  {
    id: 'waves-on-rocks',
    label: 'Waves on rocks',
    audioSrc: '/nighty-source/waves-on-rocks.mp3',
    kind: 'waves',
    sourcePath: 'assets/sounds/waves-on-rocks.mp3',
    sha256: '9ec87d5f04df70f60485088f273751f2ce1714eccc2445f3ee5a3239a467eb0d',
  },
  {
    id: 'waves-on-lava-rocks',
    label: 'Waves on lava rocks',
    audioSrc: '/nighty-source/waves-on-lava-rocks.mp3',
    kind: 'waves',
    sourcePath: 'assets/sounds/waves-on-lava-rocks.mp3',
    sha256: '81c9ebf1435aeba22bdd838145adc1db1507b3188924bfa5744c0dfb52b25c25',
  },
  {
    id: 'waves-on-cliffs',
    label: 'Waves on cliffs',
    audioSrc: '/nighty-source/waves-on-cliffs.mp3',
    kind: 'waves',
    sourcePath: 'assets/sounds/waves-on-cliffs.mp3',
    sha256: 'cf1b949c4c0ad78874795173c96432faa2b0d81a110914ad816b239cb53cf1f5',
  },
  {
    id: 'white-noise',
    label: 'White Noise',
    audioSrc: '/nighty-source/white-noise.mp3',
    kind: 'noise',
    sourcePath: 'assets/sounds/white-noise.mp3',
    sha256: 'd644b0207e38cc73e395bd08d847dfdbecd39986aa3e8de4e69d9445b99fe417',
  },
  {
    id: 'brown-noise',
    label: 'Brown',
    audioSrc: '/nighty-source/brown-noise.mp3',
    kind: 'noise',
    sourcePath: 'assets/sounds/brown-noise.mp3',
    sha256: '0cd0bb9bebcd174cd68a2472c96303bae36c144ab3ad48e84843d0b61d27872b',
  },
];

export function nightySourceSound(id: NightySourceSoundId): NightySourceSound {
  return (
    NIGHTY_SOURCE_SOUND_OPTIONS.find((sound) => sound.id === id) ??
    NIGHTY_SOURCE_SOUND_OPTIONS[0]!
  );
}

export function nightySourceAudioSrc(id: NightySourceSoundId): string {
  return nightySourceSound(id).audioSrc;
}

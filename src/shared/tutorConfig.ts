export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type AudienceGroup = 'adults' | 'kids';

export type AllenCharacterId = 'daniel' | 'marcus' | 'laura' | 'sofia' | 'leo' | 'mia';

export type ScenarioIconName =
  | 'coffee'
  | 'building'
  | 'utensils'
  | 'plane'
  | 'briefcase'
  | 'shopping-bag'
  | 'users'
  | 'trending-up'
  | 'graduation-cap'
  | 'film'
  | 'heart-pulse'
  | 'trophy'
  | 'paw-print'
  | 'palette'
  | 'home'
  | 'zap'
  | 'ice-cream'
  | 'backpack'
  | 'rocket'
  | 'sun'
  | 'wand';

export type AvatarState =
  | 'IDLE'
  | 'LISTENING'
  | 'THINKING'
  | 'SPEAKING'
  | 'INTERRUPTED';

export type AvatarExpression =
  | 'neutral'
  | 'joy'
  | 'surprise'
  | 'concentration'
  | 'congratulation';

export type ConnectionStatus =
  | 'idle'
  | 'requesting_mic'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error'
  | 'ended';

export type TutorVoiceName = 'Zephyr' | 'Fenrir' | 'Kore' | 'Puck';

export type SpanishSupportMode = 'auto' | 'always' | 'english_only';

export type KidsAgeBand = '5-6' | '7-8' | '9';

export type PracticeDurationOption = 'ask' | 5 | 10 | 15;

export interface PracticeDurationDescriptor {
  id: PracticeDurationOption;
  labelEs: string;
  shortLabelEs: string;
}

export const PRACTICE_DURATION_OPTIONS: PracticeDurationDescriptor[] = [
  { id: 'ask', labelEs: 'Preguntar al iniciar', shortLabelEs: 'Preguntar' },
  { id: 5, labelEs: '5 minutos', shortLabelEs: '5 min' },
  { id: 10, labelEs: '10 minutos', shortLabelEs: '10 min' },
  { id: 15, labelEs: '15 minutos', shortLabelEs: '15 min' },
];

export interface ScenarioVocabItem {
  en: string;
  es: string;
  phonetic: string;
}

export interface ScenarioSubtopic {
  id: string;
  titleEs: string;
  angleEn: string;
  featuredWords: string[];
}

export interface KidsAgeBandDescriptor {
  id: KidsAgeBand;
  labelEs: string;
  shortTagEs: string;
  descriptionEs: string;
  maxWordsLabelEs: string;
}

export const KIDS_AGE_BANDS: KidsAgeBandDescriptor[] = [
  {
    id: '5-6',
    labelEs: '5–6 años',
    shortTagEs: 'Palabras básicas',
    descriptionEs:
      'Vocabulario súper básico de 1 a 2 palabras, pronunciado muy despacio palabra por palabra.',
    maxWordsLabelEs: '1–2 palabras',
  },
  {
    id: '7-8',
    labelEs: '7–8 años',
    shortTagEs: 'Frases cortitas',
    descriptionEs:
      'Frases sencillas de 2 a 4 palabras cotidianas, pronunciadas lento y palabra por palabra.',
    maxWordsLabelEs: '2–4 palabras',
  },
  {
    id: '9',
    labelEs: '9 años',
    shortTagEs: 'Oraciones simples',
    descriptionEs:
      'Oraciones cortas y claras de 4 a 6 palabras para ganar soltura paso a paso.',
    maxWordsLabelEs: '4–6 palabras',
  },
];

export interface PronunciationPointsAward {
  id: string;
  points: number;
  phrase: string;
  praiseEs: string;
  createdAtMs: number;
}

export interface CEFRDescriptor {
  level: CEFRLevel;
  labelEs: string;
  kidsLabelEs: string;
  paceHint: string;
  spanishSupportSummaryEs: string;
  guidance: string;
}

export interface ScenarioConfig {
  id: string;
  audience: AudienceGroup;
  iconName: ScenarioIconName;
  title: string;
  subtitleEs: string;
  characterRole: string;
  setting: string;
  openingObjective: string;
  openingStarters: string[];
  subtopics: ScenarioSubtopic[];
  guidedVocabulary: ScenarioVocabItem[];
  conversationSteps: string[];
  focusAreas: string[];
}

export interface TutorDotStyle {
  characterId: AllenCharacterId;
  bodyTopHex: string;
  bodyMidHex: string;
  bodyBottomHex: string;
  glowHex: string;
  inkHex: string;
}

export interface TutorProfile {
  id: AllenCharacterId;
  audience: AudienceGroup;
  name: string;
  roleEs: string;
  accentLabel: string;
  voiceName: TutorVoiceName;
  personality: string;
  greetingTaglineEs: string;
  dotStyle: TutorDotStyle;
}

export interface TranscriptTurn {
  speaker: 'student' | 'tutor';
  text: string;
  timestampMs: number;
}

export interface VocabularyItem {
  term: string;
  meaningEs: string;
  example: string;
}

export type LiveCorrectionCategory =
  | 'pronunciation'
  | 'grammar'
  | 'expression'
  | 'practice';

export interface LiveCorrection {
  id: string;
  category: LiveCorrectionCategory;
  original: string;
  correction: string;
  pronunciationGuide?: string;
  tipEs: string;
  createdAtMs: number;
}

export type SensitiveContentCategory =
  | 'sexual'
  | 'violence'
  | 'aggression'
  | 'self_harm'
  | 'illegal';

export interface SensitiveContentResult {
  flagged: boolean;
  category?: SensitiveContentCategory;
}

export interface GrammarFeedbackItem {
  studentSaid: string;
  correction: string;
  explanationEs: string;
}

export interface PracticeActivity {
  title: string;
  descriptionEs: string;
  durationMinutes: number;
}

export interface PracticeReport {
  id: string;
  createdAtIso: string;
  scenarioId: string;
  scenarioTitle: string;
  audience?: AudienceGroup;
  kidsAgeBand?: KidsAgeBand;
  studentName?: string;
  tutorId: string;
  tutorName: string;
  cefrLevel: CEFRLevel;
  durationSeconds: number;
  pronunciationPoints?: number;
  comprehensionScore: number;
  fluencyScore: number;
  summaryEs: string;
  vocabularyLearned: VocabularyItem[];
  grammarErrors: GrammarFeedbackItem[];
  recommendationsEs: string[];
  recommendedActivities: PracticeActivity[];
}

export const CEFR_LEVELS: CEFRDescriptor[] = [
  {
    level: 'A1',
    labelEs: 'Principiante (Desde cero)',
    kidsLabelEs: 'Desde cero (Primeras palabras)',
    paceHint: 'Muy pausado y guiado',
    spanishSupportSummaryEs: '70–75% español latinoamericano + inglés americano desde cero',
    guidance:
      'Assume the learner is from Ecuador / South America starting from ZERO English! Speak very slowly and warmly using ~70-75% natural Latin American Spanish and ~25-30% bite-sized American English (tiny 2-6 word phrases). Always explain the meaning in Spanish first, show the phrase above your avatar so they can read it, and guide them step by step to repeat aloud.',
  },
  {
    level: 'A2',
    labelEs: 'Elemental',
    kidsLabelEs: 'Explorador (Frases cortas)',
    paceHint: 'Pausado y estructurado',
    spanishSupportSummaryEs: '45–50% español latinoamericano + inglés americano claro',
    guidance:
      'Speak at a comfortable, clear American English pace mixing roughly 45-50% warm Latin American Spanish and 50-55% natural American English with everyday US phrasing. Mirror Spanish ideas into natural American English, display phrases above your avatar when teaching or correcting, and encourage the learner to repeat aloud before moving on.',
  },
  {
    level: 'B1',
    labelEs: 'Intermedio',
    kidsLabelEs: 'Aventurero (Charlas divertidas)',
    paceHint: 'Ritmo conversacional claro',
    spanishSupportSummaryEs: '80% inglés americano + ~20% español en correcciones',
    guidance:
      'Lead the conversation primarily in natural, authentic American English (~80% English with casual US idioms and expressions), using brief Latin American Spanish (~20%) focused on pronunciation coaching, phrasing corrections, and clarifying tricky US expressions quickly.',
  },
  {
    level: 'B2',
    labelEs: 'Intermedio Alto',
    kidsLabelEs: 'B2',
    paceHint: 'Fluido y natural',
    spanishSupportSummaryEs: 'Inmersión en inglés americano (español solo si lo pides)',
    guidance:
      'Speak at a natural native American English pace with varied US idioms, everyday US slang, nuanced follow-up questions, and spontaneous turn-taking. Keep the conversation in American English and coach pronunciation, US flapping/stress, and natural phrasing.',
  },
  {
    level: 'C1',
    labelEs: 'Avanzado',
    kidsLabelEs: 'C1',
    paceHint: 'Natural con matices',
    spanishSupportSummaryEs: 'Inmersión avanzada en inglés americano',
    guidance:
      'Speak effortlessly in native American English with sophisticated vocabulary, subtle humor, natural US slang/idioms, discourse markers, and complex hypotheticals. Offer precise lexical upgrades and connected-speech pronunciation coaching.',
  },
  {
    level: 'C2',
    labelEs: 'Maestría',
    kidsLabelEs: 'C2',
    paceHint: 'Nativo y exigente',
    spanishSupportSummaryEs: 'Inmersión nativa en inglés americano',
    guidance:
      'Engage at full native American English fluency with idiomatic subtlety, US cultural nuance, and rapid spontaneous dialogue. Polish subtle collocations, intonation choices, and native US pronunciation precision.',
  },
];

export const KIDS_ALLOWED_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1'];

export const ADULT_SCENARIOS: ScenarioConfig[] = [
  {
    id: 'everyday',
    audience: 'adults',
    iconName: 'coffee',
    title: 'Everyday Conversations',
    subtitleEs: 'Charla diaria natural sobre rutinas, hobbies y planes',
    characterRole: 'a warm, friendly American English conversation partner catching up over coffee',
    setting: 'A cozy neighborhood coffee shop in Seattle with warm Edison lamps during a relaxed break',
    openingObjective:
      'Ask how their day is going and spark a spontaneous chat about routines or recent highlights.',
    openingStarters: [
      'Open as if we just sat down with fresh coffee at a Seattle café and ask what their morning routine looked like today.',
      'Open by asking what the best or funniest part of their week has been so far.',
      'Open by asking how they usually unwind after a busy day—coffee, music, a walk, or chilling at home.',
      'Open by asking what fun plan they are looking forward to this weekend.',
    ],
    subtopics: [
      {
        id: 'everyday-morning-coffee',
        titleEs: 'Rutina de la mañana y café',
        angleEn: 'Chat over morning coffee about waking up, breakfast, and how their day starts.',
        featuredWords: ['wake up early', 'grab a coffee', 'morning routine'],
      },
      {
        id: 'everyday-weekend-plans',
        titleEs: 'Planes de fin de semana',
        angleEn: 'Talk about relaxing weekend plans, hanging out with friends, or going out.',
        featuredWords: ['hang out', 'this weekend', 'sounds fun'],
      },
      {
        id: 'everyday-evening-unwind',
        titleEs: 'Cómo desconectarte en la tarde',
        angleEn: 'Share how you relax after work or study—music, cooking, walks, or chilling.',
        featuredWords: ['chill at home', 'listen to music', 'busy day'],
      },
      {
        id: 'everyday-week-highlights',
        titleEs: 'Lo mejor de tu semana',
        angleEn: 'Catch up on one fun highlight, surprise, or favorite meal from this week.',
        featuredWords: ['pretty good', 'favorite meal', 'so far'],
      },
    ],
    guidedVocabulary: [
      { en: 'How is it going?', es: '¿Cómo te va?', phonetic: 'jau iz it GÓU-in' },
      { en: 'I usually wake up early', es: 'Usualmente me levanto temprano', phonetic: 'ai IÚ-shu-a-li weik ap ÉR-li' },
      { en: 'Grab a coffee', es: 'Tomar un café', phonetic: 'grab a KÓ-fi' },
      { en: 'Hang out with friends', es: 'Pasar el rato con amigos', phonetic: 'jang aut wiz frendz' },
    ],
    conversationSteps: [
      'Step 1: Catch up about their morning or day so far at the café.',
      'Step 2: Chat about their daily routine, work, or studies and ask follow-up details.',
      'Step 3: Talk about how they relax in the evening or their plans for the weekend.',
      'Step 4: Wrap up with one fun takeaway or new American expression they practiced.',
    ],
    focusAreas: ['Small talk', 'US everyday slang', 'Natural reactions'],
  },
  {
    id: 'new-york',
    audience: 'adults',
    iconName: 'building',
    title: 'Traveling to New York',
    subtitleEs: 'Muévete por Manhattan, pide indicaciones y explora la ciudad',
    characterRole: 'a friendly New York City local guide and boutique hotel concierge',
    setting: 'A Midtown Manhattan hotel lobby overlooking the glowing New York skyline near Central Park',
    openingObjective:
      'Welcome the traveler to New York and help plan their first afternoon in the city.',
    openingStarters: [
      'Welcome them to the Midtown hotel lobby right near Central Park and ask what iconic NYC landmark they want to visit first.',
      'Greet them right outside a Manhattan subway station and offer to help them get to Times Square or Brooklyn Bridge.',
      'Welcome them on a lively New York evening and ask whether they are in the mood for NYC pizza, a museum, or a walk in Central Park.',
      'Ask how their flight into New York went and help them map out an awesome first itinerary in Manhattan.',
    ],
    subtopics: [
      {
        id: 'ny-subway-directions',
        titleEs: 'Cómo moverte en el metro',
        angleEn: 'Help the traveler navigate the NYC subway to reach Times Square or Brooklyn Bridge.',
        featuredWords: ['take the subway', 'two blocks away', 'uptown train'],
      },
      {
        id: 'ny-central-park',
        titleEs: 'Tarde en Central Park y museos',
        angleEn: 'Plan an afternoon walking through Central Park, visiting museums, and taking photos.',
        featuredWords: ['Central Park', 'walk around', 'take pictures'],
      },
      {
        id: 'ny-street-food',
        titleEs: 'Comida callejera y pizza neoyorquina',
        angleEn: 'Explore classic New York food spots—pizza slices, bagels, and food trucks.',
        featuredWords: ['slice of pizza', 'grab a bagel', 'food truck'],
      },
      {
        id: 'ny-broadway-night',
        titleEs: 'Noche en Times Square y Broadway',
        angleEn: 'Plan an exciting evening seeing bright lights, a Broadway show, or a rooftop view.',
        featuredWords: ['Times Square', 'Broadway show', 'city lights'],
      },
    ],
    guidedVocabulary: [
      { en: 'How do I get to Times Square?', es: '¿Cómo llego a Times Square?', phonetic: 'jau du ai get tu taimz skwer' },
      { en: 'Take the subway', es: 'Tomar el metro', phonetic: 'teik de SÁB-wei' },
      { en: 'A slice of pizza', es: 'Una porción de pizza', phonetic: 'a slais ov PÍT-sa' },
      { en: 'It is two blocks away', es: 'Está a dos cuadras', phonetic: 'it iz tu bloks a-WÉI' },
    ],
    conversationSteps: [
      'Step 1: Welcome the traveler to Manhattan and ask what spot they want to explore first.',
      'Step 2: Practice asking for and confirming subway or walking directions.',
      'Step 3: Recommend a classic New York food stop or evening activity and ask their preference.',
      'Step 4: Confirm their mini-itinerary for the day in New York.',
    ],
    focusAreas: ['Directions', 'Subway & transit', 'Local US recommendations'],
  },
  {
    id: 'restaurant',
    audience: 'adults',
    iconName: 'utensils',
    title: 'At the Restaurant',
    subtitleEs: 'Reservas, recomendaciones del menú, alergias y la cuenta',
    characterRole: 'an attentive, upbeat American server at a lively modern bistro',
    setting: 'A warm candlelit evening table at The Blue Lantern Bistro in Austin, Texas',
    openingObjective:
      'Welcome the guest to their table, mention tonight’s specials, and ask what they would like to drink.',
    openingStarters: [
      'Welcome them to The Blue Lantern Bistro in Austin, hand over the menu, and ask what drink they want to start with.',
      'Greet them at the host stand, confirm their table for tonight, and ask if they prefer sitting indoors or on the patio.',
      'Arrive at their table excited about tonight’s grilled burger and pasta specials and ask what kind of food they are craving.',
      'Check if they have any food preferences or allergies before recommending our most popular American dishes.',
    ],
    subtopics: [
      {
        id: 'rest-table-drinks',
        titleEs: 'Reservar mesa y pedir bebidas',
        angleEn: 'Greet them at the host stand, choose indoor vs. patio seating, and take their drink order.',
        featuredWords: ['table for two', 'on the patio', 'iced water'],
      },
      {
        id: 'rest-chef-specials',
        titleEs: 'Especiales del chef y alergias',
        angleEn: 'Recommend tonight’s grilled dishes and check for food allergies or preferences.',
        featuredWords: ['what do you recommend', 'no onions', 'chef special'],
      },
      {
        id: 'rest-brunch-menu',
        titleEs: 'Brunch americano de domingo',
        angleEn: 'Order classic American brunch—pancakes, eggs, avocado toast, and fresh coffee.',
        featuredWords: ['pancakes', 'coffee refill', 'on the side'],
      },
      {
        id: 'rest-dessert-check',
        titleEs: 'Postres y pedir la cuenta',
        angleEn: 'Order dessert, ask for a to-go box, and practice asking politely for the check.',
        featuredWords: ['to-go box', 'get the check', 'split the bill'],
      },
    ],
    guidedVocabulary: [
      { en: 'I would like a table for two', es: 'Quisiera una mesa para dos', phonetic: 'ai wud laik a TÉI-bol for tu' },
      { en: 'Could I have the burger, please?', es: '¿Me podría traer la hamburguesa, por favor?', phonetic: 'kud ai jav de BÉR-ger plis' },
      { en: 'What do you recommend?', es: '¿Qué me recomienda?', phonetic: 'wat du iu re-ko-MÉND' },
      { en: 'Can we get the check, please?', es: '¿Nos trae la cuenta, por favor?', phonetic: 'kan wi get de chek plis' },
    ],
    conversationSteps: [
      'Step 1: Seat the guest and take their drink order.',
      'Step 2: Discuss menu recommendations, food preferences, or allergies and take their main dish order.',
      'Step 3: Check in on how the meal tastes and ask about dessert or coffee.',
      'Step 4: Practice politely asking for the check and paying.',
    ],
    focusAreas: ['Ordering food', 'Polite US requests', 'Dietary preferences'],
  },
  {
    id: 'airport',
    audience: 'adults',
    iconName: 'plane',
    title: 'At the Airport',
    subtitleEs: 'Check-in, equipaje, puertas de embarque y cambios de vuelo',
    characterRole: 'a helpful US international airline check-in and gate agent',
    setting: 'International departures counter at JFK Terminal 4 overlooking the sunset runway',
    openingObjective:
      'Greet the passenger at the check-in desk and ask for their destination and luggage details.',
    openingStarters: [
      'Welcome them to the JFK Terminal 4 check-in desk and ask where they are flying today and whether they have bags to check.',
      'Greet them at the boarding gate and ask if they prefer a window seat or an aisle seat for their upcoming flight.',
      'Let them know their flight is boarding soon and help them confirm their gate number and carry-on bag.',
      'Welcome them at the airline customer service desk after a short flight delay and help find the best connection.',
    ],
    subtopics: [
      {
        id: 'air-checkin-luggage',
        titleEs: 'Check-in y equipaje facturado',
        angleEn: 'Check in at the airline counter with passport, checked bag weight, and boarding pass.',
        featuredWords: ['here is my passport', 'checked bag', 'boarding pass'],
      },
      {
        id: 'air-seat-upgrade',
        titleEs: 'Elegir asiento de ventana o pasillo',
        angleEn: 'Pick between a window or aisle seat and ask about legroom near the front.',
        featuredWords: ['window seat', 'aisle seat', 'overhead bin'],
      },
      {
        id: 'air-security-gate',
        titleEs: 'Seguridad y puerta de embarque',
        angleEn: 'Navigate airport security screening and find the right departure gate on time.',
        featuredWords: ['carry-on bag', 'which gate', 'boarding time'],
      },
      {
        id: 'air-flight-delay',
        titleEs: 'Cambio de vuelo y conexiones',
        angleEn: 'Handle a flight delay calmly at customer service and confirm a connecting flight.',
        featuredWords: ['delayed flight', 'connecting flight', 'next available'],
      },
    ],
    guidedVocabulary: [
      { en: 'Here is my passport', es: 'Aquí está mi pasaporte', phonetic: 'jir iz mai PÁS-port' },
      { en: 'Window seat or aisle seat', es: 'Asiento de ventana o pasillo', phonetic: 'WÍN-dou sit or ail sit' },
      { en: 'Carry-on bag', es: 'Equipaje de mano', phonetic: 'KÉ-ri-on bag' },
      { en: 'Which gate is my flight?', es: '¿En qué puerta sale mi vuelo?', phonetic: 'wich geit iz mai flait' },
    ],
    conversationSteps: [
      'Step 1: Check in at the counter (passport, destination, checked vs. carry-on luggage).',
      'Step 2: Choose seat preference (window or aisle) and hand over the boarding pass.',
      'Step 3: Confirm security check, boarding time, and departure gate.',
      'Step 4: Handle a quick travel question (flight delay, connection, or boarding call).',
    ],
    focusAreas: ['Travel logistics', 'Flight changes', 'Clarifying instructions'],
  },
  {
    id: 'job-interview',
    audience: 'adults',
    iconName: 'briefcase',
    title: 'Job Interview',
    subtitleEs: 'Entrevista laboral real con preguntas técnicas y conductuales',
    characterRole: 'an insightful, approachable US Hiring Manager conducting a video interview',
    setting: 'A sunlit modern US office during a professional video call interview',
    openingObjective:
      'Thank the candidate for joining the call and invite them to introduce themselves and their background.',
    openingStarters: [
      'Thank them warmly for hopping on the video interview and invite them to give a quick intro about themselves and their work.',
      'Open the interview by asking what excited them most about applying for this role.',
      'Start with a friendly icebreaker and ask them to share one project or achievement they are proud of.',
      'Welcome them to the interview call and ask what their biggest professional strength is.',
    ],
    subtopics: [
      {
        id: 'job-self-intro',
        titleEs: 'Presentación personal y trayectoria',
        angleEn: 'Practice a confident 30-second self-introduction and summarize past experience.',
        featuredWords: ['I have experience in', 'my background', 'current role'],
      },
      {
        id: 'job-strengths-growth',
        titleEs: 'Fortalezas y áreas de mejora',
        angleEn: 'Discuss your biggest professional strength and one skill you are actively growing.',
        featuredWords: ['biggest strength', 'fast learner', 'working on'],
      },
      {
        id: 'job-proud-project',
        titleEs: 'Un logro o reto resuelto',
        angleEn: 'Walk through a real problem you solved at work or school using simple steps.',
        featuredWords: ['solving problems', 'teamwork', 'the result was'],
      },
      {
        id: 'job-smart-questions',
        titleEs: 'Preguntas al reclutador y cierre',
        angleEn: 'Practice asking smart questions about team culture, growth, and next steps.',
        featuredWords: ['team culture', 'next steps', 'thank you for this opportunity'],
      },
    ],
    guidedVocabulary: [
      { en: 'I have experience in...', es: 'Tengo experiencia en...', phonetic: 'ai jav iks-PÍ-ri-ens in' },
      { en: 'My biggest strength is...', es: 'Mi mayor fortaleza es...', phonetic: 'mai BÍ-gest strengz iz' },
      { en: 'I love solving problems', es: 'Me encanta resolver problemas', phonetic: 'ai lav SÓL-ving PRÓ-blemz' },
      { en: 'Thank you for this opportunity', es: 'Gracias por esta oportunidad', phonetic: 'zank iu for dis o-por-TÚ-ni-ti' },
    ],
    conversationSteps: [
      'Step 1: Candidate self-introduction and background summary.',
      'Step 2: Discuss key strengths and why they want this position.',
      'Step 3: Walk through a real past project or challenge they solved.',
      'Step 4: Invite the candidate to ask one smart question about the team or role.',
    ],
    focusAreas: ['STAR method', 'Strengths & projects', 'Professional US tone'],
  },
  {
    id: 'shopping',
    audience: 'adults',
    iconName: 'shopping-bag',
    title: 'Shopping',
    subtitleEs: 'Tallas, precios, devoluciones y consejos de estilo en tienda',
    characterRole: 'a stylish, friendly retail specialist at a flagship US store',
    setting: 'A bright contemporary clothing and sneaker boutique in Los Angeles',
    openingObjective:
      'Welcome the shopper and ask what occasion or item they are looking for today.',
    openingStarters: [
      'Welcome them into our Los Angeles boutique and ask what item or outfit they are shopping for today.',
      'Greet them near the sneaker and jacket display and ask what color or size they usually wear.',
      'Ask if they are shopping for a special occasion, a gift, or just refreshing their everyday style.',
      'Greet them at the fitting room area and offer to grab a different size or suggest matching pieces.',
    ],
    subtopics: [
      {
        id: 'shop-sizes-fitting',
        titleEs: 'Tallas y probador de ropa',
        angleEn: 'Find the right size and color in a boutique and ask to try items in the fitting room.',
        featuredWords: ['in medium', 'try this on', 'fitting room'],
      },
      {
        id: 'shop-sneakers-style',
        titleEs: 'Zapatillas y estilo diario',
        angleEn: 'Shop for comfortable sneakers or a jacket and compare two colors or fits.',
        featuredWords: ['sneakers', 'fits great', 'too tight'],
      },
      {
        id: 'shop-sales-budget',
        titleEs: 'Precios, ofertas y descuentos',
        angleEn: 'Ask about prices, seasonal sales, discounts, and paying by card or cash.',
        featuredWords: ['how much', 'on sale', 'pay by card'],
      },
      {
        id: 'shop-gifts-returns',
        titleEs: 'Comprar un regalo y cambios',
        angleEn: 'Pick out a thoughtful gift for a friend and ask about the gift receipt and return policy.',
        featuredWords: ['gift receipt', 'return policy', 'exchange it'],
      },
    ],
    guidedVocabulary: [
      { en: 'Do you have this in medium?', es: '¿Tienen esto en talla mediana?', phonetic: 'du iu jav dis in MÍ-di-um' },
      { en: 'Can I try this on?', es: '¿Me puedo probar esto?', phonetic: 'kan ai trai dis on' },
      { en: 'How much does it cost?', es: '¿Cuánto cuesta?', phonetic: 'jau mach daz it kost' },
      { en: 'Is it on sale?', es: '¿Está en oferta?', phonetic: 'iz it on seil' },
    ],
    conversationSteps: [
      'Step 1: Find out what item, color, or style the shopper wants.',
      'Step 2: Check size availability and invite them to try it on in the fitting room.',
      'Step 3: Discuss price, discounts, or comparing two options.',
      'Step 4: Complete checkout or ask about the return policy.',
    ],
    focusAreas: ['Sizes & colors', 'Comparisons', 'Exchanges & checkout'],
  },
  {
    id: 'new-friends',
    audience: 'adults',
    iconName: 'users',
    title: 'Making New Friends',
    subtitleEs: 'Rompe el hielo en un evento internacional y conecta con gente',
    characterRole: 'an outgoing American attendee at a creative community mixer',
    setting: 'An evening cultural networking meetup on a glowing rooftop terrace in Chicago',
    openingObjective:
      'Introduce yourself warmly, ask where the student is from, and find shared interests.',
    openingStarters: [
      'Say hi on the Chicago rooftop meetup, ask where they are from, and how they heard about the event.',
      'Break the ice near the snack table and ask what hobbies or passions keep them busy outside work or school.',
      'Start a fun icebreaker by asking what place in the world they would love to travel to next.',
      'Welcome them to the international mixer and ask what kind of music, food, or weekend adventures they love.',
    ],
    subtopics: [
      {
        id: 'friends-hometown-origins',
        titleEs: 'De dónde eres y tu ciudad',
        angleEn: 'Break the ice by introducing yourself and sharing cool things about your hometown.',
        featuredWords: ['nice to meet you', 'where are you from', 'great food'],
      },
      {
        id: 'friends-hobbies-passions',
        titleEs: 'Hobbies y pasiones en común',
        angleEn: 'Discover shared hobbies, sports, or creative activities you enjoy outside work.',
        featuredWords: ['for fun', 'into music', 'me too'],
      },
      {
        id: 'friends-dream-travel',
        titleEs: 'Viajes soñados y aventuras',
        angleEn: 'Swap dream travel destinations, beach vs. mountain trips, and funny travel stories.',
        featuredWords: ['dream trip', 'love to visit', 'beach or mountains'],
      },
      {
        id: 'friends-stay-in-touch',
        titleEs: 'Hacer planes y quedar en contacto',
        angleEn: 'Suggest grabbing coffee next week and naturally exchange contact info.',
        featuredWords: ['stay in touch', 'grab coffee', 'see you soon'],
      },
    ],
    guidedVocabulary: [
      { en: 'Nice to meet you!', es: '¡Mucho gusto en conocerte!', phonetic: 'nais tu mit iu' },
      { en: 'Where are you from?', es: '¿De dónde eres?', phonetic: 'wer ar iu from' },
      { en: 'What do you do for fun?', es: '¿Qué haces para divertirte?', phonetic: 'wat du iu du for fan' },
      { en: 'Let us stay in touch!', es: '¡Mantengámonos en contacto!', phonetic: 'lets stei in tach' },
    ],
    conversationSteps: [
      'Step 1: Friendly introduction — where they are from and what brought them to the meetup.',
      'Step 2: Discover shared hobbies, travel dreams, or favorite food.',
      'Step 3: Swap a fun story or recommendation.',
      'Step 4: Exchange contact info naturally and say goodbye warmly.',
    ],
    focusAreas: ['Icebreakers', 'US casual slang', 'Keeping flow alive'],
  },
  {
    id: 'business',
    audience: 'adults',
    iconName: 'trending-up',
    title: 'Business English',
    subtitleEs: 'Reuniones ejecutivas, negociaciones, plazos y presentaciones',
    characterRole: 'a sharp, collaborative US project director in a strategy call',
    setting: 'A sleek executive strategy video meeting with a US team',
    openingObjective:
      'Open the meeting concisely and ask the student for an update on their proposal or timeline.',
    openingStarters: [
      'Kick off the weekly US team sync and ask for a quick update on their top priority this week.',
      'Open a client strategy meeting and ask what key goal they want to achieve this quarter.',
      'Start a project planning call and ask whether our current deadline feels realistic or needs adjustment.',
      'Open a collaborative brainstorm and ask for their pitch on how to improve customer experience.',
    ],
    subtopics: [
      {
        id: 'biz-weekly-sync',
        titleEs: 'Reunión semanal de avances',
        angleEn: 'Give a crisp weekly status update covering priorities, wins, and blockers.',
        featuredWords: ['touch base', 'top priority', 'on track'],
      },
      {
        id: 'biz-deadlines-scope',
        titleEs: 'Negociar plazos y entregas',
        angleEn: 'Discuss a tight project deadline and negotiate realistic deliverables calmly.',
        featuredWords: ['tight deadline', 'push back', 'next steps'],
      },
      {
        id: 'biz-client-pitch',
        titleEs: 'Presentar una propuesta al cliente',
        angleEn: 'Pitch a fresh idea to a US client and explain its main benefit clearly.',
        featuredWords: ['solid plan', 'key benefit', 'save time'],
      },
      {
        id: 'biz-feedback-collaboration',
        titleEs: 'Dar y recibir feedback profesional',
        angleEn: 'Practice giving constructive feedback and aligning on team action items.',
        featuredWords: ['great point', 'action items', 'follow up'],
      },
    ],
    guidedVocabulary: [
      { en: 'Let us touch base on...', es: 'Pongámonos al día sobre...', phonetic: 'lets tach beis on' },
      { en: 'We are on track for the deadline', es: 'Vamos a tiempo para la fecha límite', phonetic: 'wi ar on trak for de DÉD-lain' },
      { en: 'What are the next steps?', es: '¿Cuáles son los próximos pasos?', phonetic: 'wat ar de nekst steps' },
      { en: 'That sounds like a solid plan', es: 'Suena como un plan sólido', phonetic: 'dat saundz laik a SÓ-lid plan' },
    ],
    conversationSteps: [
      'Step 1: Kick off the meeting and get a quick status update.',
      'Step 2: Discuss one challenge, budget, or timeline trade-off.',
      'Step 3: Propose and agree on a practical solution.',
      'Step 4: Confirm clear action items and next meeting steps.',
    ],
    focusAreas: ['Negotiation', 'Executive US phrasing', 'Action items'],
  },
  {
    id: 'cambridge',
    audience: 'adults',
    iconName: 'graduation-cap',
    title: 'Speaking Exam Practice',
    subtitleEs: 'Simulacro oral estructurado con feedback preciso de pronunciación',
    characterRole: 'an encouraging, certified American English Speaking Examiner',
    setting: 'A quiet, bright university speaking assessment hall',
    openingObjective:
      'Begin Part 1 of the speaking practice with a welcoming tone and ask a clear introductory question.',
    openingStarters: [
      'Welcome them to Part 1 of the speaking mock exam and ask them to describe their hometown or favorite place in their city.',
      'Open the structured speaking practice by asking what they do during the week—work, studies, or personal projects.',
      'Start Part 1 with a warm examiner tone and ask how they enjoy spending their free time.',
      'Begin the speaking practice by asking about an interesting goal they want to accomplish this year.',
    ],
    subtopics: [
      {
        id: 'exam-hometown-places',
        titleEs: 'Parte 1: Tu ciudad y lugares favoritos',
        angleEn: 'Describe your hometown, climate, and favorite neighborhood with clear details.',
        featuredWords: ['for example', 'what I enjoy most', 'lively city'],
      },
      {
        id: 'exam-daily-work-study',
        titleEs: 'Parte 1: Trabajo, estudios y metas',
        angleEn: 'Explain your daily work or studies and one goal you want to achieve this year.',
        featuredWords: ['in my opinion', 'my goal is', 'because'],
      },
      {
        id: 'exam-compare-choices',
        titleEs: 'Parte 2: Comparar opciones y preferencias',
        angleEn: 'Compare two everyday choices (city vs. countryside, online vs. in-person) using linkers.',
        featuredWords: ['on the other hand', 'both options', 'I prefer'],
      },
      {
        id: 'exam-memorable-story',
        titleEs: 'Parte 3: Contar una experiencia memorable',
        angleEn: 'Tell a short, structured story about a memorable trip, teacher, or achievement.',
        featuredWords: ['first of all', 'after that', 'unforgettable'],
      },
    ],
    guidedVocabulary: [
      { en: 'In my opinion...', es: 'En mi opinión...', phonetic: 'in mai o-PÍ-nion' },
      { en: 'On the other hand...', es: 'Por otro lado...', phonetic: 'on di Á-der jand' },
      { en: 'For example...', es: 'Por ejemplo...', phonetic: 'for ig-ZÁM-pol' },
      { en: 'What I enjoy most is...', es: 'Lo que más disfruto es...', phonetic: 'wat ai en-YÓI moust iz' },
    ],
    conversationSteps: [
      'Step 1: Part 1 warm-up question about personal background or daily life.',
      'Step 2: Follow-up "why" question encouraging a structured 2–3 sentence answer with examples.',
      'Step 3: Opinion/comparison question using linking words.',
      'Step 4: Brief encouraging examiner wrap-up noting one strong point.',
    ],
    focusAreas: ['Exam structure', 'Cohesion & discourse', 'American pronunciation'],
  },
  {
    id: 'pop-culture',
    audience: 'adults',
    iconName: 'film',
    title: 'Movies, Music & Pop Culture',
    subtitleEs: 'Series, películas, música y charla casual con modismos de EE. UU.',
    characterRole: 'an enthusiastic American friend who loves movies, playlists, and trending shows',
    setting: 'A neon-lit cozy movie lounge chatting about favorite films, shows, and playlists',
    openingObjective:
      'Ask what movies, series, or music they have been into lately using friendly American expressions.',
    openingStarters: [
      'Kick off our hangout by asking what movie or TV show they have been binge-watching lately.',
      'Ask what kind of music or favorite artist is always on their playlist when they want good vibes.',
      'Open by asking whether they prefer action movies, comedies, or thrillers on a Friday night.',
      'Start by asking about a concert, movie, or song that totally blew their mind recently.',
    ],
    subtopics: [
      {
        id: 'pop-binge-series',
        titleEs: 'Series que te tienen enganchado',
        angleEn: 'Chat about a trending series you are hooked on and describe the plot without spoilers.',
        featuredWords: ['hooked on', 'binge-watch', 'plot twist'],
      },
      {
        id: 'pop-movie-night',
        titleEs: 'Noche de cine y géneros favoritos',
        angleEn: 'Compare action, comedy, and sci-fi movies and pick one for Friday movie night.',
        featuredWords: ['favorite genre', 'definitely watch', 'great acting'],
      },
      {
        id: 'pop-music-playlists',
        titleEs: 'Música, conciertos y playlists',
        angleEn: 'Share favorite artists, concert memories, and songs that boost your mood.',
        featuredWords: ['soundtrack', 'good vibes', 'live concert'],
      },
      {
        id: 'pop-podcasts-creators',
        titleEs: 'Podcasts, videos y cultura digital',
        angleEn: 'Talk about favorite podcasts, YouTube channels, or funny viral moments.',
        featuredWords: ['trending', 'super funny', 'check it out'],
      },
    ],
    guidedVocabulary: [
      { en: 'I am hooked on this show', es: 'Estoy enganchado con esta serie', phonetic: 'ai am jukt on dis shou' },
      { en: 'My favorite genre is...', es: 'Mi género favorito es...', phonetic: 'mai FÉI-vo-rit YÁN-ra iz' },
      { en: 'The soundtrack is awesome', es: 'La banda sonora es increíble', phonetic: 'de SÁUND-trak iz ÁW-som' },
      { en: 'You should definitely watch it', es: 'Definitivamente deberías verla', phonetic: 'iu shud DÉ-fi-nit-li wach it' },
    ],
    conversationSteps: [
      'Step 1: Ask about a recent favorite movie, show, or music artist.',
      'Step 2: Ask what they liked most about the story, acting, or vibe.',
      'Step 3: Compare genres or swap recommendations.',
      'Step 4: Pick one show or song to watch/listen to next.',
    ],
    focusAreas: ['Expressing opinions', 'US slang & idioms', 'Storytelling'],
  },
  {
    id: 'health-doctor',
    audience: 'adults',
    iconName: 'heart-pulse',
    title: 'At the Doctor & Wellness',
    subtitleEs: 'Síntomas, farmacia, hábitos saludables y citas médicas en EE. UU.',
    characterRole: 'a calm, reassuring American wellness doctor at a neighborhood clinic',
    setting: 'A peaceful, bright consultation room at a neighborhood wellness clinic',
    openingObjective:
      'Greet the patient warmly and ask how they have been feeling or what brings them in today.',
    openingStarters: [
      'Welcome them to the clinic consultation room and ask what brings them in today or how they have been feeling.',
      'Greet them for an annual wellness checkup and ask how their sleep and daily energy levels have been lately.',
      'Welcome them to the neighborhood pharmacy counter and ask if they are looking for something for a cold, headache, or allergies.',
      'Start a relaxed wellness chat asking about their favorite healthy habits—exercise, food, or staying hydrated.',
    ],
    subtopics: [
      {
        id: 'health-symptoms-visit',
        titleEs: 'Consulta médica y síntomas comunes',
        angleEn: 'Explain simple everyday symptoms (headache, sore throat, tired) and how long they lasted.',
        featuredWords: ['I have a headache', 'since yesterday', 'sore throat'],
      },
      {
        id: 'health-pharmacy-counter',
        titleEs: 'En la farmacia en EE. UU.',
        angleEn: 'Ask a friendly pharmacist for over-the-counter relief for a cold or allergies.',
        featuredWords: ['cold medicine', 'how often', 'allergies'],
      },
      {
        id: 'health-sleep-energy',
        titleEs: 'Sueño, estrés y descanso',
        angleEn: 'Chat about sleep routines, screen breaks, and simple ways to feel more energized.',
        featuredWords: ['feel tired', 'good sleep', 'take a break'],
      },
      {
        id: 'health-nutrition-habits',
        titleEs: 'Hábitos saludables y alimentación',
        angleEn: 'Discuss balanced meals, drinking plenty of water, and staying active every day.',
        featuredWords: ['plenty of water', 'healthy snacks', 'daily walk'],
      },
    ],
    guidedVocabulary: [
      { en: 'I have a headache', es: 'Tengo dolor de cabeza', phonetic: 'ai jav a JÉD-eik' },
      { en: 'I feel a little tired', es: 'Me siento un poco cansado/a', phonetic: 'ai fil a LÍ-tol TÁI-erd' },
      { en: 'Since yesterday', es: 'Desde ayer', phonetic: 'sins IÉS-ter-dei' },
      { en: 'Drink plenty of water', es: 'Toma mucha agua', phonetic: 'drink PLÉN-ti ov WÓ-ter' },
    ],
    conversationSteps: [
      'Step 1: Ask how they are feeling or what symptom/wellness goal brings them in.',
      'Step 2: Ask helpful follow-up details (how long, sleep, hydration, or allergies).',
      'Step 3: Share clear, reassuring everyday wellness advice or pharmacy instructions.',
      'Step 4: Confirm if they have any final questions before wrapping up the visit.',
    ],
    focusAreas: ['Health & symptoms', 'Daily habits', 'Asking clear questions'],
  },
  {
    id: 'sports-hobbies',
    audience: 'adults',
    iconName: 'trophy',
    title: 'Sports, Tech & Hobbies',
    subtitleEs: 'Deportes, videojuegos, tecnología y planes de fin de semana',
    characterRole: 'an energetic American buddy chatting about weekend hobbies, sports, and gadgets',
    setting: 'A sunny green park after a weekend game and workout',
    openingObjective:
      'Ask what sports, games, or fun hobbies they love doing on weekends.',
    openingStarters: [
      'Greet them after a sunny park workout and ask what sport or outdoor activity they love most.',
      'Kick off a fun chat asking what video game, app, or cool piece of tech they have been enjoying lately.',
      'Open by asking whether they are more of a soccer fan, gym person, or weekend hiker.',
      'Start by asking what creative hobby or skill they would love to learn this year.',
    ],
    subtopics: [
      {
        id: 'sports-soccer-teams',
        titleEs: 'Fútbol, deportes y partidos',
        angleEn: 'Chat about playing or watching soccer, basketball, or cheering for a favorite team.',
        featuredWords: ['play soccer', 'favorite team', 'watch the game'],
      },
      {
        id: 'sports-gym-outdoors',
        titleEs: 'Gimnasio, caminatas y aire libre',
        angleEn: 'Talk about working out at the gym, running in the park, or weekend hiking.',
        featuredWords: ['work out', 'go hiking', 'stay active'],
      },
      {
        id: 'sports-gaming-tech',
        titleEs: 'Videojuegos y tecnología nueva',
        angleEn: 'Chat about favorite video games, smartphones, gadgets, or useful apps.',
        featuredWords: ['really into', 'video games', 'cool gadget'],
      },
      {
        id: 'sports-creative-hobbies',
        titleEs: 'Pasatiempos creativos por aprender',
        angleEn: 'Share a creative hobby like photography, guitar, painting, or cooking you want to try.',
        featuredWords: ['try a new hobby', 'learn how to', 'free time'],
      },
    ],
    guidedVocabulary: [
      { en: 'I play soccer on weekends', es: 'Juego fútbol los fines de semana', phonetic: 'ai plei SÓ-ker on WÍK-endz' },
      { en: 'I am really into...', es: 'Me gusta muchísimo...', phonetic: 'ai am RÍ-li ÍN-tu' },
      { en: 'Work out at the gym', es: 'Entrenar en el gimnasio', phonetic: 'werk aut at de yim' },
      { en: 'Try a new hobby', es: 'Probar un nuevo pasatiempo', phonetic: 'trai a niu JÓ-bi' },
    ],
    conversationSteps: [
      'Step 1: Ask about their favorite sport, game, or weekend hobby.',
      'Step 2: Ask how often they do it and who they enjoy doing it with.',
      'Step 3: Chat about a favorite team, gadget, or goal they want to reach.',
      'Step 4: Plan a fun weekend activity together in English.',
    ],
    focusAreas: ['Hobbies & passions', 'Action verbs', 'Casual US expressions'],
  },
];

export const KIDS_SCENARIOS: ScenarioConfig[] = [
  {
    id: 'kids-animals',
    audience: 'kids',
    iconName: 'paw-print',
    title: 'Animals & Pets',
    subtitleEs: 'Perros, gatos, leones y sonidos divertidos de animales',
    characterRole: 'a super friendly, patient American kids English buddy exploring a sunny animal park',
    setting: 'A bright green park with trees, butterflies, cute pets, and friendly animals',
    openingObjective:
      'Start in our sunny animal park! Teach one animal word in English with its exact Spanish meaning (like "dog" = perro) and ask what animal they love.',
    openingStarters: [
      'Welcome the child to our sunny park of animals! Say that a happy puppy just ran by, explain clearly that "dog" means "perro", and practice "dog" slowly word by word!',
      'Spot a cute little kitten in the green park, explain clearly that "cat" means "gato", and practice "cat" slowly!',
      'Imagine we visit a big friendly lion at the animal park, explain clearly that "lion" means "león", and practice "lion" slowly!',
      'Look at a pretty little bird singing in the park trees, explain clearly that "bird" means "pájaro", and practice "bird" slowly!',
    ],
    subtopics: [
      {
        id: 'kids-animals-pets',
        titleEs: 'Mascotas en casa (perro y gato)',
        angleEn: 'Play with a cute puppy (dog = perro) and sleepy kitten (cat = gato) at the park.',
        featuredWords: ['dog', 'cat', 'puppy'],
      },
      {
        id: 'kids-animals-safari',
        titleEs: 'Safari en la selva (león y mono)',
        angleEn: 'Go on a friendly jungle safari spotting a lion (león), monkey (mono), and elephant (elefante).',
        featuredWords: ['lion', 'monkey', 'elephant'],
      },
      {
        id: 'kids-animals-farm',
        titleEs: 'Animales de la granja y sonidos',
        angleEn: 'Visit a happy sunny farm with a cow (vaca), duck (pato), and funny animal sounds.',
        featuredWords: ['cow', 'duck', 'pig'],
      },
      {
        id: 'kids-animals-sky-ocean',
        titleEs: 'Pájaros en el cielo y peces en el mar',
        angleEn: 'Spot a singing bird (pájaro) in the trees and a swimming fish (pez) or turtle (tortuga).',
        featuredWords: ['bird', 'fish', 'turtle'],
      },
    ],
    guidedVocabulary: [
      { en: 'dog', es: 'perro', phonetic: 'dog' },
      { en: 'cat', es: 'gato', phonetic: 'kat' },
      { en: 'bird', es: 'pájaro', phonetic: 'berd' },
      { en: 'lion', es: 'león', phonetic: 'LÁI-on' },
      { en: 'fish', es: 'pez', phonetic: 'fish' },
      { en: 'I like dogs', es: 'Me gustan los perros', phonetic: 'ai laik dogz' },
    ],
    conversationSteps: [
      'Step 1 (Animals): Introduce 1 friendly pet in our park (dog = perro or cat = gato), clearly explaining what it means in Spanish.',
      'Step 2 (Animals): Ask what animal the child likes best, translate THAT animal into English, explain its meaning, and practice it slowly.',
      'Step 3 (Animals): Play a fun animal-sound guessing mini-game (lion = león, bird = pájaro, fish = pez).',
      'Step 4 (Animals): Celebrate all the animal words they learned in English today!',
    ],
    focusAreas: ['Animal names (dog, cat, lion, bird)', 'Animal sounds', 'I like...'],
  },
  {
    id: 'kids-colors-numbers',
    audience: 'kids',
    iconName: 'palette',
    title: 'Colors, Numbers & Shapes',
    subtitleEs: 'Juega con colores, números del 1 al 20 y formas divertidas',
    characterRole: 'a cheerful American kids buddy playing a colorful rainbow, numbers & shapes game',
    setting: 'A joyful rainbow sky filled with colorful floating balloons and bright stars',
    openingObjective:
      'Play a rainbow color, counting, or shape game! Always say the exact Spanish meaning of each color/number/shape first.',
    openingStarters: [
      'Point to a big red balloon floating in our rainbow sky, explain clearly that "red" means "rojo", and practice "red" slowly!',
      'Count three shiny stars in our sky together, explain clearly that "one, two, three" means "uno, dos, tres", and practice slowly word by word!',
      'Point to the bright blue rainbow sky, explain clearly that "blue" means "azul", and practice "blue" slowly!',
      'Spot a glowing golden star shape, explain clearly that "star" means "estrella", and practice "star" slowly!',
    ],
    subtopics: [
      {
        id: 'kids-cn-rainbow-balloons',
        titleEs: 'Globos del arcoíris (rojo y azul)',
        angleEn: 'Pop colorful floating balloons in the sky learning red (rojo), blue (azul), and yellow (amarillo).',
        featuredWords: ['red', 'blue', 'yellow'],
      },
      {
        id: 'kids-cn-counting-1-5',
        titleEs: 'Contamos del 1 al 5',
        angleEn: 'Count floating stars and balloons together slowly: one, two, three, four, five.',
        featuredWords: ['one', 'two', 'three'],
      },
      {
        id: 'kids-cn-shapes-magic',
        titleEs: 'Formas divertidas (estrella y círculo)',
        angleEn: 'Draw glowing shapes in the air: star (estrella), circle (círculo), and heart (corazón).',
        featuredWords: ['star', 'circle', 'heart'],
      },
      {
        id: 'kids-cn-color-hunt',
        titleEs: 'Búsqueda de colores en tu cuarto',
        angleEn: 'Play an I-Spy game finding green (verde), orange (naranja), and purple (morado) around them.',
        featuredWords: ['green', 'orange', 'purple'],
      },
    ],
    guidedVocabulary: [
      { en: 'red', es: 'rojo', phonetic: 'red' },
      { en: 'blue', es: 'azul', phonetic: 'blu' },
      { en: 'yellow', es: 'amarillo', phonetic: 'IÉ-lou' },
      { en: 'green', es: 'verde', phonetic: 'grin' },
      { en: 'one, two, three', es: 'uno, dos, tres', phonetic: 'wan · tu · zri' },
      { en: 'circle / star', es: 'círculo / estrella', phonetic: 'SÉR-kol / star' },
    ],
    conversationSteps: [
      'Step 1 (Colors): Teach 1 bright color from our balloons (red = rojo or blue = azul) with its exact Spanish meaning.',
      'Step 2 (Colors): Ask the child their favorite color in Spanish, translate it into English, and practice it slowly.',
      'Step 3 (Numbers): Count balloons or stars together in English (one, two, three, four, five) explaining each number.',
      'Step 4 (Shapes): Practice a fun shape (star = estrella or circle = círculo) and celebrate!',
    ],
    focusAreas: ['Colors (red, blue, yellow, green)', 'Numbers 1–10', 'Shapes (star, circle)'],
  },
  {
    id: 'kids-family',
    audience: 'kids',
    iconName: 'home',
    title: 'My Family & Friends',
    subtitleEs: 'Presenta a tu familia, hermanos, abuelos y mejores amigos',
    characterRole: 'a warm, gentle American kids buddy chatting about family and best friends',
    setting: 'A cozy sunny neighborhood with colorful houses and green hills',
    openingObjective:
      'Chat warmly about their family and best friends, teaching words like "mom" (mamá), "dad" (papá), and "friend" (amigo) with exact Spanish meanings.',
    openingStarters: [
      'Start in our cozy neighborhood chatting about family! Explain clearly that "mom" means "mamá" and practice "mom" slowly!',
      'Wave happily from our neighborhood houses, explain clearly that "dad" means "papá", and practice "dad" slowly!',
      'Talk about playing with our best friends, explain clearly that "friend" means "amigo o amiga", and practice "friend" slowly!',
      'Talk about everyone who lives at home, explain clearly that "family" means "familia", and practice "family" slowly!',
    ],
    subtopics: [
      {
        id: 'kids-fam-mom-dad',
        titleEs: 'Mamá y papá en casa',
        angleEn: 'Chat sweetly about mom (mamá) and dad (papá) and fun things you do together at home.',
        featuredWords: ['mom', 'dad', 'home'],
      },
      {
        id: 'kids-fam-siblings',
        titleEs: 'Hermanos, hermanas y bebés',
        angleEn: 'Talk about having a brother (hermano), sister (hermana), or baby (bebé) in the family.',
        featuredWords: ['brother', 'sister', 'baby'],
      },
      {
        id: 'kids-fam-grandparents',
        titleEs: 'Abuelita y abuelito',
        angleEn: 'Share warm stories about visiting grandma (abuela) and grandpa (abuelo).',
        featuredWords: ['grandma', 'grandpa', 'family'],
      },
      {
        id: 'kids-fam-best-friends',
        titleEs: 'Mis mejores amigos',
        angleEn: 'Talk about your best friend (mejor amigo/a) and favorite games to play together.',
        featuredWords: ['friend', 'best friend', 'play'],
      },
    ],
    guidedVocabulary: [
      { en: 'mom', es: 'mamá', phonetic: 'mam' },
      { en: 'dad', es: 'papá', phonetic: 'dad' },
      { en: 'sister', es: 'hermana', phonetic: 'SÍS-ter' },
      { en: 'brother', es: 'hermano', phonetic: 'BRÁ-der' },
      { en: 'grandma', es: 'abuela', phonetic: 'GRÁND-ma' },
      { en: 'friend', es: 'amigo / amiga', phonetic: 'frend' },
    ],
    conversationSteps: [
      'Step 1 (Family): Practice "mom" (mamá) or "dad" (papá) with its exact Spanish meaning.',
      'Step 2 (Family): Ask who else lives in their house (brothers, sisters, grandparents) and teach that exact family word in English.',
      'Step 3 (Friends): Ask about their best friend and teach "friend" (amigo/amiga) or "my friend" (mi amigo/a).',
      'Step 4 (Family): Practice a sweet mini phrase like "I love my family" (amo a mi familia) adapted to their age!',
    ],
    focusAreas: ['Family members (mom, dad, sister, brother)', 'Best friends', 'My family'],
  },
  {
    id: 'kids-superheroes',
    audience: 'kids',
    iconName: 'zap',
    title: 'Superheroes & Magic',
    subtitleEs: 'Imagina superpoderes, capas voladoras y misiones geniales',
    characterRole: 'an exciting, kind American kids coach inviting the child to join the Superhero Club',
    setting: 'A magical superhero sky with glowing clouds and golden stars',
    openingObjective:
      'Create our Superhero Club! Teach fun superhero words with exact Spanish meanings (like "fly" = volar, "hero" = héroe, "cape" = capa).',
    openingStarters: [
      'Welcome the child to our Superhero Club in the sky! Explain clearly that "fly" means "volar" and practice "fly" (or "I can fly") slowly!',
      'Pretend we are putting on glowing superhero capes! Explain clearly that "cape" means "capa" and practice "cape" slowly!',
      'Start a fun superhero mission in the clouds! Explain clearly that "hero" means "héroe" and practice "hero" slowly!',
      'Pretend we have a sparkly magic superpower! Explain clearly that "magic" means "magia" and practice "magic" slowly!',
    ],
    subtopics: [
      {
        id: 'kids-hero-fly-sky',
        titleEs: '¡Puedo volar en las nubes!',
        angleEn: 'Fly through the superhero sky practicing fly (volar), sky (cielo), and fast (rápido).',
        featuredWords: ['fly', 'fast', 'hero'],
      },
      {
        id: 'kids-hero-suit-cape',
        titleEs: 'Mi traje y capa de superhéroe',
        angleEn: 'Design a glowing superhero cape (capa) and mask (máscara) in their favorite color.',
        featuredWords: ['cape', 'mask', 'super'],
      },
      {
        id: 'kids-hero-jump-strong',
        titleEs: 'Súper saltos y súper fuerza',
        angleEn: 'Practice active hero verbs: jump (saltar), run (correr), and strong (fuerte).',
        featuredWords: ['jump', 'run', 'strong'],
      },
      {
        id: 'kids-hero-magic-rescue',
        titleEs: 'Misión mágica de rescate',
        angleEn: 'Use kind magic (magia) and teamwork to help a lost puppy find its way home.',
        featuredWords: ['magic', 'help', 'I can fly'],
      },
    ],
    guidedVocabulary: [
      { en: 'hero', es: 'héroe', phonetic: 'JÍ-rou' },
      { en: 'cape', es: 'capa', phonetic: 'keip' },
      { en: 'fly', es: 'volar', phonetic: 'flai' },
      { en: 'jump', es: 'saltar', phonetic: 'yamp' },
      { en: 'magic', es: 'magia', phonetic: 'MÁ-yik' },
      { en: 'I can fly', es: 'Yo puedo volar', phonetic: 'ai kan flai' },
    ],
    conversationSteps: [
      'Step 1 (Superheroes): Join the Hero Club and practice "hero" (héroe) or "cape" (capa) with clear Spanish meaning.',
      'Step 2 (Superpowers): Ask what superpower they want (volar = fly, saltar alto = jump, magia = magic) and teach it in English.',
      'Step 3 (Hero Mission): Imagine saving a cute puppy or cloud castle using their new English superpower word.',
      'Step 4 (Hero Celebration): Celebrate their superhero English mission!',
    ],
    focusAreas: ['Superhero words (hero, cape, magic)', 'Superpower verbs (fly, jump)', 'I can...'],
  },
  {
    id: 'kids-food',
    audience: 'kids',
    iconName: 'ice-cream',
    title: 'Yummy Food & Ice Cream',
    subtitleEs: 'Frutas, pizza, helados y cómo pedir tu snack favorito',
    characterRole: 'a playful American ice-cream & snack shop buddy serving yummy treats',
    setting: 'A cheerful striped neighborhood ice-cream and snack stand',
    openingObjective:
      'Play at our yummy ice-cream & snack shop! Teach food words with exact Spanish meanings (ice cream = helado, pizza = pizza, apple = manzana).',
    openingStarters: [
      'Welcome the child to our striped ice-cream stand! Explain clearly that "ice cream" means "helado" and practice "ice cream" slowly word by word!',
      'Pretend we are serving warm yummy pizza at our snack shop! Explain clearly that "pizza" is pronounced "PÍT-sa" and practice "yummy pizza" slowly!',
      'Show a basket of sweet red apples at our snack stand, explain clearly that "apple" means "manzana", and practice "apple" slowly!',
      'Open a yummy snack picnic at our stand, explain clearly that "cake" means "pastel", and practice "cake" slowly!',
    ],
    subtopics: [
      {
        id: 'kids-food-ice-cream',
        titleEs: 'Heladería de sabores deliciosos',
        angleEn: 'Serve scoops of ice cream (helado) and practice asking politely with please (por favor).',
        featuredWords: ['ice cream', 'yummy', 'please'],
      },
      {
        id: 'kids-food-fruits',
        titleEs: 'Canasta de frutas frescas',
        angleEn: 'Taste sweet fruits: apple (manzana), banana (guineo/plátano), and orange (naranja).',
        featuredWords: ['apple', 'banana', 'juice'],
      },
      {
        id: 'kids-food-pizza-party',
        titleEs: 'Fiesta de pizza y jugo',
        angleEn: 'Make a pretend pizza (pizza) with cheese (queso) and serve cold water (agua).',
        featuredWords: ['pizza', 'cheese', 'water'],
      },
      {
        id: 'kids-food-birthday-cake',
        titleEs: 'Pastel y galletas de merienda',
        angleEn: 'Have a cheerful snack picnic with cake (pastel), cookie (galleta), and milk (leche).',
        featuredWords: ['cake', 'cookie', 'milk'],
      },
    ],
    guidedVocabulary: [
      { en: 'ice cream', es: 'helado', phonetic: 'ais krim' },
      { en: 'pizza', es: 'pizza', phonetic: 'PÍT-sa' },
      { en: 'apple', es: 'manzana', phonetic: 'Á-pol' },
      { en: 'banana', es: 'plátano / guineo', phonetic: 'ba-NÁ-na' },
      { en: 'cake', es: 'pastel', phonetic: 'keik' },
      { en: 'water', es: 'agua', phonetic: 'WÓ-ter' },
    ],
    conversationSteps: [
      'Step 1 (Food Shop): Welcome them to our ice-cream & snack stand and practice 1 yummy treat (ice cream = helado or apple = manzana).',
      'Step 2 (Favorite Food): Ask what their favorite fruit or snack is in Spanish, translate it into English, and practice it slowly.',
      'Step 3 (Polite Order): Practice asking politely with "please" (por favor) — e.g. "Ice cream, please" (helado, por favor).',
      'Step 4 (Yummy Wrap-up): Pretend to serve their snack and celebrate the food words they learned!',
    ],
    focusAreas: ['Yummy foods & fruits', 'Ice cream flavors', 'Please & thank you'],
  },
  {
    id: 'kids-school-toys',
    audience: 'kids',
    iconName: 'backpack',
    title: 'At School & Toys',
    subtitleEs: 'Mi mochila, crayones, juegos del recreo y juguetes favoritos',
    characterRole: 'an upbeat American school & playtime buddy opening a backpack and toy box',
    setting: 'A bright playful classroom with paper airplanes, backpacks, crayons, and toys',
    openingObjective:
      'Peek inside our school backpack and toy box! Always explain the exact Spanish meaning of every toy or school word.',
    openingStarters: [
      'Open our colorful classroom toy box together! Explain clearly that "ball" means "pelota" and practice "ball" slowly!',
      'Peek inside our school backpack! Explain clearly that "book" means "libro" and practice "book" slowly!',
      'Pick up a bright drawing pencil in class! Explain clearly that "pencil" means "lápiz" and practice "pencil" slowly!',
      'Show our box of favorite playtime toys! Explain clearly that "toy" means "juguete" and practice "toy" slowly!',
    ],
    subtopics: [
      {
        id: 'kids-school-backpack',
        titleEs: '¿Qué hay en mi mochila?',
        angleEn: 'Open a school backpack (mochila) and find a book (libro) and notebook (cuaderno).',
        featuredWords: ['backpack', 'book', 'school'],
      },
      {
        id: 'kids-school-drawing',
        titleEs: 'Hora de dibujar con crayones',
        angleEn: 'Draw colorful pictures using a pencil (lápiz), crayon (crayón), and paper (papel).',
        featuredWords: ['pencil', 'crayon', 'draw'],
      },
      {
        id: 'kids-school-toybox',
        titleEs: 'La caja mágica de juguetes',
        angleEn: 'Explore the toy box: ball (pelota), robot (robot), and toy car (carro de juguete).',
        featuredWords: ['ball', 'toy', 'car'],
      },
      {
        id: 'kids-school-recess',
        titleEs: 'Juegos del recreo con amigos',
        angleEn: 'Play fun recess games with a ball (pelota), swing (columpio), and teacher (profe).',
        featuredWords: ['play', 'teacher', 'ball'],
      },
    ],
    guidedVocabulary: [
      { en: 'ball', es: 'pelota', phonetic: 'bol' },
      { en: 'book', es: 'libro', phonetic: 'buk' },
      { en: 'pencil', es: 'lápiz', phonetic: 'PÉN-sol' },
      { en: 'backpack', es: 'mochila', phonetic: 'BÁK-pak' },
      { en: 'toy', es: 'juguete', phonetic: 'toi' },
      { en: 'crayon', es: 'crayón', phonetic: 'KRÉI-on' },
    ],
    conversationSteps: [
      'Step 1 (Toys/School): Pull 1 item from the toy box or backpack (ball = pelota or book = libro) and explain its Spanish meaning.',
      'Step 2 (Their Favorite Toy): Ask what their favorite toy at home is, translate it to English, and practice it slowly.',
      'Step 3 (Classroom Fun): Practice 1 school item (pencil = lápiz, backpack = mochila, or crayon = crayón).',
      'Step 4 (Playtime Wrap-up): Celebrate their school and toy words!',
    ],
    focusAreas: ['School items (book, pencil, backpack)', 'Toys (ball, toy)', 'My toy / My book'],
  },
  {
    id: 'kids-space-dinos',
    audience: 'kids',
    iconName: 'rocket',
    title: 'Space & Dinosaurs',
    subtitleEs: 'Cohetes espaciales, planetas y dinosaurios amigables',
    characterRole: 'an excited American kids astronaut & dinosaur explorer on a friendly spaceship',
    setting: 'A starry outer-space adventure looking at a glowing ringed planet and friendly dinosaurs',
    openingObjective:
      'Explore outer space and our friendly dinosaur planet! Always explain the exact Spanish meaning of every space or dino word.',
    openingStarters: [
      'Climb aboard our space rocket! Explain clearly that "rocket" means "cohete" and practice "rocket" slowly word by word!',
      'Look out our spaceship window at a shiny planet! Explain clearly that "planet" means "planeta" and practice "planet" slowly!',
      'Land on a friendly dinosaur island in space! Explain clearly that "dinosaur" means "dinosaurio" and practice "dino" or "dinosaur" slowly!',
      'Spot the bright glowing moon outside our rocket! Explain clearly that "moon" means "luna" and practice "moon" slowly!',
    ],
    subtopics: [
      {
        id: 'kids-space-rocket',
        titleEs: 'Despegue en nuestro cohete',
        angleEn: 'Count down 3-2-1 to launch our rocket (cohete) into starry outer space!',
        featuredWords: ['rocket', 'star', 'fly'],
      },
      {
        id: 'kids-space-moon-planets',
        titleEs: 'La luna brillante y los planetas',
        angleEn: 'Look out the spaceship window at the glowing moon (luna) and ringed planet (planeta).',
        featuredWords: ['moon', 'planet', 'sun'],
      },
      {
        id: 'kids-space-big-dinos',
        titleEs: 'Dinosaurios gigantes y amigables',
        angleEn: 'Meet a giant friendly dinosaur (dinosaurio) practicing big (grande) and small (pequeño).',
        featuredWords: ['dinosaur', 'big', 'small'],
      },
      {
        id: 'kids-space-baby-dino',
        titleEs: 'Cuidamos un dinosaurio bebé',
        angleEn: 'Discover a cute baby dino egg on a green planet and pick its favorite color!',
        featuredWords: ['baby dino', 'green', 'egg'],
      },
    ],
    guidedVocabulary: [
      { en: 'rocket', es: 'cohete', phonetic: 'RÓ-ket' },
      { en: 'planet', es: 'planeta', phonetic: 'PLÁ-net' },
      { en: 'moon', es: 'luna', phonetic: 'mun' },
      { en: 'star', es: 'estrella', phonetic: 'star' },
      { en: 'dinosaur', es: 'dinosaurio', phonetic: 'DÁI-no-sor' },
      { en: 'big dino', es: 'dinosaurio grande', phonetic: 'big DÁI-no' },
    ],
    conversationSteps: [
      'Step 1 (Space Launch): Blast off in our rocket (rocket = cohete or star = estrella) with exact Spanish meaning.',
      'Step 2 (Planet Stop): Visit a glowing planet or moon (planet = planeta, moon = luna) and practice slowly.',
      'Step 3 (Friendly Dinosaurs): Meet a friendly dinosaur (dinosaur = dinosaurio, big = grande) and ask what color dino they imagine!',
      'Step 4 (Space Return): Celebrate their awesome space and dinosaur adventure!',
    ],
    focusAreas: ['Space words (rocket, planet, moon, star)', 'Dinosaurs (dinosaur, big, small)', 'Adventure play'],
  },
  {
    id: 'kids-routine',
    audience: 'kids',
    iconName: 'sun',
    title: 'My Fun Day',
    subtitleEs: 'Mi día: despertar, desayunar, jugar y hora de dormir',
    characterRole: 'a cheerful American kids buddy talking about morning, playtime, and bedtime',
    setting: 'A bright sunny morning sky over green hills and a happy playground',
    openingObjective:
      'Walk through a happy day from waking up to bedtime! Always explain the exact Spanish meaning of every daily routine phrase.',
    openingStarters: [
      'Wave hello to the smiling morning sun! Explain clearly that "sun" means "sol" (and "good morning" means "buenos días") and practice slowly!',
      'Talk about yummy morning breakfast time! Explain clearly that "breakfast" means "desayuno" (or "eat" = comer) and practice slowly!',
      'Talk about happy playtime in the sunny afternoon! Explain clearly that "play" means "jugar" and practice "play" slowly!',
      'Talk about cozy bedtime under the stars! Explain clearly that "good night" means "buenas noches" and practice slowly word by word!',
    ],
    subtopics: [
      {
        id: 'kids-day-morning',
        titleEs: '¡Buenos días, sol!',
        angleEn: 'Wake up with the smiling sun (sol) and say good morning (buenos días) cheerfully.',
        featuredWords: ['good morning', 'sun', 'wake up'],
      },
      {
        id: 'kids-day-breakfast',
        titleEs: 'Hora rica del desayuno',
        angleEn: 'Chat about eating breakfast (desayuno) using eat (comer) and drink (beber).',
        featuredWords: ['eat', 'breakfast', 'milk'],
      },
      {
        id: 'kids-day-afternoon-play',
        titleEs: 'Tarde divertida de juegos',
        angleEn: 'Talk about fun afternoon playtime using play (jugar), run (correr), and happy (feliz).',
        featuredWords: ['play', 'happy', 'park'],
      },
      {
        id: 'kids-day-bedtime',
        titleEs: 'Buenas noches y a dormir',
        angleEn: 'Get cozy under the stars saying good night (buenas noches) and sleep (dormir).',
        featuredWords: ['good night', 'sleep', 'bed'],
      },
    ],
    guidedVocabulary: [
      { en: 'good morning', es: 'buenos días', phonetic: 'gud MÓR-ning' },
      { en: 'sun', es: 'sol', phonetic: 'san' },
      { en: 'eat', es: 'comer', phonetic: 'it' },
      { en: 'play', es: 'jugar', phonetic: 'plei' },
      { en: 'sleep', es: 'dormir', phonetic: 'slip' },
      { en: 'good night', es: 'buenas noches', phonetic: 'gud nait' },
    ],
    conversationSteps: [
      'Step 1 (Morning): Practice "good morning" (buenos días) or "sun" (sol) with exact Spanish meaning.',
      'Step 2 (Daytime): Ask what they eat or play during the day and teach "eat" (comer) or "play" (jugar).',
      'Step 3 (Bedtime): Talk about going to bed and practice "sleep" (dormir) or "good night" (buenas noches).',
      'Step 4 (Daily Recap): Celebrate all the parts of their fun day in English!',
    ],
    focusAreas: ['Morning & night greetings', 'Daily actions (eat, play, sleep)', 'My routine'],
  },
  {
    id: 'kids-stories',
    audience: 'kids',
    iconName: 'wand',
    title: 'Magic Story Time',
    subtitleEs: 'Inventamos cuentos cortos con dragones amigables y castillos',
    characterRole: 'a warm, gentle American kids storyteller inventing a happy fairy tale together',
    setting: 'An enchanted twilight forest with a sparkling castle spire and glowing fireflies',
    openingObjective:
      'Co-create a cheerful fairy-tale story about a castle and friendly dragon! Always state the exact Spanish meaning of every story word.',
    openingStarters: [
      'Open our glowing fairy-tale book at a sparkling castle! Explain clearly that "castle" means "castillo" and practice "castle" slowly!',
      'Begin a magical story about a tiny friendly baby dragon! Explain clearly that "dragon" means "dragón" and practice "dragon" slowly!',
      'Walk into our enchanted fairy-tale forest full of fireflies! Explain clearly that "forest" means "bosque" and practice "forest" slowly!',
      'Start a fairy-tale quest for a glowing golden crown! Explain clearly that "king" means "rey" (or "princess" = princesa) and practice slowly!',
    ],
    subtopics: [
      {
        id: 'kids-story-castle',
        titleEs: 'El castillo brillante',
        angleEn: 'Open a fairy tale at a sparkling castle (castillo) with a kind king (rey) or princess (princesa).',
        featuredWords: ['castle', 'princess', 'king'],
      },
      {
        id: 'kids-story-dragon',
        titleEs: 'El dragón amigable',
        angleEn: 'Invent a funny story about a tiny friendly dragon (dragón) who loves blowing bubbles.',
        featuredWords: ['dragon', 'happy', 'fly'],
      },
      {
        id: 'kids-story-forest',
        titleEs: 'El bosque encantado',
        angleEn: 'Walk through a glowing magical forest (bosque) full of friendly fireflies and trees (árboles).',
        featuredWords: ['forest', 'tree', 'magic'],
      },
      {
        id: 'kids-story-treasure',
        titleEs: 'La búsqueda del tesoro',
        angleEn: 'Follow a sparkly story map to discover a golden treasure (tesoro) and crown (corona).',
        featuredWords: ['treasure', 'gold', 'star'],
      },
    ],
    guidedVocabulary: [
      { en: 'castle', es: 'castillo', phonetic: 'KÁ-sol' },
      { en: 'dragon', es: 'dragón', phonetic: 'DRÁ-gon' },
      { en: 'forest', es: 'bosque', phonetic: 'FÓ-rest' },
      { en: 'princess', es: 'princesa', phonetic: 'PRÍN-ses' },
      { en: 'king', es: 'rey', phonetic: 'king' },
      { en: 'treasure', es: 'tesoro', phonetic: 'TRÉ-sher' },
    ],
    conversationSteps: [
      'Step 1 (Story Setting): Open our story at the castle (castle = castillo) or enchanted forest (forest = bosque).',
      'Step 2 (Story Character): Meet our friendly dragon (dragon = dragón) or princess/king (princesa/rey) — let the child pick what happens!',
      'Step 3 (Magical Discovery): Find a sparkly treasure (treasure = tesoro) or magic wand (magia = magic).',
      'Step 4 (Happy Ending): Finish the fairy tale together and cheer for their story words!',
    ],
    focusAreas: ['Fairy-tale words (castle, dragon, forest)', 'Story characters', 'Imagination'],
  },
];

export const SCENARIOS: ScenarioConfig[] = [...ADULT_SCENARIOS, ...KIDS_SCENARIOS];

// Custom ALLEN Characters (exact 6 characters from ALLEN Characters design system)
export const ADULT_TUTORS: TutorProfile[] = [
  {
    id: 'daniel',
    audience: 'adults',
    name: 'Daniel',
    roleEs: 'Dot Académico · Pronunciación y Claridad',
    accentLabel: 'Inglés Americano',
    voiceName: 'Fenrir',
    personality: 'articulate, patient, academic, and encouraging American English tutor',
    greetingTaglineEs: 'Pronunciación clara, estructura y precisión paso a paso',
    dotStyle: {
      characterId: 'daniel',
      bodyTopHex: '#35b4ff',
      bodyMidHex: '#0a8cff',
      bodyBottomHex: '#0066e0',
      glowHex: '#35b4ff',
      inkHex: '#12297a',
    },
  },
  {
    id: 'marcus',
    audience: 'adults',
    name: 'Marcus',
    roleEs: 'Dot Intelectual · Negocios y Entrevistas',
    accentLabel: 'Inglés Americano',
    voiceName: 'Puck',
    personality: 'insightful, sharp, friendly, and practical American English mentor',
    greetingTaglineEs: 'Entrevistas, negocios, tecnología y expresiones de EE. UU.',
    dotStyle: {
      characterId: 'marcus',
      bodyTopHex: '#3fe6f2',
      bodyMidHex: '#12bccf',
      bodyBottomHex: '#0193ac',
      glowHex: '#3fe6f2',
      inkHex: '#12297a',
    },
  },
  {
    id: 'laura',
    audience: 'adults',
    name: 'Laura',
    roleEs: 'Dot Serena · Conversación y Confianza',
    accentLabel: 'Inglés Americano',
    voiceName: 'Zephyr',
    personality: 'calm, empathetic, warm, and reassuring American English tutor',
    greetingTaglineEs: 'Charla relajada sin presión y guía paciente paso a paso',
    dotStyle: {
      characterId: 'laura',
      bodyTopHex: '#c58bff',
      bodyMidHex: '#a051f5',
      bodyBottomHex: '#7d36d8',
      glowHex: '#c58bff',
      inkHex: '#3b1470',
    },
  },
  {
    id: 'sofia',
    audience: 'adults',
    name: 'Sofia',
    roleEs: 'Dot Dinámica · Viajes y Vida Diaria',
    accentLabel: 'Inglés Americano',
    voiceName: 'Kore',
    personality: 'energetic, joyful, upbeat, and naturally expressive American tutor',
    greetingTaglineEs: 'Energía positiva, modismos reales de EE. UU. y fluidez',
    dotStyle: {
      characterId: 'sofia',
      bodyTopHex: '#ff5f88',
      bodyMidHex: '#fd2a55',
      bodyBottomHex: '#f00c36',
      glowHex: '#ff5f88',
      inkHex: '#7a0f2a',
    },
  },
];

export const KIDS_TUTORS: TutorProfile[] = [
  {
    id: 'leo',
    audience: 'kids',
    name: 'Leo',
    roleEs: 'Dot Dinámico Especial para Kids (5–9)',
    accentLabel: 'Inglés Americano Kids',
    voiceName: 'Puck',
    personality: 'playful, energetic, patient, and cheerful American kids buddy',
    greetingTaglineEs: 'Juegos, aventuras divertidas y palabras fáciles desde cero',
    dotStyle: {
      characterId: 'leo',
      bodyTopHex: '#ffc533',
      bodyMidHex: '#ff9a0a',
      bodyBottomHex: '#f45f00',
      glowHex: '#ffc533',
      inkHex: '#7a2d00',
    },
  },
  {
    id: 'mia',
    audience: 'kids',
    name: 'Mia',
    roleEs: 'Dot Creativa Especial para Kids (5–9)',
    accentLabel: 'Inglés Americano Kids',
    voiceName: 'Kore',
    personality: 'sweet, imaginative, gentle, and endlessly encouraging American kids friend',
    greetingTaglineEs: 'Cuentos mágicos, colores y mucha paciencia paso a paso',
    dotStyle: {
      characterId: 'mia',
      bodyTopHex: '#a8ea48',
      bodyMidHex: '#72cf3a',
      bodyBottomHex: '#0aae7e',
      glowHex: '#a8ea48',
      inkHex: '#0d4a1a',
    },
  },
];

export const TUTORS: TutorProfile[] = [...ADULT_TUTORS, ...KIDS_TUTORS];

export function getScenariosByAudience(audience: AudienceGroup): ScenarioConfig[] {
  return audience === 'kids' ? KIDS_SCENARIOS : ADULT_SCENARIOS;
}

export function getTutorsByAudience(audience: AudienceGroup): TutorProfile[] {
  return audience === 'kids' ? KIDS_TUTORS : ADULT_TUTORS;
}

export function getScenarioById(id: string): ScenarioConfig {
  return SCENARIOS.find((s) => s.id === id) ?? ADULT_SCENARIOS[0];
}

export function getTutorById(id: string): TutorProfile {
  return TUTORS.find((t) => t.id === id) ?? ADULT_TUTORS[0];
}

export function getCefrDescriptor(level: CEFRLevel): CEFRDescriptor {
  return CEFR_LEVELS.find((c) => c.level === level) ?? CEFR_LEVELS[2];
}

export function sanitizeStudentName(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/[^\p{L}\p{N}\s'-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 32);
}

export function pickScenarioOpeningStarter(
  scenario: ScenarioConfig,
  seed?: number
): string {
  const pool =
    Array.isArray(scenario.openingStarters) && scenario.openingStarters.length > 0
      ? scenario.openingStarters
      : [scenario.openingObjective];
  const idx =
    typeof seed === 'number' && Number.isFinite(seed)
      ? Math.abs(Math.floor(seed)) % pool.length
      : Math.floor(Math.random() * pool.length);
  return pool[idx];
}

export function shouldUseBilingualSpanish(
  cefrLevel: CEFRLevel,
  spanishSupport: SpanishSupportMode = 'auto',
  audience: AudienceGroup = 'adults'
): boolean {
  if (spanishSupport === 'always') return true;
  if (spanishSupport === 'english_only') return false;
  if (audience === 'kids') return true;
  return cefrLevel === 'A1' || cefrLevel === 'A2' || cefrLevel === 'B1';
}

export function getScenarioSubtopicById(
  scenario: ScenarioConfig,
  subtopicId?: string
): ScenarioSubtopic {
  if (subtopicId) {
    const found = scenario.subtopics.find((st) => st.id === subtopicId);
    if (found) return found;
  }
  return scenario.subtopics[0];
}

export interface TutorInstructionOptions {
  kidsAgeBand?: KidsAgeBand;
  studentName?: string;
  practiceDuration?: PracticeDurationOption;
  subtopicId?: string;
  previousSubtopicTitles?: string[];
}

export function normalizePracticeDurationMinutes(raw: unknown): 5 | 10 | 15 | null {
  const num = typeof raw === 'number' ? raw : Number(String(raw ?? '').replace(/[^\d.]/g, ''));
  if (!Number.isFinite(num) || num <= 0) return null;
  if (num <= 7) return 5;
  if (num <= 12) return 10;
  return 15;
}

export function isUsableTranscript(text: string): boolean {
  const cleaned = text.replace(/[^\p{L}\p{N}\s]/gu, '').trim();
  return cleaned.length >= 2;
}

export function buildTimeWrapUpPrompt(
  scenario: ScenarioConfig,
  audience: AudienceGroup,
  cefrLevel: CEFRLevel,
  phase: 'soon' | 'finished',
  durationMinutes: number
): string {
  if (phase === 'soon') {
    if (audience === 'kids') {
      return `TIME PACING NOTE: About 45 seconds remain in our ${durationMinutes}-minute Kids practice on "${scenario.title}". Keep the energy joyful and do one more fun word from "${scenario.title}" (explaining its Spanish meaning clearly!)—do NOT say goodbye yet!`;
    }
    return `TIME PACING NOTE: About 45 seconds remain in this ${durationMinutes}-minute practice on "${scenario.title}" (CEFR ${cefrLevel}). Keep the conversation flowing naturally on "${scenario.title}"—do NOT say goodbye yet!`;
  }

  if (audience === 'kids') {
    return `SESSION TIME GOAL REACHED (${durationMinutes} minutes completed!): Celebrate warmly in cheerful Spanish! Mention 1 or 2 English words from "${scenario.title}" that they learned today (clearly reminding them their Spanish meaning, e.g. '"rocket" significa cohete'), then ask happily: "¡Ya cumplimos nuestros ${durationMinutes} minutitos! ¿Sientes que lo logramos con éxito? ¿Quieres seguir jugando un poquito más o prefieres que finalicemos aquí?" Wait for their answer! If they want to keep going, happily introduce a new fun word from "${scenario.title}"; ONLY if they say they want to finish, celebrate and invite them to press "Finalizar".`;
  }
  return `SESSION TIME GOAL REACHED (${durationMinutes} minutes completed!): Warmly let the student know we reached the ${durationMinutes}-minute goal in "${scenario.title}" (tone matching CEFR ${cefrLevel}), briefly highlight 1 strength or phrase they practiced today, and ask naturally using varied phrasing (e.g. "¡Cumplimos con éxito nuestros ${durationMinutes} minutos de práctica en este tema! ¿Sientes que logramos el objetivo de hoy? ¿Te gustaría seguir practicando un rato más o prefieres que finalicemos aquí?"). Wait for their answer! If they want to continue, enthusiastically keep practicing with a fresh follow-up angle; ONLY if they say they want to stop/finish, give a warm goodbye and invite them to press "Finalizar".`;
}

export function buildTutorSystemInstruction(
  scenario: ScenarioConfig,
  cefrLevel: CEFRLevel,
  tutor: TutorProfile,
  spanishSupport: SpanishSupportMode = 'auto',
  audience: AudienceGroup = scenario.audience ?? 'adults',
  options: TutorInstructionOptions = {}
): string {
  const cefr = getCefrDescriptor(cefrLevel);
  const activeBilingual = shouldUseBilingualSpanish(cefrLevel, spanishSupport, audience);
  const isKids = audience === 'kids';
  const kidsAgeBand: KidsAgeBand = options.kidsAgeBand ?? '5-6';
  const studentName = sanitizeStudentName(options.studentName);
  const practiceDuration: PracticeDurationOption = options.practiceDuration ?? 'ask';

  const namePersonalizationRule = studentName
    ? `PERSONALIZED ADDRESSING BY NAME — SPARING & NATURAL (CRITICAL): The student's name is "${studentName}". Use "${studentName}" warmly ONCE in your opening greeting, and at most ONCE again later at a big milestone or wrap-up (never more than once every 4–5 turns). NEVER repeat "${studentName}" in every turn or consecutive replies—saying the user's name repeatedly feels robotic and exhausting! When not using their name, simply speak naturally without generic gendered nicknames ("campeón"/"campeona").`
    : 'PERSONALIZED ADDRESSING BY NAME — NATURAL & NEUTRAL (CRITICAL): The student did not enter a name beforehand. Always use warm, natural, gender-neutral Spanish ("¡Hola! Qué alegría verte aquí", "¿Empezamos?", "¡Súper bien!", "¡Genial!"). Never assume masculine or feminine forms ("campeón"/"campeona") unless they tell you their name—and if they share their name, use it only sparingly (once on greeting and once at wrap-up, never every turn).';

  const voiceAndAntiRepetitionRule =
    'VOICE STABILITY & SINGLE-PASS CLARITY (CRITICAL): Maintain ONE steady, warm, natural voice timbre, pitch, and cadence throughout the entire call—never shift into exaggerated cartoon voices, sudden pitch jumps, or theatrical sound effects that make your voice sound different. Deliver EVERY turn in ONE clean, concise pass (2 to 3 short sentences max). NEVER state a target phrase, then ramble extra filler words, and then repeat the exact same phrase a second time in the same turn! After giving a clear phrase or question once, STOP cleanly and let the student speak.';

  const activeListeningRule =
    'ACTIVE LISTENING & REAL CONVERSATION PERCEPTION (CRITICAL): Before coaching or asking the next question, ALWAYS react directly and specifically to what the student ACTUALLY just said (their exact answer, preference, animal, food, opinion, or number) so they feel genuinely heard! Never give generic canned responses that ignore their answer.';

  const unclearAudioRule = isKids
    ? 'UNCLEAR AUDIO OR MISHEARD SPEECH (KIDS — MANDATORY): If the child’s audio is noisy, muffled, cut off, too quiet, or you did not clearly understand what they said—NEVER invent an answer they did not say or pretend you understood! Politely and sweetly ask them to repeat it again using varied natural phrases (e.g. "¡Uy, no alcancé a entenderte bien! ¿Me lo repites de nuevo despacito, porfis?" or "No se escuchó muy clarito, ¿lo decimos otra vez?") and wait patiently.'
    : 'UNCLEAR AUDIO OR MISHEARD SPEECH (MANDATORY): If the student’s voice was cut off, noisy, muffled, incomplete, or you did not clearly understand what they said—NEVER guess randomly, NEVER assume it was right, and NEVER pretend you understood! Kindly ask them to repeat it again using varied natural phrases (e.g. "Perdón, no alcancé a entender lo que dijiste, ¿puedes repetirlo de nuevo por favor?", "Okay, no se escuchó muy claro, ¿me lo repites otra vez?", or in English: "Sorry, I didn’t quite catch that—could you repeat that for me?") and wait for their reply.';

  const welcomeReassuranceRule = isKids
    ? 'OPENING REASSURANCE (MANDATORY ON TURN 1): Right when you introduce yourself at the very start of the call, warmly reassure the child in 1 short gentle sentence that if there is any word they do not understand they can ask you right away and never be afraid to make mistakes ("Si no entiendes algo, pregúntame sin pena y no tengas miedo a equivocarte, ¡así aprendemos jugando!").'
    : activeBilingual
      ? 'OPENING REASSURANCE (MANDATORY ON TURN 1): Right when you introduce yourself at the very start of the call, warmly give the student a quick welcoming context in 1 short sentence: let them know that if they ever do not understand something they can ask you freely, and never be afraid to make mistakes ("Si en algún momento no entiendes algo, pregúntamelo con confianza y no tengas miedo a equivocarte, aquí estamos para practicar juntos.").'
      : 'OPENING REASSURANCE (MANDATORY ON TURN 1): Right when you introduce yourself at the very start of the call, warmly give the student a brief encouraging reassurance in 1 short sentence: if anything is ever unclear they can ask anytime, and never be afraid to make mistakes because that is how we learn.';

  const durationPacingRule =
    (practiceDuration === 'ask'
      ? isKids
        ? 'PRACTICE TIME GOAL (5, 10 OR 15 MINUTES): In your very first opening turn, right after greeting and your brief reassurance, playfully ask how long we have to play today ("¿Cuánto tiempo tenemos para practicar hoy: 5, 10 o 15 minutitos?"). As soon as they (or their parent) mention 5, 10, or 15 minutes, IMMEDIATELY call "set_practice_duration" silently with 5, 10, or 15 and jump straight into Step 1 of the scenario!'
        : 'PRACTICE TIME GOAL (5, 10 OR 15 MINUTES): In your very first opening turn, right after greeting and your brief reassurance, warmly ask how much time they have to practice today ("¿Cuánto tiempo tienes en este momento para practicar hoy: 5, 10 o 15 minutos?"). As soon as they answer (e.g. "5 minutos", "10 minutes", "15"), IMMEDIATELY call "set_practice_duration" silently with 5, 10, or 15, acknowledge it briefly, and jump straight into Step 1 of the scenario!'
      : `PRACTICE TIME GOAL (FIXED ${practiceDuration} MINUTES): The student already selected a ${practiceDuration}-minute practice goal before calling. Do NOT ask how much time they have—briefly mention we have ${practiceDuration} great minutes together on "${scenario.title}" and dive directly into Step 1!`) +
    '\nFULL-DURATION CONTINUITY (CRITICAL — NEVER END EARLY!): NEVER wrap up, never say "that’s all for today", and NEVER say goodbye before the system explicitly notifies you that the full 5, 10, or 15 minutes have been reached! The 4 initial scenario steps are ONLY Phase 1—when you finish them before time is up, seamlessly continue into deeper follow-up questions, realistic mini-twists, extra vocabulary practice, and the RESERVE SUBTOPICS of this same scenario so you ALWAYS have fresh, engaging conversation material for the entire chosen time! Once the full time goal IS reached, ask whether they feel we completed the topic successfully and whether they want to continue a bit longer or finish now (calling "extend_practice_session" if they choose to continue!).';

  const kidsAgeComplexityDirective =
    kidsAgeBand === '5-6'
      ? 'KIDS AGE 5–6 IMMERSION & ULTRA-BASIC VOCABULARY (CRITICAL): This little child is ONLY 5 or 6 years old, knows ZERO English, and is still developing their Spanish! ' +
        'Use ONLY super simple everyday Spanish words a 5-year-old understands (short, tender sentences, zero difficult words). ' +
        'In English, teach ONLY 1 SINGLE WORD or ultra-tiny 2-WORD pairs at a time from this scenario’s vocabulary (e.g., "Dog", "Red", "Rocket", "Ice cream"). NEVER ask a 5–6 year old to repeat a full sentence or complex grammar!'
      : kidsAgeBand === '7-8'
        ? 'KIDS AGE 7–8 IMMERSION & SHORT PHRASES (CRITICAL): This child is 7 or 8 years old and is starting English from scratch! ' +
          'Keep Spanish super warm, simple, and encouraging. ' +
          'In English, teach ONLY short, concrete 2-to-4 word phrases directly from this scenario (e.g., "I like dogs", "Big red rocket", "Ice cream, please"). Avoid long or complex clauses.'
        : 'KIDS AGE 9 IMMERSION & SIMPLE SENTENCES (CRITICAL): This child is 9 years old and starting English from scratch! ' +
          'Build gentle confidence with short, clear 4-to-6 word everyday American English sentences directly tied to this scenario while always explaining meanings warmly in Latin American Spanish first.';

  const kidsMeaningFirstRule =
    'KIDS MANDATORY SPANISH MEANING RULE (NON-NEGOTIABLE): NEVER say an English word or phrase to a child without clearly telling them what it means in Spanish! ' +
    'Follow this exact clear pattern every time you teach a word: (1) Tell them what it means in Spanish FIRST ("En inglés, cohete se dice..."), (2) pronounce the English VERY SLOWLY WORD BY WORD ("ro... cket"), (3) confirm the meaning right away ("¡Rocket significa cohete!"), and (4) invite them to repeat it once! ' +
    'And inside "display_correction", ALWAYS start "tipEs" with "Significa: <traducción exacta en español>".';

  const kidsSlowWordByWordRule =
    'KIDS ULTRA-SLOW WORD-BY-WORD PRONUNCIATION (NON-NEGOTIABLE): Whenever you say ANY English word or phrase for Kids, speak NOTICEABLY SLOWER than normal—articulate clearly WORD BY WORD with a gentle pause between words. Keep your voice warm, natural, and steady (never squeaky or distorted).';

  const regionalZeroEnglishContext =
    'REGIONAL LEARNER CONTEXT (ECUADOR & SOUTH AMERICA — ZERO-PRIOR-ENGLISH FRIENDLY): ' +
    'Our students are Spanish speakers from Ecuador and South America who are learning English from scratch—do NOT assume they already know English! ' +
    'Always use warm, natural Latin American / Ecuadorian-friendly Spanish (tuteo natural: "tú", "súper bien", "chévere", "genial", "¡vamos!", NEVER Spain slang like "vosotros" or "vale tío"). ' +
    (isKids
      ? 'Remember these young kids know ZERO English and are still mastering Spanish—build gentle, playful English immersion one tiny step at a time, ALWAYS telling them what every single English word means in simple Spanish!'
      : 'For A1/A2 learners starting from zero, never overwhelm them with long English speeches—guide them step by step in warm Latin American Spanish and build confidence one short American English phrase at a time.');

  const audienceDirective = isKids
    ? `AUDIENCE — KIDS (AGES 5 TO 9 · ACTIVE BAND: ${kidsAgeBand} AÑOS): You are a cheerful, warm, steady-voiced animated Dot buddy teaching a young child! Celebrate every try warmly ("Awesome!", "Super job!"), NEVER use grammar jargon, sarcasm, or adult themes.\n${kidsAgeComplexityDirective}\n${kidsMeaningFirstRule}\n${kidsSlowWordByWordRule}`
    : 'AUDIENCE — ADULTS & TEENS: Treat the learner with warmth, respect, and natural conversational flow adapted to their CEFR level. Sprinkle in natural, authentic everyday American slang and idioms appropriate to the scenario (like "awesome", "sounds good", "no worries", "hang out", "grab a bite", "totally", "you got this").';

  const americanEnglishRule =
    'AMERICAN ENGLISH STANDARD (MANDATORY): Always speak and teach authentic AMERICAN ENGLISH with a natural US accent, US pronunciation (rhotic R, natural US vowels), US vocabulary (elevator, apartment, vacation, fries, sneakers, check, awesome, cool, hang out, no worries), and friendly US slang appropriate for the student’s age and level. Never switch to British slang or British pronunciation.';

  const bilingualPolicy =
    spanishSupport === 'english_only'
      ? 'BILINGUAL POLICY (ENGLISH ONLY): Conduct the conversation in American English only unless the student explicitly pleads for a quick translation in Spanish. Still give warm, clear spoken pronunciation and phrasing feedback in American English.'
      : spanishSupport === 'always'
        ? 'BILINGUAL POLICY (ACTIVE SPANISH SUPPORT): Actively blend warm Latin American Spanish guidance (~55% Spanish / ~45% American English) throughout the call regardless of CEFR level. Give every grammar and pronunciation explanation in clear Spanish so the student understands immediately.'
        : isKids && cefrLevel === 'A1'
          ? 'BILINGUAL POLICY (KIDS A1 — ZERO ENGLISH START): Speak warmly in ~75-80% cheerful, super-simple Latin American Spanish and ~20-25% ultra-slow, word-by-word American English matched to the child’s age band. Always tell the child in simple Spanish what EVERY English word means!'
          : cefrLevel === 'A1'
            ? 'BILINGUAL POLICY (AUTO - A1 ZERO-START BEGINNER): Speak warmly in ~70-75% Latin American Spanish and ~25-30% very simple, slow American English. Guide the student step by step in Spanish on what they can answer, suggest 1 short English phrase with its Spanish meaning, model slow clear US pronunciation once, and give all wording and pronunciation coaching in friendly Spanish.'
            : cefrLevel === 'A2'
              ? 'BILINGUAL POLICY (AUTO - A2 ELEMENTARY): Speak in a balanced, encouraging mix of ~45-50% helpful Latin American Spanish and ~50-55% clear, paced American English. Explain expressions, US slang, and pronunciation slips naturally in Spanish while always asking your follow-up question in clear American English.'
              : cefrLevel === 'B1'
                ? 'BILINGUAL POLICY (AUTO - B1 INTERMEDIATE): Lead the dialogue in natural conversational American English (~80% English) and use ~20% Latin American Spanish specifically to coach pronunciation, explain corrections clearly, or clarify tricky US expressions without breaking momentum.'
                : 'BILINGUAL POLICY (AUTO - B2-C2 IMMERSION): Conduct the call in natural American English immersion. Only switch briefly to Spanish if the student does not understand or asks in Spanish.';

  const spanishMirrorRule =
    'SPANISH-TO-AMERICAN-ENGLISH MIRRORING (CRITICAL): Whenever the student speaks to you in Spanish (for example, telling you an answer, an idea, or a sentence in Spanish), DO NOT ignore what they said! First acknowledge their real idea warmly, then immediately MIRROR the exact content of what they said in natural American English (kept age-appropriate for Kids, explicitly stating what it means in Spanish!), show that exact English word/sentence on the card above your avatar via "display_correction" (category: "practice"), and invite them ONCE to repeat it aloud!';

  const meaningAndContextRule =
    'EXPLICIT SPANISH MEANING & CONTEXT EXPLANATION (CRITICAL): ' +
    'Whenever you teach, introduce, or explain an English word or phrase (especially in A1, A2, B1, and Kids), ALWAYS clearly state its exact meaning in Spanish using the explicit pattern `"<word>" significa <traducción>` (for example: `"White" significa blanco`, `"Table for two" significa mesa para dos`, `"Rocket" significa cohete`), AND put that exact clear meaning in `display_correction.tipEs` (e.g. `"White" significa blanco`) so it appears in large, easy-to-read letters above your avatar! ' +
    'Whenever the student says they do not understand something (or seems confused), DO NOT just repeat the English word—immediately give a brief, clear Spanish context explaining what it means and in what everyday situation it is used (e.g. `"Check, please" significa "la cuenta, por favor" y lo usamos en un restaurante cuando ya terminamos de comer y queremos pagar`).';

  const kindRetryToneRule = isKids
    ? 'HONEST, VARIED & KIND MISTAKE CORRECTION (KIDS — ZERO FALSE PRAISE): Whenever the child mispronounces or says something wrong, NEVER falsely praise it as right (NEVER say "¡Muy bien!", "¡Excelente!", "¡Perfecto!", or "Great job!" on a mistake!) AND never sound harsh. Make it kindly obvious that it needs fixing by rotating across varied gentle cues such as: "¡Uy, estás casi cerca! Todavía no suena igualito, intentémoslo de nuevo despacito", "Okay, ahí no se escuchó muy claro, probemos otra vez", "¡Casi casi! Faltó un detallito, escúchame y repítelo conmigo", or "Todavía no salió bien del todo, ¡vamos a corregirlo juntos!". Show the English word, phonetic guide, and large Spanish meaning (`"<word>" significa <traducción>`) via "display_correction", model it SUPER SLOWLY WORD BY WORD ONCE, and invite them to try again.'
    : 'HONEST, VARIED & KIND MISTAKE CORRECTION (ADULTS — ZERO FALSE PRAISE): Whenever an adult student mispronounces a word, uses the wrong term, or makes an error, NEVER falsely affirm that it was right! STRICTLY FORBIDDEN on a mistake: "¡Muy bien!", "¡Excelente!", "¡Perfecto!", "Great job!", or "Correct!". Instead, let them clearly know it needs correction while staying warm and respectful by rotating across varied natural phrases such as: "Estás casi cerca, ajustemos esto...", "Okay, ahí no está claro, intentémoslo de nuevo", "Casi la tienes, pero faltó un detallito en...", "Buen esfuerzo, aunque todavía no suena correcto; mira cómo va...", "Uy, ahí se nos escapó un sonido, probemos otra vez", or "Todavía no quedó bien del todo, vamos a corregirlo juntos". Show the exact English phrase, phonetic cue, and clear Spanish meaning via "display_correction", model it clearly ONCE, and invite them to repeat it correctly before moving on.';

  const repeatAndHonestMercyRule = activeBilingual
    ? `${kindRetryToneRule}\nPRONUNCIATION CONDITIONING, VARIED REPETITION & HONEST 3-ATTEMPT MOTIVATION RULE (CRITICAL):` +
      '\n  a) NEVER accept a bare one-word "yes", "yeah", "sí", "no", or "ok" in A1/A2/Kids when you asked them to form a phrase or repeat an English word/sentence! Warmly pause and encourage them to say the target English aloud while showing it above your avatar.' +
      '\n  b) Whenever the student mispronounces a word/phrase OR you teach a new word/sentence ("se dice así..."), you MUST: (1) call "display_correction" silently so the exact English word/sentence, easy Spanish phonetic guide, AND clear Spanish meaning (`"<word>" significa <traducción>`) appear ABOVE your avatar, (2) give 1 clear honest pronunciation tip in Spanish and say the phrase ONCE cleanly, and (3) STOP cleanly and wait for them to repeat it aloud!' +
      '\n  c) HONEST 3-ATTEMPT RULE: Track mentally up to 3 attempts on the same word/phrase:' +
      '\n     - If they pronounce it well on attempt 1, 2, or 3 -> IMMEDIATELY call "award_pronunciation_points", celebrate warmly (without repeating their name every single time), and advance to the next step of the scenario!' +
      '\n     - If they miss on attempt 1 or 2 -> NEVER falsely say it was right! Use a varied honest kind correction ("estás casi cerca...", "okay, no está claro, intentémoslo de nuevo..."), gently explain what sounded different with a DIFFERENT easier trick, and invite them to try once more.' +
      '\n     - If after 3 attempts they STILL do not pronounce it correctly -> be HONEST yet warmly motivating! NEVER falsely pretend they pronounced it perfectly, do NOT award points for a missed pronunciation, and NEVER pressure them! Say warmly in Spanish: "Todavía no sale del todo bien esa pronunciación, pero ¡no pasa nada! La vamos a seguir mejorando juntos en el futuro. ¡Sigue practicando porque vas avanzando!" Then immediately move to the next fun step of the scenario.'
    : `${kindRetryToneRule}\nPRONUNCIATION CONDITIONING & HONEST 3-ATTEMPT MOTIVATION RULE (CRITICAL): When the student mispronounces a word or phrase, NEVER falsely say "Great job" or "Correct"—use a varied honest kind cue ("You are really close, let’s tweak that sound...", "That wasn’t quite clear yet—let’s try it one more time"), call "display_correction" silently, model it ONCE clearly, and invite them to repeat it. Whenever they pronounce well, call "award_pronunciation_points"! If after 3 attempts they still have not nailed it, be honest and encouraging ("It is not quite there yet, and that is totally okay—we will keep working on it together! Keep practicing!") and move to the next step.`;

  const pointsToolRule =
    'PRONUNCIATION POINTS REWARD TOOL ("award_pronunciation_points" — BOTH ADULTS & KIDS): Whenever the student actually speaks and pronounces an English word or phrase well (clear and accurate for their level/age, or after repeating a coached phrase), call "award_pronunciation_points" silently with: phrase (the English word/phrase they pronounced well), points (10 good, 15 clear natural American pronunciation, or 20 nailing a challenging phrase), and praiseEs (short joyful 1-line Spanish praise like "¡Excelente pronunciación!" or "¡Súper bien!"—do NOT spam their name every time). NEVER call it before the student speaks or when pronunciation was wrong or unclear!';

  const safetyPolicy =
    'STRICT COMMUNITY SAFETY & DIGITAL ETHICS GUARDRAILS (NON-NEGOTIABLE — APPLIES TO BOTH KIDS AND ADULTS):' +
    '\n  - You MUST strictly refuse and block any conversation involving: sexual or sexually explicit content, pornography, flirting/romantic advances with minors, violence, weapons, physical aggression, threats, gore, bullying, harassment, hate speech, slurs, self-harm, suicide, illegal drugs, crimes, or any content that violates AI safety and digital community standards.' +
    (isKids
      ? '\n  - EXTRA CHILD PROTECTION (AGES 5–9): Keep 100% G-rated, wholesome, innocent, and safe at all times. Never discuss scary, violent, romantic, or adult topics, and never ask for personal identifying details (address, school name, phone number, last name).'
      : '') +
    '\n  - If the user brings up ANY restricted or sensitive topic: stay calm, polite, and firm; do NOT engage, elaborate, joke about, or repeat inappropriate words. Clearly state (in Spanish/English matching their level) that ALLEN Aula is a safe educational space governed by community guidelines and we cannot discuss that topic, then immediately redirect back to the active safe learning scenario.';

  const activeSubtopic = getScenarioSubtopicById(scenario, options.subtopicId);
  const previousSubtopics = (options.previousSubtopicTitles ?? []).filter(Boolean);

  const a1AdaptivePaceRule =
    cefrLevel === 'A1' && !isKids
      ? 'A1 ADAPTIVE PRONUNCIATION SPEED (CRITICAL FOR A1): ' +
        'When an A1 learner mispronounces a word/phrase or struggles to say it on Attempt 1: ' +
        '(1) On your FIRST slow coaching retry, pronounce the target English phrase NOTICEABLY SLOWER and clearly WORD BY WORD with brief gentle pauses between words so they catch every syllable easily! ' +
        '(2) From their 2nd and 3rd attempts onward (or when practicing it again to build fluency), switch back to a NORMAL, natural conversational American rhythm so they get used to real speed!'
      : '';

  const basicVisualPromptRule =
    cefrLevel === 'A1' || cefrLevel === 'A2' || isKids
      ? 'ALWAYS DISPLAY TARGET SENTENCE ABOVE AVATAR (MANDATORY FOR A1, A2 & KIDS): ' +
        'On EVERY SINGLE TURN where you ask the student to answer, read, or practice an English word/sentence, you MUST call "display_correction" (category: "practice") with: ' +
        'correction (the exact short English sentence or word they should read & pronounce aloud), ' +
        'pronunciationGuide (easy Spanish phonetic cue), and tipEs (clear Spanish meaning — for Kids always starting with "Significa: ..."). ' +
        'This ensures the learner ALWAYS sees the exact words above your avatar so they can read and practice speaking!'
      : '';

  const subtopicRotationRule =
    `TODAY’S FRESH SUBTOPIC (MANDATORY VARIETY ACROSS DAYS): Focus today’s opening and first steps specifically on the subtopic "${activeSubtopic.titleEs}" — ${activeSubtopic.angleEn} ` +
    `Featured words/phrases for today’s angle: ${activeSubtopic.featuredWords.join(', ')}. ` +
    (previousSubtopics.length > 0
      ? `The student ALREADY practiced these earlier subtopics in previous sessions/days: ${previousSubtopics.join(', ')}. DO NOT open with those repeated angles—make today feel fresh and new inside "${scenario.title}"!`
      : `Make this subtopic feel lively, concrete, and distinct inside "${scenario.title}"!`);

  const vocabRoadmap = scenario.guidedVocabulary
    .map((v) => `"${v.en}" = ${v.es} (${v.phonetic})`)
    .join(' | ');
  const stepsRoadmap = scenario.conversationSteps.join('\n  - ');
  const reserveSubtopicsBank = scenario.subtopics
    .filter((st) => st.id !== activeSubtopic.id)
    .map((st) => `"${st.titleEs}": ${st.angleEn} [${st.featuredWords.join(', ')}]`)
    .join('\n  - ');

  return [
    `You are ${tutor.name}, a professional bilingual American English-Spanish virtual Dot tutor for ALLEN Aula conducting a LIVE ONE-ON-ONE VOICE VIDEO CALL.`,
    `Your personality is ${tutor.personality}.`,
    namePersonalizationRule,
    welcomeReassuranceRule,
    voiceAndAntiRepetitionRule,
    activeListeningRule,
    unclearAudioRule,
    meaningAndContextRule,
    durationPacingRule,
    subtopicRotationRule,
    ...(a1AdaptivePaceRule ? [a1AdaptivePaceRule] : []),
    ...(basicVisualPromptRule ? [basicVisualPromptRule] : []),
    regionalZeroEnglishContext,
    audienceDirective,
    americanEnglishRule,
    `Active roleplay scenario: "${scenario.title}" (${scenario.subtitleEs}).`,
    `Active daily subtopic (Phase 1): "${activeSubtopic.titleEs}" (${activeSubtopic.angleEn}).`,
    `Your character: ${scenario.characterRole}.`,
    `Setting (matches the visual background behind you): ${scenario.setting}.`,
    `Opening goal: ${scenario.openingObjective}`,
    `On-topic vocabulary roadmap (STAY FAITHFUL TO THIS THEME!): ${vocabRoadmap}`,
    `Phase 1 progression steps (when finished before the timer expires, DO NOT say goodbye—transition smoothly into Phase 2 reserve subtopics below!):\n  - ${stepsRoadmap}`,
    `Phase 2 RESERVE ON-TOPIC EXPANSION SUBTOPICS (use these to keep the conversation lively and rich for the FULL 5, 10, or 15 minutes without ever running out of topic!):\n  - ${reserveSubtopicsBank}`,
    `Focus areas: ${scenario.focusAreas.join(', ')}.`,
    `Student CEFR Level: ${cefr.level} (${isKids ? cefr.kidsLabelEs : cefr.labelEs}).`,
    `Level adaptation: ${cefr.guidance}`,
    bilingualPolicy,
    '',
    'CRITICAL LIVE VOICE CALL RULES:',
    '1. This is a real-time spoken video call, NEVER a text chat. Keep every spoken turn crisp, warm, and concise (2 to 3 natural sentences max) so the student speaks more than you do.',
    '2. Never use markdown, bullet lists, asterisks, emojis, phonetic IPA symbols read literally, or stage directions in speech. Speak strictly as a real human tutor on a video call.',
    `3. STRICT TOPIC CONTINUITY & SCENARIO FIDELITY: Stay 100% faithful inside "${scenario.title}" (${scenario.setting}) anchored in today’s subtopic "${activeSubtopic.titleEs}", using its vocabulary roadmap and progression steps. NEVER drift into random unrelated words or generic small talk outside "${scenario.title}"! After finishing Phase 1 steps, smoothly flow into the Phase 2 reserve subtopics so you NEVER end early before the full session timer completes.`,
    `4. ${spanishMirrorRule}`,
    `5. ${repeatAndHonestMercyRule}`,
    '6. TURN-TAKING & PATIENT LISTENING: The app uses clean turn-taking (the student’s mic unlocks right after you finish speaking). Finish each turn cleanly in ONE pass and stop immediately so the student can answer without interruption.',
    '7. INTERACTIVE SUPPORT WHEN STUCK, CONFUSED OR SILENT: If the student does not understand something or stays quiet, warmly reassure them in Latin American Spanish, give clear brief context explaining what it means (`"<word>" significa ...`), call "display_correction" (category: "practice") silently, and invite them once to pronounce it.',
    '8. VISUAL FLOATING CARD TOOL ("display_correction") — NON-BLOCKING: Whenever you (a) correct a mistake, (b) teach or suggest an English word/sentence/question to read and repeat (especially EVERY turn in A1, A2, and Kids!), or (c) mirror Spanish into American English -> call "display_correction" with: category ("pronunciation" | "grammar" | "expression" | "practice"), original, correction, pronunciationGuide (easy Spanish phonetic cue), and tipEs (EXPLICIT Spanish meaning in clear format like `"White" significa blanco` or `Significa: mesa para dos` so it displays in large letters above your avatar!). Never pause or repeat your sentence because you called a tool!',
    `9. ${pointsToolRule}`,
    `10. ${safetyPolicy}`,
  ].join('\n');
}

export function buildSilenceNudgePrompt(
  scenario: ScenarioConfig,
  cefrLevel: CEFRLevel,
  spanishSupport: SpanishSupportMode = 'auto',
  attempt: 1 | 2 = 1,
  audience: AudienceGroup = scenario.audience ?? 'adults',
  options: TutorInstructionOptions = {}
): string {
  const allowSpanish = spanishSupport !== 'english_only';
  const isKids = audience === 'kids';
  const kidsAgeBand: KidsAgeBand = options.kidsAgeBand ?? '5-6';
  const sampleVocab = scenario.guidedVocabulary[attempt % scenario.guidedVocabulary.length] ?? scenario.guidedVocabulary[0];
  const vocabHint = sampleVocab
    ? allowSpanish
      ? `"${sampleVocab.en}" (which means "${sampleVocab.es}" in Spanish)`
      : `"${sampleVocab.en}"`
    : `an easy phrase for "${scenario.title}"`;

  if (!allowSpanish) {
    return attempt === 1
      ? `The student has been quiet for a few seconds. Do NOT repeat their name if you already greeted them. Warmly encourage them in clear American English adapted to CEFR ${cefrLevel}, suggest one short example reply for "${scenario.title}" like ${vocabHint} (calling display_correction with category "practice" silently), and invite them once to try. Keep it concise (2 sentences).`
      : `The student is still silent. Reassure them warmly ("No worries at all!"), smoothly offer an even easier question inside "${scenario.title}" with one short phrase (displaying it via display_correction), and keep it brief (2 sentences).`;
  }

  if (isKids) {
    const chunkHint =
      kidsAgeBand === '5-6'
        ? `ONE single super easy word directly from "${scenario.title}" such as ${vocabHint}`
        : kidsAgeBand === '7-8'
          ? `ONE tiny 2-to-3 word phrase directly from "${scenario.title}" using ${vocabHint}`
          : `ONE short simple 4-word phrase directly from "${scenario.title}" using ${vocabHint}`;
    if (attempt === 1) {
      return `The child (age ${kidsAgeBand}, zero English) has been quiet for a few seconds. Do NOT repeat their name if you already said it. Speak gently in super simple Latin American Spanish: reassure them there is no rush, clearly explain the Spanish meaning of ${chunkHint}, pronounce the English VERY SLOWLY WORD BY WORD ONCE—calling "display_correction" (category: "practice", tipEs starting with "Significa: ...") silently—and playfully invite them to repeat it! Keep it very short (2 sentences).`;
    }
    return `The child (age ${kidsAgeBand}) is still quiet. Do NOT pressure them! Cheer warmly in simple Latin American Spanish and offer another super easy word directly inside "${scenario.title}" like ${vocabHint}, clearly stating its Spanish meaning and pronouncing the English VERY SLOWLY WORD BY WORD ONCE (calling "display_correction" silently). Keep it short (2 sentences).`;
  }

  if (attempt === 1) {
    return `The student has been silent for a few seconds and may be unsure how to answer. Do NOT repeat their name if you already used it. Step in warmly in Latin American Spanish: reassure them there is no rush and remind them they can answer in Spanish if they want, suggest 1 easy American English phrase directly from "${scenario.title}" such as ${vocabHint} (calling "display_correction" with category "practice" silently), and kindly invite them once to pronounce it! Keep it concise (2 sentences).`;
  }

  return `The student is still quiet. Reassure them warmly in Latin American Spanish so they feel comfortable, and smoothly switch to a fresh, simpler question inside "${scenario.title}" with one very short American English phrase like ${vocabHint} (calling "display_correction" silently). Keep it brief (2 sentences).`;
}

const SENSITIVE_PATTERNS: Array<{ category: SensitiveContentCategory; regex: RegExp }> = [
  {
    category: 'sexual',
    regex:
      /\b(sex|sexual|sexo|sexuales|porn|porno|pornograf[ií]a|pornography|xxx|nude|nudes|desnud[oa]s?|er[oó]tic[oa]|masturba\w*|orgasm\w*|penis|pene|vagina|boobs|tetas|prostitu\w*|stripper|onlyfans|hentai|fetish|fetiche|violaci[oó]n|rape|molest\w*|pedofil\w*|pedophil\w*|incest\w*)\b/i,
  },
  {
    category: 'violence',
    regex:
      /\b(kill\s+you|kill\s+him|kill\s+her|kill\s+them|murder|asesin\w*|matar\s+a|te\s+voy\s+a\s+matar|voy\s+a\s+matar|shoot\s+up|disparar\s+a|tiroteo|massacre|masacre|bomb\s+threat|hacer\s+una\s+bomba|terroris\w*|tortur\w*|decapit\w*|stab\s+you|apuñal\w*|golpearte|romperte\s+la\s+cara)\b/i,
  },
  {
    category: 'aggression',
    regex:
      /\b(fuck\s+you|motherfucker|bitch|asshole|cunt|retard|faggot|nigger|puta\s+madre|hijo\s+de\s+puta|hijueputa|malparid[oa]|pendej[oa]|imb[eé]cil|est[uú]pid[oa]|idiota|te\s+odio|c[aá]llate\s+idiota|basura\s+humana)\b/i,
  },
  {
    category: 'self_harm',
    regex:
      /\b(suicide|suicid\w*|kill\s+myself|matarme|quitarme\s+la\s+vida|cortarme\s+las\s+venas|self[\s-]?harm|autolesi[oó]n)\b/i,
  },
  {
    category: 'illegal',
    regex:
      /\b(cocaine|coca[ií]na|heroin|hero[ií]na|methamphetamine|metanfetamina|sell\s+drugs|vender\s+drogas|buy\s+drugs|comprar\s+drogas|trafficking|tr[aá]fico\s+de\s+personas|hack\s+bank|robar\s+un\s+banco)\b/i,
  },
];

export function detectSensitiveContent(text: string): SensitiveContentResult {
  const cleaned = text.trim();
  if (!cleaned) return { flagged: false };
  for (const rule of SENSITIVE_PATTERNS) {
    if (rule.regex.test(cleaned)) {
      return { flagged: true, category: rule.category };
    }
  }
  return { flagged: false };
}

export function buildSafetyRedirectPrompt(
  scenario: ScenarioConfig,
  audience: AudienceGroup,
  cefrLevel: CEFRLevel
): string {
  if (audience === 'kids') {
    return `SAFETY ALERT: The child just mentioned or triggered a sensitive or unsafe word. Stay super calm, gentle, and protective. Do NOT repeat the word. Politely say in warm Latin American Spanish (with simple English) that in ALLEN Aula Kids we only talk about fun, safe topics, and immediately redirect with a cheerful, simple question back to "${scenario.title}" (CEFR ${cefrLevel}). Keep it short (2 sentences).`;
  }
  return `SAFETY ALERT: The user just brought up a sensitive or restricted topic that violates community safety guidelines. Remain calm, firm, and respectful. Do NOT engage with, joke about, or repeat the inappropriate content. Politely state in Latin American Spanish/English matching CEFR ${cefrLevel} that ALLEN Aula follows community safety norms and we cannot discuss sensitive, sexual, violent, or aggressive topics, then immediately redirect back to the safe "${scenario.title}" scenario with a concrete question. Keep it brief (2 sentences).`;
}

export function inferExpressionFromTranscript(text: string): AvatarExpression {
  const normalized = text.toLowerCase();
  if (
    /\b(excellent|fantastic|amazing|great job|well done|brilliant|congratulations|perfect|awesome|spot on|impressive|nailed it|way to go|you rock|super job|excelente|muy bien|perfecto|genial|bravo|lo dijiste genial|qué bien|súper|chévere)\b/.test(
      normalized
    )
  ) {
    return 'congratulation';
  }
  if (
    /\b(wow|really\?|oh!|no way|surprising|unexpected|interesting!|whoa|vaya|en serio|increíble)\b/.test(
      normalized
    )
  ) {
    return 'surprise';
  }
  if (
    /\b(glad|happy|wonderful|lovely|nice to meet|welcome|haha|smile|fun|enjoy|pleasure|delighted|bienvenido|bienvenida|qué gusto|encantado|encantada|hola)\b/.test(
      normalized
    )
  ) {
    return 'joy';
  }
  if (
    /\b(actually|notice|grammar|instead of|tip|remember|try saying|pronounce|careful|meaning|significa|en español|pronuncia|pronunciación|fíjate|se dice|suena como|repite|ojo con|repeat after|todavía no)\b/.test(
      normalized
    )
  ) {
    return 'concentration';
  }
  return 'neutral';
}

export function formatCallDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function looksLikeSpokenCorrection(text: string): boolean {
  const normalized = text.toLowerCase();
  return /(\ben vez de\b|\ben lugar de\b|\bse dice\b|\bse pronuncia\b|\bpronunciación\b|\bsuena como\b|\bno se dice\b|\bmejor di\b|\bmejor decir\b|\bdeberías decir\b|\bfíjate en\b|\bcorrige\b|\bcorrección\b|\bpuedes decir\b|\bintenta decir\b|\bdilo conmigo\b|\brepite conmigo\b|\brepítelo\b|\brepite después de mí\b|\ben inglés sería\b|\ben inglés decimos\b|\bprueba decir\b|\binstead of\b|\btry saying\b|\btry to say\b|\byou should say\b|\bbetter to say\b|\bwe say\b|\byou can say\b|\byou'?d say\b|\bin english\b.*\bsay\b|\brepeat after me\b|\bsay it with me\b|\bpronounced\b|\bpronounce it\b|\bsmall correction\b|\bquick tip\b)/.test(
    normalized
  );
}

export function normalizeLiveCorrection(raw: unknown): LiveCorrection | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const original = typeof obj.original === 'string' ? obj.original.trim() : '';
  const correction = typeof obj.correction === 'string' ? obj.correction.trim() : '';
  const tipEs = typeof obj.tipEs === 'string' ? obj.tipEs.trim() : '';
  const pronunciationGuide =
    typeof obj.pronunciationGuide === 'string' && obj.pronunciationGuide.trim().length > 0
      ? obj.pronunciationGuide.trim()
      : undefined;

  if (!correction) {
    return null;
  }

  const rawCategory = typeof obj.category === 'string' ? obj.category.toLowerCase().trim() : '';
  let category: LiveCorrectionCategory = 'grammar';
  if (
    rawCategory === 'practice' ||
    rawCategory === 'repeat' ||
    rawCategory === 'practica' ||
    rawCategory === 'práctica' ||
    rawCategory === 'phrase'
  ) {
    category = 'practice';
  } else if (
    rawCategory === 'pronunciation' ||
    rawCategory === 'pronunciacion' ||
    rawCategory === 'pronunciación'
  ) {
    category = 'pronunciation';
  } else if (
    rawCategory === 'expression' ||
    rawCategory === 'vocabulary' ||
    rawCategory === 'expresion'
  ) {
    category = 'expression';
  } else if (!original) {
    category = 'practice';
  } else if (pronunciationGuide && original.toLowerCase() === correction.toLowerCase()) {
    category = 'pronunciation';
  }

  return {
    id:
      typeof obj.id === 'string' && obj.id.trim().length > 0
        ? obj.id.trim()
        : `corr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    category,
    original: original || correction,
    correction,
    ...(pronunciationGuide ? { pronunciationGuide } : {}),
    tipEs:
      tipEs ||
      (category === 'practice'
        ? 'Léelo en voz alta y repítelo con tu profesor.'
        : 'Fíjate en la forma natural en inglés americano.'),
    createdAtMs:
      typeof obj.createdAtMs === 'number' && Number.isFinite(obj.createdAtMs)
        ? obj.createdAtMs
        : Date.now(),
  };
}

export function looksLikePronunciationPraise(text: string): boolean {
  const normalized = text.toLowerCase();
  // Never falsely trigger if the tutor is saying pronunciation still needs work
  if (
    /\b(todav[ií]a no|not quite|intenta de nuevo|try again|casi|almost|en vez de|instead of|se pronuncia)\b/.test(
      normalized
    )
  ) {
    return false;
  }
  return /\b(excelente pronunciaci[oó]n|muy bien pronunciado|lo dijiste perfecto|lo dijiste genial|lo pronunciaste|s[uú]per bien|perfect pronunciation|great pronunciation|you nailed it|spot on|awesome job|way to go|fantastic job|great job|well done|bravo|perfecto|excelente)\b/.test(
    normalized
  );
}

export function normalizePronunciationAward(raw: unknown): PronunciationPointsAward | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const rawPoints = Number(obj.points ?? 10);
  const points = Number.isFinite(rawPoints)
    ? Math.min(25, Math.max(5, Math.round(rawPoints)))
    : 10;
  const phrase = typeof obj.phrase === 'string' ? obj.phrase.trim().slice(0, 120) : '';
  const praiseEs =
    typeof obj.praiseEs === 'string' && obj.praiseEs.trim().length > 0
      ? obj.praiseEs.trim().slice(0, 120)
      : '¡Excelente pronunciación!';

  return {
    id:
      typeof obj.id === 'string' && obj.id.trim().length > 0
        ? obj.id.trim()
        : `pts_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    points,
    phrase,
    praiseEs,
    createdAtMs:
      typeof obj.createdAtMs === 'number' && Number.isFinite(obj.createdAtMs)
        ? obj.createdAtMs
        : Date.now(),
  };
}

export function parseJsonObjectSafely(rawText: string): Record<string, unknown> {
  const trimmed = rawText.trim();
  if (!trimmed) {
    throw new Error('La respuesta del modelo llegó vacía.');
  }

  // Strip optional markdown code fences (```json ... ```)
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(unfenced) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Attempt extracting outermost JSON object substring
  }

  const start = unfenced.indexOf('{');
  const end = unfenced.lastIndexOf('}');
  if (start !== -1 && end > start) {
    const slice = unfenced.slice(start, end + 1);
    const parsed = JSON.parse(slice) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  }

  throw new Error('No se pudo interpretar el formato JSON del informe.');
}

/**
 * Vedic (sidereal) rashi reference data.
 *
 * The structural fields - lord, element, quality, nakshatras, exalted and
 * debilitated grahas - are not editorial. They are derived from the same tables
 * the backend uses to cast charts (SIGN_LORDS, EXALTATION_SIGNS, NAKSHATRA_NAMES
 * in app/services/astrology.py), so the reference pages cannot drift away from
 * what the app actually calculates.
 */

export interface ZodiacSign {
  slug: string;
  name: string;
  sanskrit: string;
  symbol: string;
  tagline: string;
  /** Sign number 1-12, matching the backend's signNumber. */
  number: number;
  lord: string;
  element: string;
  quality: string;
  nakshatras: string[];
  exalted: string | null;
  debilitated: string | null;
  bodyPart: string;
  deity: string;
  direction: string;
  gemstone: string;
  luckyDay: string;
  luckyColors: string[];
  luckyNumbers: number[];
  personality: string;
  strengths: string[];
  weaknesses: string[];
  career: string;
  relationships: string;
  health: string;
  finance: string;
  compatibleWith: string[];
  challengingWith: string[];
  remedies: string[];
}

/** Ratna and vaar follow the sign lord, so both are derived rather than listed. */
export const GEMSTONE_BY_LORD: Record<string, string> = {
  Sun: "Ruby (Manikya)",
  Moon: "Pearl (Moti)",
  Mars: "Red Coral (Moonga)",
  Mercury: "Emerald (Panna)",
  Jupiter: "Yellow Sapphire (Pukhraj)",
  Venus: "Diamond (Heera)",
  Saturn: "Blue Sapphire (Neelam)"
};

export const DAY_BY_LORD: Record<string, string> = {
  Sun: "Sunday",
  Moon: "Monday",
  Mars: "Tuesday",
  Mercury: "Wednesday",
  Jupiter: "Thursday",
  Venus: "Friday",
  Saturn: "Saturday"
};

export function findZodiacSign(slug: string): ZodiacSign | undefined {
  const normalized = slug.trim().toLowerCase();
  return ZODIAC_SIGNS.find(
    (sign) => sign.slug === normalized || `${sign.slug}-horoscope` === normalized
  );
}

/**
 * Merge an admin override onto a sign. Only the prose fields are replaceable, and
 * only when non-empty, so a blank box in the admin panel means "use the built-in
 * text" rather than wiping the page.
 */
export function withZodiacOverride(
  sign: ZodiacSign,
  override: Partial<Pick<ZodiacSign, "tagline" | "personality" | "career" | "relationships" | "health" | "finance">> | undefined
): ZodiacSign {
  if (!override) {
    return sign;
  }
  const merged = { ...sign };
  for (const key of ["tagline", "personality", "career", "relationships", "health", "finance"] as const) {
    const value = override[key];
    if (typeof value === "string" && value.trim()) {
      merged[key] = value;
    }
  }
  return merged;
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    slug: "aries",
    name: "Aries",
    sanskrit: "Mesha",
    symbol: "The Ram",
    tagline: "The zodiac's first spark  -  Mars-ruled fire in motion, quick to begin, slow to be stopped.",
    number: 1,
    lord: "Mars",
    element: "Fire (Agni)",
    quality: "Movable (Chara)",
    nakshatras: [
      "Ashwini",
      "Bharani",
      "Krittika"
    ],
    exalted: "Sun",
    debilitated: "Saturn",
    bodyPart: "Head and brain",
    deity: "Mangal (Angaraka), the graha-devata of Mesha; worshipped through Kartikeya (Skanda/Subrahmanya), the commander of the celestial armies, and in many traditions through Hanuman, whose worship is prescribed for strengthening or pacifying Mars.",
    direction: "East (Purva)  -  Mesha is the first rashi and rises in the east; Mars itself governs the south (Dakshina) in graha-dik.",
    gemstone: "Red Coral (Moonga)",
    luckyDay: "Tuesday",
    luckyColors: [
      "Red (rakta)",
      "Coral / vermilion orange",
      "Saffron"
    ],
    luckyNumbers: [9, 1, 3],
    personality: "Mesha is the first rashi of the zodiac, a fiery (agni tattva) and movable (chara) sign ruled by Mars  -  Mangal, the commander among the grahas. This gives the native a forward-leaning temperament: quick to decide, quick to act, and most alive at the beginning of things, when a problem is still unsolved and a path still unmade. The fire element shows as warmth, candour and a bright, unguarded honesty, while the chara quality keeps that fire in motion, so Mesha natives start readily, move on readily, and rarely sit long with a settled situation. The exaltation of the Sun in this rashi adds natural authority and a sense of dignity, so leadership tends to be assumed rather than requested, while Saturn's debilitation here explains the classical caution that patience, delay and slow accumulation are the hardest disciplines for this sign. At their best Mesha natives are courageous, direct and protective; at their most unguarded they are impatient with anything that asks them to wait.",
    strengths: [
      "Courage (parakrama) and willingness to face difficulty head-on",
      "Decisiveness  -  able to choose and commit while others deliberate",
      "Pioneering initiative; excels at starting what does not yet exist",
      "Physical vitality, stamina and endurance under pressure",
      "Directness and honesty, with little talent for pretence",
      "Natural leadership and command presence",
      "Protective loyalty towards family, juniors and those under their care"
    ],
    weaknesses: [
      "Impatience; difficulty sustaining effort once the novelty has passed",
      "Quick anger (krodha) that flares and subsides before it can be governed",
      "Impulsiveness in decisions, spending and speech",
      "Bluntness that can wound where tact was needed",
      "Resistance to authority, advice and imposed structure",
      "A tendency to leave things half-finished and move to the next beginning"
    ],
    career: "Mesha natives thrive where initiative counts more than consensus. Mars (Mangal) as the sign lord grants stamina, decisiveness and a tolerance for risk, which classical texts associate with kshatriya-type work: command, defence, surgery, engineering, metals, machinery, sport and physical training. Because Mesha is a chara (movable) rashi, careers with travel, new territory, or repeated fresh starts suit them better than static desk routines, and the exaltation of the Sun here supports authority, leadership and public standing. Typical professions: defence and police services, surgeons and emergency medicine, athletes and coaches, engineers and mechanics, firefighters, entrepreneurs and founders, real-estate and land dealings, metallurgy and fabrication trades, martial arts instruction, and roles requiring crisis response.",
    relationships: "Mesha brings ardour and loyalty to partnership  -  affection is expressed openly, defended fiercely, and rarely disguised. Classical Vedic matching, however, rests on the Moon's rashi and nakshatra rather than on the solar sign, so the Ashtakoota (guna milan) score, nakshatra yoni and gana, and above all the state of Mangal in both charts (the Mangal dosha assessment) matter far more than sign-to-sign generalities. The recurring friction point is temperament rather than affection: Mars gives a short flare of anger that passes quickly but can leave the partner unsettled, and the chara restlessness dislikes being managed. Partners who meet directness with directness, and who do not mistake a flare for a verdict, generally find Mesha steady and deeply committed.",
    health: "In the Kaal Purusha scheme Mesha governs the head and brain, so classical vulnerabilities are described around this region: headaches and migraine tendencies, heat in the head, eye strain, sinus and dental complaints, and susceptibility to injuries or accidents affecting the head and face. Mars is a pitta graha and Mesha is an agni (fire) rashi, so the classical picture is one of excess heat  -  inflammation, fevers, skin eruptions, acidity, and a restlessness that disturbs sleep. Traditional guidance emphasises cooling and cushioning that fire: adequate rest, moderation with spice and stimulants, and care during fast-moving or sharp-edged activity; anything persistent belongs with a qualified physician, not with a chart.",
    finance: "Mesha natives usually earn through effort, enterprise and their own initiative rather than through inheritance or passive means, and Mars gives the courage to invest early and act on an opportunity before it is crowded. The same haste can make spending impulsive and returns uneven, with sharp gains and sharp corrections rather than a smooth curve. Classical texts link Mars to bhumi (land and property), so real estate, machinery and tangible assets are often the areas where this rashi accumulates most steadily.",
    compatibleWith: [
      "Leo (Simha)",
      "Sagittarius (Dhanu)",
      "Cancer (Karka)"
    ],
    challengingWith: [
      "Capricorn (Makara)",
      "Aquarius (Kumbha)",
      "Virgo (Kanya)"
    ],
    remedies: [
      "Recite the Mangal beeja mantra  -  'Om Kram Kreem Kraum Sah Bhaumaya Namah'  -  108 times on Tuesday (Mangalvar), or chant the Hanuman Chalisa and Mangal stotra on that day.",
      "Observe a Tuesday vrat (fast), traditionally taken with a single sattvic meal and avoidance of salt, and offer worship to Hanuman or Kartikeya.",
      "Perform daan on Tuesday: red masoor dal, jaggery (gud), red cloth, copper vessels, or red coral, given to those in genuine need, and offer red flowers such as hibiscus.",
      "Wear a natural red coral (moonga) of appropriate weight, set in gold or copper on the ring finger of the right hand, energised on a Tuesday in Shukla Paksha  -  and only after a competent jyotishi has examined the chart, since a gemstone strengthens the graha rather than softens it.",
      "Feed and care for cows, offer water and shelter, and cultivate practical service (seva)  -  traditionally recommended alongside restraint in anger and speech, which the shastras treat as the real upaya for Mangal."
    ]
  },
  {
    slug: "taurus",
    name: "Taurus",
    sanskrit: "Vrishabha",
    symbol: "The Bull (Vrishabha)",
    tagline: "Shukra's bull  -  patient, sensuous and immovable; a rashi that builds slowly and keeps what it builds.",
    number: 2,
    lord: "Venus",
    element: "Earth (Prithvi)",
    quality: "Fixed (Sthira)",
    nakshatras: [
      "Krittika",
      "Rohini",
      "Mrigashira"
    ],
    exalted: "Moon",
    debilitated: null,
    bodyPart: "Face, neck and throat",
    deity: "Devi Mahalakshmi, approached through Shukra, the lord of this rashi; Nandi, the bull of Shiva, is also traditionally honoured as the emblem of Vrishabha, and Shukracharya himself is invoked in the graha's own worship.",
    direction: "South (Dakshina)  -  the classical dik of Vrishabha; Shukra's own quarter is the south-east (Agneya).",
    gemstone: "Diamond (Heera)",
    luckyDay: "Friday",
    luckyColors: [
      "White",
      "Pastel pink and rose",
      "Silver and pale blue"
    ],
    luckyNumbers: [6, 15, 24],
    personality: "Vrishabha is the second rashi of the zodiac and the natural dhana bhava of the Kaal Purusha, so its deepest instinct is to gather, hold and enjoy what is tangible. Ruled by Shukra and composed of Prithvi tattva in the sthira (fixed) mode, the Vrishabha native moves slowly, decides once, and rarely reopens the decision  -  the bull grazes where it stands rather than wandering. Shukra gives an unhurried love of beauty, fragrance, music, touch and good food, while the earth element turns that love into something practical: skills mastered, land held, things well made and kept. Chandra attains exaltation at 3 of this rashi, a dignity no other graha holds here, and it lends Vrishabha a calm, nourishing, almost maternal steadiness of mind; its three nakshatras deepen the picture, with Krittika bringing Surya's cutting clarity, Rohini bringing Chandra's fertility and charm, and the first two padas of Mrigashira adding a Mars-ruled search for something finer. Classed as a stri (feminine), prishtodaya rashi of the Vaishya varna, Vrishabha is receptive and mercantile by temperament rather than pioneering  -  its power lies in endurance, not in the first move.",
    strengths: [
      "Extraordinary patience and staying power (sthira bala)",
      "Loyalty that does not waver once given",
      "Refined aesthetic sense  -  an eye for beauty, quality and craft",
      "Practical skill with money, land and material resources",
      "A calming, grounding presence that steadies others",
      "A rich, resonant voice and persuasive, measured speech",
      "Genuine capacity for enjoyment and contentment without haste"
    ],
    weaknesses: [
      "Obstinacy  -  the fixed quality hardening into refusal to reconsider",
      "Possessiveness and attachment (raga) toward people and things",
      "Deep resistance to change, even change that is needed",
      "Over-indulgence in comfort, food and luxury",
      "Slowness to forgive; grievances held quietly for years",
      "A tendency to measure worth, including self-worth, in material terms"
    ],
    career: "Shukra's rulership over Vrishabha inclines the native toward work that is sensory, tangible and steadily built rather than improvised  -  the earth element rewards mastery of a craft over rapid reinvention, and the sthira quality favours long tenure in one field. Because Vrishabha is the natural dhana bhava (second house) of the Kaal Purusha, the rashi also carries a strong instinct for valuation: knowing what a thing is worth and what it will be worth later. The Krittika portion adds Surya's exacting fire to the work, Rohini brings Chandra's fertility and charm, and Mrigashira's Mars-ruled padas add a searching, quality-seeking eye. Professions traditionally associated with this rashi include banking, accountancy and finance; jewellery, gemstones and precious metals; textiles, perfumery and cosmetics; hospitality, food, dairy and confectionery; agriculture, land and real estate; singing, music, acting and voice work (Vrishabha governs the throat in the Kaal Purusha); and the design arts  -  interiors, fashion, architecture and fine art.",
    relationships: "Shukra is the kalatra karaka, the natural significator of spouse and marriage, so the affairs of the heart are never incidental for this rashi  -  Vrishabha loves with the senses as much as the mind, and once attached, stays. Commitment is usually slow to form and difficult to dissolve: the fixed quality gives remarkable loyalty and patience, and the same quality can harden into possessiveness, silence during conflict, and a long memory for hurts. The seventh rashi from Vrishabha is Vrishchika, ruled by Mangala, so the classical reading is that partnership brings intensity, depth and a demand for transformation to a nature that would otherwise prefer everything to stay as it is. In the Vedic tradition compatibility is judged not by rashi alone but by Ashtakoota guna milan from the Moon's nakshatra, together with graha maitri, bhakut, nadi and the state of the seventh house and Shukra in both charts  -  the sign affinities below describe general temperament, not a verdict on any particular match.",
    health: "In the Kaal Purusha, the scheme by which the zodiac maps onto the cosmic body, Vrishabha governs the face, mouth, neck and throat  -  and so the classical vulnerabilities named for this rashi cluster there: the tonsils and throat, hoarseness and strain of the voice, the teeth and gums, the cervical region of the neck, and the glandular area of the throat. Shukra's rulership and the kapha-heavy combination of Prithvi tattva with a fixed quality are traditionally said to produce a slow, comfortable metabolism, a fondness for sweet and rich food, and a tendency to put on weight and to resist exertion once settled. Classical astrology names such areas as points of sensitivity to be treated kindly through regular routine, movement and moderation; it is a symbolic vocabulary, not a diagnosis, and any actual symptom belongs with a qualified physician.",
    finance: "Vrishabha is the natural second rashi of the Kaal Purusha, the dhana bhava of accumulated wealth, family resources and speech, so the classical texts read it as a sign of gathering rather than gambling. Shukra grants an easy relationship with comfort and beautiful possessions, while the Prithvi tattva prefers wealth that can be touched  -  land, gold, ornaments, savings, a home  -  over abstract or volatile holdings, and the fixed quality makes debt and instability genuinely uncomfortable to this rashi. The traditional caution is the reverse of miserliness: because Shukra also rules bhoga, the same nature that accumulates patiently can spend heavily on luxury, hospitality and the pleasures of the table. These are temperamental tendencies described by the shastra, not guidance about any particular financial decision.",
    compatibleWith: [
      "Virgo (Kanya)",
      "Capricorn (Makara)",
      "Aquarius (Kumbha)"
    ],
    challengingWith: [
      "Leo (Simha)",
      "Pisces (Meena)",
      "Sagittarius (Dhanu)"
    ],
    remedies: [
      "Recite the Shukra beeja mantra 'Om Draam Dreem Draum Sah Shukraya Namah' or the simpler 'Om Shum Shukraya Namah' on Shukravar (Friday) morning, traditionally 108 times daily, with the full japa count given as 16,000 over a cycle.",
      "Observe the Shukravar vrat  -  a Friday fast taken lightly, often on white foods such as milk, curd or rice, broken after evening worship of Devi Mahalakshmi with the Sri Suktam.",
      "Offer daan on Friday of Shukra's white substances  -  white cloth, rice, sugar or mishri, curd, ghee, silver, camphor, white flowers and fragrance  -  given to women, young girls or those in need, without announcement.",
      "Honour the significations of Shukra in daily life: treat women with respect, keep the home and one's person clean and fragrant, support music and the arts, and feed a white cow  -  classical texts count conduct itself as upaya.",
      "Heera (diamond) is the ratna of Shukra, with safed pukhraj (white sapphire), opal or white zircon named as uparatna substitutes, set in silver or platinum and worn on a Friday of shukla paksha in Shukra's hora  -  but a gemstone strengthens whatever the graha signifies in that chart, so it should be worn only after a qualified astrologer has examined the whole kundali."
    ]
  },
  {
    slug: "gemini",
    name: "Gemini",
    sanskrit: "Mithuna",
    symbol: "The Couple  -  a man holding a club and a woman holding a vina",
    tagline: "Mercury's restless messenger  -  an air rashi that thinks in questions and lives by the well-turned word.",
    number: 3,
    lord: "Mercury",
    element: "Air (Vayu)",
    quality: "Dual (Dwiswabhava)",
    nakshatras: [
      "Mrigashira",
      "Ardra",
      "Punarvasu"
    ],
    exalted: null,
    debilitated: null,
    bodyPart: "Shoulders, arms and lungs",
    deity: "Bhagavan Vishnu (Narayana), the adhidevata of Budha, worshipped along with Budha Graha himself  -  the green-hued, gentle kumara born of Chandra and Tara",
    direction: "West (Paschim)  -  the quarter assigned to the Vayu-tattva rashis Mithuna, Tula and Kumbha",
    gemstone: "Emerald (Panna)",
    luckyDay: "Wednesday",
    luckyColors: [
      "Emerald green",
      "Parrot green",
      "White"
    ],
    luckyNumbers: [5, 14, 23, 32],
    personality: "Mithuna is the third rashi of the nirayana zodiac, spanning 60 to 90, ruled by Budha (Mercury), of Vayu tattva (air) and dwiswabhava (dual or mutable) quality; it is a human (nara) sign, male in gender, and sirshodaya  -  it rises head first, which classical texts read as quickness of understanding and strength at the beginning of an undertaking. Budha is a saumya graha, youthful and gentle, the karaka of buddhi and vani, and famously takes the colour of whatever graha it sits with  -  so the Mithuna nature is genuinely adaptive, learning by conversation and contact rather than by force. Air gives lightness, mobility and a mind that works through connection and comparison; the dual quality gives the capacity to hold two positions at once, to mediate, translate and carry a message between worlds without distorting it. At their best such natives are alert, witty, well-informed and unusually easy to talk to, able to learn a new skill or a new room of people faster than most. The same combination, unanchored, becomes chanchalata  -  restlessness, breadth without depth, and a difficulty in settling on one path when several remain interesting.",
    strengths: [
      "Tikshna buddhi  -  quick, precise grasp of new subjects",
      "Articulate, persuasive speech and skilled writing",
      "Genuine adaptability; comfortable amid change and variety",
      "Commercial sense: numbers, negotiation and fair exchange",
      "Natural mediator who can hold two viewpoints at once",
      "Wide network of friends, contacts and sources",
      "Youthful humour and lightness that defuses conflict"
    ],
    weaknesses: [
      "Chanchalata  -  mental restlessness and difficulty settling",
      "Breadth at the cost of depth; many beginnings, fewer completions",
      "Indecision natural to a dwiswabhava rashi",
      "Nervous strain and overstimulation of the mind",
      "Cleverness that can slide into argument or glibness"
    ],
    career: "Budha is the karaka of buddhi (intellect), vani (speech), ganita (calculation) and vanijya (trade), so Mithuna natives typically prosper wherever information is gathered, shaped and passed on. The dwiswabhava quality suits work with variety, movement and many simultaneous threads rather than one slow, heavy vertical; the Vayu tattva favours networks and contacts over solitary labour. Because Mithuna is the third rashi of the Kaal Purusha  -  the sthana of communication, courage in undertakings and short journeys  -  such natives often do well as the link between parties rather than at either end of a transaction. Typical professions: writing, journalism, editing and publishing; teaching and training; trade, broking, sales and marketing; accountancy, audit and statistics; software, IT and telecom; translation and languages; law and advocacy; media, advertising and public relations; travel, transport and logistics; and the sastric callings of Budha such as jyotisha, mathematics and panditya-work with texts.",
    relationships: "Classical Vedic matching does not compare sun signs at all: it is done on the Chandra rashi and janma nakshatra through Ashtakoota guna milan, with the 7th bhava, its lord and the position of Guru and Shukra weighed alongside. On those grounds Mithuna sits comfortably with Tula and Kumbha (the 5/9 trine of its own tattva), with Kanya, which shares Budha as lord, and with Simha, whose lord Surya is a friend of Budha; Karka is a dwirdwadasha (2/12) placement and its lord Chandra is counted an enemy by Budha, which classical Graha Maitri treats cautiously. In married life Mithuna natives value companionship, talk and shared curiosity above display, and Budha's napumsaka (neuter) character often shows as an easy, friendly intimacy rather than a heavy or possessive one. The dual quality can bring indecision or a divided attention, so partnerships tend to settle best where there is enough stimulation to hold interest and enough steadiness to hold ground  -  a judgement that belongs to the full kundali, never to the rashi alone.",
    health: "In the Kaal Purusha scheme Mithuna governs the shoulders, arms, hands, collarbone, upper chest and lungs, while its lord Budha signifies the nadi-mandala (nervous system), the skin and the organ of speech. Classical vulnerabilities described for this rashi therefore cluster around the breath and the nerves  -  shvasa and kasa (breathing and cough complaints), vata disturbance in the upper chest, strain or injury in the arms, wrists and hands, restless sleep and nervous exhaustion from overwork of the mind. Traditional guidance for an air rashi is simply regularity: steady hours, unhurried meals, pranayama and time away from constant talk and traffic; any actual symptom belongs to a physician, not to a chart.",
    finance: "Budha is the graha of commerce, accounts and negotiation, so classical texts associate Mithuna with wealth earned through exchange  -  trade, communication, intermediation and skill of hand and tongue  -  rather than through inherited or static holdings. Such natives often carry several income streams at once, in keeping with the dual nature of the rashi, and are usually quick and capable with figures, contracts and the fine print. The same mutable air can scatter resources across many small interests, and a chart is read for the 2nd, 11th and 9th bhavas and the strength of Budha before anything is said about a particular native's prosperity.",
    compatibleWith: [
      "Virgo (Kanya)",
      "Libra (Tula)",
      "Taurus (Vrishabha)"
    ],
    challengingWith: [
      "Pisces (Meena)",
      "Cancer (Karka)",
      "Scorpio (Vrishchika)"
    ],
    remedies: [
      "Chant the Budha beeja mantra 'Om Bram Breem Braum Sah Budhaya Namah' 108 times, especially on Budhavara (Wednesday) morning; the Navagraha stotra verse 'Priyangu-kalika-shyamam rupenapratimam budham, saumyam saumya-gunopetam tam budham pranamamyaham' is recited in the same way.",
      "Worship Bhagavan Vishnu, the adhidevata of Budha, on Wednesdays  -  recitation of the Vishnu Sahasranama and offering of tulsi are the commonly prescribed forms.",
      "Perform daan on Wednesday: whole green moong, green cloth, a kansya (bronze) vessel, camphor, and books or writing materials given to students; feeding green fodder or spinach to a cow is a widely kept form of the same upaya.",
      "Observe a Budhavara vrata  -  a simple single meal of green moong and green vegetables, kept regularly rather than occasionally.",
      "Panna (emerald), traditionally 3 to 6 ratti set in gold or silver and worn on the little finger of the right hand on a Wednesday of the shukla paksha, is the ratna of Budha  -  but a gemstone is prescribed only after a competent jyotishi has examined Budha's actual strength and ownership in the birth chart, never on rashi alone."
    ]
  },
  {
    slug: "cancer",
    name: "Cancer",
    sanskrit: "Karka",
    symbol: "The Crab (Karka)",
    tagline: "Ruled by Chandra, Karka moves like the tide  -  a hard shell guarding a deeply nourishing heart.",
    number: 4,
    lord: "Moon",
    element: "Water (Jala)",
    quality: "Movable (Chara)",
    nakshatras: [
      "Punarvasu",
      "Pushya",
      "Ashlesha"
    ],
    exalted: "Jupiter",
    debilitated: "Mars",
    bodyPart: "Chest, breast and stomach",
    deity: "Chandra (Soma), lord of Karka; worshipped in classical practice through Shiva as Chandrashekhara, with Apas, the cosmic waters, as adhidevata of the Moon and Parvati (Uma/Gauri) as pratyadhidevata.",
    direction: "North (Uttara)",
    gemstone: "Pearl (Moti)",
    luckyDay: "Monday",
    luckyColors: [
      "White",
      "Silver-grey",
      "Pearl cream"
    ],
    luckyNumbers: [2, 7, 11, 20],
    personality: "Karka is the only rashi owned by Chandra, the graha of manas  -  the feeling, remembering, reflecting mind  -  and its natives live through that instrument first: they absorb the mood of a room before they analyse it, and they remember kindness and injury alike for decades. As a jala (water) rashi it is receptive, retentive and adaptive, taking the shape of whatever vessel it is poured into, while its chara (movable) quality means it genuinely does initiate and change  -  leaving a city, starting a household, rebuilding a life  -  though always for an emotional reason rather than a strategic one. The crab is a fitting symbol: a firm outer shell over a soft interior, and a sideways walk, since Karka natives prefer the indirect approach to the head-on one and will circle a difficult subject rather than confront it. Chandra's waxing and waning gives them their well-known tides of mood, and also their gift, because a mind that moves can move with other people. This is classically a sattvic, Brahmin-varna, even (feminine) rashi facing north, and its three nakshatras colour it further: the last pada of Punarvasu bringing renewal and the ability to begin again, Pushya bringing nourishment, dharma and the wish to protect, and Ashlesha bringing depth, penetration and a shrewdness that the gentle exterior does not advertise.",
    strengths: [
      "Deep emotional intelligence and an instinctive read of other people",
      "Unshakeable loyalty to family, home and roots",
      "Remarkable memory for people, places and detail",
      "A genuine nurturing and protective instinct",
      "Strong intuition, the natural gift of Chandra-ruled manas",
      "Tenacity  -  a quiet, patient grip that does not let go",
      "Adaptability, the water-like ability to fit any vessel"
    ],
    weaknesses: [
      "Fluctuating moods that rise and fall with the Moon's phases",
      "Over-attachment and difficulty letting go of the past",
      "An indirect, sideways approach that avoids necessary confrontation",
      "Hypersensitivity  -  taking small slights personally",
      "Retreating into the shell and going silent under stress",
      "Anxiety about security that can tip into possessiveness"
    ],
    career: "Karka is the fourth rashi of the Kaal Purusha, the sign of home, roots and the heart, and Chandra gives its natives a natural feel for what people need before they say it  -  which is why so many of them end up in work that feeds, houses, heals or reassures the public. Being a chara (movable) rashi, they are quite willing to start things and to relocate or change course, but they do it for emotional reasons rather than ambition alone; a hostile or coldly competitive workplace drains them far faster than hard work does. Guru's exaltation in Karka is the classical signature of the trusted counsellor: teaching, guiding and advising suit this rashi better than pure aggression does, and Mangal's debilitation here warns that they rarely thrive on open conflict or brute confrontation. Typical professions attributed to Karka in classical and modern practice: nursing, caregiving and allied healthcare; catering, hospitality and hotel work; dairy, water supply, beverages and liquids; shipping, fisheries and anything connected with the sea; real estate, land and interior work; teaching of young children; counselling and psychology; human resources and public-facing retail; agriculture and irrigation; and trade in pearls, silver and textiles.",
    relationships: "Karka gives one of the most loyal and domestically devoted natures in the zodiac; once attached, these natives attach completely, and the home they build is the real centre of their life rather than a backdrop to it. The seventh rashi from Karka is Makara, owned by Shani, which classically indicates a search for a partner who brings maturity, steadiness and permanence  -  commitment is taken seriously here, sometimes slowly, and a settled, responsible spouse suits them far better than an exciting but unreliable one. The bond with the mother and with family elders remains strong after marriage and is often woven into the marriage itself, so a partner who honours those ties finds an easy welcome. The classical caution is the other face of the same devotion: Chandra's sensitivity can turn into clinging, brooding over old hurts, or a silent withdrawal into the shell when what would help most is saying the thing plainly.",
    health: "Karka governs the chest, breasts and stomach in the body of the Kaal Purusha, so classical texts link this rashi to the digestive fire and to the lining of the stomach  -  acidity, irregular appetite, indigestion and complaints that flare when the mind is unsettled are the traditionally noted vulnerabilities. Chandra also rules rasa dhatu, the body's fluids and plasma, and the kapha humour, which is why swelling and water retention, chest congestion, cough and disturbed sleep are the other classical themes for Karka. Jyotisha treats these as tendencies to be aware of, not as ailments to be diagnosed from a chart; the traditional emphasis is simply that for this rashi a calm mind and a regular routine of meals and sleep are inseparable from physical well-being, and anything persistent belongs with a doctor.",
    finance: "Chandra waxes and wanes, and Karka's fortunes classically move in cycles rather than a straight line  -  periods of plenty alternating with quieter stretches, which is exactly why this rashi tends to save instinctively and to keep something set aside for the family. Money here is rarely wanted for its own sake; it is wanted as security, and most of it flows toward home, land, dependants and the comfort of people they love. The exaltation of Guru in Karka is a favourable classical indication for gain through good counsel, elders and teachers, while the Moon's changeable nature explains the old caution that this rashi should let an emotional impulse cool before it becomes a financial decision.",
    compatibleWith: [
      "Aries (Mesha)",
      "Leo (Simha)",
      "Scorpio (Vrishchika)"
    ],
    challengingWith: [
      "Capricorn (Makara)",
      "Gemini (Mithuna)",
      "Aquarius (Kumbha)"
    ],
    remedies: [
      "Recite the Chandra beeja mantra  -  Om Shraam Shreem Shraum Sah Chandramase Namah  -  108 times on Monday mornings, or the Vedic Aapyayasva sukta, keeping the practice regular rather than occasional.",
      "Observe the Somvar vrat (Monday fast), and offer abhisheka of water and milk to Shiva, who wears Chandra on his forehead and is the traditional refuge of an afflicted Moon.",
      "Perform daan of white articles on a Monday evening  -  rice, milk, curd, sugar, white cloth, camphor, silver or pearls  -  given quietly to someone who genuinely needs them.",
      "Serve and honour the mother and the elderly women of the family, and give water freely: offering arghya to the Moon or supporting a water source is a classical upaya for Chandra.",
      "Wear a natural pearl (moti) of good quality set in silver on the little finger, begun on a Monday  -  but only if a qualified astrologer finds it suitable for the whole chart, since gemstones strengthen a graha rather than simply pacify it."
    ]
  },
  {
    slug: "leo",
    name: "Leo",
    sanskrit: "Simha",
    symbol: "The Lion (Simha)",
    tagline: "Ruled by Surya, the fixed fire of Simha burns steady  -  a sovereign heart that leads by warmth, not force.",
    number: 5,
    lord: "Sun",
    element: "Fire (Agni)",
    quality: "Fixed (Sthira)",
    nakshatras: [
      "Magha",
      "Purva Phalguni",
      "Uttara Phalguni"
    ],
    exalted: null,
    debilitated: null,
    bodyPart: "Heart and upper back",
    deity: "Surya Narayana  -  Bhagavan Surya, the Sun worshipped as the visible form of Narayana; Agni is honoured as the Sun's adhidevata and Rudra as its pratyadhidevata.",
    direction: "East (Purva)  -  the direction of the fiery rashis and of Surya's rising",
    gemstone: "Ruby (Manikya)",
    luckyDay: "Sunday",
    luckyColors: [
      "Ruby red",
      "Saffron and deep orange",
      "Gold"
    ],
    luckyNumbers: [1, 3, 9],
    personality: "Simha is the single rashi owned outright by Surya, and since the Sun is the atma-karaka  -  the graha of the soul, the self, the father and the king  -  the sign carries the temperament of sovereignty rather than mere ambition. Being an agni (fire) rashi of sthira (fixed) quality, its fire is neither the spark of Mesha nor the travelling flame of Dhanu but a held, central heat: Simha natives warm those around them steadily, commit slowly, and change direction with great reluctance. Dignity, loyalty, a keen sense of honour and an instinctive dislike of anything cheap or servile run through the sign, and recognition usually matters to them more than money does. Its three nakshatras shade this differently  -  Magha, whose devata are the Pitris, gives lineage-consciousness and regal bearing; Purva Phalguni under Bhaga gives warmth, enjoyment and open-handedness; the single pada of Uttara Phalguni under Aryaman adds patronage, reliability and steady friendship. Because no graha finds either exaltation or debilitation in Simha, the classical texts read the rashi almost entirely through the condition of the Sun itself  -  its bhava, dignity, avastha and aspects in the individual chart.",
    strengths: [
      "Natural authority and the ability to carry responsibility openly",
      "Large-heartedness and genuine generosity toward dependants",
      "Steadfast loyalty and constancy, the gift of the sthira quality",
      "Integrity and an unwillingness to act in a manner felt to be beneath them",
      "Courage and a calm, warm magnetism that draws people",
      "Creative and dramatic flair, a sense of occasion and ceremony",
      "Protectiveness and patronage  -  they lift the people around them"
    ],
    weaknesses: [
      "Ahamkara  -  pride that hardens into an unwillingness to be corrected",
      "Inflexibility, the shadow side of the fixed quality",
      "Sensitivity to slight; a real need for acknowledgement",
      "A tendency to become domineering when unquestioned",
      "Extravagance and display beyond what is prudent",
      "Difficulty apologising or admitting an error in public"
    ],
    career: "The 10th bhava counted from Simha is Vrishabha, owned by Shukra, so classical readings pair the Sun's authority with Venus's domains of beauty, art and refinement  -  work that is public-facing and lets the person be seen and credited. Simha rarely settles in anonymous or closely supervised roles; it does best where responsibility is visible, where a name is attached to the outcome, and where the native can take the blame as readily as the applause. Surya's own karakatva covers government, command, medicine, gold and the father, and a well-placed Sun is read as the seat of tejas  -  the steadiness that lets a person carry authority without being deformed by it. Typical professions: government service and civil administration, politics and public office, defence and police, medicine and surgery, the judiciary, teaching and academic leadership, entrepreneurship and family business, the gold and jewellery trade, theatre, cinema and the performing arts, hospitality, and senior management.",
    relationships: "Vedic matching is done through Ashtakoota  -  graha maitri, bhakoot, nadi, gana and the rest, compared between the Chandra rashis and janma nakshatras of the two charts  -  so a Simha native's compatibility is judged from the Moon's placement and the strength of the 7th bhava, never from a sun-sign table. The 7th from Simha is Kumbha, owned by Shani, which is why classical texts describe the Simha partner as serious, dutiful and steady, often older or from a different background, and a marriage that matures with time rather than igniting at once. Simha gives loyalty and protection generously and expects to be honoured in return; when that respect is felt to be withheld, the fixed quality shows itself as stubborn withdrawal rather than open quarrel. Before any match is settled, tradition weighs Kuja dosha, the condition of Shukra for a man and of Guru for a woman, and the dignity of the 7th lord in both kundalis.",
    health: "In the Kaal Purusha, Simha governs the hridaya (heart) and the upper back, so classical writing associates an afflicted Sun or an afflicted 5th bhava with complaints of the heart and circulation, blood pressure, and stiffness of the dorsal spine; the eyes are also included, since Surya signifies sight. As a pitta-dominant agni rashi, the sign is traditionally linked with fevers, acidity and inflammatory conditions, and with vitality that rises and falls along with the Sun's dignity in the kundali  -  which is why the classical advice is simply moderation, early rising and sunlight. These are traditional significations rather than diagnoses; any actual symptom belongs with a qualified physician.",
    finance: "Both dhana bhavas counted from Simha  -  the 2nd (Kanya) and the 11th (Mithuna)  -  are owned by Budha, so classical readings tie this rashi's earnings to intelligence, communication, commerce and skilled work rather than to inheritance alone. The Sun signifies position and repute, and Simha natives typically earn through the standing they hold; the same solar open-handedness that makes them generous hosts and ready patrons tends to make holding money harder than making it. The sthira quality pulls toward durable and visible assets  -  land, property, gold  -  rather than restless speculation, and classical texts count copper and gold among the metals of Surya.",
    compatibleWith: [
      "Aries (Mesha)",
      "Scorpio (Vrishchika)",
      "Sagittarius (Dhanu)"
    ],
    challengingWith: [
      "Libra (Tula)",
      "Aquarius (Kumbha)",
      "Capricorn (Makara)"
    ],
    remedies: [
      "Offer arghya to the rising Sun at sunrise: water poured from a copper vessel facing east, with a little roli and red flowers, while reciting the Gayatri mantra.",
      "Japa of the Surya beeja mantra 'Om Hraam Hreem Hraum Sah Suryaya Namah', or recitation of the Aditya Hridaya Stotra from the Valmiki Ramayana, especially on Sundays.",
      "Ravivar vrat  -  a Sunday fast kept with one simple meal, traditionally taken without salt and not after sunset.",
      "Daan on Sunday: wheat, jaggery, ghee, copper, red cloth or a ruby given to a needy person or a temple; serving one's father and elders is counted the strongest upaya for Surya of all.",
      "Manikya (ruby) set in gold or copper, worn on the ring finger of the right hand on a Sunday in shukla paksha  -  and only when a competent astrologer confirms the Sun's placement supports it, since an already strong or malefic Sun is not strengthened further."
    ]
  },
  {
    slug: "virgo",
    name: "Virgo",
    sanskrit: "Kanya",
    symbol: "The Maiden  -  a young woman seated in a boat, holding a sheaf of grain and a lamp",
    tagline: "Budha's own field, where a careful hand turns raw earth into ordered, useful harvest.",
    number: 6,
    lord: "Mercury",
    element: "Earth (Prithvi)",
    quality: "Dual (Dwiswabhava)",
    nakshatras: [
      "Uttara Phalguni",
      "Hasta",
      "Chitra"
    ],
    exalted: "Mercury",
    debilitated: "Venus",
    bodyPart: "Intestines and digestive tract",
    deity: "Bhagavan Vishnu (Narayana), the presiding devata of Budha graha; the rashi itself is worshipped in the form of Devi Durga as Kanya",
    direction: "South (Dakshina)",
    gemstone: "Emerald (Panna)",
    luckyDay: "Wednesday",
    luckyColors: [
      "Emerald green",
      "Sage and olive earth tones",
      "White"
    ],
    luckyNumbers: [5, 14, 23],
    personality: "Kanya is the one rashi whose lord is also exalted within it  -  Budha (Mercury) both rules and reaches his highest dignity here, so the faculties of discrimination, measurement and precise speech operate at full strength. Being a prithvi (earth) rashi, that intelligence refuses to remain abstract: it wants to be tested against material reality and to show itself as work done properly. The dwiswabhava (dual) quality makes the native genuinely adaptable and multi-skilled, able to change method mid-task, but also inclined to revisit a settled decision several times before trusting it. As the sixth rashi of the Kaal Purusha  -  the sthana of roga, rina and shatru, of illness, obligation and obstacle  -  Kanya carries a diagnostic instinct: it notices what is out of order and quietly assumes responsibility for setting it right. The classical image states the whole nature in one picture: a maiden seated in a boat, holding a sheaf of grain in one hand and a lamp in the other, carrying sustenance and discernment carefully across moving water.",
    strengths: [
      "Viveka  -  a fine, trained power of discrimination that separates the essential from the ornamental",
      "Methodical, uncomplaining industry; work is finished, not merely begun",
      "Skill in language, calculation and precise explanation, the natural gift of Budha",
      "A genuine seva instinct: contentment in being useful to others without requiring the credit",
      "Adaptability and range from the dwiswabhava quality  -  several competences held at once",
      "Practical problem-solving that grounds ideas in what can actually be done",
      "Scrupulous honesty in small matters, which over time builds substantial trust"
    ],
    weaknesses: [
      "Chronic over-analysis; the mind reopens a matter long after it was settled",
      "Perfectionism that turns critical, most severely toward the self",
      "Nervous restlessness and difficulty resting while anything remains unfinished",
      "Indecision and second-guessing, the shadow side of the dual quality",
      "Reticence in affection and discomfort in receiving care, ease or luxury",
      "Absorption in detail that occasionally loses sight of the larger purpose"
    ],
    career: "Kanya natives generally prosper wherever accuracy, analysis and sustained service are the actual product. Budha's rulership gives facility with language, number and system, while the prithvi (earth) element insists that the intelligence produce something tangible  -  a balanced ledger, a corrected manuscript, a patient made well. Because this is the sixth rashi of the Kaal Purusha, the sthana of service, healing and the resolution of disorder, many natives are drawn to work that repairs something rather than work that merely displays. The dwiswabhava quality often means a portfolio career or a specialism that keeps branching: two skills, two employers, or a craft that is periodically re-learned. Typical professions include accountancy, auditing and taxation, statistics and data analysis, editing, translation and proofreading, teaching and research, medicine, nursing, pharmacy, Ayurveda and dietetics, jyotish and other diagnostic sciences, law, software and quality assurance, administration, logistics and supply-chain work, and skilled trades demanding fine measurement.",
    relationships: "Kanya loves through attention rather than declaration  -  remembering the dosage, arriving early, handling the tedious paperwork no one else will touch  -  and can be misread as cool by partners who expect romance to announce itself. The debilitation of Shukra in this rashi is the classical reason given for a certain reticence in courtship and a habit of critiquing the very thing one most wants to keep. In kundali milan, graha maitri is strongest with the signs of Budha's friend Shukra and with Mithuna, which shares Budha as lord; Mithuna also sits in the favourable 4-10 bhakoot axis, while Vrishabha and Makara form the nava-pancham 5-9 relation, temperamentally easy but scoring nil in the strict Bhakoot reckoning  -  a reminder that the full ashtakoota, Mangal dosha and the seventh bhava matter far more than the rashi alone. The 6-8 shadashtaka with Mesha and Kumbha and the 2-12 dwirdwadasha with Simha and Tula are the placements traditional astrologers examine most carefully before proceeding.",
    health: "In the Kaal Purusha, Kanya governs the intestines and the digestive tract, and classical texts accordingly describe this rashi's constitutional sensitivities as centred on agni  -  the digestive fire. Tradition associates the sign with mandagni or irregular digestion, vata disturbance in the bowels, gas, colic and an unusually direct link between mental agitation and the gut, so that worry is felt in the abdomen before it is felt anywhere else. Budha additionally rules the skin, the nervous system and speech, and the texts extend the vulnerability to nervous exhaustion, sleeplessness from an unquiet mind, and reactive skin conditions. These are classical tendencies of the rashi, not a diagnosis; regular meals, rest and quiet are the traditional supports, and any actual complaint belongs with a qualified physician or vaidya.",
    finance: "Wealth in Kanya is characteristically accumulated rather than acquired in a stroke  -  earned through skill, service and trade, tracked carefully, and spent with a reflexive sense of proportion. Budha favours commerce, contracts and multiple small streams over a single large one, and the dual quality often produces exactly that: a salary alongside consulting, teaching or a family concern. Because Shukra falls to debilitation in this rashi, classical texts note a certain awkwardness with luxury and with receiving: the native may live well below their means, hesitate to price their own work at its worth, or feel obscurely guilty about indulgence. The temperament is one of prudence, and its shadow is anxiety about sufficiency even when sufficiency is plainly present.",
    compatibleWith: [
      "Taurus (Vrishabha)",
      "Gemini (Mithuna)",
      "Libra (Tula)"
    ],
    challengingWith: [
      "Aquarius (Kumbha)",
      "Pisces (Meena)",
      "Aries (Mesha)"
    ],
    remedies: [
      "Recite the Budha beeja mantra  -  Om Bram Breem Braum Sah Budhaya Namah  -  on Wednesdays, the classical japa count being nine thousand repetitions completed over a period; the simpler Om Budhaya Namah and the Vishnu Sahasranama are equally traditional for strengthening Budha.",
      "Observe a light satvik vrata on Budhwar (Wednesday), taking green moong and avoiding heavy or stale food, with worship offered to Bhagavan Vishnu.",
      "Perform daan on Wednesday: whole green moong, green cloth, bronze or kansa vessels, and books, slates or stationery given to students and teachers; feeding green fodder to a cow or calf is the commonest household form of this upaya.",
      "Practise kanya-pujan  -  honouring and feeding young girls, particularly during Navaratri  -  which is the upaya most specifically attached to this rashi.",
      "The gemstone of Budha is the emerald (panna), classically set in gold and worn on the little finger on a Wednesday in Budha hora. A ratna is prescribed only after a competent astrologer has examined the whole kundali, since a strong or ill-placed Budha changes the counsel entirely."
    ]
  },
  {
    slug: "libra",
    name: "Libra",
    sanskrit: "Tula",
    symbol: "The Balance (Tula)  -  a merchant holding a pair of scales, the only rashi represented by an inanimate object",
    tagline: "The scales of Shukra  -  airy, refined and diplomatic, weighing every side before settling on a balance.",
    number: 7,
    lord: "Venus",
    element: "Air (Vayu)",
    quality: "Movable (Chara)",
    nakshatras: [
      "Chitra",
      "Swati",
      "Vishakha"
    ],
    exalted: "Saturn",
    debilitated: "Sun",
    bodyPart: "Lower back and kidneys",
    deity: "Shukra (Shukracharya), the graha-devata of this rashi; classical Vedic listings give Indrani as Shukra's adhidevata and Indra as pratyadhidevata, while in living practice Venus upaya is carried out through the worship of Mahalakshmi.",
    direction: "West (Pashchim)  -  the classical dik of Tula rashi. Shukra's own direction as a graha is the south-east (Agni kona).",
    gemstone: "Diamond (Heera)",
    luckyDay: "Friday",
    luckyColors: [
      "White",
      "Pale blue",
      "Pastel pink"
    ],
    luckyNumbers: [6, 15, 24],
    personality: "Tula is the seventh rashi and the only one represented by an inanimate object  -  the balance held by a merchant  -  and that image carries most of its meaning: a temperament that weighs and measures before it acts. Ruled by Shukra (Venus), it takes on Venus's refinement, love of beauty, pleasant speech and instinct for harmony, and being a vayu-tattva (Air) rashi it works through ideas, exchange and relationship rather than through force. Its chara (movable) quality makes the native an initiator  -  Tula people open conversations, form alliances, start ventures and dislike stagnation  -  though the same mobility can show up as restlessness and too many unfinished beginnings. Saturn's exaltation in this rashi explains its capacity for impartial judgement, patience and durable structures, while the Sun's debilitation here is the other side of the same coin: a discomfort with blunt self-assertion and a preference for consensus over command. The three nakshatras layer this further  -  Chitra's craftsmanship and eye for design, Swati's independent, wind-borne diplomacy and trading sense, and Vishakha's sharply focused ambition once a goal is finally chosen.",
    strengths: [
      "A genuine sense of fairness  -  the instinct to hear both sides before judging, strengthened by Saturn's exaltation here",
      "Refined aesthetic judgement and craftsmanship, the gift of Chitra",
      "Diplomacy, tact and the pleasant, persuasive speech that is Shukra's signature",
      "Real skill at partnership  -  forming alliances and, more rarely, keeping them",
      "Initiative and adaptability from the chara-vayu combination; quick to begin, quick to adjust",
      "Concentrated determination once Vishakha's focus settles on a goal",
      "Social grace that opens doors and defuses conflict before it hardens"
    ],
    weaknesses: [
      "Chronic indecision  -  the scales keep swinging long after a choice is due",
      "Conflict-avoidance and people-pleasing, the mark of a debilitated Surya in this rashi",
      "Over-attachment to comfort, luxury and appearances when Venus goes unrestrained",
      "Restlessness and scattered effort; many beginnings, fewer completions",
      "Measuring self-worth by a partner's or a group's approval",
      "Conceding a principle to keep the peace, and quietly resenting it afterwards"
    ],
    career: "Shukra's karakatva points Tula natives toward work where taste, negotiation and human relationship are the real product. Chitra contributes design and craft ability, Swati contributes trade, movement and the diplomat's touch, and Vishakha supplies the ambition to carry a project to completion  -  while Saturn's exaltation in this rashi gives an unusual aptitude for law, arbitration and anything requiring impartial judgement. Because Tula is the seventh sign of the Kaal Purusha, the house of contracts, partners and vyapara, these natives frequently prosper in partnership rather than in isolation, and their careers often turn on one well-chosen collaborator. Typical professions: law, judiciary and mediation; diplomacy and public relations; architecture, interior and graphic design; fashion, textiles, jewellery, gemcraft and cosmetics; music, dance and the fine arts; hospitality, luxury retail and event work; trade, brokerage, import-export and commercial negotiation; counselling, HR and matrimonial or relationship advisory work; banking, valuation and accounts, where the instinct to balance is literal.",
    relationships: "Tula is the rashi of the seventh house of the Kaal Purusha, and Shukra is the kalatra karaka, the natural significator of the spouse  -  so partnership sits at the centre of a Tula native's life in a way it does not for most other signs. They are courteous, attentive and genuinely companionable partners who make a home beautiful and a quarrel short, but the classical caution is equally clear: a tendency to idealise the other, to over-accommodate, and to avoid the necessary confrontation until unspoken resentment has accumulated. It is worth stating plainly that Vedic compatibility is never judged from the Sun sign; it is assessed from the Chandra rashi and janma nakshatra through Ashtakoota guna milan, along with Mangal dosha, the strength of the seventh bhava and of Shukra in both charts. On that basis Tula pairs easily with rashis ruled by Budha and Shani, since those grahas are Shukra's natural friends and graha maitri scores full  -  and although Vrishabha falls in the 6/8 shadashtaka axis, the bhakoot dosha is held to be cancelled where both rashis share the same lord.",
    health: "In the Kaal Purusha, Tula governs the lower back, the kidneys and the associated urinary and bladder region, and Shukra additionally rules the shukra dhatu and the body's fluid balance. The vulnerabilities classical jyotisha associates with an afflicted Tula or a weak Shukra therefore cluster there  -  lumbar strain and stiffness, kidney and urinary complaints, disorders of fluid retention, and, because Venus rules the sweet taste and a kapha-vata constitution, a classical caution about rich, sweet and sedentary living. The traditional counsel is simply the sign's own principle, balance: regular movement for a rashi that likes to sit comfortably, moderation in indulgence, and attention to any persistent lower-back or urinary symptom with a qualified medical practitioner rather than through astrology alone.",
    finance: "Shukra is the graha of bhoga  -  wealth that is enjoyed rather than merely counted  -  so Tula natives tend to earn well through contracts, partnerships, aesthetics and trade, and to spend readily on comfort, ornament, vehicles and the people they care for. Swati's association with commerce often brings several parallel income streams rather than one fixed salary, which suits the chara nature but can make cash flow uneven. Saturn's exaltation here is the balancing factor: when it is well placed, the same person who loves beauty also builds patient, long-horizon assets, and classical texts describe Shukra dasha for this rashi as a period of acquisition of comforts, vehicles and ornaments.",
    compatibleWith: [
      "Gemini (Mithuna)",
      "Capricorn (Makara)",
      "Aquarius (Kumbha)"
    ],
    challengingWith: [
      "Leo (Simha)",
      "Sagittarius (Dhanu)",
      "Pisces (Meena)"
    ],
    remedies: [
      "Observe Shukravara (Friday): a light sattvic vrat, clean white clothing, and worship of Mahalakshmi with the recitation of the Shri Suktam before sunset.",
      "Japa of the Shukra beeja mantra 'Om Shum Shukraya Namah', or the Puranic dhyana shloka 'Himakunda-mrinalabham daityanam paramam gurum, sarva-shastra-pravaktaram bhargavam pranamamyaham'  -  traditionally counted to 16,000 repetitions across a Venus period.",
      "Daan of white and Venusian articles on Friday: rice, mishri or sugar, ghee, curd, white cloth, silver, camphor, scent and white flowers, given to women, young girls or a temple.",
      "Gemstone upaya: heera (diamond) set in silver or platinum, with safed pukhraj (white sapphire), white zircon or opal as accepted substitutes  -  worn on a Friday in Shukra hora after prana-pratishtha, and only on the advice of a qualified jyotishi, since Shukra is a functional malefic for some lagnas.",
      "Conduct-based upaya, held classically to be the most lasting: respect toward women and one's spouse, honesty in contracts and promises, service to cows, and restraint in indulgence  -  Shukra is said to answer to character before it answers to ritual."
    ]
  },
  {
    slug: "scorpio",
    name: "Scorpio",
    sanskrit: "Vrishchika",
    symbol: "The Scorpion (Vrishchika)",
    tagline: "Still water with fire at the bottom  -  Mars keeping watch over depths few people are ever shown.",
    number: 8,
    lord: "Mars",
    element: "Water (Jala)",
    quality: "Fixed (Sthira)",
    nakshatras: [
      "Vishakha",
      "Anuradha",
      "Jyeshtha"
    ],
    exalted: null,
    debilitated: "Moon",
    bodyPart: "Pelvis and reproductive organs",
    deity: "Mangala (Kuja), lord of Vrishchika, whose adhidevata in the classical Graha-devata scheme is Bhumi Devi (the Earth) and whose pratyadhidevata is Kartikeya-Subrahmanya; in popular upaya Hanuman is the deity most widely invoked for Mars.",
    direction: "North (Uttara)  -  the classical disha of the Jala (water) rashis, of which Vrishchika is one; the graha Mangal himself is assigned the South (Dakshina).",
    gemstone: "Red Coral (Moonga)",
    luckyDay: "Tuesday",
    luckyColors: [
      "Red (rakta)",
      "Maroon and deep crimson",
      "Coral / burnt orange"
    ],
    luckyNumbers: [9, 18, 27],
    personality: "Vrishchika is the eighth rashi of the sidereal zodiac: a Sthira (fixed) rashi of the Jala (water) element, ruled by Mangal, the graha of heat, courage and unbending will. The combination is an unusual one  -  the commander of fire set to govern still, deep water  -  and it produces a temperament that is quiet on the surface and immovable underneath, capable of holding a purpose, a promise or a grievance for decades without visible effort. Mars gives the drive to go straight at what frightens other people, while the water element turns that drive inward, so the characteristic Vrishchika strength is not display but concentration: the ability to look steadily at something painful and keep working. This is also the one rashi in which no graha finds exaltation while Chandra, the Moon, falls into debilitation (deepest at the third degree)  -  a classical signature for feelings that run very strong and are shown very little. Its three nakshatras trace the arc of the sign well: the last pada of Vishakha (Indragni) for single-minded ambition, all four padas of Anuradha (Mitra) for devoted friendship and disciplined cooperation, and all four of Jyeshtha (Indra) for hard-won seniority and the willingness to carry responsibility alone.",
    strengths: [
      "Endurance  -  the Sthira quality allows them to outlast opposition rather than overpower it",
      "Penetrating perception; natural investigators who notice what is being left unsaid",
      "Steadiness in crisis, a direct gift of Mangal  -  often calmest when the situation is worst",
      "Deep, tested loyalty to a small circle, the classical mark of Anuradha",
      "Capacity for regeneration: able to rebuild after loss or reversal without bitterness turning into paralysis",
      "Absolute discretion  -  a confidence given to a Vrishchika native tends to stay there",
      "Aptitude for research, medicine, and the hidden or technical sciences"
    ],
    weaknesses: [
      "Secretiveness that hardens into suspicion of motives",
      "Slow to forgive  -  Mars's long memory reinforced by the fixed quality",
      "Possessiveness and jealousy in close attachments",
      "Cutting, precisely aimed speech when provoked, the sting of Jyeshtha",
      "Difficulty asking for help or naming a feeling, a signature of Chandra's debilitation here",
      "All-or-nothing extremes, with little tolerance for half-measures in themselves or others"
    ],
    career: "Mangal gives Vrishchika natives an appetite for work that other people find uncomfortable, and the Sthira (fixed) quality gives them the stamina to stay with it for a lifetime. Because Vrishchika is the eighth rashi of the Kaal Purusha  -  the sthana of crisis, hidden things, surgery, inheritance and research  -  classical astrology associates it with vocations that involve cutting into a problem, whether that problem is a body, a machine, a case file or a mystery. Mars's ruling of blood, iron, fire and weapons combines with the water element to favour fields where technical force is applied with patience and discretion rather than display. Anuradha's capacity to organise people and Jyeshtha's natural seniority also make Vrishchika unexpectedly good at quiet institutional leadership, often arriving at authority late and holding it firmly. Typical professions: surgeons and anaesthetists, physicians and paramedics, defence and police services, detectives, forensic and intelligence work, engineers (especially chemical, mechanical, mining and petroleum), geologists and drilling professionals, researchers and laboratory scientists, psychologists and psychotherapists, jyotishis, tantriks and other students of the hidden sciences, insurance and risk assessment, auditing and taxation, litigation, and real estate or land development.",
    relationships: "Vrishchika approaches partnership the way it approaches everything else  -  slowly, with reservation, and then completely. Anuradha's influence makes these natives capable of extraordinary constancy and of standing by a partner through circumstances that would end most bonds, while the fixed quality means that once trust is given it is rarely withdrawn, and once broken it is rarely restored. The same intensity has a shadow side that the classical texts do not soften: possessiveness, jealousy, a tendency to test the other person, and long silences in place of plain speech, reinforced by Chandra's debilitation in this rashi. In the Vedic tradition a match is never judged by the rashi alone  -  Ashtakoota melapak, graha maitri, and above all the condition of Mangal in both charts (the question of Kuja or Mangal dosha and its many classical cancellations) are examined together by an astrologer who has seen both kundalis.",
    health: "In the scheme of the Kaal Purusha, Vrishchika governs the pelvis and the reproductive and excretory organs  -  the bladder, the urinary and genital passages, the rectum and the groin. Because the rashi is watery but its lord Mangal is the hot, pitta-dominant graha of blood and inflammation, classical texts describe its characteristic vulnerabilities as heat-and-moisture conditions in that region: urinary and genital complaints, piles and fistula, hernia, menstrual irregularity, and disorders of the blood, alongside Mars's general tendency towards accidents, cuts, burns and surgical episodes. The Vrishchika habit of absorbing strain silently rather than speaking of it is itself treated as a health factor, since suppressed intensity is said to settle in the body. None of this is a diagnosis or a prediction  -  these are traditional areas of sensitivity, and any actual symptom belongs with a qualified medical practitioner.",
    finance: "Classical texts connect the eighth rashi of the Kaal Purusha with wealth that arrives through channels other than ordinary salary  -  inheritance, a spouse's or partner's resources, insurance, legacies, dealings in land and minerals, and returns from work that others consider risky. Vrishchika natives are typically private about money to the point of secrecy, dislike being asked what they hold, and are strong accumulators once they decide a goal is worth it, since the Sthira quality resists spending impulses that would break a long plan. The Mars side of the temperament is the counterweight: a sudden conviction can turn into an all-or-nothing commitment, and speculative or leveraged ventures appeal more than they should. Whether any of this actually manifests depends on the strength and placement of Mangal and the second, eighth and eleventh bhavas in the individual kundali, not on the rashi alone.",
    compatibleWith: [
      "Leo (Simha)",
      "Pisces (Meena)",
      "Taurus (Vrishabha)"
    ],
    challengingWith: [
      "Capricorn (Makara)",
      "Aquarius (Kumbha)",
      "Gemini (Mithuna)"
    ],
    remedies: [
      "Japa of the Mangal beeja mantra  -  Om Kram Kreem Kraum Sah Bhaumaya Namah  -  recited on Tuesdays, traditionally in a count of 10,000 over a fixed period, or the Vedic Mangal mantra beginning Om Agnirmurdha Divah Kakut.",
      "Mangalvar vrat: a Tuesday fast taken with a single sattvic meal, traditionally without salt, kept for a series of Tuesdays begun in the Shukla paksha.",
      "Daan on Tuesday of Mars's own substances  -  masoor dal (red lentils), jaggery, red cloth, copper vessels, red flowers or wheat  -  given to a needy person, a temple or a Brahmin, never in expectation of return.",
      "Worship of Hanuman with sindoor and chameli (jasmine) oil on Tuesdays, with recitation of the Hanuman Chalisa or Bajrang Baan; worship of Kartikeya-Subrahmanya where that tradition is followed.",
      "Moonga (red coral / praval) of good quality, set in copper, silver or gold and worn on the ring finger on a Tuesday morning  -  a gemstone upaya that should be taken up only after a competent jyotishi has examined the whole kundali, since Mars as a functional malefic is not strengthened indiscriminately."
    ]
  },
  {
    slug: "sagittarius",
    name: "Sagittarius",
    sanskrit: "Dhanu",
    symbol: "The Archer (Dhanu, the bow)  -  classically depicted as a bow-bearing figure, the upper body human and the lower body equine",
    tagline: "Guru's archer: fire aimed at dharma, forever drawing the bow toward a wider horizon.",
    number: 9,
    lord: "Jupiter",
    element: "Fire (Agni)",
    quality: "Dual (Dwiswabhava)",
    nakshatras: [
      "Mula",
      "Purva Ashadha",
      "Uttara Ashadha"
    ],
    exalted: null,
    debilitated: null,
    bodyPart: "Hips and thighs",
    deity: "Brihaspati (Guru), preceptor of the devas and lord of the ninth rashi; in Navagraha worship Indra is his adhidevata and Brahma his pratyadhidevata, and in the Vaishnava tradition Jupiter's grace is invoked through Vishnu and through Dakshinamurti, the silent teacher.",
    direction: "East (Purva)  -  the direction assigned to the Agni (fire) rashis Mesha, Simha and Dhanu",
    gemstone: "Yellow Sapphire (Pukhraj)",
    luckyDay: "Thursday",
    luckyColors: [
      "Yellow",
      "Golden saffron",
      "Cream"
    ],
    luckyNumbers: [3, 12, 21],
    personality: "Dhanu, the ninth rashi, is the fiery sign of Guru (Brihaspati), the preceptor of the devas, and its people carry his signature: a natural pull toward meaning, law, philosophy and the wider view, and an instinct to teach whatever they have understood. The Agni (fire) element gives them tejas  -  warmth, conviction, straight speech and a forward-leaning optimism that recovers quickly from setbacks  -  while Jupiter softens that heat into generosity, faith and a genuine wish that others should do well. Being Dwiswabhava (dual in quality), Dhanu is two-natured and mobile: the native is student and teacher at once, at home in the ashram and on the road, able to change direction without feeling that the earlier path was wasted. Its three nakshatras trace this arc plainly  -  Mula under Ketu digs for the root of things and is willing to tear away what is false, Purva Ashadha under Shukra gives the \"undefeated\" buoyancy that carries a person through, and the single pada of Uttara Ashadha under Surya lends steadiness and final victory to what is pursued with dharma. No graha finds exaltation or debilitation in Dhanu, which the tradition reads as a rashi that neither inflates nor diminishes what enters it, but asks each planet to work by its own honest strength.",
    strengths: [
      "Dharmic instinct  -  a reliable inner sense of what is right, and the courage to act on it",
      "Optimism and resilience under Agni tattva; setbacks are absorbed rather than brooded over",
      "Natural teaching ability and clarity in explaining complex ideas",
      "Generosity of spirit and purse, with real pleasure in another's advancement",
      "Honesty and directness that makes their word dependable",
      "Adaptability from the Dwiswabhava quality  -  able to change course, place or field without losing themselves",
      "Breadth of vision that sees the whole pattern rather than the immediate detail"
    ],
    weaknesses: [
      "Bluntness that lands as tactlessness, especially when they believe they are simply being truthful",
      "A tendency to preach or moralise where counsel was not sought",
      "Over-optimism and over-commitment  -  promising more than the day can hold",
      "Restlessness from the dual quality, leaving good work unfinished when a newer horizon appears",
      "Impatience with routine, paperwork and the small disciplines that sustain large plans",
      "Excess in enjoyment  -  food, travel, spending  -  since Guru expands whatever he touches"
    ],
    career: "Jupiter (Guru/Brihaspati) is the graha of wisdom, dharma, counsel and expansion, so Dhanu natives flourish wherever knowledge is transmitted, judged or applied for the good of others rather than merely traded. The Dwiswabhava (dual) quality gives them range and mobility: they often carry two vocations at once, or move between institutions, cities and countries rather than sitting in one chair for forty years. Because the Fire element supplies conviction, they do best where they may speak plainly and be believed, and worst where they must execute someone else's instructions without understanding the reason. Classical Jyotisha associates Dhanu with teaching and academia, law and the judiciary, priesthood and temple service, philosophy and religious study, publishing, editing and writing, counselling and mentoring, banking, finance and treasury work, Ayurveda and medicine, diplomacy and foreign affairs, travel and the hospitality trade, horsemanship, archery and athletics, and administrative or advisory posts in large organisations.",
    relationships: "The seventh bhava from Dhanu is Mithuna, ruled by Budha, so these natives are typically drawn to partners who are quick-minded, articulate and youthful in spirit, and a marriage that offers no conversation will not hold them however comfortable it is otherwise. Guru's influence makes them loyal, principled and protective, often stepping into the role of guide within the household, though the same impulse can slide into lecturing where listening was wanted. Their well-known bluntness is not unkindness but a refusal to dissemble; partners who understand this find them unusually trustworthy, while those who need tact are frequently wounded by remarks the native thought harmless. Being of dual quality, they need room to travel, study and keep their own friendships, and they give the same freedom generously in return  -  a marriage built on shared dharma and open space suits them far better than one built on close supervision.",
    health: "In the scheme of the Kaal Purusha, Dhanu governs the hips and thighs  -  the hip joints, the femur, the sacral region and the great nerves that run down the leg  -  so classical texts connect this rashi with sciatica (gridhrasi), strain or injury to the hip and thigh, and complaints arising from sudden exertion, riding, travel or sport. Jupiter rules the liver and the medas dhatu (fatty tissue), and the Fire element inclines toward pitta, so the vulnerabilities traditionally named are liver congestion, disturbances of fat and sugar metabolism, and the effects of rich food taken freely and often. Jyotisha regards the Dhanu constitution as fundamentally robust and slow to break down, which is itself the risk: warnings are noticed late, and the classical advice is regular movement, moderate diet and honest attention to early signs, alongside proper care from a qualified practitioner.",
    finance: "Jupiter is a natural benefic and the karaka of dhana, so Dhanu natives usually earn honourably and are rarely left destitute, though wealth tends to arrive through knowledge, advice, teaching or institutional position rather than through shrewd bargaining. The dual quality often produces several streams of income that rise and fall in turn, which suits them better than a single fixed salary but makes their year-to-year picture uneven. Their classical weakness is not greed but expansiveness: generous giving, large gestures, optimistic commitments and a dislike of small accounting can outrun what is actually in hand, and the traditional counsel is simply that Guru's people prosper most when their generosity is deliberate rather than impulsive.",
    compatibleWith: [
      "Aries (Mesha)",
      "Leo (Simha)",
      "Pisces (Meena)"
    ],
    challengingWith: [
      "Virgo (Kanya)",
      "Libra (Tula)",
      "Taurus (Vrishabha)"
    ],
    remedies: [
      "Recite the Guru beeja mantra 'Om Gram Greem Graum Sah Gurave Namah' 108 times on Thursday morning, or offer the Brihaspati Stotra, the Guru Gayatri, or the Vishnu Sahasranama.",
      "Observe the Brihaspativar (Thursday) vrata  -  a single simple meal of yellow food such as chana dal or kheer, taken with restraint and accompanied by worship of Brihaspati, Dakshinamurti or Vishnu.",
      "Give daan on Thursday in Guru's karakas: turmeric, chana dal, ghee, yellow cloth, books, or support for a teacher, student or temple  -  offered quietly and without expectation of return.",
      "Feed cows, especially with jaggery and gram, and offer water at the root of the Ashwattha (peepal) tree, the tree traditionally assigned to Guru.",
      "Wear a Pukhraj (yellow sapphire) set in gold on the index finger of the right hand, first worn on a Thursday of the Shukla paksha  -  but only after the whole kundali has been examined by a competent jyotishi, since a gemstone strengthens a graha's promise for good or ill; sunehla or citrine are the traditional uparatna substitutes."
    ]
  },
  {
    slug: "capricorn",
    name: "Capricorn",
    sanskrit: "Makara",
    symbol: "The Makara  -  the crocodile, depicted in Indian tradition as a powerful water-creature with a deer's head and a fish's tail (rendered in the West as the Sea-Goat)",
    tagline: "Saturn's patient climber: earth that keeps moving, building in stone what only time can finish.",
    number: 10,
    lord: "Saturn",
    element: "Earth (Prithvi)",
    quality: "Movable (Chara)",
    nakshatras: [
      "Uttara Ashadha",
      "Shravana",
      "Dhanishta"
    ],
    exalted: "Mars",
    debilitated: "Jupiter",
    bodyPart: "Knees and joints",
    deity: "Shani Deva, the graha-lord of Makara. Traditionally Saturn is not approached directly but through the deities who preside over him  -  Lord Shiva (especially as Mahamrityunjaya and through Shanivar abhisheka) and Sri Hanuman, whose worship on Saturdays is the most widely practised Shani upaya in India. Through the nakshatra Shravana, whose devata is Vishnu, this rashi also carries a strong Vaishnava thread.",
    direction: "South (Dakshina). In the classical scheme of Brihat Jataka the earthy rashis  -  Vrishabha, Kanya and Makara  -  face south, while as a graha Shani himself is assigned rulership of the west; both are used in practice, the rashi direction for matters read from the sign, the graha direction for Saturn's own remedial worship.",
    gemstone: "Blue Sapphire (Neelam)",
    luckyDay: "Saturday",
    luckyColors: [
      "Deep blue and indigo",
      "Black and charcoal grey",
      "Earth brown"
    ],
    luckyNumbers: [4, 6, 8],
    personality: "Makara is one of the two rashis of Shani (Saturn), an earth sign of movable (chara) quality, and its character sits exactly where those two forces meet. Saturn gives patience, realism and an instinct for structure: the Makara native measures before touching, prefers stone to sand, and carries responsibility as naturally as other signs carry enthusiasm. Because the rashi is chara and not fixed, that earthiness never settles into mere stability  -  there is a steady upward motion in it, a need to climb, to be useful, to be entrusted with something heavy. The symbol is apt: the makara, the crocodile of the waters, still on the surface, immensely strong beneath, and able to wait longer than anyone watching. Classical texts also call Makara a prishtodaya rashi, one that \"rises by its back\", and read into that a life whose results arrive late, from behind, and hold once they arrive; the exaltation of Mangal (Mars) here adds disciplined courage and stamina, while the debilitation of Guru (Jupiter) explains the sign's characteristic shortage of easy optimism.",
    strengths: [
      "Perseverance (dhriti) that outlasts obstacles and rivals alike",
      "Self-discipline and genuine capacity for austerity",
      "Practical realism  -  sees things as they are, not as hoped",
      "A deep sense of duty and responsibility for others",
      "Long-range strategic patience; plans in decades",
      "Stamina and disciplined courage from exalted Mangal (Mars)",
      "Loyalty, integrity and unshowy dependability"
    ],
    weaknesses: [
      "Pessimism and a melancholy that mistakes itself for realism",
      "Emotional reserve that reads to others as coldness",
      "Rigidity  -  difficulty revising a position once taken",
      "Overwork and self-denial carried past the point of usefulness",
      "Excessive caution with money, faith and trust (debilitated Guru)",
      "Harsh self-judgement and an anxious attachment to status"
    ],
    career: "Saturn rewards structure, and Makara natives generally rise through institutions rather than around them  -  by seniority, by competence, and by outlasting everyone else in the room. The exaltation of Mangal (Mars) in this rashi gives real executive stamina: disciplined courage, an appetite for hard technical work, and the ability to finish what was begun years earlier. The three nakshatras colour the vocation: Uttara Ashadha (Sun, Vishvedevas) inclines toward principled authority and causes that are won slowly; Shravana (Moon, Vishnu) toward listening, learning, teaching and the word; Dhanishta (Mars, the Vasus) toward rhythm, resources, property and enterprise. Typical professions in the classical reading include administration and civil service, law and the judiciary, engineering, construction and architecture, mining, iron, steel and oil, land, real estate and agriculture, project and supply-chain management, accountancy and audit, banking and actuarial work, medicine and surgery (with exalted Mars), archaeology, history and scholarship, teaching and scriptural study, music and sound (Dhanishta), and vocations of service to labourers, elders and the dispossessed  -  including monastic and ascetic paths, which Shani's rashis are classically associated with.",
    relationships: "Makara loves by provision rather than by declaration. Saturn is a graha of duty and of time, so affection here shows up as reliability, as the bill quietly paid and the promise kept for twenty years, and a partner who needs verbal warmth may have to learn to read subtext. The tradition associates Shani's rashis with later marriage, longer courtships and a seriousness about commitment that resists being hurried  -  and once given, the commitment is rarely withdrawn. In the classical method, compatibility is judged from the Moon's rashi and nakshatra through Ashtakoota milan rather than from a sun-sign, weighing Graha Maitri (friendship of the sign lords), Bhakoot (the count between the two rashis), Nadi and Gana; a full guna milan with examination of both charts for Mangal dosha, the seventh house and its lord always outranks any general list of matching signs.",
    health: "In the Kaal Purusha, the cosmic body of the zodiac, Makara governs the knees, kneecaps and the joints generally  -  and by extension, through Shani, the bones, teeth, skin and the vata dosha. The classical vulnerabilities named for this rashi are therefore stiffness and wear in the knees and joints, rheumatic and arthritic complaints, dryness of skin, dental and bone weakness, a sluggish digestive fire, and a slow-burning fatigue or melancholy that comes from chronic overwork rather than from any single strain. Ayurvedic and jyotisha tradition responds to a Saturnine constitution with warmth, oil and rhythm  -  regular sleep, warm cooked food, abhyanga (oil massage) of the joints, and rest taken before exhaustion rather than after it; none of this replaces a physician, and a chart describes tendencies, never a diagnosis.",
    finance: "Shani gives wealth that is earned rather than received, and usually late rather than early: savings built by denial, property held for decades, income tied to work actually performed. The classical signature of Makara is frugality and an aversion to debt or speculation, with land, minerals, machinery and long-service employment named as its natural sources of gain. The debilitation of Guru (Jupiter) in this rashi is the counterweight that older texts emphasise  -  the expansive, trusting, open-handed instinct is muted here, so Makara natives may undervalue their own work, hold on past the point of usefulness, or be slow to take counsel from advisers and elders; where Jupiter is otherwise well placed or the debility is cancelled (neechabhanga), this hardens into shrewdness rather than scarcity.",
    compatibleWith: [
      "Taurus (Vrishabha)",
      "Libra (Tula)",
      "Virgo (Kanya)"
    ],
    challengingWith: [
      "Cancer (Karka)",
      "Scorpio (Vrishchika)",
      "Leo (Simha)"
    ],
    remedies: [
      "Recite the Shani beeja mantra 'Om Praam Preem Praum Sah Shanaishcharaya Namah' or the simpler 'Om Sham Shanaishcharaya Namah' 108 times on Saturdays; the Dasharatha Shani Stotra and, most commonly of all, the Hanuman Chalisa on Saturday evening are the traditional substitutes for those who prefer stotra to japa.",
      "Observe Shanivar vrat  -  a simple one-meal fast on Saturdays, the food dark and plain (black urad dal, black til)  -  and light a lamp of til or mustard oil beneath a Peepal tree at dusk, offering water to its root. This is the most widely kept Saturn upaya in Indian households.",
      "Perform daan on Saturday: black sesame (til), black urad, iron, mustard oil, a woollen blanket, black cloth, shoes or plain food, given to labourers, the elderly, the disabled or the genuinely poor. Feeding crows, black dogs and buffalo is prescribed in the same spirit  -  Shani accepts service, not display.",
      "Wear Neelam (blue sapphire) set in iron or panchdhatu on the middle finger of the right hand, taken up on a Saturday in Shani's hora. Blue sapphire is the swiftest and least forgiving of gemstones, and the classical instruction is unambiguous: only on the advice of a competent jyotishi after the whole chart is examined, and only after a trial period of wearing.",
      "Practise the upaya Saturn values above all others  -  sustained, unglamorous service: care of elders and the sick, honest dealing with employees and servants, Shiva abhisheka on Saturdays and Amavasya, and the discipline of finishing what has been undertaken."
    ]
  },
  {
    slug: "aquarius",
    name: "Aquarius",
    sanskrit: "Kumbha",
    symbol: "The Water Pot  -  a man carrying an empty pitcher on his shoulder (Kumbha)",
    tagline: "Shani's air rashi: the steady pot-bearer who carries water for everyone and drinks last.",
    number: 11,
    lord: "Saturn",
    element: "Air (Vayu)",
    quality: "Fixed (Sthira)",
    nakshatras: [
      "Dhanishta",
      "Shatabhisha",
      "Purva Bhadrapada"
    ],
    exalted: null,
    debilitated: null,
    bodyPart: "Calves and ankles",
    deity: "Shani Deva, the graha who owns this rashi  -  in Navagraha ritual his adhidevata is Prajapati (Brahma) and his pratyadhidevata is Yama; Lord Shiva and Hanuman are the deities most commonly invoked in Shani upaya.",
    direction: "West (Paschim)  -  the disha of both Shani and the eleventh rashi",
    gemstone: "Blue Sapphire (Neelam)",
    luckyDay: "Saturday",
    luckyColors: [
      "Deep blue (neela)",
      "Black and charcoal",
      "Ash grey"
    ],
    luckyNumbers: [4, 8, 17, 26],
    personality: "Kumbha is the eleventh rashi of the Kaal Purusha, an air (vayu) rashi of fixed (sthira) quality owned by Shani (the classical lord is Shani alone; some later traditions also associate Rahu with it). The vayu tattva gives a mind that lives among ideas, patterns and people rather than possessions, while the sthira nature turns those ideas into settled convictions  -  a Kumbha native will listen to you patiently and then do precisely what they had already decided. Shani's imprint is unmistakable: an unhurried temperament, an unusual tolerance for hardship and delay, a dislike of display, and a sense of fairness that instinctively sides with the overlooked rather than the powerful. The symbol carries the rest of the meaning: a bearer walking with a pot meant for others, often the last to drink from it. Its three nakshatras deepen the portrait  -  Dhanishta's rhythm and organising capacity, Shatabhisha's secretive, investigative and healing bent under Varuna, and Purva Bhadrapada's ascetic intensity under Aja Ekapada, which is why so many Kumbha natives pair warm public usefulness with a private life kept firmly behind a closed door.",
    strengths: [
      "Impartial, principled judgement  -  Shani's discipline applied to people and rules alike",
      "Systems-level, original thinking natural to the vayu tattva",
      "Endurance: the sthira quality lets them outlast opponents with far greater force",
      "Genuine ease with groups, guilds and causes, fitting the labha bhava of the Kaal Purusha",
      "Research temperament and comfort with the hidden or unexplained (Shatabhisha)",
      "Unshakeable loyalty once a commitment is actually made",
      "Freedom from snobbery  -  treats every rank of person the same way"
    ],
    weaknesses: [
      "Emotional reserve that others read as coldness or indifference",
      "Sthira rigidity presented as principle  -  very slow to revise a settled position",
      "Detachment from immediate family in favour of abstractions, work or causes",
      "Melancholy and pessimism when Shani is weak or afflicted in the chart",
      "Secretiveness: withholds information people around them needed to have",
      "Contrariness for its own sake, resisting a sound idea because it came from authority"
    ],
    career: "Shani rules labour, structure, time and everything that endures, and the eleventh rashi rules networks and collective effort, so Kumbha natives usually do best where a large system has to be built, maintained or reformed  -  work that rewards patience and dislikes showmanship. Shatabhisha's presence here is the classical signature of the researcher, the healer and the astrologer, while Dhanishta lends organising and performing ability and Purva Bhadrapada a taste for deep, solitary study. They tend to rise late but hold what they gain, and they work better inside institutions or causes than in purely self-promoting roles. Typical professions: engineering and technology, scientific and pharmaceutical research, medicine and psychiatry, astrology and occult sciences, law and judiciary, administration and public service, social reform and NGO work, labour and trade-union leadership, mining, iron, oil and heavy industry, archaeology and history, electrical work, aviation, and charitable or religious trusts.",
    relationships: "The seventh from Kumbha is Simha, owned by Surya, so the kalatra sthana of this rashi is naturally drawn to warmth, dignity and confidence  -  the Kumbha native is often steadied by a partner far more demonstrative than themselves. Shani makes commitment slow and deliberate rather than impulsive, and classical texts associate Shani's rashis with a later and more considered marriage; what follows, though, is durable, since a Kumbha native rarely withdraws once the vow is made. The usual friction is expressive rather than moral: affection is shown through duty, reliability and provision instead of words, and a partner who needs open feeling may read the silence as distance. It is worth remembering that classical compatibility is judged from the janma nakshatra and janma rashi of both horoscopes through Ashtakoota guna milan, along with Mangal dosha and the strength of the seventh house and its lord  -  never from a sun sign alone.",
    health: "In the scheme of the Kaal Purusha, Kumbha governs the calves and ankles, and classical texts therefore associate this rashi with complaints of the lower legs  -  cramps, sluggish circulation, swelling, and strains or fractures at the ankle. Shani's rulership adds the asthi dhatu (bones, joints and teeth) and a tendency toward slow-building, chronic conditions rather than sudden ones, while the vayu tattva points to vata disturbance showing up as dryness, irregular sleep and nervous depletion under long strain. Traditional regimen for this constitution emphasises warmth, steady daily routine, adequate rest and oil massage (abhyanga) of the legs and feet; any actual symptom, of course, belongs with a qualified physician rather than with a horoscope.",
    finance: "Kumbha is the labha bhava of the Kaal Purusha, the house of gains and income, so wealth here tends to arrive through networks, associations, elder patrons and collective enterprises rather than through solitary effort. Shani's manner with money is slow and earned: classical writers describe his wealth as arriving late but resting on something real, built by persistence rather than luck, and Kumbha natives are usually frugal, resistant to display, and quietly generous toward causes and dependents. The classical caution attached to Shani is the opposite one  -  that thrift can harden into anxiety about scarcity long after the scarcity has passed, and that the eleventh-house appetite for gain works best when it stays tied to work actually done.",
    compatibleWith: [
      "Taurus (Vrishabha)",
      "Libra (Tula)",
      "Gemini (Mithuna)"
    ],
    challengingWith: [
      "Virgo (Kanya)",
      "Scorpio (Vrishchika)",
      "Cancer (Karka)"
    ],
    remedies: [
      "Japa of Shani's mantra on Shanivar (Saturday), in the Shani hora where possible  -  the beeja mantra Om Praam Preem Praum Sah Shanaishcharaya Namah, or the simpler Om Sham Shanaishcharaya Namah, with 108 repetitions on a mala of black or iron beads.",
      "Recitation of the Dasharatha Krita Shani Stotra, and of the Hanuman Chalisa on Saturdays  -  Hanuman being the classical refuge from Shani's severity.",
      "Daan on Saturday: black sesame (kala til), urad dal, mustard oil, iron, black cloth and blankets given to the poor, to labourers, or to the elderly and disabled; feeding crows, Shani's vahana, is part of the same upaya.",
      "Shanivar vrat  -  a simple single meal taken on Saturdays, avoiding salt and oil-rich food, observed for a fixed number of Saturdays and concluded properly rather than abandoned midway.",
      "Blue sapphire (neelam) set in iron or panchadhatu, worn on the middle finger of the right hand, first put on at a Saturday sunrise after ritual purification. Neelam is the strongest of the gemstone upaya and also the quickest to act; it should be taken up only after a competent jyotishi has examined the strength and placement of Shani in the individual horoscope. A milder substitute is lighting a mustard-oil lamp beneath a Peepal tree on Saturday evening, alongside personal service to elders and workers, which the tradition regards as the upaya Shani accepts most readily of all."
    ]
  },
  {
    slug: "pisces",
    name: "Pisces",
    sanskrit: "Meena",
    symbol: "Two Fishes tied together, swimming in opposite directions",
    tagline: "Two fishes bound by a single thread  -  one swimming toward the world, one away from it.",
    number: 12,
    lord: "Jupiter",
    element: "Water (Jala)",
    quality: "Dual (Dwiswabhava)",
    nakshatras: [
      "Purva Bhadrapada",
      "Uttara Bhadrapada",
      "Revati"
    ],
    exalted: "Venus",
    debilitated: "Mercury",
    bodyPart: "Feet and lymphatic system",
    deity: "Bhagavan Vishnu, worshipped especially in his Matsya (fish) avatara; Brihaspati, guru of the devas, as the devata of the sign lord Guru",
    direction: "North (Uttara)",
    gemstone: "Yellow Sapphire (Pukhraj)",
    luckyDay: "Thursday",
    luckyColors: [
      "Yellow (peeta)",
      "Saffron and gold",
      "Sea green"
    ],
    luckyNumbers: [3, 9, 12],
    personality: "Meena is the twelfth and final rashi of the sidereal zodiac, a jala (water) sign of dwiswabhava (dual) quality ruled by Guru  -  Brihaspati, the graha of wisdom, faith and expansion. Where earlier rashis build and hold, Meena dissolves: it is the moksha sthana of the Kaal Purusha, and its natives carry an instinctive sense that the visible world is not the whole of the story. Jupiter's rulership gives them a broad, forgiving, dharmic temperament  -  listeners and teachers by nature, quick to see the good in a person and slow to condemn. The water element makes them deeply receptive, absorbing the mood of a room before a word is spoken, while the dual quality keeps them flexible, many-sided and rarely fixed in one position for long. Classically Meena is of Brahmin varna and is the one Ubhayodaya rashi, able to rise either way  -  a description the tradition connects to its two fishes, tied together yet swimming in opposite directions, one toward worldly duty and one toward release from it.",
    strengths: [
      "Deep compassion (daya) and an instinct to help before being asked",
      "Shraddha  -  a natural capacity for faith, devotion and surrender",
      "Intuition that reads a person or a situation before reasoning catches up",
      "Remarkable adaptability from the dwiswabhava quality; at ease with change and with many roles at once",
      "Guru-given breadth of mind: philosophical, tolerant, drawn to learning and to teaching others",
      "Generosity with money, time and forgiveness alike",
      "A fine artistic sensibility, especially for music, poetry and image"
    ],
    weaknesses: [
      "Difficulty deciding and holding to a decision; the two fishes pull opposite ways",
      "Porous boundaries  -  absorbs other people's burdens and moods as though they were its own",
      "A habit of idealising people, and quiet disappointment when they prove ordinary",
      "Escapism under pressure: withdrawal, daydreaming, or leaning on soothing habits",
      "Jupiterian excess  -  over-promising, over-giving, and letting practical order slip",
      "Sensitivity to criticism that can settle into lasting self-doubt"
    ],
    career: "Guru's rulership turns Meena toward work that involves counsel, meaning and care rather than combat or command, and the sign's people are usually at their best where sympathy is an asset rather than a liability. The dwiswabhava (dual) quality suits roles that change shape often and call for many skills at once, while the twelfth-house nature of the rashi in the Kaal Purusha classically links it to places set slightly apart from ordinary life  -  hospitals, ashrams, research institutions, ships, and foreign lands. Meena natives tend to flourish when someone steadier handles the hard administrative edges, leaving them free to do the work itself. Typical professions: teaching and academia; priesthood and temple service; jyotisha and the traditional sciences; law, advisory and trustee work; medicine, especially nursing, anaesthesia, psychiatry and palliative care; counselling and social work; charitable trusts and NGOs; music, poetry, film, photography and design; pharmaceuticals and chemicals; shipping, fisheries and marine work; hospitality; and careers built abroad or in import-export.",
    relationships: "Shukra (Venus), the graha of love and marriage, attains its exaltation in Meena, and this shows in the rashi's capacity for tender, undemanding, forgiving affection. Meena natives tend to give themselves fully to a partnership and to look for more than companionship in it  -  a shared faith, a shared sense of beauty, the feeling that the bond means something beyond convenience. The same idealism can make them slow to see a partner as they actually are, and tradition holds that they do best beside someone practical enough to keep the household's edges while they keep its heart. In the Vedic view, compatibility for marriage is judged from the Moon's rashi and nakshatra through Ashtakoota guna milana, together with the condition of the 7th house, its lord, and Venus and Jupiter  -  never from sign-to-sign generalities alone.",
    health: "In the Kaal Purusha, Meena governs the feet and the lymphatic system, and the classical texts accordingly associate the rashi with the feet and ankles, with fluid balance and swelling, and with the body's quieter work of drainage and immunity. As a jala (water) rashi ruled by Guru it carries a kapha-predominant tendency  -  a disposition toward damp, cold and heaviness, toward the medas (fat) dhatu and the liver that Jupiter signifies, and toward sleep that runs either too deep or too broken. Being unusually porous by temperament, Being unusually porous by temperament, Meena natives are classically described as sensitive to their surroundings and to whatever they take in, which the texts frame as a reason for regular hours and clean, restful environments - never as a reason to alter any treatment, which is a matter for a physician alone.",
    finance: "Guru is a benefic of the first order and rarely leaves Meena in real want, but the rashi occupies the vyaya (expenditure) portion of the Kaal Purusha, so wealth tends to move through the hands rather than settle in them. Classically, money reaches Meena through knowledge, counsel, care and grace  -  teaching, advisory work, healing, art, institutions and connections in distant places  -  and more often through other people's regard than through hard bargaining. The traditional caution concerns structure rather than earning: open-handed generosity, guarantees given for friends, and a distaste for accounts are the usual leaks, which is why classical writers commend plain record-keeping and a practical partner in money matters.",
    compatibleWith: [
      "Scorpio (Vrishchika)",
      "Sagittarius (Dhanu)",
      "Aries (Mesha)"
    ],
    challengingWith: [
      "Gemini (Mithuna)",
      "Virgo (Kanya)",
      "Libra (Tula)"
    ],
    remedies: [
      "Chant the Guru beeja mantra, Om Gram Greem Graum Sah Gurave Namah, 108 times on Thursday morning; the Vishnu Sahasranama or the Brihaspati stotra serve the same purpose for those who prefer a longer recitation.",
      "Keep the Brihaspativara vrat  -  a simple Thursday fast with a single yellow meal taken without salt, offered up to Guru and to Vishnu.",
      "Give daan of Guru's articles on a Thursday: chana dal, turmeric, ghee, yellow cloth, bananas or books, offered to a teacher, a priest, a student or a temple, and given quietly.",
      "Serve gurus, elders and teachers; offer water and light a lamp at a peepal tree on Thursday; feed cows with jaggery and gram.",
      "Pukhraj (yellow sapphire) set in gold, worn on the index finger on a Thursday, is the classical ratna of Guru  -  but a gemstone is prescribed only after a qualified jyotishi has read the whole chart, never from the rashi alone."
    ]
  },
];

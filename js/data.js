/* ============================================================
   data.js — بنك الأسئلة والبيانات الثابتة (عربي + English)
   The Call of the Wild · Interactive Quiz
   ============================================================ */

const CHAPTERS = {
  I:   "Into the Primitive",
  II:  "The Law of Club and Fang",
  III: "The Dominant Primordial Beast",
  IV:  "Who Has Won to Mastership",
  V:   "The Toil of Trace and Trail",
  VI:  "For the Love of a Man",
  VII: "The Sounding of the Call"
};

const CHAPTERS_AR = {
  I:   "إلى البدائية",
  II:  "قانون الهراوة والناب",
  III: "الوحش البدائي السائد",
  IV:  "من نال السيادة",
  V:   "مشقة الحزام والمسار",
  VI:  "من أجل حب إنسان",
  VII: "صوت النداء"
};

const PARTS = [
  { id: "sum",  game: "لعبة المزوِّر",  gameEn: "Forgery Game",      title: "ملخص الفصول",      titleEn: "Chapter Summaries",
    sub: "كل فصل له ملخص بأربع جمل، وواحدة منها مزوّرة. دوس على الجملة اللي مش من الرواية.",
    subEn: "Each chapter has a 4-sentence summary with one forged sentence. Tap the one that does not belong." },
  { id: "key",  game: "اسمع الصوت",     gameEn: "Hear the Voice",    title: "النقاط الرئيسية",   titleEn: "Key Moments",
    sub: "شخصيات بتتكلم، وغرائز بتصحى. اعرف مين قال إيه، وإيه اللي اتعلّمه باك وإيه اللي كان جواه.",
    subEn: "Characters speak, instincts awaken. Identify who said what and what Buck learned vs. what was already inside him." },
  { id: "thm",  game: "لوحة التحقيق",   gameEn: "Evidence Board",    title: "الموضوعات",         titleEn: "Themes",
    sub: "اربط المشاهد بالأفكار الكبيرة بخيوط، وبعدين حدّد باك فين بين الحضارة والبرية.",
    subEn: "Connect scenes to big ideas with threads, then place Buck on the civilization-to-wild spectrum." },
  { id: "core", game: "ساحة النقاش",    gameEn: "Debate Arena",      title: "أسئلة جوهرية",      titleEn: "Core Questions",
    sub: "مفيش إجابة واحدة صح. حدّد موقفك على المقياس واكتب سببك، وبعدين شوف إنت وصاحبك اختلفتوا فين.",
    subEn: "No single right answer. Set your position on the scale, write your reason, then see where you and your partner diverged." }
];

const QUESTIONS = [
  /* ================= ملخص الفصول: لعبة المزوِّر ================= */
  {
    id: "f1", part: "sum", ch: "I", type: "forged",
    sents: [
      "Manuel، مساعد البستاني عند القاضي Miller، باع باك عشان يجيب فلوس للعب القمار.",
      "باك اتحبس في صندوق خشب وفضل يومين من غير أكل ولا مياه.",
      "اشتراه Thornton ودخل معاه الشمال.",
      "راجل السويتر الأحمر علّمه قانون الهراوة، وباك خرج من الموضوع مهزوم لكن مش مكسور."
    ],
    sentsEn: [
      "Manuel, the gardener's helper at Judge Miller's, stole Buck to pay off his gambling debts.",
      "Buck was locked in a wooden crate and starved two days without food or water.",
      "John Thornton bought Buck and took him north across the trail.",
      "The man in the red sweater taught him the law of the club, leaving Buck beaten but not broken."
    ],
    fake: 2,
    truth: "اللي اشتراه فعلاً هو Perrault، ساعي الحكومة الكندية، ومعاه François. Thornton مبيظهرش إلا في الفصل الخامس.",
    truthEn: "It was actually Perrault, the Canadian government courier, and François who bought him. John Thornton does not appear until Chapter V.",
    why: "Perrault دفع تلتمية دولار بفلوس الحكومة، وباك اتشحن على السفينة Narwhal ناحية الشمال.",
    whyEn: "Perrault paid three hundred dollars of government funds, and Buck was shipped north aboard the Narwhal."
  },
  {
    id: "f2", part: "sum", ch: "II", type: "forged",
    sents: [
      "على شاطئ Dyea، باك بيشوف Curly بتتقتل وسط دايرة صامتة من الـ huskies.",
      "François بيلبّس باك الحزام لأول مرة، وDave بيعلّمه الشغل بعضّات خفيفة.",
      "باك بيقضي أول ليلة في الخيمة الدافية جنب Perrault وFrançois.",
      "بيتعلّم ينام تحت التلج بعد ما يشوف Billee متكوّر في حفرة."
    ],
    sentsEn: [
      "On the beach at Dyea, Buck watches Curly killed amid a silent circle of huskies.",
      "François harnesses Buck for the first time, while Dave teaches him the work with sharp warning nips.",
      "Buck spends his first freezing night sleeping inside the warm tent beside Perrault and François.",
      "He learns to sleep under the snow after observing Billee curled in a dugout hole."
    ],
    fake: 2,
    truth: "اتطرد من الخيمة بالشتايم والأواني، ونام في حفرة حفرها في التلج.",
    truthEn: "He was driven from the tent with curses and flying pots, and had to sleep in a hole scooped from the snow.",
    why: "ولما صحي مدفون تحت التلج حس بخوف قديم من الفخ، رغم إنه عمره ما جرّب فخ.",
    whyEn: "Waking buried under snow, he felt an ancient fear of the trap, though he had never experienced one before."
  },
  {
    id: "f3", part: "sum", ch: "III", type: "forged",
    sents: [
      "باك بيتحدى Spitz علناً ويحمي الكلاب اللي Spitz بيعاقبها.",
      "Dolly بتتجنن وبتعوي، وFrançois بيقتلها بالفأس.",
      "المعركة الأخيرة بتحصل بعد مطاردة أرنب، في ليلة مقمرة والدايرة بتتفرج.",
      "Perrault بيتدخل ويفصل بين باك وSpitz قبل ما حد يموت."
    ],
    sentsEn: [
      "Buck openly mutinies against Spitz, shielding the dogs Spitz attempts to discipline.",
      "Dolly goes mad and howls with rabies, and François kills her with an axe.",
      "The final battle erupts after a rabbit chase on a moonlit night as the pack encircles them.",
      "Perrault intervenes and separates Buck and Spitz before either dog is killed."
    ],
    fake: 3,
    truth: "محدش فصل المعركة. Spitz اتكسرت رجليه الأمامية واتقتل، وباك بقى leader الفريق.",
    truthEn: "No one stopped the fight. Spitz had both forelegs broken and was killed; Buck became the pack leader.",
    why: "دايرة الـ huskies قفلت على Spitz بالظبط زي ما قفلت على Curly قبله.",
    whyEn: "The silent circle of watching huskies closed in on Spitz exactly as they had closed in on Curly."
  },
  {
    id: "f4", part: "sum", ch: "IV", type: "forged",
    sents: [
      "François بيحاول يحط Sol-leks مكان باك كـ leader، فباك بيرفض لحد ما يبقى هو القائد.",
      "باك بيبقى قائد أحسن من Spitz، والفريق بيتحسّن في الشغل.",
      "Dave بيتعافى بعد استراحة قصيرة ويرجع يشتغل زي الأول.",
      "بعد Dawson، السواق بيتغيّر وبيبقى فيه Scotch half-breed والفريق بيجر البريد."
    ],
    sentsEn: [
      "François tries to put Sol-leks in the lead, but Buck obstinately refuses until given leadership.",
      "Buck proves a superior leader to Spitz, driving the team to record-breaking runs.",
      "Dave quickly recovers after a short rest and happily returns to pulling in his traces.",
      "After Dawson, the driver changes to a Scotch half-breed hauling heavy government mail pouches."
    ],
    fake: 2,
    truth: "Dave مرض ومات وهو في الحزام. اتضرب بالرصاص بعد ما صمم يفضل في مكانه.",
    truthEn: "Dave fell mortally ill in the traces. Refusing to leave his place, he was mercifully shot behind the river trees.",
    why: "الجملة دي مش بس معلومة. موت Dave هو اللي بيخلّي الفصل يتكلم عن الشغل كمعنى وكرامة.",
    whyEn: "Dave's death elevated sled-pulling into sacred purpose—pride in trace and trail that transcended life itself."
  },
  {
    id: "f5", part: "sum", ch: "V", type: "forged",
    sents: [
      "الفريق بيوصل Skaguay منهك، وبيتباع بعدها لـ Hal وCharles وMercedes.",
      "Hal وCharles بيحمّلوا الزلاجة حاجات كتير مالهاش لازمة، وMercedes بتركب عليها.",
      "Mercedes هي اللي بتنقذ باك من ضرب Hal.",
      "Thornton بيحذّرهم إن الجليد رقيق، لكن Hal بيضرب باك لما يرفض يتحرك."
    ],
    sentsEn: [
      "The exhausted team limps into Skaguay and is sold for a pittance to Hal, Charles, and Mercedes.",
      "Hal and Charles overload the sled with foolish luxuries, and Mercedes insists on riding.",
      "Mercedes compassionately protects Buck from Hal's brutal clubbing.",
      "Thornton warns them that the river ice is rotten, but Hal continues beating Buck when he refuses to rise."
    ],
    fake: 2,
    truth: "اللي أنقذ باك هو John Thornton. ضرب Hal على إيده بقبضة الفأس وقطع حبال باك بسكينه.",
    truthEn: "It was John Thornton who saved Buck, striking Hal's hand with the axe handle and cutting Buck free.",
    why: "وبعدها الجليد انهار بالزلاجة والبشر والكلاب، وThornton قال لباك: You poor devil.",
    whyEn: "Moments later, the rotten ice collapsed under the sled, humans, and dogs; Thornton whispered: You poor devil."
  },
  {
    id: "f6", part: "sum", ch: "VI", type: "forged",
    sents: [
      "Thornton بيراعي باك لحد ما يتعافى، وباك بيحبه حب مالوش مثيل.",
      "Thornton بيقول لباك Jump على حافة جرف، وباك بيكاد يقفز لولا إنه مسكه.",
      "باك بيهاجم Burton في حانة لما ضرب Thornton، وبيتبرّأ في miners' meeting.",
      "Thornton بيخسر الرهان قدام Matthewson لأن باك مش قادر يحرّك الحمولة."
    ],
    sentsEn: [
      "Thornton nurses Buck back to strength, forging a bond of boundless, passionate love.",
      "Thornton commands Buck to 'Jump!' toward a precipice, and Buck leaps until yanked back.",
      "Buck tears open Burton's throat in a saloon brawl to defend Thornton and is acquitted at a miners' meeting.",
      "Thornton loses his bet against Matthewson because Buck is unable to break out the frozen sled load."
    ],
    fake: 3,
    truth: "باك حرّك زلاجة محمّلة بألف رطل ومشى بيها مية ياردة، وكسّب Thornton ١٦٠٠ دولار.",
    truthEn: "Buck broke out a sled loaded with a thousand pounds of flour and hauled it one hundred yards, winning $1,600.",
    why: "Thornton كان اتورّط في الرهان بلسانه واستلف ألف دولار من Jim O'Brien. باك عمل ده عشان يرد له الجميل.",
    whyEn: "Thornton was trapped by his own boast and borrowed a thousand dollars from Jim O'Brien. Buck did it out of devotion."
  },
  {
    id: "f7", part: "sum", ch: "VII", type: "forged",
    sents: [
      "Thornton وشركاه بيسافروا للشرق يدوّروا على منجم مفقود بفلوس الرهان.",
      "باك بيسمع نداء غامض من الغابة وبيجري مع ذئب بري، وبعدين بيرجع لـ Thornton.",
      "باك بيطارد moose ضخم لحد ما يقدر عليه في آخر اليوم الرابع.",
      "Thornton بيلاقي المنجم ويرجع بيه لبيت القاضي Miller."
    ],
    sentsEn: [
      "Thornton and his partners head east into the wilderness seeking a legendary lost gold mine.",
      "Buck hears a mysterious call from the forest, runs with a wild timber wolf, but returns to Thornton.",
      "Buck stalks a colossal bull moose for four grueling days until finally pulling it down.",
      "Thornton discovers the mother lode and returns rich to Judge Miller's estate in California."
    ],
    fake: 3,
    truth: "الـ Yeehats قتلوا Thornton. باك انتقم منهم وسابهم، وانضم لقطيع الذئاب.",
    truthEn: "The Yeehats slaughtered Thornton. Buck massacred them in retribution and joined the wild wolf pack.",
    why: "بعدها بقى Ghost Dog في حكايات الـ Yeehats، وبيرجع كل خريف لوادي موت Thornton.",
    whyEn: "Buck became the legendary Ghost Dog of Yeehat lore, returning every autumn to mourn at Thornton's valley."
  },

  /* ================= النقاط الرئيسية: اسمع الصوت ================= */
  {
    id: "w1", part: "key", ch: "I", type: "who",
    quote: "Be a good dog and all'll go well and the goose hang high. Be a bad dog, and I'll whale the stuffin' outa you.",
    opts: ["Perrault", "الراجل ذو السويتر الأحمر", "Manuel", "صاحب الحانة"],
    optsEn: ["Perrault", "The Man in the Red Sweater", "Manuel", "The Saloonkeeper"],
    correct: 1,
    why: "كلام بعد الضرب بالهراوة: عرض صريح لقانون الهراوة. اطيع واتعامل كويس، اعصي وهتتضرب.",
    whyEn: "Spoken after the clubbing: a blunt declaration of the Law of the Club. Obey and live; rebel and be crushed."
  },
  {
    id: "w2", part: "key", ch: "I", type: "who",
    quote: "Twist it, an' you'll choke 'm plentee.",
    opts: ["Manuel", "Perrault", "François", "الراجل ذو السويتر الأحمر"],
    optsEn: ["Manuel", "Perrault", "François", "The Man in the Red Sweater"],
    correct: 0,
    why: "Manuel بيقولها وهو بيلف الحبل على رقبة باك، وبيسلّمه للغريب. دي لحظة الخيانة.",
    whyEn: "Manuel says this as he twists the rope around Buck's neck, handing him to the stranger. The moment of betrayal."
  },
  {
    id: "w3", part: "key", ch: "II", type: "who",
    quote: "Dat Buck, heem pool lak hell. I tich heem queek as anyt'ing.",
    opts: ["Perrault", "Hal", "François", "Thornton"],
    optsEn: ["Perrault", "Hal", "François", "Thornton"],
    correct: 2,
    why: "François بيمدح تعلّم باك السريع لـ Perrault. طريقة كلامه المكسّرة بتبين إنه French-Canadian half-breed.",
    whyEn: "François praises Buck's quick learning to Perrault in his characteristic French-Canadian dialect."
  },
  {
    id: "w4", part: "key", ch: "I", type: "who",
    quote: "Sacredam! Dat one dam bully dog! Eh? How moch?",
    opts: ["Perrault", "François", "Matthewson", "Hans"],
    optsEn: ["Perrault", "François", "Matthewson", "Hans"],
    correct: 0,
    why: "Perrault شاف باك عند راجل السويتر الأحمر وعرف إنه واحد في عشرة آلاف، واشتراه بفلوس الحكومة.",
    whyEn: "Perrault spotted Buck at the dog doctor's and recognized him as one in ten thousand, buying him on government funds."
  },
  {
    id: "w5", part: "key", ch: "VI", type: "who",
    quote: "It's uncanny.",
    opts: ["Hans", "Pete", "Thornton", "Jim O'Brien"],
    optsEn: ["Hans", "Pete", "Thornton", "Jim O'Brien"],
    correct: 1,
    why: "بيقولها Pete بعد ما Thornton طلب من باك يقفز من الجرف وباك كاد يقفز. Thornton ردّ: It is splendid, and it is terrible, too.",
    whyEn: "Pete gasps this after Thornton commanded Buck to leap off a cliff and pulled him back at the brink."
  },
  {
    id: "w6", part: "key", ch: "VI", type: "who",
    quote: "I've got a thousand dollars that says he can't.",
    opts: ["Jim O'Brien", "Matthewson", "Black Burton", "ملك Skookum Bench"],
    optsEn: ["Jim O'Brien", "Matthewson", "Black Burton", "The King of the Skookum Benches"],
    correct: 1,
    why: "Matthewson هو الـ Bonanza King اللي رمى كيس الدهب على البار ونادى بلوف Thornton.",
    whyEn: "Matthewson, the Bonanza King, slams his sack of gold dust on the saloon bar, calling Thornton's boast."
  },
  {
    id: "sort1", part: "key", ch: "", type: "sort",
    q: "غريزة موروثة ولا اتعلّمه؟ صنّف كل موقف من حياة باك.",
    qEn: "Inherited instinct or learned by experience? Classify each moment from Buck's life.",
    labels: ["غريزة موروثة", "اتعلّمه بالتجربة"],
    labelsEn: ["Inherited Instinct", "Learned by Experience"],
    items: [
      { t: "اتخض من إحساس إنه محبوس تحت التلج من غير ما يجرّب فخ قبل كده", a: 0 },
      { t: "حفر حفرة ينام فيها بعد ما شاف Billee", a: 1 },
      { t: "عرف إن اللي معاه هراوة لازم يتطاع", a: 1 },
      { t: "حسّ إن الجليد رقيق ورفض يقوم", a: 0 },
      { t: "بقى يفهم أوامر زي ho وmush", a: 1 },
      { t: "حلم بالراجل الشعراني قاعد جنب النار", a: 0 },
      { t: "بقى يتجنب الجانب الأعمى لـ Sol-leks", a: 1 },
      { t: "حسّ بنداء غامض من الغابة وجري ناحيته", a: 0 }
    ],
    itemsEn: [
      { t: "Panic at being trapped under snow without ever having experienced a trap", a: 0 },
      { t: "Digging a sleeping burrow in the snow after watching Billee", a: 1 },
      { t: "Knowing that a man wielding a club is a lawgiver to be obeyed", a: 1 },
      { t: "Sensing that the spring river ice is rotten and refusing to rise", a: 0 },
      { t: "Understanding sled commands like 'ho' and 'mush'", a: 1 },
      { t: "Dreaming of the ancient hairy man crouching by the campfire", a: 0 },
      { t: "Avoiding Sol-leks's blind side to prevent being slashed", a: 1 },
      { t: "Hearing the haunting call from the wild forest and running toward it", a: 0 }
    ],
    why: "الغريزة ظهرت في اللحظات اللي باك ما اتعلّمهاش فيها: خوف الفخ، حس الجليد، الأحلام، والنداء. أما الهراوة وmush وSol-leks وحفرة التلج فاتعلّمها بالتجربة أو بالملاحظة.",
    whyEn: "Instinct awoke in untaught moments: ancestral fear of traps, rotten ice sense, racial memories, and the wild call. Club law, harness commands, and snow burrows were learned."
  },

  /* ================= الموضوعات: لوحة التحقيق ================= */
  {
    id: "board1", part: "thm", ch: "", type: "board",
    q: "اربط كل مشهد بالفكرة الكبيرة اللي بيدل عليها. دوس على مشهد وبعدين على فكرة، وهيتشدّ خيط بينهم.",
    qEn: "Connect each scene to the central theme it illustrates. Tap a scene, then tap a theme to draw a thread between them.",
    pairs: [
      { l: "راجل الهراوة يكسر عناد باك",                   r: "القوة هي القانون" },
      { l: "باك يسمع نداء الغابة ويجري ورا ذئب",           r: "عودة الغريزة" },
      { l: "باك ينقذ Thornton من الرابيدز",                 r: "الولاء والحب" },
      { l: "Hal وCharles وMercedes يتخانقوا بدل ما يشتغلوا", r: "غرور الإنسان" },
      { l: "Dave يرفض يسيب الحزام وهو مريض",               r: "الشغل والكرامة" }
    ],
    pairsEn: [
      { l: "The man in the red sweater breaks Buck's defiance", r: "The Law of Club and Fang" },
      { l: "Buck answers the wild call and runs with the wolf", r: "The Primordial Call" },
      { l: "Buck risks his life in the rapids to rescue Thornton", r: "Devotion and Love" },
      { l: "Hal, Charles, and Mercedes bicker instead of working", r: "Human Folly and Hubris" },
      { l: "Dave refuses to leave the harness while dying",        r: "Pride of Trace and Trail" }
    ],
    why: "كل مشهد دليل على فكرة. حفظ المشهد ومعاه الفكرة هو أقصر طريق لأي إجابة في الامتحان.",
    whyEn: "Every scene is evidence of a deeper theme. Mapping dramatic scenes to core concepts is the swiftest route to understanding Jack London's vision."
  },
  {
    id: "meter1", part: "thm", ch: "", type: "meter",
    q: "اضبط مؤشر باك بين الحضارة والبرية في أربع لحظات. حرّك كل مؤشر، وبعدين ثبّت.",
    qEn: "Set Buck's position between Civilization and Wilderness across four turning points. Adjust each slider, then lock in.",
    ends: ["حضارة", "برية"],
    endsEn: ["Civilization", "Wilderness"],
    moments: [
      { t: "بعد ما اتضرب بالهراوة (الفصل I)",           lo: 10, hi: 35 },
      { t: "بعد ما قتل Spitz وبقى leader (الفصل III)",  lo: 45, hi: 72 },
      { t: "وهو عند Thornton على النهر (الفصل VI)",      lo: 50, hi: 80 },
      { t: "آخر الرواية، Ghost Dog (الفصل VII)",         lo: 90, hi: 100 }
    ],
    momentsEn: [
      { t: "After being clubbed by the man in red (Ch. I)",          lo: 10, hi: 35 },
      { t: "After killing Spitz and becoming lead dog (Ch. III)",     lo: 45, hi: 72 },
      { t: "Resting with Thornton beside the river (Ch. VI)",         lo: 50, hi: 80 },
      { t: "At novel's end as the legendary Ghost Dog (Ch. VII)",     lo: 90, hi: 100 }
    ],
    why: "التحول ما حصلش مرة واحدة. كان مرحلة بعد مرحلة: الهراوة، القيادة، ثم الحب اللي بيمسك باك على حافة، وفي الآخر النداء بيكسب. مدى الإجابة واسع عمداً، المهم الاتجاه.",
    whyEn: "Buck's transformation was an inexorable progression from pampered pet, to sled dog, to wild apex predator."
  },

  /* ================= أسئلة جوهرية: ساحة النقاش ================= */
  {
    id: "d1", part: "core", ch: "VII", type: "debate",
    q: "في آخر الرواية، باك بقى وحش مش بطل.",
    qEn: "By the end of the novel, Buck has become a savage beast rather than a hero.",
    ends: ["مش موافق خالص", "موافق جداً"],
    endsEn: ["Strongly Disagree", "Strongly Agree"],
    pro: "بيقتل الـ Yeehats من غير رحمة، وبيتحول لأسطورة مخيفة، وبيقطع آخر رباط ببشر.",
    proEn: "He slaughters the Yeehats mercilessly, becomes a dreaded specter of death, and severs every tie to humanity.",
    con: "الغريزة كانت جواه من الأول، والحضارة كانت قشرة. هو رجع لطبيعته، وبقى قائد عادل لقطيعه.",
    conEn: "Primal instinct was inside him from birth; civilization was merely a veneer. He reclaimed his ancient birthright as pack leader."
  },
  {
    id: "d2", part: "core", ch: "I", type: "debate",
    q: "لو باك فضل في بيت القاضي Miller، كان هيبقى أسعد.",
    qEn: "If Buck had stayed at Judge Miller's estate, he would have lived a happier life.",
    ends: ["مش موافق خالص", "موافق جداً"],
    endsEn: ["Strongly Disagree", "Strongly Agree"],
    pro: "أمان وأكل وحب عيلة، ومن غير ضرب ولا جوع ولا موت أصحابه.",
    proEn: "Safety, comfort, delicious food, and gentle family love, without starvation, clubbings, or bloody death.",
    con: "الرحلة طلّعت أحسن ما فيه: القوة والذكاء والمعنى. الراحة ما كانتش هتديله ده.",
    conEn: "The harsh North forged his true greatness: strength, cunning, vitality, and heroic purpose that luxury could never offer."
  },
  {
    id: "d3", part: "core", ch: "VI", type: "debate",
    q: "حب Thornton هو اللي أخّر باك عن النداء، وبعد موته بقى حر.",
    qEn: "Thornton's love was what delayed Buck from answering the call; only his death set Buck truly free.",
    ends: ["مش موافق خالص", "موافق جداً"],
    endsEn: ["Strongly Disagree", "Strongly Agree"],
    pro: "كل ما يسمع النداء كان بيرجع للنار عشان Thornton. ولما مات انقطع آخر خيط.",
    proEn: "Whenever Buck answered the forest call, he returned to the campfire for Thornton. Death broke the last humane chain.",
    con: "النداء كان هيكسب في الآخر مهما حصل، والحب كان سبب إنه اتأخر مش إنه اتوقف.",
    conEn: "The wild call was inevitable; Thornton's love was a sanctuary of reverence and pride, not an impediment."
  },
  {
    id: "d4", part: "core", ch: "V", type: "debate",
    q: "Hal وCharles وMercedes هم الأشرار الحقيقيين في الرواية، أكتر من Manuel.",
    qEn: "Hal, Charles, and Mercedes are the true villains of the novel, far worse than Manuel.",
    ends: ["مش موافق خالص", "موافق جداً"],
    endsEn: ["Strongly Disagree", "Strongly Agree"],
    pro: "عن جهل وغرور ماتت كلاب كتير، وما سمعوش تحذير. ضرر أكبر من خيانة Manuel.",
    proEn: "Through stubborn arrogance and foolish vanity, they starved and murdered an entire team, ignoring every warning.",
    con: "Manuel هو اللي ابتدأ كل حاجة بالخيانة، وHal وأصحابه مجرد ناس قليلة الخبرة مش أشرار.",
    conEn: "Manuel committed cold calculated betrayal against a family dog; Hal and company were incompetent fools rather than criminals."
  },
  {
    id: "d5", part: "core", ch: "VII", type: "debate",
    q: "نهاية الرواية حزينة أكتر ما هي حرة.",
    qEn: "The conclusion of the novel is tragic rather than triumphant.",
    ends: ["مش موافق خالص", "موافق جداً"],
    endsEn: ["Strongly Disagree", "Strongly Agree"],
    pro: "باك بيروح الوادي كل سنة يبكي. الحرية جت بتمن، وهو فقد الوحيد اللي حبه.",
    proEn: "Buck returns to the valley each autumn to mourn and howl. His freedom cost him the only human being he ever loved.",
    con: "اتحرر وبقى قائد وأسطورة. الحزن جزء من الحياة لكن الأولوية للنداء.",
    conEn: "Buck achieved immortal freedom as apex leader and legend. Grief is part of life, but the primordial call reigns supreme."
  },
  {
    id: "d6", part: "core", ch: "", type: "debate",
    q: "الحضارة قشرة رقيقة فوق الغريزة، في الكلاب وفي البشر.",
    qEn: "Civilization is merely a thin veneer over primal instinct—in beasts and humans alike.",
    ends: ["مش موافق خالص", "موافق جداً"],
    endsEn: ["Strongly Disagree", "Strongly Agree"],
    pro: "باك رجع لغريزته بسرعة، والبشر في البرية (زي Hal) بيتصرفوا بجهل وأنانية.",
    proEn: "Buck reverted to ancient instincts within weeks, while civilized humans like Hal quickly descend into barbarism.",
    con: "Thornton وPerrault بيبينوا إن الحضارة ممكن تعني عدل ورحمة وخبرة، مش بس قشرة.",
    conEn: "Figures like John Thornton and François demonstrate that true civilization means justice, loyalty, and competence."
  },
  {
    id: "c1", part: "core", ch: "", type: "open",
    q: "ليه اختار Jack London إن بطل الرواية يكون كلب بدل إنسان؟ إيه اللي قدر يوصّله بالشكل ده؟",
    qEn: "Why did Jack London choose a dog rather than a human as the protagonist? What did this perspective uniquely achieve?",
    model: "• الكلب ما بيخبّيش غريزته ولا بيتجمّل زي البشر، فالقارئ يشوف الغريزة عارية.
• نقدر نتابع التحول من الحضارة للبرية من غير تعقيدات اجتماعية.
• London كاتب من مدرسة الـ naturalism: البيئة والوراثة بتحكم في المصير.
• القارئ بيتعاطف جداً مع حيوان، فقسوة الإنسان والطبيعة بتأثر أكتر.
• السرد بيدخل أفكار باك (anthropomorphism خفيف) فبيقرّب لنا الفكرة.",
    modelEn: "• A dog does not rationalize or disguise primal instincts, giving readers an unmasked view of nature.
• Traces the stark regression from civilization to wild free of societal moralizing.
• London writes from literary Naturalism: heredity and environment govern ultimate destiny.
• Readers empathize deeply with a faithful animal, intensifying the cruelty of nature and humans.
• Light anthropomorphism invites readers directly into Buck's sensory and instinctual awakening."
  },
  {
    id: "c2", part: "core", ch: "I", type: "open",
    q: "الرواية بتقول عن باك بعد الهراوة: «He was beaten, but he was not broken». إيه الفرق بين إنك تتهزم وإنك تتكسر؟ وفين شفت الفرق ده تاني؟",
    qEn: "The novel says of Buck after the club: 'He was beaten, but he was not broken.' What is the difference between being beaten and being broken? Where else does this theme appear?",
    model: "• Beaten: اتهزم جسدياً. Broken: اتكسرت إرادته وكرامته.
• باك أطاع ظاهرياً لكن فضل بيراقب وبيتعلم، ودهاؤه صحي.
• نفس الفكرة: Dave رفض ينفصل عن الشغل، Spitz حارب لآخر لحظة، وباك رفض يقوم لما Hal ضربه على الجليد.
• في المقابل: الكلاب اللي كانت بتتذلل وتلحس إيد الراجل بعد الضرب هي اللي اتكسرت.",
    modelEn: "• Beaten: Physical defeat of the body. Broken: Crushing of inner spirit, pride, and self-respect.
• Buck bowed to superior force to survive, but remained watchful, proud, and defiant.
• Mirrors Dave refusing to yield his harness, Spitz fighting to the last fang, and Buck defying Hal on rotting ice.
• In contrast, dogs that groveled and licked the club-man's boots were truly broken."
  },
  {
    id: "c3", part: "core", ch: "VII", type: "open",
    q: "اكتب سؤال واحد كنت هتسأله لباك في آخر الرواية، وتخيّل هيرد بإيه.",
    qEn: "Write one question you would ask Buck at the end of the novel, and imagine how he would respond.",
    model: "مفيش إجابة صح. الإجابات القوية هي اللي بتربط السؤال بفكرة من الرواية. مثلاً: «وحشك Thornton؟» والرد: «مش وحش، ده الراجل اللي علّمني إن في حاجة اسمها حب.» أو «إنت اخترت ولا النداء اختارك؟»",
    modelEn: "No single correct answer. Insightful answers tie to key themes, such as: 'Do you miss Thornton?' — 'I do not miss men, but every autumn I sing love to his memory by the river.' Or: 'Did you choose the wild, or did the wild choose you?'"
  }
];

const CHAPTER_KEY = {
  I:   "Manuel يبيع باك. بيتضرب بالهراوة، بيتعلم قانونها، وبيتباع لـ Perrault وFrançois. بيتشحن على سفينة Narwhal ويشوف الثلج لأول مرة.",
  II:  "شاطئ Dyea: موت Curly، أول شغل في الحزام، تعارف على Dave وSol-leks وSpitz، وأول ليلة ينام فيها تحت التلج.",
  III: "التمرد على Spitz. Dolly تتجنن، مطاردة الأرنب، والمعركة اللي بتنتهي بموت Spitz وبقاء باك leader.",
  IV:  "باك قائد ممتاز، رحلة Dawson، الشعراني في الأحلام، وموت Dave في الحزام.",
  V:   "Hal وCharles وMercedes يشتروا الفريق، رحلة كارثية، Thornton ينقذ باك، والجليد ينهار.",
  VI:  "باك يحب Thornton، يدافع عنه ضد Burton، ينقذه في النهر، ويكسب رهان الألف رطل.",
  VII: "البحث عن المنجم المفقود، النداء بيزيد، قتل الـ moose، موت Thornton، انتقام باك، وانضمامه للذئاب."
};

const CHAPTER_KEY_EN = {
  I:   "Manuel sells Buck. Clubbed by the man in red, taught the Law of Club and Fang, sold to Perrault and François, and shipped north to see snow.",
  II:  "Dyea beach: Curly's tragic death, first time in harness, meeting Dave, Sol-leks, and Spitz, and learning to burrow in the snow.",
  III: "Mutiny against Spitz. Dolly's rabies madness, the moonlight rabbit chase, and the death match where Buck slays Spitz.",
  IV:  "Buck thrives as team leader, the grueling Dawson mail run, visions of the ancient hairy man, and Dave's heroic death in the traces.",
  V:   "Hal, Charles, and Mercedes buy the team; a catastrophic journey ending when John Thornton saves Buck before the ice collapses.",
  VI:  "Buck's devoted love for Thornton, defending him from Burton, rescuing him in the rapids, and breaking out the 1,000-lb sled.",
  VII: "The search for the lost mine, the sounding of the call, slaying the bull moose, Thornton's murder, Buck's vengeance, and joining the wolf pack."
};

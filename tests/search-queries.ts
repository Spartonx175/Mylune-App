// Realistic things she would type, per list, in French and English. Used by the search stress test.
// A query "passes" when at least one of its acceptable answers appears in the top 5 results (by any name).
// Format: [query, ...acceptable normalized name fragments]. A fragment matches when any name of a top-5 item contains it.

export type Q = [string, ...string[]];

export const FOOD_QUERIES: Q[] = [
  // cheese
  ["feta", "feta"], ["burrata", "burrata"], ["mozzarella", "mozzarella"], ["mozarella", "mozzarella"], ["halloumi", "halloumi"],
  ["ricotta", "ricotta"], ["mascarpone", "mascarpone"], ["parmesan", "parmesan"], ["parmigiano", "parmesan", "parmigiano"],
  ["grana padano", "grana", "parmesan"], ["pecorino", "pecorino"], ["gorgonzola", "gorgonzola"], ["roquefort", "roquefort"],
  ["fromage bleu", "bleu", "roquefort"], ["camembert", "camembert"], ["camambert", "camembert"], ["brie", "brie"],
  ["coulommiers", "coulommiers", "brie"], ["chevre", "chevre", "goat"], ["fromage de chevre", "chevre", "goat"], ["goat cheese", "chevre", "goat"],
  ["boursin", "boursin", "fromage frais", "cream cheese"], ["philadelphia", "philadelphia", "cream cheese", "fromage frais"],
  ["cream cheese", "cream cheese", "fromage frais", "philadelphia"], ["cottage cheese", "cottage", "fromage blanc", "fromage frais"],
  ["emmental", "emmental"], ["gruyere", "gruyere"], ["comte", "comte"], ["cheddar", "cheddar"], ["gouda", "gouda"],
  ["edam", "edam", "gouda"], ["babybel", "babybel", "fromage"], ["vache qui rit", "vache qui rit", "fromage fondu", "processed"],
  ["raclette", "raclette"], ["reblochon", "reblochon"], ["munster", "munster"], ["epoisses", "epoisses", "munster"],
  ["saint marcellin", "marcellin"], ["mont d or", "mont d or", "vacherin"], ["fromage frais", "fromage frais", "frais"],
  ["faisselle", "faisselle", "fromage blanc"], ["skyr", "skyr", "yaourt", "yogurt"], ["paneer", "paneer"], ["tzatziki", "tzatziki"],
  ["fromage rape", "rape", "grated"], ["fondue", "fondue"], ["tartiflette", "tartiflette"], ["pizza", "pizza"], ["croque monsieur", "croque"],
  ["fromage au lait cru", "lait cru", "raw"], ["fromage", "fromage", "cheese"], ["cheese", "cheese", "fromage"],
  // charcuterie / meat
  ["jambon", "jambon", "ham"], ["jambon cru", "jambon cru", "prosciutto", "cured ham"], ["prosciutto", "prosciutto", "jambon"],
  ["serrano", "serrano", "jambon"], ["saucisson", "saucisson"], ["chorizo", "chorizo"], ["salami", "salami"], ["pate", "pate"],
  ["rillettes", "rillettes"], ["foie gras", "foie gras"], ["steak tartare", "tartare"], ["carpaccio", "carpaccio"],
  ["bacon", "bacon", "lardons"], ["lardons", "lardons", "bacon"], ["merguez", "merguez"], ["andouillette", "andouillette"],
  ["boudin", "boudin"], ["hot dog", "hot dog", "saucisse"], ["kebab", "kebab"], ["nuggets", "nuggets"], ["poulet", "poulet", "chicken"],
  ["chicken", "chicken", "poulet"], ["canard", "canard", "duck"], ["magret", "magret", "canard"], ["lapin", "lapin", "rabbit"],
  ["agneau", "agneau", "lamb"], ["steak", "steak", "boeuf", "beef"], ["boeuf", "boeuf", "beef"], ["porc", "porc", "pork"],
  ["foie de veau", "foie"], ["foie", "foie", "liver"], ["saucisse", "saucisse", "sausage"], ["viande hachee", "hache", "mince", "ground"],
  ["hamburger", "burger", "hamburger"], ["viande", "viande", "meat"], ["viande saignante", "saignant", "rare", "viande"],
  // fish / seafood
  ["saumon fume", "saumon fume", "smoked salmon"], ["smoked salmon", "smoked salmon", "saumon fume"], ["saumon", "saumon", "salmon"],
  ["sushi", "sushi"], ["sashimi", "sashimi"], ["maki", "maki", "sushi"], ["thon", "thon", "tuna"], ["tuna", "tuna", "thon"],
  ["thon en boite", "thon", "tuna", "canned"], ["espadon", "espadon", "swordfish"], ["requin", "requin", "shark"], ["maquereau", "maquereau", "mackerel"],
  ["sardines", "sardine"], ["anchois", "anchois", "anchovies"], ["hareng", "hareng", "herring"], ["tarama", "tarama"], ["surimi", "surimi"],
  ["crevettes", "crevette", "shrimp", "prawn"], ["huitres", "huitre", "oyster"], ["moules", "moule", "mussel"], ["coquilles saint jacques", "saint jacques", "scallop"],
  ["homard", "homard", "lobster"], ["crabe", "crabe", "crab"], ["calamars", "calamar", "squid"], ["poulpe", "poulpe", "octopus"], ["caviar", "caviar"],
  ["poisson cru", "poisson cru", "raw fish"], ["ceviche", "ceviche", "poisson cru", "raw fish"], ["poke bowl", "poke", "sushi", "poisson cru"],
  ["poisson", "poisson", "fish"], ["fish", "fish", "poisson"], ["cabillaud", "cabillaud", "cod"], ["truite", "truite", "trout"], ["bar", "bar", "sea bass"],
  ["fruits de mer", "fruits de mer", "seafood"], ["fish and chips", "fish and chips", "poisson"],
  // eggs
  ["oeuf mollet", "mollet", "soft boiled"], ["oeuf", "oeuf", "egg"], ["egg", "egg", "oeuf"], ["oeufs", "oeuf", "egg"], ["oeuf dur", "oeuf dur", "hard boiled", "dur"],
  ["oeuf au plat", "au plat", "fried egg"], ["mayonnaise", "mayonnaise", "mayo"], ["mousse au chocolat", "mousse"], ["tiramisu", "tiramisu"],
  ["creme brulee", "brulee"], ["meringue", "meringue"], ["pate a gateau crue", "pate", "cookie dough", "raw"], ["omelette", "omelette"],
  ["oeuf poche", "poche", "poached"], ["oeuf a la coque", "coque", "soft boiled"], ["creme anglaise", "creme anglaise", "custard"], ["sauce hollandaise", "hollandaise"],
  ["sauce bearnaise", "bearnaise"], ["glace", "glace", "ice cream"], ["ice cream", "ice cream", "glace"], ["tarte au citron meringuee", "meringue", "citron"],
  // fruit / veg / other
  ["ananas", "ananas", "pineapple"], ["papaye", "papaye", "papaya"], ["mangue", "mangue", "mango"], ["litchi", "litchi", "lychee"], ["kiwi", "kiwi"],
  ["melon", "melon"], ["pasteque", "pasteque", "watermelon"], ["avocat", "avocat", "avocado"], ["pomme", "pomme", "apple"], ["banane", "banane", "banana"],
  ["fraises", "fraise", "strawberr"], ["framboises", "framboise", "raspberr"], ["raisin", "raisin", "grape"], ["datte", "datte", "date"], ["figue", "figue", "fig"],
  ["germes de soja", "germe", "sprout"], ["graines germees", "germe", "sprout"], ["alfalfa", "alfalfa", "germe", "sprout"], ["salade en sachet", "sachet", "salad", "salade"],
  ["salade", "salade", "salad"], ["persil", "persil", "parsley"], ["coriandre", "coriandre", "coriander"], ["gingembre", "gingembre", "ginger"],
  ["curcuma", "curcuma", "turmeric"], ["reglisse", "reglisse", "liquorice", "licorice"], ["champignons", "champignon", "mushroom"], ["miel", "miel", "honey"],
  ["noix de cajou", "cajou", "cashew"], ["cacahuetes", "cacahuete", "peanut"], ["amandes", "amande", "almond"], ["sesame", "sesame"], ["tahini", "tahini", "sesame"],
  ["houmous", "houmous", "hummus"], ["falafel", "falafel"], ["tofu", "tofu"], ["edamame", "edamame", "soja"], ["algues", "algue", "seaweed"], ["spiruline", "spiruline"],
  ["nori", "nori", "algue"], ["nutella", "nutella", "pate a tartiner", "chocolat"], ["chocolat", "chocolat", "chocolate"], ["chewing gum", "chewing", "gum"],
  ["edulcorant", "edulcorant", "sweetener"], ["stevia", "stevia", "edulcorant"], ["ail", "ail", "garlic"], ["oignon", "oignon", "onion"], ["piment", "piment", "chili", "chilli"],
  ["moutarde", "moutarde", "mustard"], ["wasabi", "wasabi"], ["sauce soja", "soja", "soy"], ["cornichons", "cornichon", "pickle"], ["olives", "olive"],
  ["kimchi", "kimchi"], ["choucroute", "choucroute", "sauerkraut"], ["yaourt", "yaourt", "yogurt", "yoghurt"], ["kefir", "kefir"], ["tomate", "tomate", "tomato"],
  ["pates", "pate", "pasta"], ["riz", "riz", "rice"], ["pain", "pain", "bread"], ["quinoa", "quinoa"], ["lentilles", "lentille", "lentil"], ["pois chiches", "pois chiche", "chickpea"],
  ["brocoli", "brocoli", "broccoli"], ["carottes", "carotte", "carrot"], ["epinards", "epinard", "spinach"], ["chou", "chou", "cabbage"], ["courgette", "courgette", "zucchini"],
  ["pomme de terre", "pomme de terre", "potato"], ["frites", "frite", "fries"], ["pizza surgelee", "pizza"], ["plat prepare", "plat", "ready"], ["soupe", "soupe", "soup"],
  ["bouillon", "bouillon", "stock"], ["sandwich", "sandwich"], ["sandwich jambon beurre", "sandwich", "jambon"], ["salade de fruits", "salade de fruits", "fruit salad"],
  ["jus de fruits", "jus", "juice"], ["compote", "compote"], ["confiture", "confiture", "jam"], ["beurre", "beurre", "butter"], ["creme fraiche", "creme"], ["lait", "lait", "milk"],
  ["lait cru", "lait cru", "raw milk"], ["lait de coco", "coco", "coconut"], ["huile d olive", "huile", "olive oil"], ["vinaigre", "vinaigre", "vinegar"], ["sel", "sel", "salt"],
  ["sucre", "sucre", "sugar"], ["biscuit", "biscuit", "cookie"], ["gateau", "gateau", "cake"], ["croissant", "croissant"], ["fruits secs", "fruit sec", "dried fruit"],
];

export const DRINK_QUERIES: Q[] = [
  ["cafe", "cafe", "coffee"], ["coffee", "coffee", "cafe"], ["cafe decafeine", "decafeine", "decaf"], ["the", "the", "tea"], ["tea", "tea", "the"], ["the vert", "the vert", "green tea"],
  ["green tea", "green tea", "the vert"], ["tisane", "tisane", "herbal"], ["infusion", "infusion", "tisane", "herbal"], ["kombucha", "kombucha"], ["jus d orange", "orange", "juice", "jus"],
  ["jus de fruits", "jus", "juice"], ["smoothie", "smoothie"], ["red bull", "red bull", "energy", "energie"], ["boisson energisante", "energisante", "energy"], ["coca", "coca", "cola"],
  ["coca zero", "zero", "diet", "light", "cola"], ["soda", "soda"], ["vin", "vin", "wine"], ["biere", "biere", "beer"], ["biere sans alcool", "sans alcool", "alcohol free", "alcohol-free"],
  ["champagne", "champagne"], ["cidre", "cidre", "cider"], ["eau gazeuse", "gazeuse", "sparkling"], ["eau du robinet", "robinet", "tap"], ["eau", "eau", "water"],
  ["lait", "lait", "milk"], ["lait d amande", "amande", "almond"], ["matcha", "matcha"], ["chai", "chai"], ["the glace", "glace", "iced"], ["gingembre", "gingembre", "ginger"],
  ["tisane de framboisier", "framboisier", "raspberry leaf"], ["menthe", "menthe", "mint"], ["camomille", "camomille", "chamomile"], ["alcool", "alcool", "alcohol"], ["cocktail", "cocktail"],
  ["mocktail", "mocktail", "sans alcool"], ["limonade", "limonade", "lemonade"], ["chocolat chaud", "chocolat", "hot chocolate"], ["eau de coco", "coco", "coconut"],
  ["jus de pamplemousse", "pamplemousse", "grapefruit"], ["jus de canneberge", "canneberge", "cranberry"], ["boisson au soja", "soja", "soy"], ["lait cru", "lait cru", "raw milk"],
];

export const EXERCISE_QUERIES: Q[] = [
  ["marche", "marche", "walking"], ["walking", "walking", "marche"], ["course", "course", "running"], ["running", "running", "course"], ["jogging", "jogging", "course", "running"],
  ["natation", "natation", "swimming"], ["swimming", "swimming", "natation"], ["yoga", "yoga"], ["pilates", "pilates"], ["velo", "velo", "cycling", "bike"],
  ["musculation", "musculation", "weights", "strength"], ["crossfit", "crossfit"], ["danse", "danse", "dance"], ["equitation", "equitation", "horse"], ["ski", "ski"],
  ["plongee", "plongee", "diving"], ["escalade", "escalade", "climbing"], ["tennis", "tennis"], ["boxe", "boxe", "boxing"], ["aquagym", "aquagym", "water"], ["sauna", "sauna"],
  ["hammam", "hammam"], ["jacuzzi", "jacuzzi", "hot tub"], ["abdos", "abdo", "abs", "abdominal"], ["gainage", "gainage", "plank"], ["trampoline", "trampoline"], ["golf", "golf"],
  ["randonnee", "randonnee", "hiking"], ["velo d appartement", "velo", "stationary", "bike"], ["zumba", "zumba"], ["football", "football", "soccer"], ["volley", "volley"],
  ["squat", "squat"], ["pompes", "pompe", "push"], ["etirements", "etirement", "stretch"], ["fitness", "fitness"], ["sport", "sport", "exercise"], ["rollers", "roller", "skating"],
  ["patin", "patin", "skat"], ["surf", "surf"], ["kayak", "kayak"], ["rameur", "rameur", "rowing"], ["elliptique", "elliptique", "elliptical"], ["rapports sexuels", "sexuel", "sex"],
  ["porter des charges", "charge", "lifting"], ["menage", "menage", "housework"], ["jardinage", "jardinage", "gardening"], ["voyage en avion", "avion", "flying", "flight"],
];

export const MEDICINE_QUERIES: Q[] = [
  ["doliprane", "doliprane"], ["paracetamol", "paracetamol"], ["efferalgan", "efferalgan"], ["dafalgan", "dafalgan"], ["ibuprofene", "ibuprofene", "ibuprofen"],
  ["advil", "advil"], ["nurofen", "nurofen"], ["aspirine", "aspirine", "aspirin"], ["spasfon", "spasfon"], ["smecta", "smecta"], ["gaviscon", "gaviscon"], ["maalox", "maalox"],
  ["imodium", "imodium", "loperamide"], ["forlax", "forlax"], ["strepsils", "strepsils"], ["humex", "humex"], ["actifed", "actifed"], ["rhinadvil", "rhinadvil"],
  ["ventoline", "ventoline", "salbutamol"], ["antibiotique", "antibiotique", "antibiotic", "amoxicilline"], ["amoxicilline", "amoxicilline", "amoxicillin"],
  ["omeprazole", "omeprazole"], ["levothyrox", "levothyrox", "levothyroxine"], ["magnesium", "magnesium"], ["fer", "fer", "iron", "tardyferon"], ["tardyferon", "tardyferon", "fer"],
  ["acide folique", "folique", "folic", "uvedose", "speciafoldine"], ["vitamine d", "vitamine d", "vitamin d", "uvedose"], ["huile essentielle", "huile essentielle", "essential oil"],
  ["arnica", "arnica"], ["homeopathie", "homeopathie", "homeopath"], ["melatonine", "melatonine", "melatonin"], ["cetirizine", "cetirizine", "zyrtec"], ["zyrtec", "zyrtec", "cetirizine"],
  ["aerius", "aerius", "desloratadine"], ["betadine", "betadine"], ["hextril", "hextril"], ["voltarene", "voltarene", "diclofenac"], ["lamaline", "lamaline"], ["tramadol", "tramadol"],
  ["codeine", "codeine"], ["cafeine", "cafeine", "caffeine"], ["pilule", "pilule", "contracepti"], ["vaccin", "vaccin", "vaccine"], ["vaccin grippe", "grippe", "flu"],
  ["anti inflammatoire", "inflammatoire", "ains", "nsaid"], ["sirop contre la toux", "toux", "cough"], ["spray nasal", "nasal"], ["collyre", "collyre", "eye"],
  ["creme anti acne", "acne"], ["tisane", "tisane"], ["probiotiques", "probiotique", "probiotic"], ["omega 3", "omega", "huile de poisson", "fish oil"], ["vitamine c", "vitamine c", "vitamin c"],
  ["vitamine a", "vitamine a", "vitamin a", "retinol"], ["iode", "iode", "iodine"], ["calcium", "calcium"], ["zinc", "zinc"], ["levothyroxine", "levothyroxine", "levothyrox"],
  ["antidepresseur", "antidepresseur", "antidepressant"], ["anxiolytique", "anxiolytique", "anti anxiety"], ["lexomil", "lexomil", "bromazepam"], ["xanax", "xanax", "alprazolam"],
  ["sumatriptan", "sumatriptan", "triptan", "migraine"], ["migraine", "migraine"], ["constipation", "constipation", "laxatif", "laxative"], ["diarrhee", "diarrhee", "diarrhoea", "imodium"],
  ["nausees", "nausee", "nausea", "vomissement"], ["brulures d estomac", "brulure", "heartburn", "gaviscon"], ["mal de gorge", "gorge", "throat"], ["rhume", "rhume", "cold"],
  ["allergie", "allergie", "allergy", "antihistamin"], ["mycose", "mycose", "yeast", "thrush"], ["cystite", "cystite", "uti"], ["hemorroides", "hemorroide", "haemorrhoid"],
];

// English-speaking user, English interface.
export const EN_QUERIES: Record<"foods" | "drinks" | "exercise" | "medicines", Q[]> = {
  foods: [
    ["feta", "feta"], ["feta cheese", "feta"], ["burrata", "burrata"], ["mozzarella", "mozzarella"], ["soft cheese", "cheese", "brie", "camembert"], ["brie", "brie"], ["camembert", "camembert"],
    ["goat cheese", "goat", "chevre"], ["blue cheese", "blue", "bleu", "roquefort", "gorgonzola"], ["gorgonzola", "gorgonzola"], ["halloumi", "halloumi"], ["cream cheese", "cream cheese"],
    ["cottage cheese", "cottage", "fromage blanc"], ["parmesan", "parmesan"], ["raw milk cheese", "raw", "unpasteur", "lait cru"], ["cheddar", "cheddar"], ["ricotta", "ricotta"], ["mascarpone", "mascarpone"],
    ["smoked salmon", "smoked salmon"], ["sushi", "sushi"], ["raw fish", "raw fish", "sushi", "sashimi"], ["tuna", "tuna"], ["tuna sandwich", "tuna"], ["shrimp", "shrimp", "prawn"], ["prawns", "prawn", "shrimp"],
    ["oysters", "oyster"], ["runny eggs", "egg"], ["soft boiled egg", "soft", "egg"], ["mayonnaise", "mayonnaise", "mayo"], ["caesar salad", "caesar", "salad"], ["deli meat", "deli", "ham", "cold cut", "charcuterie"],
    ["ham", "ham", "jambon"], ["salami", "salami"], ["pate", "pate"], ["hot dog", "hot dog"], ["steak", "steak", "beef"], ["rare steak", "steak", "beef", "rare"], ["liver", "liver"], ["sausage", "sausage"],
    ["chicken", "chicken"], ["bacon", "bacon"], ["sprouts", "sprout"], ["bagged salad", "bagged", "salad"], ["pineapple", "pineapple"], ["papaya", "papaya"], ["honey", "honey"], ["liquorice", "liquorice", "licorice"],
    ["soy milk", "soy", "soja"], ["tofu", "tofu"], ["seaweed", "seaweed", "algae", "nori"], ["kimchi", "kimchi"], ["peanuts", "peanut"], ["peanut butter", "peanut"], ["nutella", "nutella", "chocolate", "hazelnut"],
    ["ice cream", "ice cream"], ["soft serve", "ice cream", "soft serve"], ["tiramisu", "tiramisu"], ["cookie dough", "cookie dough", "dough"], ["avocado", "avocado"], ["melon", "melon", "cantaloupe"],
    ["watermelon", "watermelon"], ["mushrooms", "mushroom"], ["leftovers", "leftover"], ["rice", "rice"], ["takeaway", "takeaway", "take away", "ready"], ["kebab", "kebab", "doner"], ["pizza", "pizza"],
    ["turkey", "turkey", "dinde"], ["lamb", "lamb"], ["duck", "duck"], ["egg", "egg"], ["eggs", "egg"], ["yogurt", "yogurt", "yoghurt"], ["milk", "milk"], ["raw milk", "raw milk", "milk"], ["butter", "butter"],
  ],
  drinks: [
    ["coffee", "coffee"], ["decaf coffee", "decaf"], ["green tea", "green tea"], ["herbal tea", "herbal", "tisane", "infusion"], ["raspberry leaf tea", "raspberry leaf", "raspberry"], ["kombucha", "kombucha"],
    ["energy drink", "energy", "red bull"], ["diet coke", "diet", "cola", "zero"], ["coke", "cola", "coke"], ["wine", "wine"], ["non alcoholic beer", "alcohol free", "non alcoholic", "alcohol-free"], ["beer", "beer"],
    ["orange juice", "orange juice", "orange"], ["fresh juice", "juice"], ["smoothie", "smoothie"], ["coconut water", "coconut"], ["sparkling water", "sparkling"], ["tap water", "tap"], ["ginger tea", "ginger"],
    ["peppermint tea", "mint", "peppermint"], ["chamomile tea", "chamomile"], ["matcha", "matcha"], ["hot chocolate", "chocolate"], ["champagne", "champagne", "sparkling wine"], ["cocktail", "cocktail"],
  ],
  exercise: [
    ["walking", "walking"], ["running", "running"], ["jogging", "jogging", "running"], ["swimming", "swimming"], ["yoga", "yoga"], ["pilates", "pilates"], ["cycling", "cycling", "bike"],
    ["weightlifting", "weight", "strength"], ["gym", "gym", "strength", "exercise"], ["crossfit", "crossfit"], ["horse riding", "horse"], ["skiing", "ski"], ["hot tub", "hot tub", "jacuzzi"],
    ["sauna", "sauna"], ["flying", "flying", "flight", "plane"], ["sex", "sex"], ["hiking", "hiking"], ["tennis", "tennis"], ["dancing", "dance"], ["sit ups", "sit", "abdominal", "crunch"],
  ],
  medicines: [
    ["paracetamol", "paracetamol"], ["tylenol", "paracetamol", "acetaminophen", "tylenol"], ["acetaminophen", "acetaminophen", "paracetamol"], ["ibuprofen", "ibuprofen"], ["aspirin", "aspirin"],
    ["cough syrup", "cough"], ["sore throat", "throat", "lozenge"], ["heartburn", "heartburn", "antacid", "gaviscon", "omeprazole"], ["antibiotics", "antibiotic", "amoxicillin"], ["sleeping pills", "sleep", "melatonin", "zolpidem"],
    ["nasal spray", "nasal"], ["cold and flu", "cold", "flu", "decongestant"], ["hayfever", "hay", "antihistamine", "cetirizine", "loratadine"], ["antihistamine", "antihistamine"], ["vitamins", "vitamin"],
    ["folic acid", "folic"], ["iron tablets", "iron"], ["vitamin a", "vitamin a"], ["omega 3", "omega", "fish oil"], ["calcium", "calcium"], ["magnesium", "magnesium"], ["vitamin d", "vitamin d"],
    ["laxative", "laxative", "constipation"], ["diarrhoea", "diarrhoea", "diarrhea", "loperamide", "imodium"], ["morning sickness", "sickness", "nausea", "vomiting"], ["migraine", "migraine"],
    ["antidepressants", "antidepress"], ["thyroid", "thyroid", "levothyroxine"], ["asthma inhaler", "asthma", "inhaler"], ["flu vaccine", "flu", "vaccine"], ["essential oils", "essential"], ["herbal remedies", "herbal"],
    ["codeine", "codeine"], ["tramadol", "tramadol"], ["hemorrhoids", "hemorrhoid", "haemorrhoid", "piles"], ["thrush", "thrush", "yeast", "antifungal", "clotrimazole"], ["cystitis", "cystitis", "uti", "urinary"],
  ],
};

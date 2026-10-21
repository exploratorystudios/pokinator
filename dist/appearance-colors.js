// Reviewed against the bundled, non-shiny sprites for the original regional
// appearances. These are visible palettes, not Pokédex search categories.
// Include prominent features and large markings, not eyes or tiny details.
// White includes cream, brown includes tan, gray includes silver, yellow gold.
export const COLOR_LABELS = Object.freeze({
  black:'black', blue:'blue or teal', brown:'brown or tan', gray:'gray or silver',
  green:'green', orange:'orange', pink:'pink', purple:'purple or lavender',
  red:'red', white:'white or cream', yellow:'yellow or gold',
});

const palettes = {
  // Kanto
  1:'green blue', // Bulbasaur
  2:'green blue pink', // Ivysaur
  3:'green blue red pink', // Venusaur
  4:'orange white', // Charmander
  5:'red white', // Charmeleon
  6:'orange white blue', // Charizard
  7:'blue brown yellow', // Squirtle
  8:'blue brown white', // Wartortle
  9:'blue brown white gray', // Blastoise
  10:'green', // Caterpie
  11:'green', // Metapod
  12:'purple white blue', // Butterfree
  13:'brown orange pink', // Weedle
  14:'yellow', // Kakuna
  15:'yellow black white', // Beedrill
  16:'brown white', // Pidgey
  17:'brown white red', // Pidgeotto
  18:'brown white red yellow', // Pidgeot
  19:'purple white', // Rattata
  20:'brown white', // Raticate
  21:'brown red', // Spearow
  22:'brown red', // Fearow
  23:'purple yellow', // Ekans
  24:'purple', // Arbok
  25:'yellow black red', // Pikachu
  26:'orange white brown yellow red', // Raichu
  27:'yellow white', // Sandshrew
  28:'yellow brown white', // Sandslash
  29:'blue purple', // Nidoran♀
  30:'blue', // Nidorina
  31:'blue white', // Nidoqueen
  32:'purple', // Nidoran♂
  33:'purple', // Nidorino
  34:'purple white', // Nidoking
  35:'pink', // Clefairy
  36:'pink', // Clefable
  37:'orange brown red', // Vulpix
  38:'yellow white', // Ninetales
  39:'pink', // Jigglypuff
  40:'pink white', // Wigglytuff
  41:'blue purple', // Zubat
  42:'blue purple', // Golbat
  43:'blue green', // Oddish
  44:'blue orange brown', // Gloom
  45:'blue red white', // Vileplume
  46:'orange red', // Paras
  47:'orange red yellow', // Parasect
  48:'purple', // Venonat
  49:'purple', // Venomoth
  50:'brown', // Diglett
  51:'brown', // Dugtrio
  52:'white yellow', // Meowth
  53:'white', // Persian
  54:'yellow', // Psyduck
  55:'blue', // Golduck
  56:'white brown', // Mankey
  57:'white brown', // Primeape
  58:'orange black white', // Growlithe
  59:'orange black white', // Arcanine
  60:'blue white', // Poliwag
  61:'blue white', // Poliwhirl
  62:'blue white', // Poliwrath
  63:'yellow brown', // Abra
  64:'yellow brown', // Kadabra
  65:'yellow brown', // Alakazam
  66:'gray blue', // Machop
  67:'gray blue purple', // Machoke
  68:'gray blue', // Machamp
  69:'yellow green brown', // Bellsprout
  70:'yellow green pink', // Weepinbell
  71:'yellow green', // Victreebel
  72:'blue red', // Tentacool
  73:'blue red gray', // Tentacruel
  74:'gray', // Geodude
  75:'gray', // Graveler
  76:'brown gray', // Golem
  77:'white yellow orange red', // Ponyta
  78:'white yellow orange red', // Rapidash
  79:'pink white', // Slowpoke
  80:'pink white gray', // Slowbro
  81:'gray', // Magnemite
  82:'gray', // Magneton
  83:'brown white green', // Farfetch’d
  84:'brown black', // Doduo
  85:'brown black', // Dodrio
  86:'white', // Seel
  87:'white', // Dewgong
  88:'purple', // Grimer
  89:'purple', // Muk
  90:'purple', // Shellder
  91:'purple black', // Cloyster
  92:'black purple', // Gastly
  93:'purple', // Haunter
  94:'purple', // Gengar
  95:'gray', // Onix
  96:'yellow brown', // Drowzee
  97:'yellow white', // Hypno
  98:'orange white', // Krabby
  99:'orange white', // Kingler
  100:'red white', // Voltorb
  101:'red white', // Electrode
  102:'pink', // Exeggcute
  103:'brown green yellow', // Exeggutor
  104:'brown white', // Cubone
  105:'brown white', // Marowak
  106:'brown', // Hitmonlee
  107:'brown purple red', // Hitmonchan
  108:'pink white', // Lickitung
  109:'purple', // Koffing
  110:'purple', // Weezing
  111:'gray', // Rhyhorn
  112:'gray white', // Rhydon
  113:'pink white', // Chansey
  114:'blue', // Tangela
  115:'brown white', // Kangaskhan
  116:'blue white', // Horsea
  117:'blue white', // Seadra
  118:'white orange', // Goldeen
  119:'white orange black', // Seaking
  120:'brown yellow', // Staryu
  121:'purple yellow', // Starmie
  122:'pink white blue', // Mr. Mime
  123:'green white', // Scyther
  124:'red purple yellow', // Jynx
  125:'yellow black', // Electabuzz
  126:'red yellow', // Magmar
  127:'brown white', // Pinsir
  128:'brown', // Tauros
  129:'red white yellow', // Magikarp
  130:'blue white', // Gyarados
  131:'blue white gray', // Lapras
  132:'purple pink', // Ditto
  133:'brown white', // Eevee
  134:'blue white', // Vaporeon
  135:'yellow white', // Jolteon
  136:'orange red white', // Flareon
  137:'pink blue', // Porygon
  138:'blue brown', // Omanyte
  139:'blue brown', // Omastar
  140:'brown black', // Kabuto
  141:'brown white', // Kabutops
  142:'gray purple', // Aerodactyl
  143:'blue white', // Snorlax
  144:'blue white', // Articuno
  145:'yellow black', // Zapdos
  146:'yellow orange red', // Moltres
  147:'blue white', // Dratini
  148:'blue white', // Dragonair
  149:'orange white green blue', // Dragonite
  150:'purple white', // Mewtwo
  151:'pink', // Mew
  // Johto
  152:'green', // Chikorita
  153:'yellow green', // Bayleef
  154:'green pink', // Meganium
  155:'yellow blue orange red', // Cyndaquil
  156:'yellow blue orange red', // Quilava
  157:'yellow blue orange red', // Typhlosion
  158:'blue red', // Totodile
  159:'blue red yellow', // Croconaw
  160:'blue red yellow', // Feraligatr
  161:'brown white', // Sentret
  162:'brown white', // Furret
  163:'brown white', // Hoothoot
  164:'brown white', // Noctowl
  165:'red black white', // Ledyba
  166:'red black white yellow', // Ledian
  167:'green yellow', // Spinarak
  168:'red yellow purple', // Ariados
  169:'purple blue', // Crobat
  170:'blue yellow', // Chinchou
  171:'blue yellow', // Lanturn
  172:'yellow black', // Pichu
  173:'pink brown', // Cleffa
  174:'pink', // Igglybuff
  175:'white red blue', // Togepi
  176:'white red blue', // Togetic
  177:'green red', // Natu
  178:'green red white', // Xatu
  179:'white blue yellow', // Mareep
  180:'pink white blue', // Flaaffy
  181:'yellow black white red', // Ampharos
  182:'green red', // Bellossom
  183:'blue white', // Marill
  184:'blue white', // Azumarill
  185:'brown green', // Sudowoodo
  186:'green yellow', // Politoed
  187:'pink green', // Hoppip
  188:'green yellow', // Skiploom
  189:'blue white', // Jumpluff
  190:'purple white', // Aipom
  191:'yellow green', // Sunkern
  192:'yellow green', // Sunflora
  193:'red green white', // Yanma
  194:'blue purple', // Wooper
  195:'blue', // Quagsire
  196:'purple pink red', // Espeon
  197:'black yellow', // Umbreon
  198:'black blue', // Murkrow
  199:'pink white gray red', // Slowking
  200:'blue green red', // Misdreavus
  201:'black', // Unown
  202:'blue black', // Wobbuffet
  203:'yellow brown black', // Girafarig
  204:'blue gray', // Pineco
  205:'purple gray red', // Forretress
  206:'yellow blue white', // Dunsparce
  207:'purple pink', // Gligar
  208:'gray', // Steelix
  209:'pink white blue', // Snubbull
  210:'purple', // Granbull
  211:'blue green yellow', // Qwilfish
  212:'red white', // Scizor
  213:'yellow red', // Shuckle
  214:'blue', // Heracross
  215:'black blue red white', // Sneasel
  216:'orange brown yellow', // Teddiursa
  217:'brown yellow', // Ursaring
  218:'red orange', // Slugma
  219:'red orange gray', // Magcargo
  220:'brown', // Swinub
  221:'brown', // Piloswine
  222:'pink white', // Corsola
  223:'blue green', // Remoraid
  224:'red', // Octillery
  225:'red white', // Delibird
  226:'blue purple white', // Mantine
  227:'gray red', // Skarmory
  228:'black gray brown', // Houndour
  229:'black gray brown', // Houndoom
  230:'blue white', // Kingdra
  231:'blue', // Phanpy
  232:'gray black', // Donphan
  233:'pink red blue', // Porygon2
  234:'brown white', // Stantler
  235:'white brown green', // Smeargle
  236:'purple brown', // Tyrogue
  237:'brown blue', // Hitmontop
  238:'pink yellow', // Smoochum
  239:'yellow black', // Elekid
  240:'red yellow', // Magby
  241:'pink black white', // Miltank
  242:'pink white', // Blissey
  243:'yellow black purple white', // Raikou
  244:'brown gray white red yellow', // Entei
  245:'blue white purple', // Suicune
  246:'green', // Larvitar
  247:'blue gray', // Pupitar
  248:'green blue', // Tyranitar
  249:'white blue', // Lugia
  250:'red orange yellow green white', // Ho-Oh
  251:'green', // Celebi
  // Hoenn
  252:'green red', // Treecko
  253:'green red', // Grovyle
  254:'green red', // Sceptile
  255:'orange yellow', // Torchic
  256:'orange yellow', // Combusken
  257:'red yellow white', // Blaziken
  258:'blue orange', // Mudkip
  259:'blue orange black', // Marshtomp
  260:'blue orange black', // Swampert
  261:'gray black', // Poochyena
  262:'gray black', // Mightyena
  263:'brown white', // Zigzagoon
  264:'brown white', // Linoone
  265:'red white yellow', // Wurmple
  266:'white', // Silcoon
  267:'black white yellow orange', // Beautifly
  268:'purple', // Cascoon
  269:'purple green yellow', // Dustox
  270:'blue green', // Lotad
  271:'green yellow', // Lombre
  272:'yellow green brown', // Ludicolo
  273:'brown gray', // Seedot
  274:'brown white green', // Nuzleaf
  275:'brown white green', // Shiftry
  276:'blue red white', // Taillow
  277:'blue red white', // Swellow
  278:'white blue', // Wingull
  279:'white blue yellow', // Pelipper
  280:'white green red', // Ralts
  281:'white green red', // Kirlia
  282:'white green red', // Gardevoir
  283:'blue yellow', // Surskit
  284:'blue white orange', // Masquerain
  285:'brown white green', // Shroomish
  286:'green white red', // Breloom
  287:'brown', // Slakoth
  288:'white', // Vigoroth
  289:'brown white purple', // Slaking
  290:'white brown green', // Nincada
  291:'yellow black white', // Ninjask
  292:'brown white', // Shedinja
  293:'pink yellow', // Whismur
  294:'purple yellow black', // Loudred
  295:'blue purple yellow', // Exploud
  296:'yellow gray', // Makuhita
  297:'brown orange blue', // Hariyama
  298:'blue', // Azurill
  299:'blue red', // Nosepass
  300:'pink white', // Skitty
  301:'purple yellow white', // Delcatty
  302:'purple', // Sableye
  303:'yellow black', // Mawile
  304:'gray black', // Aron
  305:'gray black', // Lairon
  306:'gray black', // Aggron
  307:'blue white', // Meditite
  308:'pink white red yellow', // Medicham
  309:'green yellow', // Electrike
  310:'blue yellow', // Manectric
  311:'white yellow red', // Plusle
  312:'white yellow blue', // Minun
  313:'gray black blue red', // Volbeat
  314:'purple black blue yellow', // Illumise
  315:'green red blue', // Roselia
  316:'green', // Gulpin
  317:'purple', // Swalot
  318:'blue red yellow', // Carvanha
  319:'blue white', // Sharpedo
  320:'blue white', // Wailmer
  321:'blue white', // Wailord
  322:'yellow green', // Numel
  323:'red orange gray', // Camerupt
  324:'orange gray black', // Torkoal
  325:'gray black', // Spoink
  326:'purple black', // Grumpig
  327:'white brown red', // Spinda
  328:'orange white', // Trapinch
  329:'green white', // Vibrava
  330:'green red', // Flygon
  331:'green', // Cacnea
  332:'green', // Cacturne
  333:'blue white', // Swablu
  334:'blue white', // Altaria
  335:'white red', // Zangoose
  336:'black purple yellow red', // Seviper
  337:'yellow brown', // Lunatone
  338:'orange yellow', // Solrock
  339:'blue gray', // Barboach
  340:'blue yellow', // Whiscash
  341:'orange white', // Corphish
  342:'red white blue', // Crawdaunt
  343:'brown red', // Baltoy
  344:'black gray pink red', // Claydol
  345:'purple pink yellow', // Lileep
  346:'green pink yellow', // Cradily
  347:'gray green black', // Anorith
  348:'blue yellow red white', // Armaldo
  349:'brown blue', // Feebas
  350:'white red pink blue', // Milotic
  351:'gray white', // Castform, normal weather
  352:'green yellow red', // Kecleon
  353:'blue purple', // Shuppet
  354:'gray black yellow', // Banette
  355:'gray black white', // Duskull
  356:'gray', // Dusclops
  357:'green brown yellow', // Tropius
  358:'white blue pink red', // Chimecho
  359:'white blue black', // Absol
  360:'blue black', // Wynaut
  361:'yellow orange black', // Snorunt
  362:'white gray black', // Glalie
  363:'blue purple white', // Spheal
  364:'blue white', // Sealeo
  365:'blue white', // Walrein
  366:'blue pink white', // Clamperl
  367:'blue orange yellow', // Huntail
  368:'pink purple', // Gorebyss
  369:'brown gray red', // Relicanth
  370:'pink', // Luvdisc
  371:'blue gray', // Bagon
  372:'white gray', // Shelgon
  373:'blue red white', // Salamence
  374:'blue', // Beldum
  375:'blue gray', // Metang
  376:'blue gray', // Metagross
  377:'brown gray orange', // Regirock
  378:'blue', // Regice
  379:'gray black', // Registeel
  380:'red white blue', // Latias
  381:'blue white red', // Latios
  382:'blue white red', // Kyogre
  383:'red gray black white', // Groudon
  384:'green yellow red', // Rayquaza
  385:'yellow white blue', // Jirachi
  386:'orange blue purple', // Deoxys, Normal Forme
};

export const APPEARANCE_COLORS = Object.freeze(Object.fromEntries(
  Object.entries(palettes).map(([id, colors]) => [id, Object.freeze(colors.split(' '))])
));

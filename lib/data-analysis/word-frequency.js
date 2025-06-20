import natural from "natural";
import sanitizer from "string-sanitizer";

// TODO: support many languages
// import LanguageDetect from "languagedetect";
// const languageDetector = new LanguageDetect();
// const stemmerMap = {
// english: new Stemmer(Languages.English),
// portuguese: new Stemmer(Languages.Portuguese),
// spanish: new Stemmer(Languages.Spanish),
// french: new Stemmer(Languages.French),
// dutch: new Stemmer(Languages.Dutch),
// };

// Initialize the Portuguese stemmer
const stemmer = natural.PorterStemmerPt;

export function getInsights(text) {
  const wordFrequency = getWordFrequency(text);
  const characterCount = text.trim().length;

  return {
    wordFrequency,
    characterCount,
  };
}

function getWordFrequency(text) {
  const words = text
    .toLowerCase()
    .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, " ")
    .split(" ")
    .filter((word) => sanitizer.sanitize(word))
    .filter((word) => !stopWords.includes(word));

  const data = [];

  for (const word of words) {
    const stem = stemmer.stem(word);

    if (!data.find((freqObj) => freqObj.word === word)) {
      data.push({
        stem,
        word,
        frequency: 1,
      });

      continue;
    }

    const index = data.findIndex((freqObj) => freqObj.word === word);
    data[index].frequency = data[index].frequency + 1;
  }

  const sorted = data.sort(function (a, b) {
    return a.frequency > b.frequency ? -1 : b.frequency > a.frequency ? 1 : 0;
  });

  return sorted;
}

const feedback = [
  "sonhei",
  "eu",
  "pq",
  "vc",
  "q",
  "n",
  "nao",
  "voce",
  "não",
  "sonho",
  "tava",
  "porq",
  "deu",
  "c",
  "ficava",
  "ficar",
  "ce",
  "ir",
  "ia",
  "vinha",
  "veio",
  "via",
  "alem",
];

const specialCharacters = [
  "_",
  "-",
  ".",
  ",",
  ";",
  ":",
  "@",
  "!",
  "#",
  "$",
  "%",
  "*",
  "(",
  ")",
  "=",
  "+",
  "~",
  "`",
  '"',
  "'",
];

const stopWords = [
  "a",
  "à",
  "adeus",
  "agora",
  "aí",
  "ai",
  "ainda",
  "além",
  "algo",
  "alguém",
  "algum",
  "alguma",
  "algumas",
  "alguns",
  "ali",
  "ampla",
  "amplas",
  "amplo",
  "amplos",
  "ano",
  "anos",
  "ante",
  "antes",
  "ao",
  "aos",
  "apenas",
  "apoio",
  "após",
  "aquela",
  "aquelas",
  "aquele",
  "aqueles",
  "aqui",
  "aquilo",
  "área",
  "as",
  "às",
  "assim",
  "até",
  "atrás",
  "através",
  "baixo",
  "bastante",
  "bem",
  "boa",
  "boas",
  "bom",
  "bons",
  "breve",
  "cá",
  "cada",
  "catorze",
  "cedo",
  "cento",
  "certamente",
  "certeza",
  "cima",
  "cinco",
  "coisa",
  "coisas",
  "com",
  "como",
  "conselho",
  "contra",
  "contudo",
  "custa",
  "da",
  "dá",
  "dão",
  "daquela",
  "daquelas",
  "daquele",
  "daqueles",
  "dar",
  "das",
  "de",
  "debaixo",
  "dela",
  "delas",
  "dele",
  "deles",
  "demais",
  "dentro",
  "depois",
  "desde",
  "dessa",
  "dessas",
  "desse",
  "desses",
  "desta",
  "destas",
  "deste",
  "destes",
  "deve",
  "devem",
  "devendo",
  "dever",
  "deverá",
  "deverão",
  "deveria",
  "deveriam",
  "devia",
  "deviam",
  "dez",
  "dezanove",
  "dezasseis",
  "dezassete",
  "dezoito",
  "dia",
  "diante",
  "disse",
  "disso",
  "disto",
  "dito",
  "diz",
  "dizem",
  "dizer",
  "do",
  "dois",
  "dos",
  "doze",
  "duas",
  "dúvida",
  "e",
  "é",
  "ela",
  "elas",
  "ele",
  "eles",
  "em",
  "embora",
  "enquanto",
  "entre",
  "era",
  "eram",
  "éramos",
  "és",
  "essa",
  "essas",
  "esse",
  "esses",
  "esta",
  "está",
  "estamos",
  "estão",
  "estar",
  "estas",
  "estás",
  "estava",
  "estavam",
  "estávamos",
  "este",
  "esteja",
  "estejam",
  "estejamos",
  "estes",
  "esteve",
  "estive",
  "estivemos",
  "estiver",
  "estivera",
  "estiveram",
  "estivéramos",
  "estiverem",
  "estivermos",
  "estivesse",
  "estivessem",
  "estivéssemos",
  "estiveste",
  "estivestes",
  "estou",
  "etc",
  "eu",
  "exemplo",
  "faço",
  "falta",
  "favor",
  "faz",
  "fazeis",
  "fazem",
  "fazemos",
  "fazendo",
  "fazer",
  "fazes",
  "feita",
  "feitas",
  "feito",
  "feitos",
  "fez",
  "fim",
  "final",
  "foi",
  "fomos",
  "for",
  "fora",
  "foram",
  "fôramos",
  "forem",
  "forma",
  "formos",
  "fosse",
  "fossem",
  "fôssemos",
  "foste",
  "fostes",
  "fui",
  "geral",
  "grande",
  "grandes",
  "grupo",
  "há",
  "haja",
  "hajam",
  "hajamos",
  "hão",
  "havemos",
  "havia",
  "hei",
  "hoje",
  "hora",
  "horas",
  "houve",
  "houvemos",
  "houver",
  "houvera",
  "houverá",
  "houveram",
  "houvéramos",
  "houverão",
  "houverei",
  "houverem",
  "houveremos",
  "houveria",
  "houveriam",
  "houveríamos",
  "houvermos",
  "houvesse",
  "houvessem",
  "houvéssemos",
  "isso",
  "isto",
  "já",
  "la",
  "lá",
  "lado",
  "lhe",
  "lhes",
  "lo",
  "local",
  "logo",
  "longe",
  "lugar",
  "maior",
  "maioria",
  "mais",
  "mal",
  "mas",
  "máximo",
  "me",
  "meio",
  "menor",
  "menos",
  "mês",
  "meses",
  "mesma",
  "mesmas",
  "mesmo",
  "mesmos",
  "meu",
  "meus",
  "mil",
  "minha",
  "minhas",
  "momento",
  "muita",
  "muitas",
  "muito",
  "muitos",
  "na",
  "nada",
  "não",
  "naquela",
  "naquelas",
  "naquele",
  "naqueles",
  "nas",
  "nem",
  "nenhum",
  "nenhuma",
  "nessa",
  "nessas",
  "nesse",
  "nesses",
  "nesta",
  "nestas",
  "neste",
  "nestes",
  "ninguém",
  "nível",
  "no",
  "noite",
  "nome",
  "nos",
  "nós",
  "nossa",
  "nossas",
  "nosso",
  "nossos",
  "nova",
  "novas",
  "nove",
  "novo",
  "novos",
  "num",
  "numa",
  "número",
  "nunca",
  "o",
  "obra",
  "obrigada",
  "obrigado",
  "oitava",
  "oitavo",
  "oito",
  "onde",
  "ontem",
  "onze",
  "os",
  "ou",
  "outra",
  "outras",
  "outro",
  "outros",
  "pra",
  "ah",
  "para",
  "parece",
  "parte",
  "partir",
  "paucas",
  "pela",
  "pelas",
  "pelo",
  "pelos",
  "pequena",
  "pequenas",
  "pequeno",
  "pequenos",
  "per",
  "perante",
  "perto",
  "pode",
  "pude",
  "pôde",
  "podem",
  "podendo",
  "poder",
  "poderia",
  "poderiam",
  "podia",
  "podiam",
  "põe",
  "põem",
  "pois",
  "ponto",
  "pontos",
  "por",
  "porém",
  "porque",
  "porquê",
  "posição",
  "possível",
  "possivelmente",
  "posso",
  "pouca",
  "poucas",
  "pouco",
  "poucos",
  "primeira",
  "primeiras",
  "primeiro",
  "primeiros",
  "própria",
  "próprias",
  "próprio",
  "próprios",
  "próxima",
  "próximas",
  "próximo",
  "próximos",
  "pude",
  "puderam",
  "quais",
  "quáis",
  "qual",
  "quando",
  "quanto",
  "quantos",
  "quarta",
  "quarto",
  "quatro",
  "que",
  "quê",
  "quem",
  "quer",
  "quereis",
  "querem",
  "queremas",
  "queres",
  "quero",
  "questão",
  "quinta",
  "quinto",
  "quinze",
  "relação",
  "sabe",
  "sabem",
  "são",
  "se",
  "segunda",
  "segundo",
  "sei",
  "seis",
  "seja",
  "sejam",
  "sejamos",
  "sem",
  "sempre",
  "sendo",
  "ser",
  "será",
  "serão",
  "serei",
  "seremos",
  "seria",
  "seriam",
  "seríamos",
  "sete",
  "sétima",
  "sétimo",
  "seu",
  "seus",
  "sexta",
  "sexto",
  "si",
  "sido",
  "sim",
  "sistema",
  "só",
  "sob",
  "sobre",
  "sois",
  "somos",
  "sou",
  "sua",
  "suas",
  "tal",
  "talvez",
  "também",
  "tampouco",
  "tanta",
  "tantas",
  "tanto",
  "tão",
  "tarde",
  "te",
  "tem",
  "tém",
  "têm",
  "temos",
  "tendes",
  "tendo",
  "tenha",
  "tenham",
  "tenhamos",
  "tenho",
  "tens",
  "ter",
  "terá",
  "terão",
  "terceira",
  "terceiro",
  "terei",
  "teremos",
  "teria",
  "teriam",
  "teríamos",
  "teu",
  "teus",
  "teve",
  "ti",
  "tido",
  "tinha",
  "tinham",
  "tínhamos",
  "tive",
  "tivemos",
  "tiver",
  "tivera",
  "tiveram",
  "tivéramos",
  "tiverem",
  "tivermos",
  "tivesse",
  "tivessem",
  "tivéssemos",
  "tiveste",
  "tivestes",
  "toda",
  "todas",
  "todavia",
  "todo",
  "todos",
  "trabalho",
  "três",
  "treze",
  "tu",
  "tua",
  "tuas",
  "tudo",
  "última",
  "últimas",
  "último",
  "últimos",
  "um",
  "uma",
  "umas",
  "uns",
  "vai",
  "vais",
  "vão",
  "vários",
  "vem",
  "vêm",
  "vendo",
  "vens",
  "ver",
  "vez",
  "vezes",
  "viagem",
  "vindo",
  "vinte",
  "vir",
  "você",
  "vocês",
  "vos",
  "vós",
  "vossa",
  "vossas",
  "vosso",
  "vossos",
  "zero",
  "pensava",
  "sentia",
  "dizia",
  "cantava",
  "voltava",
  "falava",
  "entrava",
  "olhava",
  "lembrava",
  "achei",
  "achava",
  "aparecia",
  "acho",
  "tentava",
  // Additional imperfect tense verbs (-ava endings)
  "andava",
  "brincava",
  "caminhava",
  "chamava",
  "chegava",
  "chorava",
  "conversava",
  "correria",
  "cozinhava",
  "criava",
  "dançava",
  "deixava",
  "desejava",
  "esperava",
  "estudava",
  "ficava",
  "gostava",
  "jogava",
  "levava",
  "morava",
  "passava",
  "pegava",
  "perguntava",
  "procurava",
  "sonhava",
  "tirava",
  "trabalhava",
  "usava",
  "voava",
  // Additional imperfect tense verbs (-ia endings)
  "abria",
  "cabia",
  "comia",
  "corria",
  "dormia",
  "escrevia",
  "fugia",
  "mentia",
  "morria",
  "nascia",
  "ouvia",
  "partia",
  "pedia",
  "perdia",
  "permitia",
  "preferia",
  "recebia",
  "ria",
  "sabia",
  "seguia",
  "servia",
  "sorria",
  "subía",
  "vendia",
  "vestia",
  "vivia",
  // Common perfect tense and other frequent verbs
  "amei",
  "andei",
  "bebi",
  "comi",
  "corri",
  "dei",
  "dormi",
  "encontrei",
  "entendi",
  "escutei",
  "falei",
  "fiz",
  "gostei",
  "joguei",
  "li",
  "ouvi",
  "parti",
  "pedi",
  "perdi",
  "recebi",
  "sai",
  "senti",
  "servir",
  "sorri",
  "vendi",
  "vi",
  "vivi",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  ...specialCharacters,
  ...feedback,
];

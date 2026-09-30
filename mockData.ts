import type { Dish, Ingredient } from '../types';
import { dishArt } from './dishArt';

// ============================================================
// 食材
// ============================================================

export const INGREDIENTS: Ingredient[] = [
  {
    id: 'cime-di-rapa',
    nameItalian: 'Cime di rapa',
    nameJapanese: 'カブの菜花',
    reading: 'チーマ・ディ・ラーパ',
    category: '葉野菜',
    description:
      'カブの仲間の若い茎・葉・つぼみ。ほろ苦さが特徴で、南イタリアの冬から春の味。ナポリでは「friarielli（フリアリエッリ）」とも呼ばれます。',
    associatedRegionIds: ['puglia', 'campania'],
  },
  {
    id: 'guanciale',
    nameItalian: 'Guanciale',
    nameJapanese: '豚ほほ肉の塩漬け',
    reading: 'グアンチャーレ',
    category: '肉加工品',
    description:
      '豚のほほ肉を塩とスパイスで熟成させたもの。脂の甘みが強く、ローマのパスタに欠かせない食材です。',
    associatedRegionIds: ['lazio'],
  },
  {
    id: 'taleggio',
    nameItalian: 'Taleggio',
    nameJapanese: 'タレッジョチーズ',
    reading: 'タレッジョ',
    category: 'チーズ',
    description:
      'ロンバルディア発祥の四角いウォッシュタイプのチーズ。香りは強めですが、中身はミルキーでやわらかい味わい。',
    associatedRegionIds: ['lombardia'],
  },
  {
    id: 'porcini',
    nameItalian: 'Funghi porcini',
    nameJapanese: 'ポルチーニ茸',
    reading: 'ポルチーニ',
    category: 'きのこ',
    description:
      '香り高いイタリアを代表するきのこ。秋が旬で、生のほか乾燥ポルチーニも一年中流通しています。',
    associatedRegionIds: ['piemonte', 'toscana', 'emilia-romagna'],
  },
  {
    id: 'radicchio',
    nameItalian: 'Radicchio rosso',
    nameJapanese: '赤チコリ',
    reading: 'ラディッキオ',
    category: '葉野菜',
    description:
      '赤紫色で苦みのあるチコリの仲間。ヴェネト州トレヴィーゾ産の細長い品種が有名で、加熱すると甘みが出ます。',
    associatedRegionIds: ['veneto'],
  },
  {
    id: 'burrata',
    nameItalian: 'Burrata',
    nameJapanese: 'ブッラータチーズ',
    reading: 'ブッラータ',
    category: 'チーズ',
    description:
      'モッツァレラの袋の中に、生クリームと細かく裂いたチーズを詰めたフレッシュチーズ。プーリア発祥で、鮮度が命です。',
    associatedRegionIds: ['puglia'],
  },
  {
    id: 'parmigiano',
    nameItalian: 'Parmigiano Reggiano',
    nameJapanese: 'パルミジャーノ・レッジャーノ',
    reading: 'パルミジャーノ・レッジャーノ',
    category: 'チーズ',
    description:
      'エミリア＝ロマーニャ州などの限られた地域で作られる長期熟成のハードチーズ。旨みが強く、削って料理の仕上げに使います。',
    associatedRegionIds: ['emilia-romagna'],
  },
  {
    id: 'pomodoro',
    nameItalian: 'Pomodoro',
    nameJapanese: 'トマト',
    reading: 'ポモドーロ',
    category: '野菜',
    description:
      'イタリア料理の基本食材。品種が豊富で、市場ではサンマルツァーノやダッテリーニなど地域ごとの品種が並びます。',
    associatedRegionIds: ['campania', 'toscana', 'puglia'],
  },
];

// ============================================================
// 料理（すべて2人分）
// ============================================================

const EVOO = { nameItalian: "Olio extravergine d'oliva", nameJapanese: 'エクストラバージンオリーブオイル' };
const SALE = { nameItalian: 'Sale', nameJapanese: '塩', amount: '適量' };
const PEPE = { nameItalian: 'Pepe nero', nameJapanese: '黒こしょう', amount: '適量' };
const AGLIO = { nameItalian: 'Aglio', nameJapanese: 'にんにく', amount: '1片' };

export const DISHES: Dish[] = [
  // ---------------- Puglia ----------------
  {
    id: 'orecchiette-cime-di-rapa',
    nameItalian: 'Orecchiette con cime di rapa',
    nameJapanese: 'チーマ・ディ・ラーパのオレキエッテ',
    regionId: 'puglia',
    tradition: 'traditional',
    servings: 2,
    description:
      '耳たぶ形のパスタ「オレキエッテ」を菜花と一緒に茹で、にんにく・アンチョビ・唐辛子のオイルで和える、プーリアを代表する一皿。',
    imageUrl: dishArt('orecchiette-cime-di-rapa', {
      style: 'short-pasta', table: '#8a5a3b', base: '#f1dfae', accent: '#6b8e23', garnish: ['#3f7d20', '#557a1f', '#2f5d17'],
    }),
    keyIngredientIds: ['cime-di-rapa'],
    ingredients: [
      { nameItalian: 'Cime di rapa', nameJapanese: 'チーマ・ディ・ラーパ（カブの菜花）', amount: '300g', ingredientId: 'cime-di-rapa' },
      { nameItalian: 'Orecchiette', nameJapanese: 'オレキエッテ', amount: '200g' },
      { ...AGLIO },
      { nameItalian: 'Peperoncino', nameJapanese: '唐辛子', amount: '1本' },
      { nameItalian: 'Acciughe sott’olio', nameJapanese: 'アンチョビ', amount: '2枚' },
      { ...EVOO, amount: '大さじ3' },
      SALE,
    ],
  },
  {
    id: 'burrata-pomodorini',
    nameItalian: 'Burrata con pomodorini',
    nameJapanese: 'ブッラータとミニトマト',
    regionId: 'puglia',
    tradition: 'modern',
    servings: 2,
    description:
      '切り分けたブッラータにミニトマトとバジル、オリーブオイルを添えるだけ。鮮度の良いブッラータを最もシンプルに楽しむ食べ方です。',
    imageUrl: dishArt('burrata-pomodorini', {
      style: 'burrata', table: '#3f5f73', base: '#fbf7ee', accent: '#e7dcc3', garnish: ['#d7261e', '#e9442e', '#f2a31a', '#c21d17'],
    }),
    keyIngredientIds: ['burrata', 'pomodoro'],
    ingredients: [
      { nameItalian: 'Burrata', nameJapanese: 'ブッラータ', amount: '1個（約250g）', ingredientId: 'burrata' },
      { nameItalian: 'Pomodorini', nameJapanese: 'ミニトマト', amount: '150g', ingredientId: 'pomodoro' },
      { nameItalian: 'Basilico', nameJapanese: 'バジル', amount: '数枚' },
      { ...EVOO, amount: '大さじ2' },
      { nameItalian: 'Pane', nameJapanese: 'パン', amount: 'お好みで' },
      SALE,
    ],
  },
  {
    id: 'orecchiette-pomodoro-burrata',
    nameItalian: 'Orecchiette al pomodoro e burrata',
    nameJapanese: 'トマトソースのオレキエッテ ブッラータのせ',
    regionId: 'puglia',
    tradition: 'modern',
    servings: 2,
    description:
      'トマトソースのオレキエッテに、仕上げにブッラータをのせる現代的な組み合わせ。とろけるクリームがソースと混ざります。',
    imageUrl: dishArt('orecchiette-pomodoro-burrata', {
      style: 'short-pasta', table: '#6d4c41', base: '#f0d7a0', accent: '#c0392b', garnish: ['#c0392b', '#fbf7ee', '#2e7d32'],
    }),
    keyIngredientIds: ['burrata', 'pomodoro'],
    ingredients: [
      { nameItalian: 'Orecchiette', nameJapanese: 'オレキエッテ', amount: '200g' },
      { nameItalian: 'Burrata', nameJapanese: 'ブッラータ', amount: '1個', ingredientId: 'burrata' },
      { nameItalian: 'Passata di pomodoro', nameJapanese: 'トマトピューレ', amount: '300ml', ingredientId: 'pomodoro' },
      { ...AGLIO },
      { nameItalian: 'Basilico', nameJapanese: 'バジル', amount: '数枚' },
      { ...EVOO, amount: '大さじ2' },
      SALE,
    ],
  },
  {
    id: 'frisella-pomodoro',
    nameItalian: 'Frisella al pomodoro',
    nameJapanese: 'トマトのフリゼッラ',
    regionId: 'puglia',
    tradition: 'traditional',
    servings: 2,
    description:
      '二度焼きした硬いパン「フリゼッラ」を水にさっとくぐらせ、トマトとオリーブオイル、オレガノをのせるプーリアの素朴な軽食。',
    imageUrl: dishArt('frisella-pomodoro', {
      style: 'bread', table: '#5d7a8c', base: '#c8955a', accent: '#d7261e', garnish: ['#e94b35', '#c21d17', '#4c7a2a'],
    }),
    keyIngredientIds: ['pomodoro'],
    ingredients: [
      { nameItalian: 'Friselle', nameJapanese: 'フリゼッラ（二度焼きパン）', amount: '2個' },
      { nameItalian: 'Pomodori maturi', nameJapanese: '完熟トマト', amount: '2個', ingredientId: 'pomodoro' },
      { nameItalian: 'Origano', nameJapanese: 'オレガノ', amount: '少々' },
      { ...EVOO, amount: '大さじ2' },
      SALE,
    ],
  },

  // ---------------- Campania ----------------
  {
    id: 'salsiccia-friarielli',
    nameItalian: 'Salsiccia e friarielli',
    nameJapanese: 'サルシッチャとフリアリエッリの炒め',
    regionId: 'campania',
    tradition: 'traditional',
    servings: 2,
    description:
      'ナポリ周辺で親しまれる組み合わせ。菜花（ナポリではフリアリエッリと呼ぶ）をにんにくと唐辛子で炒め、焼いたソーセージと合わせます。',
    imageUrl: dishArt('salsiccia-friarielli', {
      style: 'grill', table: '#7b4b2a', base: '#f3e2c0', accent: '#8d4a2b', garnish: ['#8b3a22', '#3f7d20', '#9c4a2e', '#2f5d17'],
    }),
    keyIngredientIds: ['cime-di-rapa'],
    ingredients: [
      { nameItalian: 'Salsiccia', nameJapanese: '生ソーセージ（サルシッチャ）', amount: '2本' },
      { nameItalian: 'Friarielli (cime di rapa)', nameJapanese: '菜花（チーマ・ディ・ラーパ）', amount: '400g', ingredientId: 'cime-di-rapa' },
      { ...AGLIO },
      { nameItalian: 'Peperoncino', nameJapanese: '唐辛子', amount: '1本' },
      { ...EVOO, amount: '大さじ3' },
      SALE,
    ],
  },
  {
    id: 'parmigiana-melanzane',
    nameItalian: 'Parmigiana di melanzane',
    nameJapanese: 'なすのパルミジャーナ',
    regionId: 'campania',
    tradition: 'traditional',
    servings: 2,
    description:
      '揚げたなす、トマトソース、モッツァレラ、パルミジャーノを重ねて焼く料理。発祥はカンパーニアともシチリアとも言われます。',
    imageUrl: dishArt('parmigiana-melanzane', {
      style: 'layered', table: '#4e6e58', base: '#f2c46d', accent: '#b8321f', garnish: ['#4a2b4f', '#2e7d32', '#fbf1d8'],
    }),
    keyIngredientIds: ['parmigiano', 'pomodoro'],
    ingredients: [
      { nameItalian: 'Melanzane', nameJapanese: 'なす（米なす）', amount: '2本' },
      { nameItalian: 'Passata di pomodoro', nameJapanese: 'トマトピューレ', amount: '300ml', ingredientId: 'pomodoro' },
      { nameItalian: 'Mozzarella', nameJapanese: 'モッツァレラ', amount: '125g' },
      { nameItalian: 'Parmigiano Reggiano', nameJapanese: 'パルミジャーノ・レッジャーノ', amount: '40g', ingredientId: 'parmigiano' },
      { nameItalian: 'Basilico', nameJapanese: 'バジル', amount: '数枚' },
      { nameItalian: 'Olio per friggere', nameJapanese: '揚げ油', amount: '適量' },
      SALE,
    ],
  },

  // ---------------- Lazio ----------------
  {
    id: 'carbonara',
    nameItalian: 'Spaghetti alla carbonara',
    nameJapanese: 'カルボナーラ',
    regionId: 'lazio',
    tradition: 'traditional',
    servings: 2,
    description:
      'グアンチャーレ、卵黄、ペコリーノ・ロマーノ、黒こしょうで作るローマの代表的なパスタ。本場では生クリームを使いません。起源には諸説あります。',
    imageUrl: dishArt('carbonara', {
      style: 'long-pasta', table: '#5b3a29', base: '#f4d27a', accent: '#f7df9c', garnish: ['#b5543c', '#9e4531', '#2b2b2b'],
    }),
    keyIngredientIds: ['guanciale'],
    ingredients: [
      { nameItalian: 'Spaghetti', nameJapanese: 'スパゲッティ', amount: '200g' },
      { nameItalian: 'Guanciale', nameJapanese: 'グアンチャーレ（豚ほほ肉の塩漬け）', amount: '80g', ingredientId: 'guanciale' },
      { nameItalian: "Tuorli d'uovo", nameJapanese: '卵黄', amount: '3個' },
      { nameItalian: 'Pecorino Romano', nameJapanese: 'ペコリーノ・ロマーノ', amount: '40g' },
      PEPE,
      SALE,
    ],
  },
  {
    id: 'amatriciana',
    nameItalian: "Bucatini all'amatriciana",
    nameJapanese: 'アマトリチャーナ',
    regionId: 'lazio',
    tradition: 'traditional',
    servings: 2,
    description:
      'ラツィオ州の町アマトリーチェに由来する、グアンチャーレとトマト、ペコリーノのパスタ。ローマでは穴あきパスタのブカティーニがよく使われます。',
    imageUrl: dishArt('amatriciana', {
      style: 'long-pasta', table: '#2f4858', base: '#e9a45b', accent: '#c0392b', garnish: ['#b5543c', '#f3e9d2', '#8e2a1d'],
    }),
    keyIngredientIds: ['guanciale', 'pomodoro'],
    ingredients: [
      { nameItalian: 'Bucatini', nameJapanese: 'ブカティーニ', amount: '200g' },
      { nameItalian: 'Guanciale', nameJapanese: 'グアンチャーレ', amount: '80g', ingredientId: 'guanciale' },
      { nameItalian: 'Pomodori pelati', nameJapanese: 'トマト水煮', amount: '250g', ingredientId: 'pomodoro' },
      { nameItalian: 'Pecorino Romano', nameJapanese: 'ペコリーノ・ロマーノ', amount: '30g' },
      { nameItalian: 'Vino bianco', nameJapanese: '白ワイン', amount: '大さじ2' },
      { nameItalian: 'Peperoncino', nameJapanese: '唐辛子', amount: '少々' },
      SALE,
    ],
  },
  {
    id: 'gricia',
    nameItalian: 'Rigatoni alla gricia',
    nameJapanese: 'グリーチャ',
    regionId: 'lazio',
    tradition: 'traditional',
    servings: 2,
    description:
      'グアンチャーレ、ペコリーノ、黒こしょうだけで作るローマのパスタ。トマトを入れないアマトリチャーナとも言われます。',
    imageUrl: dishArt('gricia', {
      style: 'short-pasta', table: '#44403c', base: '#f1dca7', accent: '#fbf1d8', garnish: ['#b5543c', '#a14a33', '#2b2b2b'],
    }),
    keyIngredientIds: ['guanciale'],
    ingredients: [
      { nameItalian: 'Rigatoni', nameJapanese: 'リガトーニ', amount: '200g' },
      { nameItalian: 'Guanciale', nameJapanese: 'グアンチャーレ', amount: '100g', ingredientId: 'guanciale' },
      { nameItalian: 'Pecorino Romano', nameJapanese: 'ペコリーノ・ロマーノ', amount: '40g' },
      PEPE,
      SALE,
    ],
  },

  // ---------------- Lombardia ----------------
  {
    id: 'risotto-milanese',
    nameItalian: 'Risotto alla milanese',
    nameJapanese: 'ミラノ風リゾット',
    regionId: 'lombardia',
    tradition: 'traditional',
    servings: 2,
    description:
      'サフランで黄金色に仕上げるミラノの代表的なリゾット。バターとパルミジャーノでとろりとまとめます。',
    imageUrl: dishArt('risotto-milanese', {
      style: 'risotto', table: '#3b4a5a', base: '#f2b705', accent: '#fff3c4', garnish: ['#f7d774', '#e39b0b'],
    }),
    keyIngredientIds: ['parmigiano'],
    ingredients: [
      { nameItalian: 'Riso Carnaroli', nameJapanese: '米（カルナローリ種）', amount: '160g' },
      { nameItalian: 'Zafferano', nameJapanese: 'サフラン', amount: '1包（約0.1g）' },
      { nameItalian: 'Brodo di carne', nameJapanese: '肉のブロード（スープ）', amount: '800ml' },
      { nameItalian: 'Cipolla', nameJapanese: '玉ねぎ', amount: '1/4個' },
      { nameItalian: 'Vino bianco', nameJapanese: '白ワイン', amount: '50ml' },
      { nameItalian: 'Burro', nameJapanese: 'バター', amount: '30g' },
      { nameItalian: 'Parmigiano Reggiano', nameJapanese: 'パルミジャーノ・レッジャーノ', amount: '30g', ingredientId: 'parmigiano' },
      SALE,
    ],
  },
  {
    id: 'risotto-taleggio',
    nameItalian: 'Risotto al taleggio',
    nameJapanese: 'タレッジョのリゾット',
    regionId: 'lombardia',
    tradition: 'regional',
    servings: 2,
    description:
      '仕上げにタレッジョを溶かし込むクリーミーなリゾット。ロンバルディアの家庭やトラットリアで見かける食べ方です。',
    imageUrl: dishArt('risotto-taleggio', {
      style: 'risotto', table: '#5a4636', base: '#f3e6c4', accent: '#ffffff', garnish: ['#e8c07d', '#d9a441'],
    }),
    keyIngredientIds: ['taleggio'],
    ingredients: [
      { nameItalian: 'Riso Carnaroli', nameJapanese: '米（カルナローリ種）', amount: '160g' },
      { nameItalian: 'Taleggio', nameJapanese: 'タレッジョ', amount: '80g', ingredientId: 'taleggio' },
      { nameItalian: 'Brodo vegetale', nameJapanese: '野菜のブロード', amount: '800ml' },
      { nameItalian: 'Cipolla', nameJapanese: '玉ねぎ', amount: '1/4個' },
      { nameItalian: 'Vino bianco', nameJapanese: '白ワイン', amount: '50ml' },
      { nameItalian: 'Burro', nameJapanese: 'バター', amount: '20g' },
      SALE,
    ],
  },
  {
    id: 'polenta-taleggio',
    nameItalian: 'Polenta con taleggio',
    nameJapanese: 'タレッジョのせポレンタ',
    regionId: 'lombardia',
    tradition: 'regional',
    servings: 2,
    description:
      'とうもろこし粉を練ったポレンタに、タレッジョをのせて溶かす北イタリアらしい温かい一皿。',
    imageUrl: dishArt('polenta-taleggio', {
      style: 'polenta', table: '#34495e', base: '#f4c542', accent: '#fbf1d8', garnish: ['#fff7e0', '#e8c07d'],
    }),
    keyIngredientIds: ['taleggio'],
    ingredients: [
      { nameItalian: 'Farina di mais', nameJapanese: 'ポレンタ粉（とうもろこし粉）', amount: '150g' },
      { nameItalian: 'Acqua', nameJapanese: '水', amount: '750ml' },
      { nameItalian: 'Taleggio', nameJapanese: 'タレッジョ', amount: '100g', ingredientId: 'taleggio' },
      { nameItalian: 'Burro', nameJapanese: 'バター', amount: '20g' },
      SALE,
    ],
  },

  // ---------------- Emilia-Romagna ----------------
  {
    id: 'tagliatelle-ragu',
    nameItalian: 'Tagliatelle al ragù',
    nameJapanese: 'ボローニャ風ラグーのタリアテッレ',
    regionId: 'emilia-romagna',
    tradition: 'traditional',
    servings: 2,
    description:
      '牛ひき肉と香味野菜をじっくり煮込んだラグーを、卵入り平打ち麺と合わせるボローニャの料理。仕上げにパルミジャーノを。',
    imageUrl: dishArt('tagliatelle-ragu', {
      style: 'long-pasta', table: '#6b4226', base: '#f0cf7e', accent: '#8e3b22', garnish: ['#7a2e1a', '#a0452b', '#fbf1d8'],
    }),
    keyIngredientIds: ['parmigiano'],
    ingredients: [
      { nameItalian: "Tagliatelle all'uovo", nameJapanese: '卵入りタリアテッレ', amount: '200g' },
      { nameItalian: 'Macinato di manzo', nameJapanese: '牛ひき肉', amount: '150g' },
      { nameItalian: 'Pancetta', nameJapanese: 'パンチェッタ', amount: '50g' },
      { nameItalian: 'Carota, sedano, cipolla', nameJapanese: 'にんじん・セロリ・玉ねぎ', amount: '各1/4本（個）' },
      { nameItalian: 'Passata di pomodoro', nameJapanese: 'トマトピューレ', amount: '100ml' },
      { nameItalian: 'Vino rosso', nameJapanese: '赤ワイン', amount: '50ml' },
      { nameItalian: 'Latte', nameJapanese: '牛乳', amount: '50ml' },
      { nameItalian: 'Parmigiano Reggiano', nameJapanese: 'パルミジャーノ・レッジャーノ', amount: '適量', ingredientId: 'parmigiano' },
      SALE,
    ],
  },
  {
    id: 'tortellini-brodo',
    nameItalian: 'Tortellini in brodo',
    nameJapanese: 'トルテッリーニのスープ仕立て',
    regionId: 'emilia-romagna',
    tradition: 'traditional',
    servings: 2,
    description:
      '肉やパルミジャーノを詰めた小さな詰め物パスタを、澄んだブロードで味わうボローニャやモデナの冬の料理。',
    imageUrl: dishArt('tortellini-brodo', {
      style: 'soup', table: '#2c3e50', base: '#e9c46a', accent: '#f3dca0', garnish: ['#f1d18a', '#e5b95c'],
    }),
    keyIngredientIds: ['parmigiano'],
    ingredients: [
      { nameItalian: 'Tortellini', nameJapanese: 'トルテッリーニ', amount: '200g' },
      { nameItalian: 'Brodo di cappone o di carne', nameJapanese: '鶏または肉のブロード', amount: '700ml' },
      { nameItalian: 'Parmigiano Reggiano', nameJapanese: 'パルミジャーノ・レッジャーノ', amount: '20g', ingredientId: 'parmigiano' },
      SALE,
    ],
  },

  // ---------------- Veneto ----------------
  {
    id: 'risotto-radicchio',
    nameItalian: 'Risotto al radicchio',
    nameJapanese: 'ラディッキオのリゾット',
    regionId: 'veneto',
    tradition: 'regional',
    servings: 2,
    description:
      '赤ワインとラディッキオで紫色に仕上げるリゾット。トレヴィーゾ周辺で冬によく食べられます。',
    imageUrl: dishArt('risotto-radicchio', {
      style: 'risotto', table: '#4b5d4f', base: '#8e3b5f', accent: '#f1d6e0', garnish: ['#6d1f45', '#a84a74', '#f3e9d2'],
    }),
    keyIngredientIds: ['radicchio'],
    ingredients: [
      { nameItalian: 'Riso Vialone Nano', nameJapanese: '米（ヴィアローネ・ナノ種）', amount: '160g' },
      { nameItalian: 'Radicchio rosso di Treviso', nameJapanese: 'ラディッキオ（トレヴィーゾ産）', amount: '200g', ingredientId: 'radicchio' },
      { nameItalian: 'Vino rosso', nameJapanese: '赤ワイン', amount: '50ml' },
      { nameItalian: 'Brodo vegetale', nameJapanese: '野菜のブロード', amount: '800ml' },
      { nameItalian: 'Cipolla', nameJapanese: '玉ねぎ', amount: '1/4個' },
      { nameItalian: 'Burro', nameJapanese: 'バター', amount: '20g' },
      { nameItalian: 'Parmigiano Reggiano', nameJapanese: 'パルミジャーノ・レッジャーノ', amount: '30g', ingredientId: 'parmigiano' },
      SALE,
    ],
  },
  {
    id: 'radicchio-ai-ferri',
    nameItalian: 'Radicchio trevigiano ai ferri',
    nameJapanese: 'ラディッキオのグリル',
    regionId: 'veneto',
    tradition: 'regional',
    servings: 2,
    description:
      '縦に割ったラディッキオをグリルし、オリーブオイルと塩で。苦みが和らぎ、甘みと香ばしさが出ます。',
    imageUrl: dishArt('radicchio-ai-ferri', {
      style: 'grill', table: '#3d3a36', base: '#f3e9e0', accent: '#6d1f45', garnish: ['#7a1f4a', '#8e2b58', '#6d1f45', '#9b3563'],
    }),
    keyIngredientIds: ['radicchio'],
    ingredients: [
      { nameItalian: 'Radicchio rosso di Treviso', nameJapanese: 'ラディッキオ', amount: '2株', ingredientId: 'radicchio' },
      { ...EVOO, amount: '大さじ2' },
      { nameItalian: 'Aceto di vino', nameJapanese: 'ワインビネガー', amount: '小さじ1' },
      SALE,
      PEPE,
    ],
  },

  // ---------------- Piemonte ----------------
  {
    id: 'risotto-porcini',
    nameItalian: 'Risotto ai funghi porcini',
    nameJapanese: 'ポルチーニのリゾット',
    regionId: 'piemonte',
    tradition: 'regional',
    servings: 2,
    description:
      'ポルチーニの香りを米に移したリゾット。きのこの季節の秋に、北イタリア各地でよく食べられます。',
    imageUrl: dishArt('risotto-porcini', {
      style: 'risotto', table: '#2f3e46', base: '#d9b98a', accent: '#fff4dc', garnish: ['#7b4a26', '#9a6337', '#5e3a1c', '#4a7a2a'],
    }),
    keyIngredientIds: ['porcini'],
    ingredients: [
      { nameItalian: 'Riso Carnaroli', nameJapanese: '米（カルナローリ種）', amount: '160g' },
      { nameItalian: 'Funghi porcini', nameJapanese: 'ポルチーニ（乾燥なら20g）', amount: '200g', ingredientId: 'porcini' },
      { nameItalian: 'Brodo vegetale', nameJapanese: '野菜のブロード', amount: '800ml' },
      { nameItalian: 'Scalogno', nameJapanese: 'エシャロット', amount: '1個' },
      { nameItalian: 'Vino bianco', nameJapanese: '白ワイン', amount: '50ml' },
      { nameItalian: 'Burro', nameJapanese: 'バター', amount: '20g' },
      { nameItalian: 'Parmigiano Reggiano', nameJapanese: 'パルミジャーノ・レッジャーノ', amount: '30g', ingredientId: 'parmigiano' },
      { nameItalian: 'Prezzemolo', nameJapanese: 'イタリアンパセリ', amount: '少々' },
      SALE,
    ],
  },

  // ---------------- Toscana ----------------
  {
    id: 'pappa-al-pomodoro',
    nameItalian: 'Pappa al pomodoro',
    nameJapanese: 'パッパ・アル・ポモドーロ',
    regionId: 'toscana',
    tradition: 'traditional',
    servings: 2,
    description:
      '固くなったトスカーナのパンを完熟トマトとブロードで煮崩す、パン粥のようなスープ。無駄なく使い切る農家の知恵の料理です。',
    imageUrl: dishArt('pappa-al-pomodoro', {
      style: 'soup', table: '#556b2f', base: '#d9482b', accent: '#e8a07a', garnish: ['#2e7d32', '#3a8c3f'],
    }),
    keyIngredientIds: ['pomodoro'],
    ingredients: [
      { nameItalian: 'Pane toscano raffermo', nameJapanese: '固くなったトスカーナパン', amount: '150g' },
      { nameItalian: 'Pomodori maturi', nameJapanese: '完熟トマト', amount: '400g', ingredientId: 'pomodoro' },
      { nameItalian: 'Brodo vegetale', nameJapanese: '野菜のブロード', amount: '400ml' },
      { ...AGLIO },
      { nameItalian: 'Basilico', nameJapanese: 'バジル', amount: 'ひとつかみ' },
      { ...EVOO, amount: '大さじ3' },
      SALE,
      PEPE,
    ],
  },
  {
    id: 'panzanella',
    nameItalian: 'Panzanella',
    nameJapanese: 'パンツァネッラ',
    regionId: 'toscana',
    tradition: 'traditional',
    servings: 2,
    description:
      '水で戻した固いパンにトマト、きゅうり、赤玉ねぎ、バジルを合わせる夏のサラダ。',
    imageUrl: dishArt('panzanella', {
      style: 'bread', table: '#6b8e9b', base: '#d8b27a', accent: '#d7261e', garnish: ['#e94b35', '#7cb342', '#8e3b5f', '#3a8c3f'],
    }),
    keyIngredientIds: ['pomodoro'],
    ingredients: [
      { nameItalian: 'Pane toscano raffermo', nameJapanese: '固くなったトスカーナパン', amount: '150g' },
      { nameItalian: 'Pomodori', nameJapanese: 'トマト', amount: '2個', ingredientId: 'pomodoro' },
      { nameItalian: 'Cetriolo', nameJapanese: 'きゅうり', amount: '1/2本' },
      { nameItalian: 'Cipolla rossa', nameJapanese: '赤玉ねぎ', amount: '1/4個' },
      { nameItalian: 'Basilico', nameJapanese: 'バジル', amount: '数枚' },
      { ...EVOO, amount: '大さじ3' },
      { nameItalian: 'Aceto di vino', nameJapanese: 'ワインビネガー', amount: '小さじ2' },
      SALE,
    ],
  },
  {
    id: 'tagliatelle-porcini',
    nameItalian: 'Tagliatelle ai funghi porcini',
    nameJapanese: 'ポルチーニのタリアテッレ',
    regionId: 'toscana',
    tradition: 'regional',
    servings: 2,
    description:
      'にんにくとオリーブオイルで炒めたポルチーニを平打ち麺と合わせる秋のパスタ。トスカーナやエミリア＝ロマーニャの山間部でよく見られます。',
    imageUrl: dishArt('tagliatelle-porcini', {
      style: 'long-pasta', table: '#4a3b2f', base: '#efd08c', accent: '#c9a26b', garnish: ['#7b4a26', '#9a6337', '#4a7a2a'],
    }),
    keyIngredientIds: ['porcini'],
    ingredients: [
      { nameItalian: "Tagliatelle all'uovo", nameJapanese: '卵入りタリアテッレ', amount: '200g' },
      { nameItalian: 'Funghi porcini', nameJapanese: 'ポルチーニ', amount: '200g', ingredientId: 'porcini' },
      { ...AGLIO },
      { nameItalian: 'Prezzemolo', nameJapanese: 'イタリアンパセリ', amount: '少々' },
      { ...EVOO, amount: '大さじ2' },
      SALE,
      PEPE,
    ],
  },
  {
    id: 'porcini-trifolati',
    nameItalian: 'Porcini trifolati',
    nameJapanese: 'ポルチーニのソテー',
    regionId: 'toscana',
    tradition: 'regional',
    servings: 2,
    description:
      'スライスしたポルチーニをにんにく、パセリ、オリーブオイルで炒める、きのこの香りを楽しむ付け合わせ。',
    imageUrl: dishArt('porcini-trifolati', {
      style: 'grill', table: '#2f3e46', base: '#e6c79c', accent: '#7b4a26', garnish: ['#8a5a32', '#a5703f', '#7b4a26', '#9a6337'],
    }),
    keyIngredientIds: ['porcini'],
    ingredients: [
      { nameItalian: 'Funghi porcini', nameJapanese: 'ポルチーニ', amount: '300g', ingredientId: 'porcini' },
      { ...AGLIO },
      { nameItalian: 'Prezzemolo', nameJapanese: 'イタリアンパセリ', amount: 'ひとつかみ' },
      { ...EVOO, amount: '大さじ3' },
      SALE,
      PEPE,
    ],
  },
];

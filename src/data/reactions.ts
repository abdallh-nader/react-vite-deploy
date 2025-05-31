import { Reaction } from '../context/SimulationContext';

export const reactions: Reaction[] = [
  // Acid-Base Reactions
  {
    id: 'acid-base-1',
    name: 'تعادل حمض وقاعدة – Acid-Base Neutralization',
    nameAr: 'تعادل حمض وقاعدة – Acid-Base Neutralization',
    description: 'This reaction produces sodium chloride (table salt) and water. It\'s a classic neutralization reaction.',
    descriptionAr: 'يُنتج هذا التفاعل كلوريد الصوديوم (ملح الطعام) والماء. إنه تفاعل تعادل كلاسيكي.',
    reactants: ['hcl', 'naoh'],
    products: ['nacl', 'h2o'],
    conditions: {
      temperature: 25,
      pressure: 1
    },
    effects: {
      color: '#F5F5F5',
      precipitate: true,
      temperature: 'increase'
    },
    formula: 'HCl + NaOH → NaCl + H₂O'
  },
  {
    id: 'acid-base-2',
    name: 'تفاعل الأمونيا مع الحمض – Ammonia with Acid Reaction',
    nameAr: 'تفاعل الأمونيا مع الحمض – Ammonia with Acid Reaction',
    description: 'NH₃ + HCl → NH₄Cl - Ammonia gas reacts with hydrochloric acid to form ammonium chloride salt.',
    descriptionAr: 'NH₃ + HCl → NH₄Cl - يتفاعل غاز الأمونيا مع حمض الهيدروكلوريك لتكوين ملح كلوريد الأمونيوم.',
    reactants: ['nh3', 'hcl'],
    products: ['nh4cl'],
    conditions: {
      temperature: 25,
      pressure: 1
    },
    effects: {
      color: '#FFFFFF',
      temperature: 'increase'
    },
    formula: 'NH₃ + HCl → NH₄Cl'
  },
  // Precipitation Reactions
  {
    id: 'precipitation-1',
    name: 'تفاعل نترات الفضة مع كلوريد الصوديوم – Silver Nitrate and Sodium Chloride Reaction',
    nameAr: 'تفاعل نترات الفضة مع كلوريد الصوديوم – Silver Nitrate and Sodium Chloride Reaction',
    description: 'AgNO₃ + NaCl → AgCl + NaNO₃ - A double displacement reaction that forms silver chloride precipitate.',
    descriptionAr: 'AgNO₃ + NaCl → AgCl + NaNO₃ - تفاعل إزاحة مزدوج يشكل راسب كلوريد الفضة.',
    reactants: ['agno3', 'nacl'],
    products: ['agcl', 'nano3'],
    conditions: {
      temperature: 25,
      pressure: 1
    },
    effects: {
      color: '#F5F5F5',
      precipitate: true
    },
    formula: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃'
  },
  {
    id: 'precipitation-2',
    name: 'تفاعل كلوريد الحديد(III) مع هيدروكسيد الصوديوم – Iron(III) Chloride with Sodium Hydroxide',
    nameAr: 'تفاعل كلوريد الحديد(III) مع هيدروكسيد الصوديوم – Iron(III) Chloride with Sodium Hydroxide',
    description: 'FeCl₃ + 3NaOH → Fe(OH)₃ + 3NaCl - This reaction forms a brown precipitate of iron(III) hydroxide.',
    descriptionAr: 'FeCl₃ + 3NaOH → Fe(OH)₃ + 3NaCl - يشكل هذا التفاعل راسبًا بنيًا من هيدروكسيد الحديد(III).',
    reactants: ['fecl3', 'naoh'],
    products: ['feoh3', 'nacl'],
    conditions: {
      temperature: 25,
      pressure: 1
    },
    effects: {
      color: '#A52A2A',
      precipitate: true
    },
    formula: 'FeCl₃ + 3NaOH → Fe(OH)₃↓ + 3NaCl'
  },
  // Gas Formation Reactions
  {
    id: 'gas-formation-1',
    name: 'تفاعل الخل مع كربونات الصوديوم – Vinegar and Sodium Carbonate Reaction',
    nameAr: 'تفاعل الخل مع كربونات الصوديوم – Vinegar and Sodium Carbonate Reaction',
    description: 'CH₃COOH + Na₂CO₃ → CH₃COONa + CO₂ + H₂O - This reaction produces bubbles of carbon dioxide gas.',
    descriptionAr: 'CH₃COOH + Na₂CO₃ → CH₃COONa + CO₂ + H₂O - ينتج هذا التفاعل فقاعات من غاز ثاني أكسيد الكربون.',
    reactants: ['ch3cooh', 'na2co3'],
    products: ['ch3coona', 'co2', 'h2o'],
    conditions: {
      temperature: 25,
      pressure: 1
    },
    effects: {
      color: '#FFF8E1',
      bubbles: true
    },
    formula: 'CH₃COOH + Na₂CO₃ → CH₃COONa + CO₂↑ + H₂O'
  },
  {
    id: 'gas-formation-2',
    name: 'تفاعل حمض الكبريتيك مع كربونات الصوديوم – Sulfuric Acid and Sodium Carbonate Reaction',
    nameAr: 'تفاعل حمض الكبريتيك مع كربونات الصوديوم – Sulfuric Acid and Sodium Carbonate Reaction',
    description: 'H₂SO₄ + Na₂CO₃ → Na₂SO₄ + CO₂ + H₂O - This reaction produces carbon dioxide gas.',
    descriptionAr: 'H₂SO₄ + Na₂CO₃ → Na₂SO₄ + CO₂ + H₂O - ينتج هذا التفاعل غاز ثاني أكسيد الكربون.',
    reactants: ['h2so4', 'na2co3'],
    products: ['na2so4', 'co2', 'h2o'],
    conditions: {
      temperature: 25,
      pressure: 1
    },
    effects: {
      color: '#D3D3D3',
      bubbles: true
    },
    formula: 'H₂SO₄ + Na₂CO₃ → Na₂SO₄ + CO₂↑ + H₂O'
  },
  // Combustion Reactions
  {
    id: 'combustion-1',
    name: 'تكوين الماء – Water Formation',
    nameAr: 'تكوين الماء – Water Formation',
    description: '2H₂ + O₂ → 2H₂O - This is a highly exothermic reaction that produces water.',
    descriptionAr: '2H₂ + O₂ → 2H₂O - هذا تفاعل شديد الحرارة ينتج الماء.',
    reactants: ['h2', 'o2'],
    products: ['h2o'],
    conditions: {
      temperature: 400,
      pressure: 1
    },
    effects: {
      color: '#D4F1F9',
      temperature: 'increase',
      fire: true,
      explosion: true // انفجار محتمل بسبب طبيعة التفاعل
    },
    formula: '2H₂ + O₂ → 2H₂O'
  },
  {
    id: 'combustion-2',
    name: 'احتراق الإيثانول – Ethanol Combustion',
    nameAr: 'احتراق الإيثانول – Ethanol Combustion',
    description: 'C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O - Ethanol burns in oxygen to produce carbon dioxide and water.',
    descriptionAr: 'C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O - يحترق الإيثانول في الأكسجين لإنتاج ثاني أكسيد الكربون والماء.',
    reactants: ['c2h5oh', 'o2'],
    products: ['co2', 'h2o'],
    conditions: {
      temperature: 300,
      pressure: 1
    },
    effects: {
      color: '#D3D3D3',
      temperature: 'increase',
      fire: true
    },
    formula: 'C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O'
  }
];
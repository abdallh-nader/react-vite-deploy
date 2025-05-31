import { Chemical } from '../context/SimulationContext';

export const chemicals: Chemical[] = [
  // Acids
  {
    id: 'hcl',
    name: 'Hydrochloric Acid',
    nameAr: 'حمض الهيدروكلوريك',
    color: '#DCFFDD',
    density: 1.49,
    state: 'liquid',
    formula: 'HCl'
  },
  {
    id: 'naoh',
    name: 'Sodium Hydroxide',
    nameAr: 'هيدروكسيد الصوديوم',
    color: 'F5F5F5',
    density: 2.13,
    state: 'solid',
    formula: 'NaOH'
  },
  {
    id: 'h2o',
    name: 'Water',
    nameAr: 'ماء',
    color: '#D4F1F9',
    density: 1.0,
    state: 'liquid',
    formula: 'H₂O'
  },
  {
    id: 'nacl',
    name: 'Sodium Chloride',
    nameAr: 'كلوريد الصوديوم',
    color: '#FFFFFF',
    density: 2.16,
    state: 'solid',
    formula: 'NaCl'
  },
  {
    id: 'cuso4',
    name: 'Copper Sulfate',
    nameAr: 'كبريتات النحاس',
    color: '#1E90FF',
    density: 3.6,
    state: 'solid',
    formula: 'CuSO₄'
  },
  {
    id: 'agno3',
    name: 'Silver Nitrate',
    nameAr: 'نترات الفضة',
    color: '#E8E8E8',
    density: 4.35,
    state: 'solid',
    formula: 'AgNO₃'
  },
  {
    id: 'nahco3',
    name: 'Sodium Bicarbonate',
    nameAr: 'بيكربونات الصوديوم',
    color: '#FFFFFF',
    density: 2.20,
    state: 'solid',
    formula: 'NaHCO₃'
  }
];
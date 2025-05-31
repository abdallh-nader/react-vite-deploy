import { createContext, useContext, useState, useCallback } from 'react';
import { reactions } from '../data/reactions';

export interface Chemical {
  id: string;
  name: string;
  nameAr: string;
  color: string;
  density: number;
  state: 'solid' | 'liquid' | 'gas';
  quantity?: number;
  formula?: string;
}

export interface Reaction {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  reactants: string[];
  products: string[];
  conditions: {
    temperature: number;
    pressure: number;
    catalyst?: string;
  };
  effects: {
    color: string;
    bubbles?: boolean;
    precipitate?: boolean;
    temperature?: 'increase' | 'decrease';
    smoke?: boolean;
    fire?: boolean;
    ice?: boolean;
    explosion?: boolean;
  };
  formula?: string;
}

interface SimulationContextType {
  selectedReaction: Reaction | null;
  selectReaction: (id: string) => void;
  selectedChemicals: Chemical[];
  addChemical: (id: string) => void;
  removeChemical: (id: string) => void;
  clearTestTube: () => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  pressure: number;
  setPressure: (press: number) => void;
  isReacting: boolean;
  startReaction: () => void;
  stopReaction: () => void;
  reactionResult: {
    color: string;
    hasBubbles: boolean;
    hasPrecipitate: boolean;
    temperatureChange: 'increase' | 'decrease' | 'none';
    temperature: number;
    hasGas?: boolean;
    hasSmoke?: boolean;
    hasFire?: boolean;
    hasIce?: boolean;
    hasExplosion?: boolean;
    formula?: string;
    soundEffect?: 'hissing' | 'bubbling' | 'fizzing' | 'explosion';
  } | null;
}

export const chemicals: Chemical[] = [
  { id: 'H2O', name: 'Water', nameAr: 'الماء', state: 'liquid', color: '#00B7EB', density: 1.0, formula: 'H₂O' },
  { id: 'HCl', name: 'Hydrochloric Acid', nameAr: 'حمض الهيدروكلوريك', state: 'liquid', color: '#FF6347', density: 1.18, formula: 'HCl' },
  { id: 'NaOH', name: 'Sodium Hydroxide', nameAr: 'هيدروكسيد الصوديوم', state: 'solid', color: '#FFD700', density: 2.13, formula: 'NaOH' },
  { id: 'NaCl', name: 'Sodium Chloride', nameAr: 'كلوريد الصوديوم', state: 'solid', color: '#FFFFFF', density: 2.16, formula: 'NaCl' },
  { id: 'CuSO4', name: 'Copper Sulfate', nameAr: 'كبريتات النحاس', state: 'solid', color: '#1E90FF', density: 3.6, formula: 'CuSO₄' },
  { id: 'H2SO4', name: 'Sulfuric Acid', nameAr: 'حمض الكبريتيك', state: 'liquid', color: '#DC143C', density: 1.84, formula: 'H₂SO₄' },
  { id: 'Na2CO3', name: 'Sodium Carbonate', nameAr: 'كربونات الصوديوم', state: 'solid', color: '#F0F8FF', density: 2.54, formula: 'Na₂CO₃' },
  { id: 'NH3', name: 'Ammonia', nameAr: 'الأمونيا', state: 'gas', color: '#98FB98', density: 0.73, formula: 'NH₃' },
  { id: 'O2', name: 'Oxygen', nameAr: 'الأكسجين', state: 'gas', color: '#87CEEB', density: 1.43, formula: 'O₂' },
  { id: 'H2', name: 'Hydrogen', nameAr: 'الهيدروجين', state: 'gas', color: '#FFB6C1', density: 0.09, formula: 'H₂' },
  { id: 'CO2', name: 'Carbon Dioxide', nameAr: 'ثاني أكسيد الكربون', state: 'gas', color: '#D3D3D3', density: 1.98, formula: 'CO₂' },
  { id: 'AgNO3', name: 'Silver Nitrate', nameAr: 'نترات الفضة', state: 'solid', color: '#C0C0C0', density: 4.35, formula: 'AgNO₃' },
  { id: 'FeCl3', name: 'Iron(III) Chloride', nameAr: 'كلوريد الحديد', state: 'solid', color: '#8B0000', density: 2.90, formula: 'FeCl₃' },
  { id: 'C2H5OH', name: 'Ethanol', nameAr: 'الإيثانول', state: 'liquid', color: '#F5F5DC', density: 0.79, formula: 'C₂H₅OH' },
  { id: 'CH3COOH', name: 'Acetic Acid', nameAr: 'حمض الخليك', state: 'liquid', color: '#FFFACD', density: 1.05, formula: 'CH₃COOH' },
];

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

const generateReactionFormula = (reactants: Chemical[], products: string[] = [], isSpontaneous: boolean = false) => {
  const leftSide = reactants.map(r => r.formula || r.id.toUpperCase()).join(' + ');

  if (products.length > 0) {
    const rightSide = products.map(p => {
      const chemical = chemicals.find(c => c.id === p);
      return chemical?.formula || p.toUpperCase();
    }).join(' + ');
    return `${leftSide} → ${rightSide}`;
  }

  if (isSpontaneous) {
    const reactantIds = reactants.map(r => r.id.toLowerCase());
    if (reactantIds.includes('hcl') && reactantIds.includes('naoh')) {
      return `${leftSide} → NaCl + H₂O`;
    }
    if (reactantIds.includes('h2so4') && reactantIds.includes('naoh')) {
      return `${leftSide} → Na₂SO₄ + H₂O`;
    }
    if ((reactantIds.includes('hcl') || reactantIds.includes('h2so4')) && reactantIds.includes('na2co3')) {
      return `${leftSide} → NaCl + H₂O + CO₂↑`;
    }
    if (reactantIds.includes('agno3') && reactantIds.includes('nacl')) {
      return `${leftSide} → AgCl↓ + NaNO₃`;
    }
    if (reactantIds.includes('cuso4') && reactantIds.includes('fecl3')) {
      return `${leftSide} → CuCl₂ + FeSO₄`;
    }
    if (reactantIds.includes('h2') && reactantIds.includes('o2')) {
      return `${leftSide} → H₂O`;
    }
    if (reactantIds.includes('c2h5oh') && reactantIds.includes('o2')) {
      return `${leftSide} → CO₂ + H₂O`;
    }
    return `${leftSide} → No Reaction`;
  }

  return leftSide;
};

const blendColors = (chemicals: Chemical[]): string => {
  if (chemicals.length === 0) return '#FFFFFF';
  if (chemicals.length === 1) return chemicals[0].color;

  let r = 0, g = 0, b = 0;
  let totalWeight = 0;

  chemicals.forEach(chem => {
    const quantity = chem.quantity || 1;
    const weight = chem.density * quantity;
    totalWeight += weight;

    const hex = chem.color.replace('#', '');
    r += parseInt(hex.substring(0, 2), 16) * weight;
    g += parseInt(hex.substring(2, 4), 16) * weight;
    b += parseInt(hex.substring(4, 6), 16) * weight;
  });

  if (totalWeight === 0) return '#FFFFFF';

  r = Math.round(r / totalWeight);
  g = Math.round(g / totalWeight);
  b = Math.round(b / totalWeight);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [selectedReaction, setSelectedReaction] = useState<Reaction | null>(null);
  const [selectedChemicals, setSelectedChemicals] = useState<Chemical[]>([]);
  const [temperature, setTemperature] = useState(25);
  const [pressure, setPressure] = useState(1);
  const [isReacting, setIsReacting] = useState(false);
  const [reactionResult, setReactionResult] = useState<SimulationContextType['reactionResult']>(null);

  const selectReaction = useCallback((id: string) => {
    const reaction = reactions.find(r => r.id === id) || null;
    setSelectedReaction(reaction);
    setSelectedChemicals([]);
    setReactionResult(null);
    setIsReacting(false);
  }, []);

  const addChemical = useCallback((id: string) => {
    const chemical = chemicals.find(c => c.id === id);
    if (!chemical) return;
    if (!selectedReaction && selectedChemicals.some(c => c.id === chemical.id)) return;
    setSelectedChemicals(prev => [...prev, { ...chemical, quantity: 1 }]);
  }, [selectedReaction, selectedChemicals]);

  const removeChemical = useCallback((id: string) => {
    setSelectedChemicals(prev => prev.filter(chemical => chemical.id !== id));
  }, []);

  const clearTestTube = useCallback(() => {
    setSelectedChemicals([]);
    setReactionResult(null);
    setIsReacting(false);
  }, []);

  const startReaction = useCallback(() => {
    if (selectedChemicals.length < 2) return;
    setIsReacting(true);

    if (selectedReaction) {
      setTimeout(() => {
        const temperatureChange = selectedReaction.effects.temperature || 'none';
        let finalTemp = selectedReaction.conditions.temperature;

        if (temperature > finalTemp && temperatureChange === 'increase') {
          finalTemp += 10;
        } else if (temperature < finalTemp && temperatureChange === 'decrease') {
          finalTemp -= 5;
        }

        if (pressure > 1.5 && temperatureChange === 'increase') {
          finalTemp += (pressure - 1) * 10;
        }

        const result: SimulationContextType['reactionResult'] = {
          color: selectedReaction.effects.color || '#FFFFFF',
          hasBubbles: !!selectedReaction.effects.bubbles,
          hasPrecipitate: !!selectedReaction.effects.precipitate,
          temperatureChange,
          temperature: finalTemp,
          hasGas: !!selectedReaction.effects.bubbles,
          hasSmoke: !!selectedReaction.effects.smoke,
          hasFire: !!selectedReaction.effects.fire,
          hasIce: !!selectedReaction.effects.ice,
          hasExplosion: !!selectedReaction.effects.explosion,
          formula: selectedReaction.formula || generateReactionFormula(selectedChemicals, selectedReaction.products),
          soundEffect: selectedReaction.effects.explosion ? 'explosion' :
                       selectedReaction.effects.fire ? 'hissing' :
                       selectedReaction.effects.bubbles ? 'bubbling' : undefined,
        };
        setReactionResult(result);
      }, 1500);
    } else {
      setTimeout(() => {
        const reactantIds = selectedChemicals.map(c => c.id.toLowerCase());
        const totalQuantity = selectedChemicals.reduce((sum, chem) => sum + (chem.quantity || 1), 0);
        const quantityFactor = Math.min(3, totalQuantity / 2) || 1;

        let mixedColor = blendColors(selectedChemicals);
        let tempChange: 'increase' | 'decrease' | 'none' = 'none';
        let finalTemp = temperature || 25;
        let hasBubbles = false;
        let hasPrecipitate = false;
        let hasGas = false;
        let hasSmoke = false;
        let hasFire = false;
        let hasIce = false;
        let hasExplosion = false;
        let soundEffect: 'hissing' | 'bubbling' | 'fizzing' | 'explosion' | undefined = undefined;
        let formula = generateReactionFormula(selectedChemicals, [], true);

        if (reactantIds.includes('hcl') && reactantIds.includes('naoh')) {
          mixedColor = '#e6f7ff';
          tempChange = 'increase';
          finalTemp = temperature + 15 * quantityFactor;
          hasBubbles = true;
          hasGas = true;
          soundEffect = 'bubbling';
          formula = `${selectedChemicals.map(c => c.formula).join(' + ')} → NaCl + H₂O`;
        } else if (reactantIds.includes('h2so4') && reactantIds.includes('naoh')) {
          mixedColor = '#e6f7ff';
          tempChange = 'increase';
          finalTemp = temperature + 15 * quantityFactor;
          hasBubbles = true;
          hasGas = true;
          soundEffect = 'bubbling';
          formula = `${selectedChemicals.map(c => c.formula).join(' + ')} → Na₂SO₄ + H₂O`;
        } else if ((reactantIds.includes('hcl') || reactantIds.includes('h2so4')) && reactantIds.includes('na2co3')) {
          mixedColor = '#d3d3d3';
          tempChange = 'increase';
          finalTemp = temperature + 10 * quantityFactor;
          hasBubbles = true;
          hasGas = true;
          hasSmoke = true;
          soundEffect = 'fizzing';
          formula = `${selectedChemicals.map(c => c.formula).join(' + ')} → NaCl + H₂O + CO₂↑`;
        } else if (reactantIds.includes('agno3') && reactantIds.includes('nacl')) {
          mixedColor = '#f5f5f5';
          tempChange = 'none';
          finalTemp = temperature;
          hasPrecipitate = true;
          formula = `${selectedChemicals.map(c => c.formula).join(' + ')} → AgCl↓ + NaNO₃`;
        } else if (reactantIds.includes('cuso4') && reactantIds.includes('fecl3')) {
          mixedColor = '#a5d6a7';
          tempChange = 'increase';
          finalTemp = temperature + 10 * quantityFactor;
          hasPrecipitate = true;
          formula = `${selectedChemicals.map(c => c.formula).join(' + ')} → CuCl₂ + FeSO₄`;
        } else if (reactantIds.includes('h2') && reactantIds.includes('o2')) {
          mixedColor = '#D4F1F9';
          tempChange = 'increase';
          finalTemp = temperature + 20 * quantityFactor;
          hasFire = true;
          hasExplosion = pressure > 2;
          soundEffect = hasExplosion ? 'explosion' : 'hissing';
          formula = `${selectedChemicals.map(c => c.formula).join(' + ')} → H₂O`;
        } else if (reactantIds.includes('c2h5oh') && reactantIds.includes('o2')) {
          mixedColor = '#D3D3D3';
          tempChange = 'increase';
          finalTemp = temperature + 15 * quantityFactor;
          hasFire = true;
          hasSmoke = true;
          soundEffect = 'hissing';
          formula = `${selectedChemicals.map(c => c.formula).join(' + ')} → CO₂ + H₂O`;
        } else {
          tempChange = 'none';
          finalTemp = temperature;
          hasBubbles = selectedChemicals.some(c => c.state === 'gas') || (pressure < 0.8);
          hasGas = hasBubbles;
          soundEffect = hasBubbles ? 'bubbling' : undefined;
        }

        if (pressure > 1.5 && tempChange === 'increase') {
          finalTemp += (pressure - 1) * 10;
        }

        if (typeof finalTemp !== 'number' || isNaN(finalTemp)) {
          finalTemp = 25;
        }

        if (tempChange === 'decrease' && finalTemp < 0) {
          hasIce = true;
        }

        const result: SimulationContextType['reactionResult'] = {
          color: mixedColor,
          hasBubbles,
          hasPrecipitate,
          temperatureChange: tempChange,
          temperature: finalTemp,
          hasGas,
          hasSmoke,
          hasFire,
          hasIce,
          hasExplosion,
          formula,
          soundEffect,
        };
        setReactionResult(result);
      }, 1500);
    }
  }, [selectedChemicals, selectedReaction, temperature, pressure]);

  const stopReaction = useCallback(() => {
    setIsReacting(false);
  }, []);

  return (
    <SimulationContext.Provider value={{
      selectedReaction,
      selectReaction,
      selectedChemicals,
      addChemical,
      removeChemical,
      clearTestTube,
      temperature,
      setTemperature,
      pressure,
      setPressure,
      isReacting,
      startReaction,
      stopReaction,
      reactionResult,
    }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
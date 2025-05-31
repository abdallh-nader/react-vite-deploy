import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../utils/i18n';
import { Search, Filter, Check } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { chemicals } from '../context/SimulationContext'; // استيراد من SimulationContext

interface Chemical {
  id: string;
  name: string;
  nameAr: string;
  state: 'solid' | 'liquid' | 'gas';
  color: string;
  density: number;
  formula: string;
  quantity?: number; // إضافة الخاصية الاختيارية
}

interface ChemicalSelectorProps {
  onSelectChemical: (chemicalId: string) => void;
  onCancel: () => void;
  isPouring: boolean;
}

const ChemicalSelector = ({ onSelectChemical, onCancel, isPouring }: ChemicalSelectorProps) => {
  const { language } = useTheme();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState<'all' | 'solid' | 'liquid' | 'gas'>('all');
  const [open, setOpen] = useState(false);
  const [filteredChemicals, setFilteredChemicals] = useState<Chemical[]>(chemicals);

  useEffect(() => {
    let filtered = [...chemicals];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(chem =>
        chem.name.toLowerCase().includes(searchLower) ||
        chem.nameAr.includes(searchLower) ||
        chem.id.toLowerCase().includes(searchLower)
      );
    }

    if (stateFilter !== 'all') {
      filtered = filtered.filter(chem => chem.state === stateFilter);
    }

    setFilteredChemicals(filtered);
  }, [searchTerm, stateFilter]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('search.chemicals')}
            className="w-full pl-8 p-2 rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">{t('filter.by.state')}</h4>
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStateFilter('all')}
                  className="justify-between"
                >
                  <span>{t('all.states')}</span>
                  {stateFilter === 'all' && <Check className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStateFilter('solid')}
                  className="justify-between"
                >
                  <span>{t('state.solid')}</span>
                  {stateFilter === 'solid' && <Check className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStateFilter('liquid')}
                  className="justify-between"
                >
                  <span>{t('state.liquid')}</span>
                  {stateFilter === 'liquid' && <Check className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStateFilter('gas')}
                  className="justify-between"
                >
                  <span>{t('state.gas')}</span>
                  {stateFilter === 'gas' && <Check className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
        {filteredChemicals.length > 0 ? (
          filteredChemicals.map((chemical) => (
            <Button
              key={chemical.id}
              onClick={() => onSelectChemical(chemical.id)}
              variant="secondary"
              size="sm"
              disabled={isPouring}
              className="flex items-center text-left"
            >
              <span
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: chemical.color }}
              ></span>
              <div className="flex flex-col">
                <span className="truncate text-xs font-medium">
                  {language === 'en' ? chemical.name : chemical.nameAr}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {language === 'en' ? chemical.state : t(`state.${chemical.state}`)}
                </span>
              </div>
            </Button>
          ))
        ) : (
          <div className="col-span-2 text-center py-4 text-sm text-muted-foreground">
            {t('no.results')}
          </div>
        )}
      </div>
      <Button
        onClick={onCancel}
        variant="secondary"
        className="w-full"
        disabled={isPouring}
      >
        {t('action.back')}
      </Button>
    </div>
  );
};

export default ChemicalSelector;
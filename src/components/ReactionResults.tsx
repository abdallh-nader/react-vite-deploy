
import React from 'react';
import { useTranslation } from '../utils/i18n';
import { ChevronsUpDown } from 'lucide-react';

interface ReactionResultProps {
  reactionResult: {
    color: string;
    temperatureChange: 'increase' | 'decrease' | 'none';
    hasBubbles: boolean;
    hasPrecipitate: boolean;
    hasSmoke: boolean;
    hasFire: boolean;
    hasIce: boolean;
    hasExplosion: boolean;
    formula?: string;
  };
  stateDescription: string;
  showStateChanges: boolean;
}

const ReactionResults = ({ 
  reactionResult, 
  stateDescription, 
  showStateChanges 
}: ReactionResultProps) => {
  const { t } = useTranslation();
  
  if (!reactionResult) return null;
  
  return (
    <div className="mt-6 p-4 rounded-lg bg-primary/10 animate-fade-in">
      <h3 className="text-lg font-medium mb-2">
        {t('sim.result')}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center">
          <div 
            className="w-4 h-4 rounded-full mr-2" 
            style={{ backgroundColor: reactionResult.color }}
          ></div>
          <span className="text-sm">
            {t('color.change')}
          </span>
        </div>
        
        {reactionResult.temperatureChange !== 'none' && (
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-2 ${
              reactionResult.temperatureChange === 'increase'
                ? 'bg-red-500'
                : 'bg-blue-500'
            }`}></div>
            <span className="text-sm">
              {reactionResult.temperatureChange === 'increase'
                ? t('temperature.increase')
                : t('temperature.decrease')
              }
            </span>
          </div>
        )}
        
        {reactionResult.hasBubbles && (
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full mr-2 bg-white/70"></div>
            <span className="text-sm">
              {t('gas.bubbles')}
            </span>
          </div>
        )}
        
        {reactionResult.hasPrecipitate && (
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full mr-2 bg-gray-300"></div>
            <span className="text-sm">
              {t('precipitate')}
            </span>
          </div>
        )}
        
        {reactionResult.hasSmoke && (
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full mr-2 bg-gray-400"></div>
            <span className="text-sm">
              {t('smoke.vapor')}
            </span>
          </div>
        )}
        
        {reactionResult.hasFire && (
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full mr-2 bg-orange-500"></div>
            <span className="text-sm">
              {t('fire.effect')}
            </span>
          </div>
        )}
        
        {reactionResult.hasIce && (
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full mr-2 bg-blue-300"></div>
            <span className="text-sm">
              {t('ice.effect')}
            </span>
          </div>
        )}
        
        {reactionResult.hasExplosion && (
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full mr-2 bg-red-600"></div>
            <span className="text-sm">
              {t('explosion.effect')}
            </span>
          </div>
        )}

        <div className="col-span-4 mt-4 bg-background/30 p-3 rounded-md flex items-center justify-center">
          <ChevronsUpDown className="w-5 h-5 mr-2 text-primary" />
          <span className="text-sm font-medium">
            {showStateChanges ? stateDescription : t('state.no.change')}
          </span>
        </div>
        
        {reactionResult.formula && (
          <div className="col-span-2 md:col-span-4 mt-2 p-2 bg-background/50 rounded-md text-sm font-mono">
            {reactionResult.formula}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReactionResults;

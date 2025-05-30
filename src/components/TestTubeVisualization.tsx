import React from 'react';
import { useTranslation } from '../utils/i18n';
import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, RefreshCw, ChevronDownIcon } from 'lucide-react';
import { ChevronUpIcon, ChevronsUpDown } from 'lucide-react';
import TestTube from './TestTube';
import ChemicalBottle from './ChemicalBottle';
import { Chemical } from '../context/SimulationContext';

interface ChemicalWithQuantity extends Chemical {
  quantity: number;
}

interface TestTubeVisualizationProps {
  isPouring: boolean;
  pouringChemical: Chemical | null;
  onPourComplete: () => void;
  isReacting: boolean;
  reactionResult: any;
  chemicalsWithQuantity: ChemicalWithQuantity[];
  isTestTubeBroken: boolean;
  onRestoreTestTube: () => void;
  isDangerousReaction: boolean;
  onStopReaction: () => void;
  showStateChanges: boolean;
  reactionStateDescription: string;
  bottleX?: number; // إحداثية X للزجاجة
  bottleY?: number; // إحداثية Y للزجاجة
}

const TestTubeVisualization = ({
  isPouring,
  pouringChemical,
  onPourComplete,
  isReacting,
  reactionResult,
  chemicalsWithQuantity,
  isTestTubeBroken,
  onRestoreTestTube,
  isDangerousReaction,
  onStopReaction,
  showStateChanges,
  reactionStateDescription,
  bottleX = -240, // القيمة الافتراضية 0
  bottleY = -22, // القيمة الافتراضية 0
}: TestTubeVisualizationProps) => {
  const { t } = useTranslation();
  
  // Get combined color for all substances
  const getCombinedColor = () => {
    if (!reactionResult || !reactionResult.color || chemicalsWithQuantity.length === 0) return "#cccccc";
    return reactionResult.color;
  };
  
  return (
    <div className="flex-1 flex items-center justify-center relative min-h-[400px]">
      {/* Chemical Bottle Animation */}
      {isPouring && pouringChemical && (
        <div style={{ position: 'absolute', transform: `translate(${bottleX}px, ${bottleY}px)` }}>
          <ChemicalBottle 
            chemical={pouringChemical}
            isPouring={isPouring}
            onPourComplete={onPourComplete}
          />
        </div>
      )}
      
      <TestTube 
        width={100} 
        height={300} 
        substances={isReacting && reactionResult ? [
          { 
            substance: {
              id: "reaction-result",
              name: "Reaction Result",
              nameAr: "نتيجة التفاعل",
              color: reactionResult.color || getCombinedColor(),
              state: reactionResult.hasGas ? "gas" : reactionResult.hasPrecipitate ? "solid" : "liquid",
              density: 1
            },
            volume: chemicalsWithQuantity.reduce((sum, chem) => sum + chem.quantity, 0) * 10
          }
        ] : chemicalsWithQuantity.map(chem => ({
          substance: chem,
          volume: chem.quantity * 10
        }))}
        showBubbles={reactionResult?.hasBubbles}
        showSmoke={reactionResult?.hasSmoke}
        shake={isReacting && !isTestTubeBroken}
        glow={reactionResult?.hasGlow}
        glowColor={reactionResult?.glowColor}
        showFire={reactionResult?.hasFire}
        showExplosion={reactionResult?.hasExplosion && !isTestTubeBroken}
        intensity={reactionResult?.intensity || 1}
        broken={isTestTubeBroken}
      />
      
      {/* Restore button appears when tube is broken */}
      {isTestTubeBroken && (
        <motion.button
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2 mb-2"
          onClick={onRestoreTestTube}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          {t('restore.tube', 'Restore Test Tube')}
        </motion.button>
      )}
      
      {isTestTubeBroken && (
        <motion.div 
          className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AlertTriangle className="w-4 h-4 inline-block mr-1 animate-pulse" />
          {t('tube.broken', 'Test tube broke due to violent reaction!')}
        </motion.div>
      )}
      
      {isDangerousReaction && isReacting && !isTestTubeBroken && (
        <motion.button
          className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors duration-200 animate-pulse flex items-center justify-center"
          onClick={onStopReaction}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          {t('reaction.emergency.stop', 'Emergency Stop!')}
        </motion.button>
      )}
      
      {chemicalsWithQuantity.length === 0 && !isReacting && !isTestTubeBroken && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-muted-foreground p-4 rounded-lg bg-background/50 backdrop-blur-sm animate-fade-in max-w-[200px]">
          <AlertCircle className="w-6 h-6 mx-auto mb-2" />
          <p className="text-sm">
            {t('add.chemicals')}
          </p>
        </div>
      )}
      
      {/* State Change Display Below the Test Tube */}
      {showStateChanges && reactionResult && (
        <div className="mt-4 p-3 bg-background/30 rounded-md flex items-center justify-center absolute bottom-[-3rem] left-0 right-0">
          <ChevronsUpDown className="w-5 h-5 mr-2 text-primary" />
          <span className="text-sm font-medium">
            {reactionStateDescription || t('state.no.change')}
          </span>
        </div>
      )}
    </div>
  );
};

export default TestTubeVisualization;
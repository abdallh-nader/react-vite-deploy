import React, { useEffect, useRef, useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../utils/i18n';
import TestTube from './TestTube';
import { ReactionControls } from './ReactionControls';
import { Info, AlertCircle, ListChecks, Flame, Snowflake, ChevronsUpDown, Cloud, Bomb } from 'lucide-react';
import { chemicals } from '../context/SimulationContext'; // استيراد من SimulationContext
import { motion } from 'framer-motion';
import { Chemical } from '../context/SimulationContext';
import BrokenTestTube from './BrokenTestTube';
import { useToast } from "@/hooks/use-toast";
import ChemicalBottle from './ChemicalBottle';

interface AudioRefs {
  bubbling: React.RefObject<HTMLAudioElement>;
  hissing: React.RefObject<HTMLAudioElement>;
  explosion: React.RefObject<HTMLAudioElement>;
  fizzing: React.RefObject<HTMLAudioElement>;
}   

interface SimulationAreaProps {
  autoSelectReaction?: string | null;
  soundEnabled?: boolean;
  audioRefs?: AudioRefs;
  showResultsAboveReactants?: boolean;
  useChemicalBottle?: boolean;
  autoRestoreOnExplosion?: boolean;
  sequentialPouring?: boolean;
}

const SimulationAreaWithProvider = ({ 
  autoSelectReaction, 
  soundEnabled = true, 
  audioRefs, 
  showResultsAboveReactants = true,
  useChemicalBottle = false,
  autoRestoreOnExplosion = false,
  sequentialPouring = false
}: SimulationAreaProps) => {
  try {
    useSimulation();
    return <SimulationAreaContent {...{ autoSelectReaction, soundEnabled, audioRefs, showResultsAboveReactants, useChemicalBottle, autoRestoreOnExplosion, sequentialPouring }} />;
  } catch (error) {
    console.error("SimulationArea must be used within a SimulationProvider", error);
    return null;
  }
};

const SimulationAreaContent = ({ 
  autoSelectReaction, 
  soundEnabled = true, 
  audioRefs, 
  showResultsAboveReactants = true,
  useChemicalBottle = false,
  autoRestoreOnExplosion = false,
  sequentialPouring = false
}: SimulationAreaProps) => {
  const { 
    selectedReaction, 
    reactionResult, 
    selectedChemicals,
    addChemical,
    selectReaction,
    clearTestTube,
    stopReaction,
    isReacting,
    startReaction
  } = useSimulation();
  const { language } = useTheme();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [tubeIsBroken, setTubeIsBroken] = useState(false);
  const [isPouringChemical, setIsPouringChemical] = useState(false);
  const [currentChemicalIndex, setCurrentChemicalIndex] = useState(-1);
  const [currentPouringChemical, setCurrentPouringChemical] = useState<Chemical | null>(null);

  const getStateChangeDescription = () => {
    if (!reactionResult || !isReacting) return '';

    let newState = '';
    if (reactionResult.hasExplosion || false) newState = t('state.explosion');
    else if (reactionResult.hasFire || false) newState = t('state.fire');
    else if (reactionResult.hasGas || false) newState = t('state.gas');
    else if (reactionResult.hasSmoke || false) newState = t('state.smoke');
    else if (reactionResult.hasIce || false) newState = t('state.solid');
    else if (reactionResult.hasPrecipitate || false) newState = t('state.solid');
    else newState = t('state.liquid');

    if (selectedChemicals.length < 2) return t('state.insufficient', 'Insufficient reactants for reaction');
    return t('state.change.description', 'Reactants transformed into {{state}} state', { state: newState });
  };

  const stateChangeDescription = getStateChangeDescription();
  const showStateChanges = Boolean(reactionResult && isReacting);

  useEffect(() => {
    if (!selectedReaction || selectedChemicals.length > 0 || !sequentialPouring) return;

    if (selectedReaction.reactants.length > 0 && currentChemicalIndex === -1 && !isPouringChemical) {
      setCurrentChemicalIndex(0);
    }
  }, [selectedReaction, selectedChemicals.length, currentChemicalIndex, isPouringChemical, sequentialPouring]);

  useEffect(() => {
    if (!selectedReaction || !sequentialPouring || currentChemicalIndex === -1 || isPouringChemical) return;

    if (currentChemicalIndex < selectedReaction.reactants.length) {
      const reactantId = selectedReaction.reactants[currentChemicalIndex];
      const chemical = chemicals.find(c => c.id === reactantId);
      if (chemical) {
        setCurrentPouringChemical(chemical);
        setIsPouringChemical(true);
      } else {
        setCurrentChemicalIndex(prev => prev + 1);
      }
    } else {
      setCurrentChemicalIndex(-1);
    }
  }, [currentChemicalIndex, selectedReaction, isPouringChemical, sequentialPouring]);

  const handlePourComplete = () => {
    if (currentPouringChemical && selectedReaction) {
      addChemical(currentPouringChemical.id);
      setIsPouringChemical(false);
      setCurrentPouringChemical(null);
      setCurrentChemicalIndex(prev => prev + 1);
    }
  };

  useEffect(() => {
    const cleanupReaction = () => {
      clearTestTube();
      setCurrentChemicalIndex(-1);
      setIsPouringChemical(false);
      setCurrentPouringChemical(null);
    };

    cleanupReaction();
    return cleanupReaction;
  }, [clearTestTube]);

  useEffect(() => {
    if (autoSelectReaction && typeof autoSelectReaction === 'string') {
      selectReaction(autoSelectReaction);
    }
  }, [autoSelectReaction, selectReaction]);

  useEffect(() => {
    if (selectedReaction && !isReacting && selectedChemicals.length === 0 && !sequentialPouring) {
      selectedReaction.reactants.slice(0, 2).forEach(reactantId => addChemical(reactantId));
    }
  }, [selectedReaction, selectedChemicals.length, isReacting, addChemical, sequentialPouring]);

  useEffect(() => {
    if (reactionResult && isReacting && (reactionResult.hasExplosion || false)) {
      const explosionTimer = setTimeout(() => {
        setTubeIsBroken(true);
        if (soundEnabled && audioRefs?.explosion.current) {
          audioRefs.explosion.current.volume = 0.7;
          audioRefs.explosion.current.play().catch(e => console.log('Could not play sound:', e));
        }
      }, 1500);

      const stopTimer = setTimeout(() => {
        stopReaction();
        if (autoRestoreOnExplosion) {
          setTubeIsBroken(false);
          clearTestTube();
        }
      }, 8000);

      return () => {
        clearTimeout(explosionTimer);
        clearTimeout(stopTimer);
      };
    } else if (!isReacting) {
      setTubeIsBroken(false);
    }
  }, [reactionResult, isReacting, stopReaction, soundEnabled, audioRefs, autoRestoreOnExplosion, clearTestTube]);

  useEffect(() => {
    if (!soundEnabled || !audioRefs || !reactionResult) return;

    Object.values(audioRefs).forEach(audioRef => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    });

    if (isReacting && reactionResult) {
      if ((reactionResult.hasExplosion || false) && audioRefs.explosion.current) {
        audioRefs.explosion.current.play().catch(e => console.log('Could not play sound:', e));
      } else if ((reactionResult.hasBubbles || false) && audioRefs.bubbling.current) {
        audioRefs.bubbling.current.play().catch(e => console.log('Could not play sound:', e));
      } else if ((reactionResult.hasFire || false) && audioRefs.hissing.current) {
        audioRefs.hissing.current.play().catch(e => console.log('Could not play sound:', e));
      }
    }
  }, [isReacting, reactionResult, soundEnabled, audioRefs]);

  const generateChemicalEquation = () => {
    if (!selectedReaction || selectedChemicals.length < 2) return t('equation.unavailable', 'Chemical equation unavailable');

    const reactants = selectedReaction.reactants.slice(0, 2).map(id => {
      const chemical = chemicals.find(c => c.id === id);
      return chemical?.formula || id.toUpperCase();
    }).join(' + ');

    const products = selectedReaction.products.slice(0, 1).map(id => {
      const chemical = chemicals.find(c => c.id === id);
      return chemical?.formula || id.toUpperCase();
    }).join(' + ');

    return `${reactants} → ${products}`;
  };

  const getReactantDetails = () => {
    if (!selectedReaction) return [];
    return selectedReaction.reactants.slice(0, 2).map(id => {
      const chemical = chemicals.find(c => c.id === id);
      return chemical ? {
        id: chemical.id,
        name: language === 'en' ? chemical.name : chemical.nameAr,
        state: chemical.state,
        color: chemical.color,
        formula: chemical.formula || chemical.id
      } : null;
    }).filter((item): item is NonNullable<typeof item> => item !== null);
  };

  const reactantDetails = getReactantDetails();

  const handleStartReaction = () => {
    if (selectedReaction && selectedChemicals.length >= 2) {
      startReaction();
      toast({ title: t('reaction.started'), description: t('reaction.in.progress'), duration: 3000 });
    } else {
      toast({ title: t('error'), description: t('reaction.noChemicals'), variant: "destructive" });
    }
  };

  const handleResetReaction = () => {
    clearTestTube();
    setCurrentChemicalIndex(-1);
    setIsPouringChemical(false);
    setCurrentPouringChemical(null);
    toast({ title: t('reaction.reset'), description: t('reaction.reset.description'), duration: 3000 });
  };

  const handleStopReaction = () => {
    stopReaction();
    toast({ title: t('reaction.stopped'), description: t('reaction.completed'), duration: 3000 });
  };

  return (
    <div className="container mx-auto px-4 py-6 relative z-10" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <motion.div className="glass rounded-xl p-6 shadow-lg h-full flex flex-col">
            <div className="flex-1 flex items-center justify-center relative min-h-[400px]">
              {currentPouringChemical && isPouringChemical && useChemicalBottle && (
                <ChemicalBottle chemical={currentPouringChemical} isPouring={isPouringChemical} onPourComplete={handlePourComplete} />
              )}
              {tubeIsBroken ? (
                <BrokenTestTube width={120} height={350} color={reactionResult?.color || "#cccccc"} />
              ) : (
                <TestTube
                  width={120}
                  height={350}
                  substances={isReacting && reactionResult ? [{ substance: { id: "reaction-result", name: "Reaction Result", nameAr: "نتيجة التفاعل", color: reactionResult.color || "#cccccc", state: (reactionResult.hasGas || false) ? "gas" : (reactionResult.hasPrecipitate || false) ? "solid" : (reactionResult.hasIce || false) ? "solid" : "liquid", density: 1 }, volume: 20 }] : selectedChemicals.map(chem => ({ substance: chem, volume: 10 }))}
                  showBubbles={reactionResult?.hasBubbles || false}
                  showSmoke={reactionResult?.hasSmoke || false}
                  showFire={reactionResult?.hasFire || false}
                  showIce={reactionResult?.hasIce || false}
                  showExplosion={(reactionResult?.hasExplosion || false) && !tubeIsBroken}
                  shake={isReacting}
                />
              )}
              {selectedChemicals.length === 0 && !isReacting && !selectedReaction && !isPouringChemical && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-muted-foreground p-4 rounded-lg bg-background/50 backdrop-blur-sm animate-fade-in max-w-[200px]">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm">{t('select.reaction')}</p>
                </div>
              )}
            </div>
            {reactionResult && !showResultsAboveReactants && (
              <motion.div className="mt-6 p-4 rounded-lg bg-primary/10">
                <h3 className="text-lg font-medium mb-2">{t('sim.result')}</h3>
                {selectedReaction && <div className="p-2 mb-3 bg-background/40 rounded-md text-center"><p className="font-mono text-lg">{generateChemicalEquation()}</p></div>}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full" style={{ backgroundColor: reactionResult.color || "#cccccc" }}></div><span className="text-sm">{t('color.change')}</span></div>
                  {(reactionResult.hasBubbles || false) && <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-white/70"></div><span className="text-sm">{t('gas.bubbles')}</span></div>}
                  {(reactionResult.hasPrecipitate || false) && <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-gray-300"></div><span className="text-sm">{t('precipitate')}</span></div>}
                  {(reactionResult.hasSmoke || false) && <div className="flex items-center gap-2"><Cloud className="w-4 h-4 text-gray-400" /><span className="text-sm">{t('smoke.vapor')}</span></div>}
                  {(reactionResult.hasFire || false) && <div className="flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500" /><span className="text-sm">{t('fire.effect')}</span></div>}
                  {(reactionResult.hasIce || false) && <div className="flex items-center gap-2"><Snowflake className="w-4 h-4 text-blue-300" /><span className="text-sm">{t('ice.effect')}</span></div>}
                  {(reactionResult.hasExplosion || false) && <div className="flex items-center gap-2"><Bomb className="w-4 h-4 text-red-600" /><span className="text-sm">{t('explosion.effect')}</span></div>}
                  <div className="col-span-2 md:col-span-4 mb-4 bg-background/60 p-3 rounded-md border border-primary/20 flex items-center justify-center gap-2">
                    <ChevronsUpDown className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">{stateChangeDescription}</span>
                  </div>
                </div>
              </motion.div>
            )}
            {selectedReaction && (
              <motion.div className="mt-6 p-4 rounded-lg bg-primary/10">
                <h3 className="text-lg font-medium flex items-center gap-2"><Info className="w-5 h-5" />{language === 'en' ? selectedReaction.name : selectedReaction.nameAr}</h3>
                <div className="mt-3 p-2 bg-background/40 rounded-md text-center"><p className="font-mono text-lg">{generateChemicalEquation()}</p></div>
                {reactantDetails.length > 0 && (
                  <div className="mt-4 border-t border-primary/20 pt-3">
                    <h4 className="text-sm font-medium flex items-center mb-2 gap-2"><ListChecks className="w-4 h-4" />{t('reactants')}</h4>
                    <div className="grid grid-cols-1 gap-2">{reactantDetails.map(chemical => (
                      <div key={chemical.id} className="flex items-center p-2 rounded-md bg-background/40 gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chemical.color }}></div>
                        <div><div className="text-sm font-medium">{chemical.name}</div><div className="text-xs text-muted-foreground">{chemical.formula && <span className="font-mono mr-2">{chemical.formula}</span>}{t('state')}: {t(`state.${chemical.state}`)}</div></div>
                      </div>
                    ))}</div>
                  </div>
                )}
              </motion.div>
            )}
            {reactionResult && showResultsAboveReactants && (
              <motion.div className="mt-6 p-4 rounded-lg bg-primary/10">
                <h3 className="text-lg font-medium mb-2">{t('sim.result')}</h3>
                {selectedReaction && <div className="p-2 mb-3 bg-background/40 rounded-md text-center"><p className="font-mono text-lg">{generateChemicalEquation()}</p></div>}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full" style={{ backgroundColor: reactionResult.color || "#cccccc" }}></div><span className="text-sm">{t('color.change')}</span></div>
                  {(reactionResult.hasBubbles || false) && <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-white/70"></div><span className="text-sm">{t('gas.bubbles')}</span></div>}
                  {(reactionResult.hasPrecipitate || false) && <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-gray-300"></div><span className="text-sm">{t('precipitate')}</span></div>}
                  {(reactionResult.hasSmoke || false) && <div className="flex items-center gap-2"><Cloud className="w-4 h-4 text-gray-400" /><span className="text-sm">{t('smoke.vapor')}</span></div>}
                  {(reactionResult.hasFire || false) && <div className="flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500" /><span className="text-sm">{t('fire.effect')}</span></div>}
                  {(reactionResult.hasIce || false) && <div className="flex items-center gap-2"><Snowflake className="w-4 h-4 text-blue-300" /><span className="text-sm">{t('ice.effect')}</span></div>}
                  {(reactionResult.hasExplosion || false) && <div className="flex items-center gap-2"><Bomb className="w-4 h-4 text-red-600" /><span className="text-sm">{t('explosion.effect')}</span></div>}
                  <div className="col-span-2 md:col-span-4 mb-4 bg-background/60 p-3 rounded-md border border-primary/20 flex items-center justify-center gap-2">
                    <ChevronsUpDown className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">{stateChangeDescription}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
        <div className="lg:col-span-1">
          <ReactionControls soundEnabled={soundEnabled} audioRefs={audioRefs} />
        </div>
      </div>
    </div>
  );
};

export const SimulationArea = SimulationAreaWithProvider;
export default SimulationArea;
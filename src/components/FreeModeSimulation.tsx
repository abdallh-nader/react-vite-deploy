import { useState, useEffect, useRef } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../utils/i18n';
import { motion } from 'framer-motion';
import { 
  Beaker, 
  CirclePlay,
  CircleStop,
  Trash2, 
  Plus,
  RefreshCw 
} from 'lucide-react';
import { chemicals } from '../data/chemicals';
import { Chemical } from '../context/SimulationContext';
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import MobileReactionControls from './MobileReactionControls';
import ChemicalSelector from './ChemicalSelector';
import ChemicalList from './ChemicalList';
import ReactionParameters from './ReactionParameters';
import ReactionResults from './ReactionResults';
import TestTubeVisualization from './TestTubeVisualization';

interface ChemicalWithQuantity extends Chemical {
  quantity: number;
}

interface AudioRefs {
  bubbling: React.RefObject<HTMLAudioElement>;
  hissing: React.RefObject<HTMLAudioElement>;
  explosion: React.RefObject<HTMLAudioElement>;
  fizzing: React.RefObject<HTMLAudioElement>;
  pouring: React.RefObject<HTMLAudioElement>;
  smoke: React.RefObject<HTMLAudioElement>;
  glass_break: React.RefObject<HTMLAudioElement>;
  danger: React.RefObject<HTMLAudioElement>;
}

interface FreeModeSimulationProps {
  soundEnabled?: boolean;
  audioRefs?: AudioRefs;
  showResultsAboveReactants?: boolean;
}

export const FreeModeSimulation = ({ 
  soundEnabled = true, 
  audioRefs: externalAudioRefs,
  showResultsAboveReactants = false 
}: FreeModeSimulationProps) => {
  const { language } = useTheme();
  const { t } = useTranslation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { 
    selectedChemicals,
    addChemical,
    clearTestTube,
    temperature,
    setTemperature,
    pressure,
    setPressure,
    isReacting,
    startReaction,
    stopReaction,
    reactionResult
  } = useSimulation();

  // Validate that addChemical is a function
  if (typeof addChemical !== 'function') {
    console.error('addChemical is not a function. Check SimulationContext.');
    toast({
      variant: 'destructive',
      title: t('error', 'Error'),
      description: t('context.error', 'Simulation context is not properly set up.'),
    });
  }
  
  // Define internal audioRefs if externalAudioRefs is not provided
  const internalAudioRefs: AudioRefs = {
    bubbling: useRef<HTMLAudioElement>(null),
    hissing: useRef<HTMLAudioElement>(null),
    explosion: useRef<HTMLAudioElement>(null),
    fizzing: useRef<HTMLAudioElement>(null),
    pouring: useRef<HTMLAudioElement>(null),
    smoke: useRef<HTMLAudioElement>(null),
    glass_break: useRef<HTMLAudioElement>(null),
    danger: useRef<HTMLAudioElement>(null),
  };

  // Use externalAudioRefs if provided, otherwise use internalAudioRefs
  const audioRefs = externalAudioRefs || internalAudioRefs;

  // Initialize all state hooks
  const [isSelectingChemical, setIsSelectingChemical] = useState(false);
  const [pouringChemical, setPouringChemical] = useState<Chemical | null>(null);
  const [isPouring, setIsPouring] = useState(false);
  const [chemicalsWithQuantity, setChemicalsWithQuantity] = useState<ChemicalWithQuantity[]>([]);
  const [globalQuantity, setGlobalQuantity] = useState<number>(2);
  const [reactionStateDescription, setReactionStateDescription] = useState<string>('');
  const [showStateChanges, setShowStateChanges] = useState<boolean>(false);
  const [isTestTubeBroken, setIsTestTubeBroken] = useState<boolean>(false);
  const [shouldResetTube, setShouldResetTube] = useState<boolean>(false);
  const [savedChemicalsBeforeExplosion, setSavedChemicalsBeforeExplosion] = useState<ChemicalWithQuantity[]>([]);
  const [bottleX, setBottleX] = useState<number | undefined>(undefined); // X position of the pouring bottle
  const [bottleY, setBottleY] = useState<number | undefined>(undefined); // Y position of the pouring bottle

  // Preload audio files
  useEffect(() => {
    const preloadAudio = async () => {
      try {
        const audioElements = [
          { ref: audioRefs.bubbling, src: '/sounds/bubbling.mp3', loop: true },
          { ref: audioRefs.hissing, src: '/sounds/hissing.mp3', loop: true },
          { ref: audioRefs.explosion, src: '/sounds/explosion.mp3', loop: false },
          { ref: audioRefs.fizzing, src: '/sounds/fizzing.mp3', loop: true },
          { ref: audioRefs.pouring, src: '/sounds/pouring.mp3', loop: false },
          { ref: audioRefs.smoke, src: '/sounds/smoke.mp3', loop: true },
          { ref: audioRefs.glass_break, src: '/sounds/glass_break.mp3', loop: false },
          { ref: audioRefs.danger, src: '/sounds/danger.mp3', loop: true },
        ];

        for (const { ref, src, loop } of audioElements) {
          if (ref.current) {
            ref.current.src = src;
            ref.current.loop = loop;
            await new Promise((resolve) => {
              ref.current!.addEventListener('canplaythrough', resolve, { once: true });
              ref.current!.load();
            });
          }
        }
        console.log('All audio files preloaded successfully');
      } catch (error) {
        console.error('Error preloading audio files:', error);
        toast({
          variant: 'destructive',
          title: t('audio.error.title', 'Audio Error'),
          description: t('audio.error.description', 'Could not load sound effects. The app will continue without sound.'),
        });
      }
    };

    if (!externalAudioRefs) {
      preloadAudio();
    }
  }, [audioRefs, t, toast, externalAudioRefs]);

  // Update chemicals with quantity
  useEffect(() => {
    const newChemicalsWithQuantity = selectedChemicals.map(chem => {
      const existingChem = chemicalsWithQuantity.find(c => c.id === chem.id && c.color === chem.color);
      return {
        ...chem,
        quantity: existingChem ? existingChem.quantity : globalQuantity
      };
    });
    setChemicalsWithQuantity(newChemicalsWithQuantity);
  }, [selectedChemicals, globalQuantity]);

  // Handle sound effects
  useEffect(() => {
    if (!soundEnabled || !reactionResult) return;

    Object.values(audioRefs).forEach(ref => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });

    if (isReacting && reactionResult) {
      const playSound = (sound: string, volume: number) => {
        const ref = audioRefs[sound as keyof AudioRefs];
        if (ref?.current) {
          ref.current.volume = volume;
          ref.current.play().catch(e => console.log('Could not play sound:', e));
        }
      };

      if (reactionResult.hasExplosion || reactionResult.soundEffect === 'explosion') {
        setSavedChemicalsBeforeExplosion([...chemicalsWithQuantity]);
        setIsTestTubeBroken(true);
        playSound('explosion', 0.7);
        playSound('glass_break', 0.6);

        const timer = setTimeout(() => {
          setShouldResetTube(true);
          stopReaction();
        }, 3000);

        return () => clearTimeout(timer);
      } else if (reactionResult.soundEffect === 'hissing') {
        playSound('hissing', 0.5);
      } else if (reactionResult.soundEffect === 'bubbling') {
        playSound('bubbling', 0.4);
      } else if (reactionResult.soundEffect === 'fizzing') {
        playSound('fizzing', 0.3);
      } else if (reactionResult.hasSmoke) {
        playSound('smoke', 0.5);
      } else if (reactionResult.temperature > 100) {
        playSound('danger', 0.6);
      }
    }

    return () => {
      if (soundEnabled) {
        Object.values(audioRefs).forEach(ref => {
          if (ref.current) {
            ref.current.pause();
            ref.current.currentTime = 0;
          }
        });
      }
    };
  }, [isReacting, reactionResult, soundEnabled, audioRefs, stopReaction, chemicalsWithQuantity]);

  // Reset test tube after explosion
  useEffect(() => {
    if (shouldResetTube) {
      setIsTestTubeBroken(false);
      setShouldResetTube(false);
      stopReaction();
      toast({
        title: t('tube.restored', 'Test Tube Restored'),
        description: t('tube.restored.description', 'The test tube has been restored.'),
      });
    }
  }, [shouldResetTube, stopReaction, t, toast]);

  // Update reaction state description
  useEffect(() => {
    if (isReacting && reactionResult) {
      let newState = '';
      if (reactionResult.hasGas || reactionResult.hasBubbles) {
        newState = t('state.gas', 'Gas');
      } else if (reactionResult.hasPrecipitate || reactionResult.hasIce) {
        newState = t('state.solid', 'Solid');
      } else {
        newState = t('state.liquid', 'Liquid');
      }
      const description = t('state.change.description', 'Reactants transformed into {{state}} state', { state: newState });
      setReactionStateDescription(description);
      setShowStateChanges(true);
    } else {
      setShowStateChanges(false);
    }
  }, [reactionResult, isReacting, t]);

  const handleSelectChemical = (chemicalId: string) => {
    const chemical = chemicals.find(c => c.id === chemicalId);
    if (!chemical) {
      console.error('Chemical not found:', chemicalId);
      toast({
        variant: 'destructive',
        title: t('error', 'Error'),
        description: t('chemical.not.found', 'Selected chemical not found.'),
      });
      return;
    }

    // Set initial bottle position for pouring animation (adjust as needed)
    setBottleX(50); // Example X coordinate (center of the screen)
    setBottleY(-180); // Example Y coordinate (above the test tube)

    setPouringChemical(chemical);
    setIsPouring(true);
    setIsSelectingChemical(false);

    if (soundEnabled && audioRefs.pouring.current) {
      audioRefs.pouring.current.volume = 0.3;
      audioRefs.pouring.current.currentTime = 0;
      audioRefs.pouring.current.play().catch(e => console.log('Could not play sound:', e));
    }
  };

  const handlePourComplete = () => {
    if (!pouringChemical || !pouringChemical.id) {
      console.warn('No pouring chemical set or invalid ID');
      setIsPouring(false);
      setPouringChemical(null);
      setBottleX(undefined); // Reset position when pouring is complete
      setBottleY(undefined);
      toast({
        variant: 'destructive',
        title: t('error', 'Error'),
        description: t('chemical.add.failed', 'Failed to add chemical: No chemical selected.'),
      });
      return;
    }

    try {
      if (typeof addChemical === 'function') {
        addChemical(pouringChemical.id);
        toast({
          title: t('chemical.added', 'Chemical Added'),
          description: `${language === 'en' ? pouringChemical.name : pouringChemical.nameAr} ${t('added.to.tube', 'added to test tube')}`,
          duration: 2000,
        });
      } else {
        throw new Error('addChemical is not a function');
      }
    } catch (error) {
      console.error('Error adding chemical:', error);
      toast({
        variant: 'destructive',
        title: t('error', 'Error'),
        description: t('chemical.add.failed', 'Failed to add chemical.'),
      });
    }

    setTimeout(() => {
      setIsPouring(false);
      setPouringChemical(null);
      setBottleX(undefined); // Reset position after animation
      setBottleY(undefined);
    }, 500);
  };

  const updateChemicalQuantity = (index: number, amount: number) => {
    const newChemicals = [...chemicalsWithQuantity];
    const newQuantity = Math.max(0.5, Math.min(10, newChemicals[index].quantity + amount));
    newChemicals[index].quantity = newQuantity;
    setChemicalsWithQuantity(newChemicals);
  };

  const handleGlobalQuantityChange = (value: number[]) => {
    setGlobalQuantity(value[0]);
  };

  const handleToggleReaction = () => {
    if (isReacting) {
      stopReaction();
      toast({
        title: t('reaction.stopped', 'Reaction Stopped'),
        description: t('reaction.completed', 'Chemical reaction has been stopped'),
        duration: 3000,
      });
    } else {
      if (chemicalsWithQuantity.length < 2) {
        toast({
          title: t('error', 'Error'),
          description: t('reaction.min.chemicals', 'You need at least two chemicals to start a reaction'),
          variant: "destructive",
        });
        return;
      }

      startReaction();
      toast({
        title: t('reaction.started', 'Reaction Started'),
        description: t('reaction.in.progress', 'Chemical reaction is in progress'),
        duration: 3000,
      });
    }
  };

  const handleRestoreChemicals = () => {
    if (savedChemicalsBeforeExplosion.length === 0) {
      toast({
        variant: 'destructive',
        title: t('error', 'Error'),
        description: t('no.chemicals.to.restore', 'No chemicals to restore.'),
      });
      return;
    }

    try {
      clearTestTube();
      savedChemicalsBeforeExplosion.forEach(chem => {
        if (!chem.id || !chemicals.find(c => c.id === chem.id)) {
          console.warn('Invalid or missing chemical ID:', chem.id);
          return;
        }
        if (typeof addChemical === 'function') {
          addChemical(chem.id);
        } else {
          throw new Error('addChemical is not a function');
        }
      });
      setChemicalsWithQuantity(savedChemicalsBeforeExplosion);
      toast({
        title: t('chemicals.restored', 'Chemicals Restored'),
        description: t('chemicals.restored.description', 'Previous chemicals have been restored'),
        duration: 3000,
      });
      setIsTestTubeBroken(false);
    } catch (error) {
      console.error('Error restoring chemicals:', error);
      toast({
        variant: 'destructive',
        title: t('error', 'Error'),
        description: t('chemical.restore.failed', 'Failed to restore chemicals.'),
      });
    }
  };

  const handleRestoreTestTube = () => {
    setIsTestTubeBroken(false);
    stopReaction();
    toast({
      title: t('tube.restored', 'Test Tube Restored'),
      description: t('tube.restored.description', 'The test tube has been restored with the same chemicals'),
      duration: 3000,
    });
  };

  const isDangerousReaction = reactionResult && (
    reactionResult.hasFire || 
    reactionResult.hasExplosion || 
    reactionResult.temperature > 100
  );

  useEffect(() => {
    console.log('FreeModeSimulation state:', { 
      isSelectingChemical,
      isPouring,
      pouringChemical: pouringChemical?.id,
      chemicalsCount: chemicalsWithQuantity.length,
      selectedChemicalsCount: selectedChemicals.length
    });
  }, [isSelectingChemical, isPouring, pouringChemical, chemicalsWithQuantity, selectedChemicals]);

  return (
    <div className="container mx-auto px-4 py-6 relative z-10">
      {/* Audio elements for internal refs */}
      {!externalAudioRefs && (
        <>
          <audio ref={audioRefs.bubbling} />
          <audio ref={audioRefs.hissing} />
          <audio ref={audioRefs.explosion} />
          <audio ref={audioRefs.fizzing} />
          <audio ref={audioRefs.pouring} />
          <audio ref={audioRefs.smoke} />
          <audio ref={audioRefs.glass_break} />
          <audio ref={audioRefs.danger} />
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <motion.div 
            className="glass rounded-xl p-6 shadow-lg h-full flex flex-col"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Glass breaking animation */}
            {isTestTubeBroken && (
              <motion.div
                className="absolute inset-0 bg-red-500/50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-white text-lg font-bold">{t('tube.broken', 'Test Tube Broken!')}</div>
              </motion.div>
            )}

            {/* Visualization Area */}
            <TestTubeVisualization 
              isPouring={isPouring}
              pouringChemical={pouringChemical}
              onPourComplete={handlePourComplete}
              isReacting={isReacting}
              reactionResult={reactionResult}
              chemicalsWithQuantity={chemicalsWithQuantity}
              isTestTubeBroken={isTestTubeBroken}
              onRestoreTestTube={handleRestoreTestTube}
              isDangerousReaction={isDangerousReaction}
              onStopReaction={stopReaction}
              showStateChanges={showStateChanges}
              reactionStateDescription={reactionStateDescription}
              bottleX={bottleX} // Pass dynamic X position
              bottleY={bottleY} // Pass dynamic Y position
            />
            
            {/* Mobile controls */}
            {isMobile && (
              <MobileReactionControls
                temperature={temperature}
                pressure={pressure}
                isReacting={isReacting}
                hasSufficientReactants={chemicalsWithQuantity.length >= 2}
                onTemperatureChange={setTemperature}
                onPressureChange={setPressure}
                onToggleReaction={handleToggleReaction}
                onResetSimulation={clearTestTube}
                onAddChemical={() => setIsSelectingChemical(true)}
              />
            )}

            {reactionResult && !showResultsAboveReactants && (
              <ReactionResults 
                reactionResult={reactionResult}
                stateDescription={reactionStateDescription}
                showStateChanges={showStateChanges}
              />
            )}
            
            {chemicalsWithQuantity.length > 0 && (
              <div className="mt-6 p-4 rounded-lg bg-primary/10 animate-fade-in">
                <h3 className="text-lg font-medium mb-2">
                  {t('current.reactants', 'Current Reactants')}
                </h3>
                <ChemicalList 
                  chemicals={chemicalsWithQuantity}
                  isReacting={isReacting}
                  onUpdateQuantity={updateChemicalQuantity}
                />
              </div>
            )}
            
            {reactionResult && showResultsAboveReactants && (
              <ReactionResults 
                reactionResult={reactionResult}
                stateDescription={reactionStateDescription}
                showStateChanges={showStateChanges}
              />
            )}
          </motion.div>
        </div>
        
        <div className="lg:col-span-1">
          <motion.div 
            className="glass rounded-xl p-6 shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <Beaker className="w-5 h-5 mr-2" />
                  {t('sim.add.chemical', 'Add Chemical')}
                </h3>
                
                {isSelectingChemical ? (
                  <ChemicalSelector 
                    onSelectChemical={handleSelectChemical}
                    onCancel={() => setIsSelectingChemical(false)}
                    isPouring={isPouring}
                  />
                ) : (
                  <div className="space-y-3">
                    <ChemicalList 
                      chemicals={chemicalsWithQuantity}
                      isReacting={isReacting}
                      onUpdateQuantity={updateChemicalQuantity}
                    />
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setIsSelectingChemical(true)}
                        className="flex-1 px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center button-shine"
                        disabled={isPouring}
                        variant="default"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {t('sim.add.chemical', 'Add Chemical')}
                      </Button>
                      <Button
                        onClick={clearTestTube}
                        className="px-4 py-2 rounded-lg text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors duration-200"
                        disabled={isReacting || chemicalsWithQuantity.length === 0 || isPouring}
                        variant="destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <ReactionParameters
                temperature={temperature}
                pressure={pressure}
                globalQuantity={globalQuantity}
                isReacting={isReacting}
                onTemperatureChange={setTemperature}
                onPressureChange={setPressure}
                onGlobalQuantityChange={handleGlobalQuantityChange}
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={handleToggleReaction}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium ${
                    isReacting 
                      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" 
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  } transition-colors duration-200 flex items-center justify-center button-shine`}
                  disabled={chemicalsWithQuantity.length < 2 && !isReacting}
                >
                  {isReacting ? (
                    <>
                      <CircleStop className="w-5 h-5 mr-2" />
                      {t('sim.stop.reaction', 'Stop Reaction')}
                    </>
                  ) : (
                    <>
                      <CirclePlay className="w-5 h-5 mr-2" />
                      {t('sim.start.reaction', 'Start Reaction')}
                    </>
                  )}
                </Button>
                
                {savedChemicalsBeforeExplosion.length > 0 && (
                  <Button 
                    onClick={handleRestoreChemicals}
                    className="px-4 py-3 rounded-lg font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors duration-200 flex items-center justify-center"
                    disabled={isReacting}
                  >
                    <RefreshCw className="w-5 h-5 mr-1" />
                    {t('restore.chemicals', 'Restore')}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
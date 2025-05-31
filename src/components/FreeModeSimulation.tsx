import React, { useEffect, useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../utils/i18n';
import { ReactionControls } from './ReactionControls';
import TestTube from './TestTube';

interface AudioRefs {
  bubbling: React.RefObject<HTMLAudioElement>;
  hissing: React.RefObject<HTMLAudioElement>;
  explosion: React.RefObject<HTMLAudioElement>;
  fizzing: React.RefObject<HTMLAudioElement>;
}

interface FreeModeSimulationProps {
  soundEnabled?: boolean;
  audioRefs?: AudioRefs;
}

const FreeModeSimulation = ({ soundEnabled = true, audioRefs }: FreeModeSimulationProps) => {
  const { language } = useTheme();
  const { t } = useTranslation();
  const { selectedChemicals, reactionResult, isReacting } = useSimulation();

  useEffect(() => {
    if (!soundEnabled || !audioRefs || !reactionResult) return;

    Object.values(audioRefs).forEach(audioRef => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    });

    if (isReacting && reactionResult) {
      const soundEffect = reactionResult.soundEffect || ''; // إصلاح الوصول الآمن
      if (soundEffect === 'explosion' && audioRefs.explosion.current) {
        audioRefs.explosion.current.play().catch(e => console.log('Could not play sound:', e));
      } else if (soundEffect === 'hissing' && audioRefs.hissing.current) {
        audioRefs.hissing.current.play().catch(e => console.log('Could not play sound:', e));
      } else if (soundEffect === 'bubbling' && audioRefs.bubbling.current) {
        audioRefs.bubbling.current.play().catch(e => console.log('Could not play sound:', e));
      } else if (soundEffect === 'fizzing' && audioRefs.fizzing.current) {
        audioRefs.fizzing.current.play().catch(e => console.log('Could not play sound:', e));
      }
    }
  }, [isReacting, reactionResult, soundEnabled, audioRefs]);

  return (
    <div className="container mx-auto px-4 py-6 relative z-10" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="glass rounded-xl p-6 shadow-lg h-full flex flex-col">
            <div className="flex-1 flex items-center justify-center relative min-h-[400px]">
              <TestTube
                width={120}
                height={350}
                substances={isReacting && reactionResult ? [{ substance: { id: "reaction-result", name: "Reaction Result", nameAr: "نتيجة التفاعل", color: reactionResult.color || "#cccccc", state: (reactionResult.hasGas || false) ? "gas" : (reactionResult.hasPrecipitate || false) ? "solid" : (reactionResult.hasIce || false) ? "solid" : "liquid", density: 1 }, volume: 20 }] : selectedChemicals.map(chem => ({ substance: chem, volume: chem.quantity || 10 }))}
                showBubbles={reactionResult?.hasBubbles || false}
                showSmoke={reactionResult?.hasSmoke || false}
                showFire={reactionResult?.hasFire || false}
                showIce={reactionResult?.hasIce || false}
                showExplosion={(reactionResult?.hasExplosion || false)}
                shake={isReacting}
              />
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <ReactionControls soundEnabled={soundEnabled} audioRefs={audioRefs} chemicals={selectedChemicals} />
        </div>
      </div>
    </div>
  );
};

export default FreeModeSimulation;
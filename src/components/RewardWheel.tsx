import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, RotateCcw, Gift, Star } from 'lucide-react';
import { Reward } from '@/types';
import { useWheel } from '../hooks/useWheel';
import { useRewards } from '../hooks/useRewards';
import { getRewardProbabilities, calculateEffectiveStreak, formatPercentage } from '../utils/habitUtils';
import { useAppContext } from '../context/AppContext';

interface RewardWheelProps {
  habitStreak: number;
  habitName: string;
  onRewardWon?: (reward: Reward) => void;
  disabled?: boolean;
}

export const RewardWheel: React.FC<RewardWheelProps> = ({
  habitStreak,
  habitName: _habitName,
  onRewardWon,
  disabled = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonReward, setWonReward] = useState<Reward | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isDemoSpin, setIsDemoSpin] = useState(false);
  
  const { generateWheelSegments, canSpinWheel: canSpin, getCooldownTimeRemaining } = useWheel();
  const { claimReward } = useRewards();
  const { state } = useAppContext();

  // Calculate effective streak based on user settings
  const effectiveStreak = calculateEffectiveStreak(
    state.habits, 
    state.settings.streakCalculationMode, 
    state.milestones
  );
  
  const segments = generateWheelSegments(effectiveStreak);
  const canSpinWheel = canSpin(effectiveStreak) && !disabled;

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw outer circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 4;
    ctx.stroke();

    if (segments.length === 0) {
      // Draw empty wheel
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#F3F4F6';
      ctx.fill();
      
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Noch keine Belohnungen', centerX, centerY);
      return;
    }

    let currentAngle = currentRotation;
    const anglePerSegment = (2 * Math.PI) / segments.length;

    segments.forEach((segment, _index) => {
      // Use equal segments for visual representation
      const startAngle = currentAngle;
      const endAngle = currentAngle + anglePerSegment;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text with line breaks and better scaling
      const textAngle = startAngle + anglePerSegment / 2;
      const textX = centerX + Math.cos(textAngle) * (radius * 0.7);
      const textY = centerY + Math.sin(textAngle) * (radius * 0.7);
      

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      
      // Calculate font size based on segment size and text length
      const baseSize = Math.min(16, radius / 8);
      const scaledSize = Math.max(10, baseSize - (segment.reward.name.length > 15 ? 2 : 0));
      ctx.font = `bold ${scaledSize}px Arial`;
      
      // Break text into lines if too long
      const words = segment.reward.name.split(' ');
      const lines = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const testWidth = ctx.measureText(testLine).width;
        
        if (testWidth > radius * 0.4 && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      
      // Draw lines
      const lineHeight = scaledSize * 1.2;
      const startY = -(lines.length - 1) * lineHeight / 2;
      
      lines.forEach((line, index) => {
        ctx.fillText(line, 0, startY + index * lineHeight);
      });
      
      ctx.restore();

      // Draw reward icon with better scaling
      const iconAngle = startAngle + anglePerSegment / 2;
      const iconX = centerX + Math.cos(iconAngle) * (radius * 0.4);
      const iconY = centerY + Math.sin(iconAngle) * (radius * 0.4);

      const iconSize = Math.min(32, radius / 6);
      ctx.font = `${iconSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(segment.reward.icon || '🎁', iconX, iconY);

      currentAngle = endAngle;
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#374151';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 10);
    ctx.lineTo(centerX - 15, centerY - radius - 30);
    ctx.lineTo(centerX + 15, centerY - radius - 30);
    ctx.closePath();
    ctx.fillStyle = '#EF4444';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [segments, currentRotation]);

  const spin = async (isDemo = false) => {
    if (!isDemo && (!canSpinWheel || isSpinning)) return;
    if (isDemo && isSpinning) return;

    setIsSpinning(true);
    setWonReward(null);
    setShowResult(false);
    setIsDemoSpin(isDemo);

    if (segments.length === 0) {
      setIsSpinning(false);
      return;
    }

    // Simplest approach: just spin randomly and determine winner at the end
    const spinRotations = 3 + Math.random() * 3; // 3-6 rotations
    const randomAngle = Math.random() * 2 * Math.PI; // Random final position
    const finalRotation = spinRotations * 2 * Math.PI + randomAngle;
    

    // Animate the wheel
    const startTime = Date.now();
    const duration = 3000; // 3 seconds
    const startRotation = currentRotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for realistic spinning
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const newRotation = startRotation + (finalRotation * easeOut);
      setCurrentRotation(newRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        
        // Use milestone percentages to determine winner (not visual wheel position)
        const probabilities = getRewardProbabilities(effectiveStreak, state.milestones);
        const randomValue = Math.random() * 100;
        
        let selectedCategory: Reward['category'];
        if (randomValue < probabilities.small) {
          selectedCategory = 'small';
        } else if (randomValue < probabilities.small + probabilities.medium) {
          selectedCategory = 'medium';
        } else {
          selectedCategory = 'large';
        }
        
        // Get all rewards in the selected category
        const categorySegments = segments.filter(s => s.reward.category === selectedCategory);
        
        // Randomly select one reward from that category
        const randomRewardIndex = Math.floor(Math.random() * categorySegments.length);
        const actualWinningSegment = categorySegments[randomRewardIndex] || segments[0];
        
        setWonReward(actualWinningSegment.reward);
        setShowResult(true);
        if (!isDemo) {
          onRewardWon?.(actualWinningSegment.reward);
          // Automatically claim the reward for normal spins
          claimReward(actualWinningSegment.reward.id);
        }
      }
    };

    requestAnimationFrame(animate);
  };

  const resetWheel = () => {
    setCurrentRotation(0);
    setWonReward(null);
    setShowResult(false);
    setIsDemoSpin(false);
  };


  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  const getMotivationalMessage = () => {
    if (effectiveStreak === 0) return 'Starte deine Gewohnheit um Belohnungen freizuschalten!';
    if (effectiveStreak < 7) return 'Weiter so! Erreiche 7 Tage für deine erste Belohnung!';
    
    if (state.settings.showNextMilestoneProbabilities) {
      const nextMilestone = state.milestones
        .filter(m => m.days > effectiveStreak)
        .sort((a, b) => a.days - b.days)[0];
      
      if (nextMilestone) {
        return `Zeigt Belohnungen für ${nextMilestone.label} (${nextMilestone.days} Tage)`;
      }
    }
    
    return `Fantastisch! ${effectiveStreak} Tage Streak berechtigt dich zum Drehen!`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Gift className="text-primary-500" size={20} />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            🎡 Belohnungsrad
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {state.settings.streakCalculationMode === 'highest' 
            ? `Höchster Streak: ${effectiveStreak} Tage`
            : `Alle Habits erreicht: ${effectiveStreak} Tage`
          }
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {getMotivationalMessage()}
        </p>
      </div>

      <div className="flex justify-center mb-4">
        <div className="relative w-full max-w-md">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="border-2 border-gray-200 dark:border-gray-600 rounded-full touch-none w-full h-auto"
            style={{ aspectRatio: '1/1' }}
          />
          {isSpinning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center space-y-3">
        <div className="flex justify-center gap-3 flex-wrap">
          <button
            onClick={() => spin(false)}
            disabled={!canSpinWheel || isSpinning}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm"
          >
            {isSpinning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Dreht...
              </>
            ) : (
              <>
                <Play size={16} />
                Rad drehen
              </>
            )}
          </button>
          
          <button
            onClick={() => spin(true)}
            disabled={isSpinning || segments.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm"
          >
            <Star size={16} />
            Demo
          </button>
          
          <button
            onClick={resetWheel}
            className="flex items-center gap-2 px-3 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>

        {!canSpinWheel && (
          <div className="text-xs text-gray-500 dark:text-gray-500 px-4">
            {habitStreak === 0 
              ? 'Vervollständige dein Habit um das Rad freizuschalten'
              : getCooldownTimeRemaining()
              ? `Cooldown: Noch ${getCooldownTimeRemaining()}`
              : 'Erreiche einen Meilenstein um zu drehen'
            }
          </div>
        )}

        {/* Mobile-Optimized Probability Display */}
        {segments.length > 0 && (() => {
          const probabilities = getRewardProbabilities(
            effectiveStreak, 
            state.milestones, 
            state.settings.showNextMilestoneProbabilities
          );
          return (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
                <div className="text-gray-600 dark:text-gray-400 text-xs">Klein</div>
                <div className="font-bold text-sm">
                  {formatPercentage(probabilities.small)}
                </div>
              </div>
              <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto mb-1"></div>
                <div className="text-gray-600 dark:text-gray-400 text-xs">Mittel</div>
                <div className="font-bold text-sm">
                  {formatPercentage(probabilities.medium)}
                </div>
              </div>
              <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1"></div>
                <div className="text-gray-600 dark:text-gray-400 text-xs">Groß</div>
                <div className="font-bold text-sm">
                  {formatPercentage(probabilities.large)}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Result Modal */}
      {showResult && wonReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Glückwunsch!
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              Du hast gewonnen:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="text-3xl mb-2">{wonReward.icon || '🎁'}</div>
              <div className="font-bold text-lg text-gray-900 dark:text-gray-100">
                {wonReward.name}
              </div>
              {wonReward.description && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {wonReward.description}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResult(false)}
                className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {isDemoSpin ? 'Schließen' : 'Später'}
              </button>
              {!isDemoSpin && (
                <button
                  disabled={true}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg cursor-default"
                >
                  ✓ Belohnung erhalten
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
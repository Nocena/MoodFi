// src/components/camera/training/hooks/useTrainingMode.tsx
import { useState, useEffect, useCallback } from 'react';
import { MOOD_TYPE } from '../../../../types';

// Define emotional challenges for training
const TRAINING_EMOTIONS: MOOD_TYPE[] = [
    'happy',
    'sad',
    'angry',
    'surprised',
    'fearful',
    'disgusted',
    'neutral',
];

// Shuffle array in place
const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

interface UseTrainingModeReturn {
    isActive: boolean;
    isComplete: boolean;
    currentChallenge: number;
    totalChallenges: number;
    timeRemaining: number;
    currentEmotion: MOOD_TYPE | null;
    score: number;
    correctChallenges: number;
    bonusReward: number;
    startTraining: () => void;
    stopTraining: () => void;
    nextChallenge: (success: boolean) => void;
    resetTraining: () => void;
}

export const useTrainingMode = (): UseTrainingModeReturn => {
    // Training state
    const [isActive, setIsActive] = useState<boolean>(false);
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const [currentChallenge, setCurrentChallenge] = useState<number>(0);
    const [totalChallenges] = useState<number>(10);
    const [timeRemaining, setTimeRemaining] = useState<number>(30);
    const [emotions, setEmotions] = useState<MOOD_TYPE[]>([]);
    const [currentEmotion, setCurrentEmotion] = useState<MOOD_TYPE | null>(null);
    
    // Performance tracking
    const [score, setScore] = useState<number>(0);
    const [correctChallenges, setCorrectChallenges] = useState<number>(0);
    const [bonusReward, setBonusReward] = useState<number>(0);
    
    // Initialize emotions
    useEffect(() => {
        resetEmotions();
    }, []);
    
    // Timer effect
    useEffect(() => {
        let timer: NodeJS.Timeout;
        
        if (isActive && timeRemaining > 0) {
            timer = setTimeout(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
        } else if (isActive && timeRemaining === 0) {
            // Time's up - complete the training
            completeTraining();
        }
        
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isActive, timeRemaining]);
    
    // Prepare emotion challenges
    const resetEmotions = () => {
        // Create a shuffled copy of the emotions
        const shuffledEmotions = shuffleArray([...TRAINING_EMOTIONS]);
        setEmotions(shuffledEmotions);
    };
    
    // Start training session
    const startTraining = useCallback(() => {
        setIsActive(true);
        setIsComplete(false);
        setCurrentChallenge(1);
        setTimeRemaining(30);
        setScore(0);
        setCorrectChallenges(0);
        setBonusReward(0);
    }, []);
    
    // Stop training session
    const stopTraining = useCallback(() => {
        setIsActive(false);
        completeTraining();
    }, []);
    
    // Complete training and calculate final score
    const completeTraining = useCallback(() => {
        setIsActive(false);
        setIsComplete(true);
        
        // Calculate bonus based on performance
        const timeBonus = timeRemaining > 0 ? timeRemaining : 0;
        const accuracyBonus = (correctChallenges / Math.max(currentChallenge, 1)) * 100;
        const totalBonus = Math.round((timeBonus * 2) + (accuracyBonus * 0.5));
        
        setBonusReward(totalBonus);
    }, [timeRemaining, correctChallenges, currentChallenge]);
    
    // Move to next challenge
    const nextChallenge = useCallback((success: boolean) => {
        // Update score based on success
        if (success) {
            setCorrectChallenges(prev => prev + 1);
            setScore(prev => prev + 10);
        }
        
        // Check if we've reached 10 correct challenges
        if (correctChallenges >= 9 && success) {
            // We've just completed the 10th challenge
            completeTraining();
            return;
        }
        
        // Otherwise, continue to the next challenge
        setCurrentChallenge(prev => prev + 1);
    }, [correctChallenges, completeTraining]);
    
    // Reset training session
    const resetTraining = useCallback(() => {
        setIsActive(false);
        setIsComplete(false);
        setCurrentChallenge(0);
        setTimeRemaining(30);
        setScore(0);
        setCorrectChallenges(0);
        setBonusReward(0);
        resetEmotions();
        setCurrentEmotion(null);
    }, []);
    
    return {
        isActive,
        isComplete,
        currentChallenge,
        totalChallenges,
        timeRemaining,
        currentEmotion,
        score,
        correctChallenges,
        bonusReward,
        startTraining,
        stopTraining,
        nextChallenge,
        resetTraining
    };
};

export default useTrainingMode;
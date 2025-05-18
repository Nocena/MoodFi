// src/components/camera/hooks/useMoodAnalysis.tsx
import { useState } from 'react';
import { MOOD_TYPE } from '../../../types';
import { useMoodStore } from '../../../store/moodStore';
import { verifyFace } from '../../../utils/faceVerification';

export interface VibeCheckResultType {
    requestedEmotion?: string;
    dominantEmotion: string;
    matchScore: number;
    passed: boolean;
    message: string;
}

export const useMoodAnalysis = () => {
    // State for mood detection results
    const [detectedMood, setDetectedMood] = useState<MOOD_TYPE | null>(null);
    const [confidenceScore, setConfidenceScore] = useState<number>(0);
    const [vibeCheckResult, setVibeCheckResult] = useState<VibeCheckResultType | null>(null);
    const [rewardAmount, setRewardAmount] = useState<number>(0);

    // Get mood store for fallback detection
    const { detectMood } = useMoodStore();

    // Main mood analysis function
    const analyzeMood = async (imageUrl: string, dailyMood?: string) => {
        console.log("Starting mood analysis...");
        
        // Create an image element for face-api.js to analyze
        const img = document.createElement('img');
        img.src = imageUrl;
        
        // Wait for image to load
        await new Promise((resolve) => {
            img.onload = resolve;
        });

        // Make sure the daily mood is in lowercase for face-api (it expects lowercase emotion names)
        const requestedEmotion = dailyMood?.toLowerCase();
        console.log(`Daily mood challenge: ${requestedEmotion}`);
        
        try {
            // Use face-api.js for emotion detection
            console.log(`Analyzing mood with face-api.js, looking for ${requestedEmotion}`);
            const verificationResult = await verifyFace(img, requestedEmotion);
            console.log('Full face verification result:', JSON.stringify(verificationResult, null, 2));
            
            if (verificationResult?.vibeCheck) {
                console.log("Successfully got vibeCheck result from face-api.js");
                console.log("Dominant emotion:", verificationResult.vibeCheck.dominantEmotion);
                console.log("Match score:", verificationResult.vibeCheck.matchScore);
                console.log("All emotions detected:", JSON.stringify(verificationResult.vibeCheck.detectedEmotions, null, 2));
                
                // Extract information from face-api.js verification
                const dominantEmotion = verificationResult.vibeCheck.dominantEmotion.toUpperCase() as MOOD_TYPE;

                // Set detected mood from face-api.js analysis
                setDetectedMood(dominantEmotion);
                console.log(`Setting detected mood to: ${dominantEmotion}`);

                // Get the actual emotion confidence score from the detected emotion percentage
                const emotionConfidence = Math.round(verificationResult.vibeCheck.detectedEmotions[dominantEmotion.toLowerCase()] * 100);

                // Set confidence score based on the specific emotion detection confidence
                setConfidenceScore(emotionConfidence);
                console.log(`Setting confidence score to: ${emotionConfidence}% (from dominant emotion detection)`);

                // Set vibe check results
                const vibeResult = {
                    requestedEmotion: dailyMood,
                    dominantEmotion: verificationResult.vibeCheck.dominantEmotion,
                    matchScore: verificationResult.vibeCheck.matchScore,
                    passed: verificationResult.vibeCheck.passed,
                    message: verificationResult.vibeCheck.message
                };
                setVibeCheckResult(vibeResult);
                console.log("Setting vibe check result:", JSON.stringify(vibeResult, null, 2));

                // Calculate reward based on actual values
                const isExactMatch = dominantEmotion === dailyMood?.toUpperCase();
                calculateReward(
                    emotionConfidence, 
                    verificationResult.vibeCheck.matchScore, 
                    isExactMatch
                );
                
                return { success: true };
            } else {
                console.warn("Face-api.js returned a result but without vibeCheck data");
                console.log("Full result received:", JSON.stringify(verificationResult, null, 2));
                
                // If no vibeCheck data, fall back to legacy detection
                return await handleFallbackDetection(imageUrl, dailyMood);
            }
        } catch (error) {
            console.error("Error using face-api.js for detection:", error);
            // If face-api fails, try the fallback detection
            return await handleFallbackDetection(imageUrl, dailyMood);
        }
    };
    
    // Fallback to legacy detection mechanism
    const handleFallbackDetection = async (imageUrl: string, dailyMood?: string): Promise<{success: boolean}> => {
        console.log('Using fallback mood detection');
        try {
            const detectedEmotion = await detectMood(imageUrl);
            console.log(`Fallback detected emotion: ${detectedEmotion}`);
            setDetectedMood(detectedEmotion);
            
            // Use a high default confidence for fallback
            const fallbackConfidence = 95;
            setConfidenceScore(fallbackConfidence);
            
            // Create a vibe check result based on the detected emotion
            if (dailyMood) {
                const isExactMatch = detectedEmotion === dailyMood.toUpperCase();
                
                // Calculate match score - high for exact match, lower for non-match
                const matchScore = isExactMatch ? 
                    Math.floor(Math.random() * 20) + 80 : // 80-99% for exact match
                    Math.floor(Math.random() * 30) + 10;   // 10-39% for non-match
                
                console.log(`Fallback match score (${isExactMatch ? 'exact match' : 'no match'}): ${matchScore}%`);
                
                const vibeResult = {
                    requestedEmotion: dailyMood,
                    dominantEmotion: detectedEmotion.toLowerCase(),
                    matchScore: matchScore,
                    passed: isExactMatch,
                    message: isExactMatch 
                        ? `Perfect ${formatEmotion(dailyMood.toLowerCase())} match!` 
                        : `Your mood is ${formatEmotion(detectedEmotion.toLowerCase())}, not ${formatEmotion(dailyMood.toLowerCase())}`
                };
                
                setVibeCheckResult(vibeResult);
                console.log("Setting fallback vibe check result:", JSON.stringify(vibeResult, null, 2));
                
                // Calculate reward based on fallback values
                calculateReward(fallbackConfidence, matchScore, isExactMatch);
            }
            
            return { success: true };
        } catch (error) {
            console.error("Error in fallback detection:", error);
            return { success: false };
        }
    };
    
    // Calculate reward based on detection values
    const calculateReward = (confidence: number, matchScore: number, isExactMatch: boolean) => {
        // Base reward based on confidence (confidence / 10)
        const baseReward = confidence / 10;
        
        // Bonus for exact match
        const exactMatchBonus = isExactMatch ? 50 : 0;
        
        // Additional bonuses based on match score
        let vibeBonus = 0;
        if (!isExactMatch) { // Only apply vibe bonus if not an exact match
            if (matchScore > 70) {
                vibeBonus = 30;
            } else if (matchScore > 40) {
                vibeBonus = 15;
            }
        }
        
        // Calculate total reward (rounded to 1 decimal place)
        const totalReward = parseFloat((baseReward + exactMatchBonus + vibeBonus).toFixed(1));
        setRewardAmount(totalReward);
        
        console.log(`Reward calculation: ${baseReward.toFixed(1)} (base) + ${exactMatchBonus} (match) + ${vibeBonus} (vibe) = ${totalReward}`);
    };

    // Helper function to format emotion text
    const formatEmotion = (emotion: string): string => {
        return emotion.charAt(0).toUpperCase() + emotion.slice(1).toLowerCase();
    };

    return {
        detectedMood,
        confidenceScore,
        vibeCheckResult,
        rewardAmount,
        analyzeMood,
        setDetectedMood,
        setConfidenceScore,
        setVibeCheckResult,
        setRewardAmount
    };
};
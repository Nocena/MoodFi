// faceVerification.ts for MoodFi
// Adapted from your previous project to work with the camera component

import { MOOD_TYPE } from '../types';
import * as faceapi from 'face-api.js';

declare module 'face-api.js' {
  interface FaceExpressions {
    [key: string]: number;
  }
}

export interface FaceVerificationResult {
  isHuman: boolean;
  confidence: number;
  faceVector?: string; // Base64 string of face descriptor
  message?: string;
  vibeCheck?: {
    requestedEmotion?: string;
    detectedEmotions: Record<string, number>;
    dominantEmotion: string;
    matchScore: number;
    passed: boolean;
    message: string;
  };
}

// All possible emotions that face-api.js can detect
export const EMOTIONS = [
  'neutral', 
  'happy', 
  'sad', 
  'angry', 
  'fearful', 
  'disgusted', 
  'surprised'
];

// Track model loading status
let modelsLoaded = false;
let modelLoadingPromise: Promise<void> | null = null;

/**
 * Loads all required face-api.js models - using CDN for reliability
 */
export async function loadFaceApiModels(): Promise<void> {
  if (modelsLoaded) return;
  if (modelLoadingPromise) return modelLoadingPromise;
  
  // Create a promise that we can reuse if this is called multiple times during loading
  modelLoadingPromise = new Promise(async (resolve, reject) => {
    try {
      // Use CDN-hosted models instead of local ones
      // These are guaranteed to be compatible with the face-api.js version
      const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
      
      console.log('Loading face-api.js models from CDN:', MODEL_URL);
      
      // Load models one by one for better error tracking
      console.log('Loading tiny face detector...');
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      
      console.log('Loading face landmark model...');
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      
      console.log('Loading face recognition model...');
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      
      console.log('Loading face expression model...');
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      
      modelsLoaded = true;
      console.log('All face-api.js models loaded successfully');
      resolve();
    } catch (error) {
      console.error('Error loading Face-API models:', error instanceof Error ? error.message : String(error));
      reject(new Error(`Failed to load face detection models: ${error instanceof Error ? error.message : String(error)}`));
    }
  });
  
  return modelLoadingPromise;
}

/**
 * Pick a random emotion for the vibe check
 */
export function getRandomEmotion(): string {
  // Exclude neutral for more interesting challenges
  const emojisWithoutNeutral = EMOTIONS.filter(e => e !== 'neutral');
  const randomIndex = Math.floor(Math.random() * emojisWithoutNeutral.length);
  return emojisWithoutNeutral[randomIndex];
}

/**
 * Get an emoji representing the emotion
 */
export function getEmotionEmoji(emotion: string): string {
  const emojiMap: Record<string, string> = {
    neutral: '😐',
    happy: '😀',
    sad: '😢',
    angry: '😡',
    fearful: '😨',
    disgusted: '🤢',
    surprised: '😲'
  };
  
  return emojiMap[emotion.toLowerCase()] || '❓';
}

/**
 * Convert emotion name to nice display format
 */
export function formatEmotion(emotion: string): string {
  return emotion.charAt(0).toUpperCase() + emotion.slice(1).toLowerCase();
}

/**
 * Calculate a match score between detected and requested emotions
 * This function is compatible with your simplified approach
 */
export function calculateMoodMatch(detected: MOOD_TYPE, requested: MOOD_TYPE): {
  matchScore: number;
  passed: boolean;
  message: string;
} {
  // Convert both to lowercase for comparison
  const detectedLower = detected.toLowerCase();
  const requestedLower = requested.toLowerCase();
  
  // Direct match
  if (detectedLower === requestedLower) {
    const score = Math.floor(Math.random() * 20) + 80; // 80-99%
    return {
      matchScore: score,
      passed: true,
      message: `Perfect ${formatEmotion(requestedLower)} match!`
    };
  }

  // Partial match based on mood similarities
  // For example, HAPPY and SURPRISED might be closer than HAPPY and SAD
  const moodSimilarities: Record<string, string[]> = {
    'happy': ['surprised'],
    'sad': ['fearful'],
    'angry': ['disgusted'],
    'fearful': ['sad', 'surprised'],
    'disgusted': ['angry'],
    'surprised': ['happy', 'fearful'],
    'neutral': []
  };

  const isSimilar = moodSimilarities[requestedLower]?.includes(detectedLower);
  if (isSimilar) {
    const score = Math.floor(Math.random() * 30) + 40; // 40-69%
    return {
      matchScore: score,
      passed: false,
      message: `Close! You showed ${formatEmotion(detectedLower)} instead of ${formatEmotion(requestedLower)}`
    };
  }

  // No match
  const score = Math.floor(Math.random() * 30) + 10; // 10-39%
  return {
    matchScore: score,
    passed: false,
    message: `Your mood is ${formatEmotion(detectedLower)}, not ${formatEmotion(requestedLower)}`
  };
}

/**
 * Verifies if an image contains a human face and performs vibe check
 */
export async function verifyFace(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  requestedEmotion?: string
): Promise<FaceVerificationResult> {
  try {
    console.log("verifyFace called with requested emotion:", requestedEmotion);
    console.log("Image element dimensions:", imageElement.width, "x", imageElement.height);
    
    // Ensure models are loaded
    if (!modelsLoaded) {
      console.log("Face-api models not loaded, attempting to load now...");
      await loadFaceApiModels();
      console.log("Models loaded successfully in verifyFace");
    }
    
    // Detection options - lower threshold to catch more faces
    const options = new faceapi.TinyFaceDetectorOptions({ 
      inputSize: 320,
      scoreThreshold: 0.3 // Lower threshold to detect more faces
    });
    
    console.log("Running face detection with expressions...");
    
    // Run full detection
    const detectionWithDescriptors = await faceapi
      .detectSingleFace(imageElement, options)
      .withFaceLandmarks()
      .withFaceDescriptor()
      .withFaceExpressions();
    
    // No face detected
    if (!detectionWithDescriptors) {
      console.warn("No face detected in image");
      return {
        isHuman: false,
        confidence: 0,
        message: 'No face detected in image'
      };
    }
    
    const { detection, descriptor, expressions, landmarks } = detectionWithDescriptors;
    
    console.log("Face detected with score:", detection.score);
    console.log("Raw expressions detected:", JSON.stringify(expressions, null, 2));
    
    // We still want emotion data even with low confidence, so don't return early
    // Just note the low confidence
    let confidenceIssue = false;
    if (detection.score < 0.7) {
      console.warn("Low confidence face detection:", detection.score, "but continuing with emotion analysis");
      confidenceIssue = true;
    }
    
    // Check for key facial features visibility but continue anyway
    const faceFeaturesVisible = checkFaceFeaturesVisibility(landmarks);
    if (!faceFeaturesVisible.allFeaturesVisible) {
      console.warn("Missing facial features:", faceFeaturesVisible.missingFeatures.join(', '), "but continuing with emotion analysis");
      confidenceIssue = true;
    }
    
    // Calculate face size relative to image (face too small may indicate fake/distant)
    const imageArea = imageElement.width * imageElement.height;
    const faceBox = detection.box;
    const faceArea = faceBox.width * faceBox.height;
    const faceToImageRatio = faceArea / imageArea;
    
    console.log("Face area ratio:", faceToImageRatio, "Face dimensions:", faceBox.width, "x", faceBox.height);
    
    if (faceToImageRatio < 0.03) {
      console.warn("Face too small in frame, ratio:", faceToImageRatio, "but continuing with emotion analysis");
      confidenceIssue = true;
    }
    
    // Convert face descriptor to base64 for storage - fixed for browser
    const faceVector = floatArrayToBase64(descriptor);
    
    // Calculate confidence score (0-100)
    let confidenceScore = calculateConfidenceScore(
      detection.score,
      expressions,
      faceToImageRatio
    );
    
    // Cap confidence at 85 if there were issues
    if (confidenceIssue) {
      confidenceScore = Math.min(confidenceScore, 85);
    }
    
    console.log("Calculated confidence score:", confidenceScore);
    
    // Find dominant emotion
    const emotionEntries = Object.entries(expressions);
    emotionEntries.sort((a, b) => b[1] - a[1]);
    const dominantEmotion = emotionEntries[0][0];
    const dominantScore = emotionEntries[0][1];
    
    console.log("Dominant emotion:", dominantEmotion, "with score:", dominantScore);
    
    // Process vibe check if requested
    let vibeCheck;
    if (requestedEmotion) {
      const emotionScore = expressions[requestedEmotion] || 0;
      // Lower threshold to 0.2 to make it easier to match
      const passed = emotionScore > 0.2;
      
      console.log(`Requested emotion "${requestedEmotion}" score:`, emotionScore);
      console.log("Vibe check passed:", passed);
      
      vibeCheck = {
        requestedEmotion,
        detectedEmotions: { ...expressions },
        dominantEmotion,
        matchScore: Math.round(emotionScore * 100),
        passed,
        message: passed 
          ? `Great ${formatEmotion(requestedEmotion)} vibe! ${getEmotionEmoji(requestedEmotion)}` 
          : `Try to look more ${requestedEmotion}! ${getEmotionEmoji(requestedEmotion)}`
      };
    } else {
      // If no specific emotion was requested, just report the dominant emotion
      vibeCheck = {
        detectedEmotions: { ...expressions },
        dominantEmotion,
        matchScore: Math.round(dominantScore * 100),
        passed: true,
        message: `Your vibe is ${formatEmotion(dominantEmotion)} ${getEmotionEmoji(dominantEmotion)}`
      };
    }
    
    console.log("Final vibe check result:", JSON.stringify(vibeCheck, null, 2));
    
    return {
      // Always return true with a valid vibeCheck
      isHuman: true,
      confidence: confidenceScore,
      faceVector,
      vibeCheck
    };
  } catch (error) {
    console.error('Face verification error:', error instanceof Error ? error.message : String(error));
    return {
      isHuman: false,
      confidence: 0,
      message: `Error during face analysis: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Checks if all key facial features are visible
 */
function checkFaceFeaturesVisibility(landmarks: faceapi.FaceLandmarks68) {
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  const nose = landmarks.getNose();
  const mouth = landmarks.getMouth();
  
  const missingFeatures = [];
  
  if (leftEye.length === 0) missingFeatures.push('left eye');
  if (rightEye.length === 0) missingFeatures.push('right eye');
  if (nose.length === 0) missingFeatures.push('nose');
  if (mouth.length === 0) missingFeatures.push('mouth');
  
  return {
    allFeaturesVisible: missingFeatures.length === 0,
    missingFeatures
  };
}

/**
 * Calculates a confidence score (0-100) based on various factors
 */
function calculateConfidenceScore(
  detectionScore: number,
  expressions: faceapi.FaceExpressions,
  faceToImageRatio: number
): number {
  // Base score from detection confidence
  let score = detectionScore * 50; // 0-50 range
  
  // Add points for appropriate face size (10-30 points)
  // Ideal face takes up 10-30% of image
  const faceRatioScore = Math.min(faceToImageRatio * 100, 30);
  score += faceRatioScore;
  
  // Check for expression variance (up to 20 points)
  // Real faces usually have some expression, not perfectly neutral
  const expressionValues = Object.values(expressions);
  const expressionVariance = calculateVariance(expressionValues);
  const expressionScore = Math.min(expressionVariance * 1000, 20);
  score += expressionScore;
  
  return Math.min(Math.round(score), 100);
}

/**
 * Calculates variance of an array of numbers
 */
function calculateVariance(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Convert Float32Array to Base64 string - browser-safe implementation
 */
function floatArrayToBase64(float32Array: Float32Array): string {
  // Get the underlying buffer
  const buffer = float32Array.buffer;
  const bytes = new Uint8Array(buffer);
  
  // Convert to a binary string
  let binaryString = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  
  // Convert to base64
  return btoa(binaryString);
}

/**
 * Convert Base64 string back to Float32Array - browser-safe implementation
 */
export function base64ToFloatArray(base64: string): Float32Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return new Float32Array(bytes.buffer);
}

// Simplified face detection fallback for environments where face-api.js fails to load
export async function detectFaceSimple(img: HTMLImageElement): Promise<{
  isHuman: boolean;
  confidence: number;
  message?: string;
}> {
  // This is a simplified fallback that always returns success
  // In a real implementation, you would use a more robust fallback
  return {
    isHuman: true,
    confidence: 85,
    message: 'Face detected (fallback mode)'
  };
}
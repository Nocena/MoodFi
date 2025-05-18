// src/components/camera/hooks/useFaceDetection.tsx
import { useState, useEffect } from 'react';
import {
    loadFaceApiModels
} from '../../../utils/faceVerification';

export const useFaceDetection = () => {
    const [faceApiLoaded, setFaceApiLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Initialize face-api.js models when component mounts
    useEffect(() => {
        const initFaceApi = async () => {
            try {
                setIsLoading(true);
                console.log('Loading face-api.js models...');
                await loadFaceApiModels();
                setFaceApiLoaded(true);
                console.log('Face-API models loaded successfully');
            } catch (error) {
                console.error('Failed to load Face-API models:', error);
                setError(error instanceof Error ? error : new Error('Unknown error loading face-api models'));
                // Continue without face-api as fallback
                setFaceApiLoaded(false);
            } finally {
                setIsLoading(false);
            }
        };

        initFaceApi();
    }, []);

    return {
        faceApiLoaded,
        isLoading,
        error
    };
};
import {MOOD_TYPE} from "../types";

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

/**
 * Convert a base‑64 data‑URL to a File object.
 * Uses fetch() so it’s async and streams efficiently.
 */
export const dataURLtoFile = async (dataUrl: string, fileName = 'mood.png'): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], fileName, {type: blob.type});
};

export const getMoodColor = (mood: MOOD_TYPE) => {
    switch (mood) {
        case 'happy':
            return 'yellow';
        case 'sad':
            return 'blue';
        case 'excited':
            return 'pink';
        case 'calm':
            return 'green';
        case 'neutral':
            return 'gray';
    }
};

export const getMoodEmoji = (mood: MOOD_TYPE) => {
    switch (mood) {
        case 'happy':
            return '😊';
        case 'sad':
            return '😢';
        case 'excited':
            return '😃';
        case 'calm':
            return '😌';
        case 'neutral':
            return '😐';
    }
};

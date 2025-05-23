import {MOOD_TYPE} from "../types";

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
        return 'Just now';
    } else if (diffHours < 24) {
        return `${diffHours}h ago`;
    } else {
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    }
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

export const getRandomMood = (): MOOD_TYPE => {
    const moods: MOOD_TYPE[] = ['happy', 'sad', 'fearful', 'neutral', 'angry', 'disgusted', 'surprised']
    return moods[Math.floor(Math.random() * moods.length)]
}

export const getMoodColor = (mood: MOOD_TYPE) => {
    switch (mood) {
        case 'happy':
            return 'green';
        case 'sad':
            return 'blue';
        case 'fearful':
            return 'yellow';
        case 'neutral':
            return 'gray';
        case 'angry':
            return 'red';
        case 'disgusted':
            return 'yellow';
        case 'surprised':
            return 'pink';
    }
};

export const getMoodEmoji = (mood: MOOD_TYPE) => {
    switch (mood) {
        case 'happy':
            return '😊';
        case 'sad':
            return '😢';
        case 'fearful':
            return '😨';
        case 'neutral':
            return '😐';
        case 'angry':
            return '😡';
        case 'disgusted':
            return '🤢';
        case 'surprised':
            return '😲';
    }
};

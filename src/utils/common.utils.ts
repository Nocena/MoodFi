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
    const res   = await fetch(dataUrl);
    const blob  = await res.blob();
    return new File([blob], fileName, { type: blob.type });
};
import Cookies from 'js-cookie';

const TUTORIAL_COOKIE_NAME = 'statblock_tutorial_completed';
const TUTORIAL_COOKIE_EXPIRY_DAYS = 30;

export const tutorialCookies = {
    /**
     * Check if the user has completed the tutorial
     */
    hasCompletedTutorial(): boolean {
        return Cookies.get(TUTORIAL_COOKIE_NAME) === 'true';
    },

    /**
     * Mark the tutorial as completed
     */
    markTutorialCompleted(): void {
        Cookies.set(TUTORIAL_COOKIE_NAME, 'true', {
            expires: TUTORIAL_COOKIE_EXPIRY_DAYS,
            sameSite: 'Lax',
        });
    },

    /**
     * Reset the tutorial (for testing or if user wants to see it again)
     */
    resetTutorial(): void {
        Cookies.remove(TUTORIAL_COOKIE_NAME);
    },
};


export interface SRSState {
    wordId: string;
    ease: number;
    interval: number;
    repetitions: number;
    nextReviewDate: string;
}

export const updateSRS = (current: SRSState, isCorrect: boolean): SRSState => {
    let { ease, interval, repetitions } = current;
    if (isCorrect) {
        if (repetitions === 0) interval = 1;
        else if (repetitions === 1) interval = 3;
        else interval = Math.round(interval * ease);
        repetitions += 1;
        ease = Math.min(2.5, ease + 0.1);
    } else {
        repetitions = 0;
        interval = 1;
        ease = Math.max(1.3, ease - 0.2);
    }
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);
    return {
        ...current,
        ease,
        interval,
        repetitions,
        nextReviewDate: nextReviewDate.toISOString().split('T')[0],
    };
};

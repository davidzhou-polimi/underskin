export function getClockwiseCircleMeasure(progress) {
    const normalizedProgress = Math.min(Math.max(progress, 0), 1);

    return normalizedProgress * 100;
}
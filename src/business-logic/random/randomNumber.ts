/**
 * Returns a random number between 1 and upperLimit
 */
export function randomNumber(upperLimit: number): number {
    const array = new Uint32Array(1);
    const max = Math.floor(0xFFFFFFFF / upperLimit) * upperLimit;

    do {
        crypto.getRandomValues(array);
    } while (array[0] >= max);

    return (array[0] % upperLimit) + 1;
}
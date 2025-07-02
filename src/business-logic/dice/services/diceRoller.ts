/**
 * Rolls a dice with the given number of sides
 */
export function rollDice(numOfSides: number): number {
    const array = new Uint32Array(1);
    const max = Math.floor(0xFFFFFFFF / numOfSides) * numOfSides;

    do {
        crypto.getRandomValues(array);
    } while (array[0] >= max);

    return (array[0] % numOfSides) + 1;
}
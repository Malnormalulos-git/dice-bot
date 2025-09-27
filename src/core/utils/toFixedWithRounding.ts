export default function toFixedWithRounding(value: number, precision: number = 0) {
    const power = Math.pow(10, precision);
    return Math.round(value * power) / power;
}
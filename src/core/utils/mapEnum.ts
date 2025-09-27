export default function mapEnum<T>(enumObj: T, value: string): T[keyof T] | undefined {
    const entries = Object.entries(enumObj as any);
    for (const [key, enumValue] of entries) {
        if (key === value || enumValue === value) {
            return enumValue as T[keyof T];
        }
    }
    return undefined;
}
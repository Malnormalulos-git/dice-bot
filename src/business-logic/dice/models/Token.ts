export class Token {
    type: string;
    value: number | string;

    constructor(type: string, value: number | string) {
        this.type = type;
        this.value = value;
    }
}
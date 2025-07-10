export enum TokenType {
    NUMBER,
    DICE,
    OPERATOR,
    PARENTHESES
}

export class Token {
    type: TokenType;
    value: number | string;
    explode: boolean = false;

    constructor(type: TokenType, value: number | string) {
        this.type = type;
        this.value = value;
    }
}
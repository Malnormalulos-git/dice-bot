export enum TokenType {
    NUMBER,
    DICE,
    OPERATOR,
    PARENTHES
}

export class Token {
    type: TokenType;
    value: number | string;

    constructor(type: TokenType, value: number | string) {
        this.type = type;
        this.value = value;
    }
}
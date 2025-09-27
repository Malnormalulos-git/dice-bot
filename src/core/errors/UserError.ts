export class UserError extends Error {
    expression: string | null;

    constructor(message: string, expression: string | null = null) {
        super(message);
        this.expression = expression;
        this.name = 'UserError';
    }

    toString(): string {
        return `${this.message}${this.expression ? ` in "${this.expression}"` : ''}`;
    }
}
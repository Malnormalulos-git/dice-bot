class UserError extends Error {
    constructor(message, expression = null) {
        super(message);
        this.expression = expression;
        this.name = 'UserError';
    }

    toString() {
        return `${this.message}${this.expression ? ` in "${this.expression}"` : ''}`;
    }
}

module.exports = { UserError };
import {ToAPIApplicationCommandOptions, ApplicationCommandOptionType} from "discord.js";

export default function parseOptions(input: string, options: ToAPIApplicationCommandOptions[]):
    Record<string, boolean | number | string | null> {
    const result: Record<string, boolean | number | string | null> = {};

    if (!input.trim()) {
        return result;
    }

    const params = input
        .split(' ')
        .map(p => {
            const [name, value] = p.split(':');
            return {
                name: name,
                value: value
            };
        });

    const parsedOptions = options.map(o => {
        const json = o.toJSON();
        return {
            name: json.name,
            type: json.type
        };
    });


    for (const param of params) {
        const name = param.name.toLowerCase().trim();
        const optionDef = parsedOptions.find(opt => opt.name === name);
        if (!optionDef) continue;

        const valueString = param.value.trim();
        let value: boolean | number | string | null = null;

        switch (optionDef.type) {
            case ApplicationCommandOptionType.Boolean:
                value = valueString.toLowerCase() === 'true' || valueString === '1';
                break;
            case ApplicationCommandOptionType.Integer:
                const intValue = parseInt(valueString, 10);
                if (!isNaN(intValue)) {
                    value = intValue;
                }
                break;
            case ApplicationCommandOptionType.Number:
                const floatValue = parseFloat(valueString);
                if (!isNaN(floatValue)) {
                    value = floatValue;
                }
                break;
            case ApplicationCommandOptionType.String:
                value = valueString;
                break;
            default:
                value = valueString;
        }

        if (value !== null) {
            result[name] = value;
        }
    }

    return result;
}
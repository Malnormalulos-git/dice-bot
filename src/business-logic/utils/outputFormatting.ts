import {AttachmentBuilder} from "discord.js";
import {config} from "../../../config";

const {MAX_DISCORD_MESSAGE_LENGTH} = config;

export interface MessageOutput {
    content: string;
    files?: AttachmentBuilder[];
}

/**
 * Wraps string with Discord Markdown, optionally covers by spoiler
 */
export function wrapInMarkdown(output: string, isCoveredBySpoiler: boolean = false): string {
    if (isCoveredBySpoiler)
        return `||\`\`\`Markdown\n${output.trim()}\`\`\`||`;
    return `\`\`\`Markdown\n${output.trim()}\`\`\``;
}

/**
 * Handles large message output by creating file attachments when content exceeds Discord limits
 */
export function handleLargeOutput(
    fullOutput: string,
    summaryOutput?: string,
    isCoveredBySpoiler: boolean = false,
    fileName: string = 'detailed.txt'
): string | MessageOutput {
    const wrappedOutput = wrapInMarkdown(fullOutput, isCoveredBySpoiler);

    if (wrappedOutput.length <= MAX_DISCORD_MESSAGE_LENGTH) {
        return wrappedOutput;
    }

    const buffer = Buffer.from(fullOutput, 'utf8');
    const attachment = new AttachmentBuilder(buffer, {name: fileName});

    let content: string;

    if (summaryOutput) {
        const wrappedSummary = wrapInMarkdown(summaryOutput, isCoveredBySpoiler);
        content = wrappedSummary.length > MAX_DISCORD_MESSAGE_LENGTH
            ? '`See detailed attachment`'
            : wrappedSummary;
    } else {
        content = '`See detailed attachment`';
    }

    return {
        content,
        files: [attachment]
    };
}
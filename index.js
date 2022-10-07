/* eslint-disable no-case-declarations */
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Require the necessary discord.js classes
import { Client, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";

import { rollAll } from './roll';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({
    path: `${__dirname}/.env`,
});

const { DISCORD_TOKEN } = process.env;

// Create a new client instance
const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

// When the client is ready, run this code (only once)
client.once("ready", () => {
    console.log("Ready!");
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const { commandName, options } = interaction;

    switch (commandName) {
        case "r":
            const params = {
                attempts: options.getNumber("attempts") || 1,
                complexity: options.getNumber("complexity") || 0,
                diceCount: options.getNumber("number_of_dice"),
                difficulty: options.getNumber("difficulty"),
                focus: options.getNumber("focus") || 0,
                has6as2: options.getBoolean("6_counts_as_2_successes") || false,
            };

            interaction.reply(rollAll(params));

            break;
        default:
            break;
    }
});

// Login to Discord with your client's token
client.login(DISCORD_TOKEN);

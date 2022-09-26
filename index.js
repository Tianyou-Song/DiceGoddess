/* eslint-disable no-case-declarations */
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import _ from 'lodash';

// Require the necessary discord.js classes
import { Client, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";

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

const rollDice = () => Math.floor(Math.random() * 6) + 1;

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const { commandName, options } = interaction;

    switch (commandName) {
    case "r":
        const difficulty = options.getNumber("difficulty");
        const complexity = options.getNumber("complexity");
        const numberOfDice = options.getNumber("number_of_dice");
        const focus = options.getNumber("focus") || 0;
        const hasAncientKnowledge = options.getBoolean("ancient_knowledge") || false;

        const originalDiceRolls = Array.from(
            {
                length: numberOfDice,
            },
            () => rollDice()
        );
        const newDiceRolls = _.cloneDeep(originalDiceRolls);

        const indexesChanged = {};

        let
            differenceTo6,
            differenceToPass,
            focusLeft = focus,
            foundIdx,
            rollsToFind = 5;

        while (focusLeft > 0 && rollsToFind > 0) {
            differenceTo6 = 6 - rollsToFind;
            differenceToPass = difficulty - rollsToFind;

            if (focusLeft < differenceToPass) {
                break;
            }

            foundIdx = newDiceRolls.findIndex(roll => roll === rollsToFind);

            if (
                (foundIdx === -1) ||
                (!hasAncientKnowledge && (differenceToPass <= 0)) ||
                (hasAncientKnowledge && (differenceToPass <= 0) && (focusLeft < differenceTo6))
            ) {
                rollsToFind--;
                continue;
            }

            if (
                hasAncientKnowledge &&
                (focusLeft >= differenceTo6) &&
                (differenceTo6 <= 2)
            ) {
                newDiceRolls[foundIdx] = 6;
                indexesChanged[foundIdx] = true;
                focusLeft -= differenceTo6;
                continue;
            }

            if (
                (differenceToPass === 1) &&
                (focusLeft >= differenceToPass)
            ) {
                newDiceRolls[foundIdx] += differenceToPass;
                indexesChanged[foundIdx] = true;
                focusLeft -= differenceToPass;
                rollsToFind += differenceToPass;
                continue;
            }

            if (
                hasAncientKnowledge &&
                (focusLeft >= differenceTo6) &&
                (differenceTo6 <= 4)
            ) {
                newDiceRolls[foundIdx] = 6;
                indexesChanged[foundIdx] = true;
                focusLeft -= differenceTo6;
                continue;
            }

            if (
                (differenceToPass <= 2) &&
                (focusLeft >= differenceToPass)
            ) {
                newDiceRolls[foundIdx] += differenceToPass;
                indexesChanged[foundIdx] = true;
                focusLeft -= differenceToPass;
                rollsToFind += differenceToPass;
                continue;
            }

            if (
                hasAncientKnowledge &&
                (focusLeft >= differenceTo6)
            ) {
                newDiceRolls[foundIdx] = 6;
                indexesChanged[foundIdx] = true;
                focusLeft -= differenceTo6;
                continue;
            }

            if (
                focusLeft >= differenceToPass
            ) {
                newDiceRolls[foundIdx] += differenceToPass;
                indexesChanged[foundIdx] = true;
                focusLeft -= differenceToPass;
                rollsToFind += differenceToPass;
                continue;
            }

            rollsToFind--;
        }

        let difference = 1;
        while (focusLeft > 0 && difference < 6) {
            foundIdx = newDiceRolls.findIndex(roll => 6 - roll === difference);
            if (foundIdx !== -1) {
                newDiceRolls[foundIdx]++;
                indexesChanged[foundIdx] = true;
                difference = 1;
                focusLeft--;
                continue;
            }
            difference++;

            if (newDiceRolls.every(roll => roll === 6)) {
                break;
            }
        }

        const indexSixes = newDiceRolls.reduce((accumulator, roll, idx) => {
            if (roll === 6) {
                accumulator[idx] = true;
            }

            return accumulator;
        }, {});
        const indexesSuccess = newDiceRolls.reduce((accumulator, roll, idx) => {
            if (roll >= difficulty) {
                accumulator[idx] = true;
            }

            return accumulator;
        }, {});
        const indexFailures = newDiceRolls.reduce((accumulator, roll, idx) => {
            if (roll < difficulty) {
                accumulator[idx] = true;
            }

            return accumulator;
        }, {});

        let successes = Object.keys(indexesSuccess).length;
        const sixes = Object.keys(indexSixes).length;

        if (hasAncientKnowledge) {
            successes += sixes;
            Object.keys(indexSixes).forEach(idx => newDiceRolls[idx] = `__${newDiceRolls[idx]}__`)
        }

        Object.keys(indexesChanged).forEach(idx => newDiceRolls[idx] = `**${newDiceRolls[idx]}**`);
        Object.keys(indexFailures).forEach(idx => newDiceRolls[idx] = `~~${newDiceRolls[idx]}~~`)

        let message = `
DN: ${difficulty}:${complexity}, rolling: ${numberOfDice}d6, focus: ${focus}, Ancient Knowledge: ${hasAncientKnowledge}
${originalDiceRolls.join(", ")} - rolls
${newDiceRolls.join(", ")} - after focus
6's: ${sixes}
made: ${successes}, need: ${complexity}
`;
        if (successes < complexity) {
            message += 'FAIL!';
        } else {
            message += `SUCCESS! additional success: ${successes - complexity}`;
        }

        await interaction.reply(message);

        break;

    default:
    }
});

// Login to Discord with your client's token
client.login(DISCORD_TOKEN);

/* eslint-disable func-style */
/* eslint-disable no-magic-numbers */
/* eslint-disable no-case-declarations */

/* eslint-disable sonarjs/no-small-switch */

/* eslint-disable node/no-process-env */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */

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
      const hasAncientKnowledge = options.getBoolean("ancient_knowledge");

      const originalDiceRolls = Array.from(
        {
            length: numberOfDice,
        },
        () => rollDice()
      );
      const newDiceRolls = _.cloneDeep(originalDiceRolls);

      let focusLeft = focus;
      let foundIdx, difference;

      while (focusLeft > 0) {
        if (hasAncientKnowledge) {
          foundIdx = newDiceRolls.findIndex(roll => roll === 5);
          if (foundIdx !== -1) {
            newDiceRolls[foundIdx] = 6;
            foundIdx = null;
            focusLeft--;
            continue;
          }

          if (focusLeft >= 2) {
            foundIdx = newDiceRolls.findIndex(roll => roll === 4);
            if (foundIdx !== -1) {
              newDiceRolls[foundIdx] = 6;
              foundIdx = null;
              focusLeft -= 2;
              continue;
            }
          }
        }

        difference = 1;
        while (difference <= focusLeft) {
          foundIdx = newDiceRolls.findIndex(roll => difficulty - roll === difference);
          if (foundIdx !== -1) {
            newDiceRolls[foundIdx] += difference;
            foundIdx = null;
            focusLeft -= difference;
            continue;
          }
          difference++;
        }

        if (difference > focusLeft) {
          break;
        }
      }

      difference = 1;
      while (focusLeft > 0) {
        while (difference < 6) {
          foundIdx = newDiceRolls.findIndex(roll => 6 - roll === difference);
          if (foundIdx !== -1) {
            newDiceRolls[foundIdx]++;
            difference = 1;
            foundIdx = null;
            focusLeft--;
            continue;
          }
          difference++;
          break;
        }

        if (newDiceRolls.every(roll => roll === 6)) {
          break;
        }
      }


      let successes = newDiceRolls.filter((roll) => roll >= difficulty).length;
      const sixes = newDiceRolls.filter((roll) => roll === 6).length;

      if (hasAncientKnowledge) {
        successes += sixes;
      }

      let message = `
DN: ${difficulty}:${complexity}, rolling: ${numberOfDice}d6, focus: ${focus}, Ancient Knowledge: ${hasAncientKnowledge}.
rolls: ${originalDiceRolls.join(",")}.
after focus: ${newDiceRolls.join(",")}.
6's: ${sixes}
made: ${successes}, need: ${complexity}.
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

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
          const length = options.getNumber("number_of_dice");
          const focus = options.getNumber("focus") || 0;
          const hasAncientKnowledge = options.getBoolean("ancient_knowledge");

          const originalDiceRolls = Array.from(
              {
                  length,
              },
              () => rollDice()
          );
          const newDiceRolls = _.cloneDeep(originalDiceRolls);

          let focusLeft = focus;
          let foundIdx;

          while (focusLeft > 0) {
              if (hasAncientKnowledge) {
                  foundIdx = newDiceRolls.findIndex(roll => roll === 5);
                  if (foundIdx || foundIdx === 0) {
                      newDiceRolls[foundIdx] = 6;
                      foundIdx = null;
                      focusLeft--;
                      continue;
                  }
              }

              for (let i = 1; i <= focusLeft; i++) {
                  foundIdx = newDiceRolls.findIndex(roll => difficulty - roll === i);
                  if (foundIdx || foundIdx === 0) {
                      newDiceRolls[foundIdx] += i;
                      foundIdx = null;
                      focusLeft -= i;
                      continue;
                  }
              }
              continue;
          }


          let successes = newDiceRolls.filter((roll) => roll >= difficulty).length;

          if (hasAncientKnowledge) {
              successes += newDiceRolls.filter((roll) => roll === 6).length;
          }

          let message = `DN: ${difficulty}:${complexity}
rolls:${originalDiceRolls.join(",")}.
after focus:${newDiceRolls.join(",")}.
made:${successes}, need:${complexity}.
`;
          if (successes < complexity) {
              message += 'FAIL';
          } else {
              message += `SUCCESS, additional success: ${successes - complexity}`;
          }

          await interaction.reply(message);

      break;

    default:
  }
});

// Login to Discord with your client's token
client.login(DISCORD_TOKEN);

/* eslint-disable unicorn/prefer-top-level-await */
/* eslint-disable no-unused-vars */
/* eslint-disable node/no-process-env */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Require the necessary discord.js classes
import { REST, SlashCommandBuilder, Routes } from "discord.js";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({
  path: `${__dirname}/.env`,
});

const { CLIENT_ID, GUILD_ID, DISCORD_TOKEN } = process.env;

const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

const commands = [
    new SlashCommandBuilder()
        .setName('r')
        .setDescription('Roll dice, format /r [difficulty] [complexity] [number of dice] [focus] [Ancient Knowledge]')
        .addNumberOption(option =>
            option.setName('difficulty')
                .setDescription('difficulty')
                .setRequired(true)
                .setMaxValue(6)
                .setMinValue(2)
        )
        .addNumberOption(option =>
            option.setName('complexity')
                .setDescription('complexity')
                .setRequired(true)
                .setMinValue(1)
        )
        .addNumberOption(option =>
                option.setName('number_of_dice')
                    .setDescription('number of dice')
                    .setRequired(true)
                    .setMinValue(1)
        )
        .addNumberOption(option =>
                option.setName('focus')
                    .setDescription('focus')
        )
        .addBooleanOption(option =>
            option.setName('ancient_knowledge')
                .setDescription("Ancient Knowledge")
            .setRequired(false)
        )
]
	.map(command => command.toJSON());

rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
	.then((data) => console.log(`Successfully registered ${data.length} application commands.`))
	.catch(console.error);

// rest
//   .put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] })
//   .then(() => console.log("Successfully deleted all guild commands."))
//   .catch(console.error);

// // for global commands
// rest
//   .put(Routes.applicationCommands(CLIENT_ID), { body: [] })
//   .then(() => console.log("Successfully deleted all application commands."))
//   .catch(console.error);

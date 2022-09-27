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
        .setDescription('Dice roller for Soulbound. Featuring intelligent focus and ancient knowledge application.')
        .addNumberOption(option => option
            .setDescription('difficulty')
            .setMaxValue(6)
            .setMinValue(2)
            .setName('difficulty')
            .setRequired(true)
        )
        .addNumberOption(option => option
            .setDescription('complexity')
            .setMinValue(1)
            .setName('complexity')
            .setRequired(true)
        )
        .addNumberOption(option => option
            .setDescription("number of d6's")
            .setMinValue(1)
            .setName('number_of_dice')
            .setRequired(true)
        )
        .addNumberOption(option => option
            .setDescription("Applied to maximize successes, edge cases not covered e.g. wanting more 6's than overall successes")
            .setMinValue(0)
            .setName('focus')
        )
        .addBooleanOption(option => option
            .setDescription("Any result of 6 counts as two successes")
            .setName('ancient_knowledge')
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

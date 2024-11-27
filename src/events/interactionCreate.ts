import { commands, subCommands } from "../handlers/commands";
import { Event } from "../utils/types";

export default (async function run(interaction) {
  if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;
  let command;
  const subCommand = subCommands.filter(
    subCommand => subCommand.data.name == interaction.options.getSubcommand(false)
  )[0];

  if (!subCommand)
    command = commands.filter(command => command.data.name == interaction.commandName)[0];
  else command = subCommand;

  if (!command) return;
  if (interaction.isChatInputCommand()) command.run(interaction);
  if (command.autocomplete) command.autocomplete(interaction);
} as Event<"interactionCreate">);

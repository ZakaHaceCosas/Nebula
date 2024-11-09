import { Commands } from "../handlers/commands";
import { Event } from "../utils/types";

export default (async function run(interaction) {
  if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;
  const command = await new Commands(interaction.client).getCommand(
    interaction.commandName,
    interaction.options
  );
  if (!command) return;

  if (interaction.isChatInputCommand()) command.run(interaction);
  if (command.autocomplete) command.autocomplete(interaction);
} as Event<"interactionCreate">);

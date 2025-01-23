import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
  type Client
} from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";

export let commands: { data: SlashCommandBuilder; run: any; autocomplete: any }[] = [];
export let subCommands: { data: SlashCommandSubcommandBuilder; run: any; autocomplete: any }[] = [];
function pushCommand(array: any[], command: any) {
  return array.push({ data: command.data, run: command.run, autocomplete: command.autocomplete });
}

async function createSubCommand(name: string, client: Client) {
  const commandsPath = join(process.cwd(), "src", "commands");
  const run = [];
  const autocomplete = [];
  const command = new SlashCommandBuilder()
    .setName(name.toLowerCase())
    .setDescription("This command has no description.");

  let subCommand;
  for (const subCommandFile of readdirSync(join(commandsPath, name), {
    withFileTypes: true
  })) {
    const subCommandName = subCommandFile.name.replaceAll(".ts", "");
    if (subCommandFile.isFile()) {
      subCommand = await import(
        pathToFileURL(join(commandsPath, name, subCommandFile.name)).toString()
      );

      command.addSubcommand(subCommand.data);
      pushCommand(subCommands, subCommand);
      continue;
    }

    const subCommandGroup = new SlashCommandSubcommandGroupBuilder()
      .setName(subCommandName.toLowerCase())
      .setDescription("This subcommand group has no description.");

    const subCommandGroupFiles = readdirSync(join(commandsPath, name, subCommandFile.name), {
      withFileTypes: true
    });

    for (const subCommandGroupFile of subCommandGroupFiles) {
      if (!subCommandGroupFile.isFile()) continue;
      subCommand = await import(
        pathToFileURL(
          join(commandsPath, name, subCommandFile.name, subCommandGroupFile.name)
        ).toString()
      );

      subCommandGroup.addSubcommand(subCommand.data);
      console.log(subCommandGroupFile);
      pushCommand(subCommands, subCommand);
    }

    command.addSubcommandGroup(subCommandGroup);
    run.push(subCommand.run);
    if ("autocompleteHandler" in subCommand) {
      subCommand.autocompleteHandler(client);
      autocomplete.push(subCommand.autocomplete);
    }
  }

  return { data: command, run: run, autocomplete: autocomplete };
}

async function loadCommands(client: Client) {
  const commandsPath = join(process.cwd(), "src", "commands");

  for (const commandFile of readdirSync(commandsPath, { withFileTypes: true })) {
    const name = commandFile.name;
    if (commandFile.isFile()) {
      pushCommand(commands, await import(pathToFileURL(join(commandsPath, name)).toString()));
      continue;
    }
    pushCommand(commands, await createSubCommand(name, client));
  }

  return commands;
}

export async function removeGuildCommands(client: Client) {
  const guilds = client.guilds.cache;
  for (const guildID of guilds.keys()) await guilds.get(guildID)?.commands.set([]);
}

export async function removeGlobalCommands(client: Client) {
  await client.application?.commands.set([]);
}

export async function registerGuildCommands(client: Client) {
  await loadCommands(client);
  const guilds = client.guilds.cache;

  for (const guildID of guilds.keys())
    await guilds.get(guildID)?.commands.set(commands.map(command => command.data));
}

export async function registerGlobalCommands(client: Client) {
  await loadCommands(client);
  await client.application?.commands.set(commands.map(command => command.data));
}

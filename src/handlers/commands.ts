import {
  Guild,
  SlashCommandBuilder,
  SlashCommandSubcommandGroupBuilder,
  type Client
} from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";
import { capitalize } from "../utils/capitalize";
import { getDisabledCommands } from "../utils/database/disabledCommands";

export let commands: SlashCommandBuilder[] = [];
export class Commands {
  client: Client;
  constructor(client: Client) {
    this.client = client;
  }

  private async createSubCommand(
    name: string,
    ...disabledCommands: string[]
  ): Promise<SlashCommandBuilder> {
    const commandsPath = join(process.cwd(), "src", "commands");
    const command = new SlashCommandBuilder()
      .setName(name.toLowerCase())
      .setDescription("This command has no description.");

    for (const subCommandFile of readdirSync(join(commandsPath, name), {
      withFileTypes: true
    })) {
      const subCommandName = subCommandFile.name.replaceAll(".ts", "");
      if (
        disabledCommands?.find(
          command => command?.split("/")?.[0] == name && command?.split("/")?.[1] == subCommandName
        )
      )
        continue;

      if (subCommandFile.isFile()) {
        const subCommandModule = await import(
          pathToFileURL(join(commandsPath, name, subCommandFile.name)).toString()
        );
        const subCommand = new subCommandModule.default();

        command.addSubcommand(subCommand.data);
        if ("autocompleteHandler" in subCommand) subCommand.autocompleteHandler(this.client);
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
        if (
          disabledCommands?.find(
            command =>
              command?.split("/")?.[0] == name &&
              command?.split("/")?.[1] == subCommandFile.name.replaceAll(".ts", "") &&
              command?.split("/")?.[2] == subCommandGroupFile.name.replaceAll(".ts", "")
          )
        )
          continue;

        const subCommand = await import(
          pathToFileURL(
            join(commandsPath, name, subCommandFile.name, subCommandGroupFile.name)
          ).toString()
        );
        subCommandGroup.addSubcommand(new subCommand.default().data);
      }
      command.addSubcommandGroup(subCommandGroup);
    }

    return command;
  }

  async loadCommands(...disabledCommands: string[]) {
    const commandsPath = join(process.cwd(), "src", "commands");
    const commandFiles = readdirSync(commandsPath, { withFileTypes: true });

    for (const commandFile of commandFiles) {
      const name = commandFile.name;
      if (disabledCommands?.includes(name.replaceAll(".ts", ""))) continue;

      if (commandFile.isFile()) {
        const commandImport = await import(pathToFileURL(join(commandsPath, name)).toString());
        commands.push(new commandImport.default().data);
        continue;
      }

      const subCommand = await this.createSubCommand(
        name,
        join(commandsPath, name),
        ...disabledCommands
      );
      commands.push(subCommand);
    }

    return commands;
  }

  async registerCommandsForGuild(guild: Guild, ...disabledCommands: string[]) {
    await this.loadCommands(...disabledCommands);
    await guild.commands.set(commands);
  }

  async registerCommands(): Promise<any[]> {
    await this.loadCommands();
    const guilds = this.client.guilds.cache;

    for (const guildID of guilds.keys()) {
      const disabledCommands = getDisabledCommands(guildID);
      if (disabledCommands.length > 0) await this.loadCommands(...disabledCommands);
      await guilds.get(guildID)?.commands.set(commands);
    }

    return commands;
  }

  async getCommand(name: string, options: any) {
    const subcommandName = capitalize(options.getSubcommand(false));
    const commandGroupName = capitalize(options.getSubcommandGroup(false));
    console.log(commands.filter(command => command.name == name)[0]);
    return commands.filter(command => command.name == name)[0];
  }
}

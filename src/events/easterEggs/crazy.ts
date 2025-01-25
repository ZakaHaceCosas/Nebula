import type { Message, TextChannel } from "discord.js";

export async function run(message: Message) {
  if (!message.content.toLowerCase().includes("crazy")) return;
  if (Math.round(Math.random()) <= 0.5)
    await (message.channel as TextChannel).send(
      "Crazy? I was crazy once.\nThey locked me in a room.\nA rubber room.\nA rubber room with rats.\nAnd rats make me crazy.\nCrazy? I was crazy once..."
    );
}

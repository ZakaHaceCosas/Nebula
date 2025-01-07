import { EmbedBuilder, Message, MessageReaction, PartialMessage, PartialMessageReaction, PartialUser, User } from "discord.js";
import { genColor } from "../utils/colorGen";
import { getSetting } from "../utils/database/settings";
import { getStarred, setStarred } from "../utils/database/starboard";
import { Event } from "../utils/types";

export default (async function run(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
  console.log('🌟 Reaction Add Event Triggered');
  console.log('Reaction emoji:', reaction.emoji.name);
  console.log('User:', user.tag);

  if (reaction.partial) {
    console.log('Reaction is partial, fetching...');
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Error fetching reaction:', error);
      return;
    }
  }

  const message = await reaction.message.fetch();
  console.log('Message content:', message.content);
  console.log('Message author:', message.author?.tag);

  if (!message.guild) {
    console.log('No guild found, returning');
    return;
  }

  const starEmoji = getSetting(message.guild.id, "starboard", "emoji") as string || "⭐";
  console.log('Configured star emoji:', starEmoji);

  if (reaction.emoji.name !== starEmoji) {
    console.log('Emoji does not match configured star emoji, returning');
    return;
  }

  const enabled = getSetting(message.guild.id, "starboard", "enabled") as boolean;
  console.log('Starboard enabled:', enabled);

  if (!enabled) {
    console.log('Starboard not enabled, returning');
    return;
  }

  if (!message.content && !message.attachments.size) {
    console.log('No content or attachments, returning');
    return;
  }

  const starboardChannelId = getSetting(message.guild.id, "starboard", "channel") as string;
  console.log('Starboard channel ID:', starboardChannelId);

  if (!starboardChannelId) {
    console.log('No starboard channel configured, returning');
    return;
  }

  const starboardChannel = message.guild.channels.cache.get(starboardChannelId);
  console.log('Found starboard channel:', starboardChannel?.name);

  if (!starboardChannel?.isTextBased()) {
    console.log('Starboard channel not text-based or not found, returning');
    return;
  }

  const starCount = reaction.count || 0;
  const threshold = Number(getSetting(message.guild.id, "starboard", "threshold")) || 3;
  console.log('Star count:', starCount);
  console.log('Threshold:', threshold);

  if (starCount < threshold) {
    console.log('Star count below threshold, returning');
    return;
  }

  const existingStarred = getStarred(message.guild.id, message.id);
  console.log('Existing starred message:', existingStarred ? 'yes' : 'no');

  const embed = new EmbedBuilder()
    .setAuthor({
      name: message.author.tag,
      iconURL: message.author.displayAvatarURL()
    })
    .setDescription(message.content || '')
    .addFields({
      name: 'Source',
      value: `[Jump to message](${message.url})`
    })
    .setTimestamp(message.createdAt)
    .setFooter({ text: `ID: ${message.id}` })
    .setColor(genColor(80));

  const attachment = message.attachments.first();
  if (attachment?.contentType?.startsWith('image/')) {
    console.log('Adding image attachment to embed');
    embed.setImage(attachment.url);
  }

  const starText = `${starEmoji} ${starCount}`;

  try {
    if (existingStarred) {
      console.log('Updating existing starred message');
      const [channelId, , starMessageId, , , ] = existingStarred;
      const starboardMessage = await starboardChannel.messages.fetch(starMessageId);
      await starboardMessage.edit({ content: starText, embeds: [embed] });

      setStarred(
        message.guild.id,
        message.id,
        channelId,
        message.author.id,
        starMessageId,
        starCount,
        message.content || '',
        message.createdTimestamp.toString()
      );
      console.log('Successfully updated starred message');
    } else {
      console.log('Creating new starred message');
      const starMessage = await starboardChannel.send({ content: starText, embeds: [embed] });

      setStarred(
        message.guild.id,
        message.id,
        message.channel.id,
        message.author.id,
        starMessage.id,
        starCount,
        message.content || '',
        message.createdTimestamp.toString()
      );
      console.log('Successfully created new starred message');
    }
  } catch (error) {
    console.error('Error handling starboard message:', error);
  }

  console.log('🌟 Starboard processing complete');
} as Event<"messageReactionAdd">);
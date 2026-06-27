import { GuildMember, EmbedBuilder, TextChannel, ChannelType } from "discord.js";
import { logger } from "../../lib/logger";

const WELCOME_CHANNEL_NAMES = ["welcome", "ترحيب", "أهلاً", "مرحبا", "الترحيب"];

export async function handleWelcome(member: GuildMember) {
  const guild = member.guild;

  const welcomeChannel = guild.channels.cache.find(
    (ch) =>
      ch.type === ChannelType.GuildText &&
      WELCOME_CHANNEL_NAMES.some((name) =>
        ch.name.toLowerCase().includes(name.toLowerCase())
      )
  ) as TextChannel | undefined;

  if (!welcomeChannel) {
    logger.warn({ guild: guild.name }, "No welcome channel found");
    return;
  }

  const memberCount = guild.memberCount;
  const joinedAt = member.joinedAt ?? new Date();

  const embed = new EmbedBuilder()
    .setTitle(`🎉 عضو جديد انضم!`)
    .setDescription(
      `**أهلاً وسهلاً بك يا ${member}!** 🌟\n\n` +
      `نحن سعداء بانضمامك إلى **${guild.name}**.\n` +
      `تأكد من قراءة القوانين والأنظمة قبل التفاعل.\n\n` +
      `📅 **تاريخ الإنضمام:** <t:${Math.floor(joinedAt.getTime() / 1000)}:F>\n` +
      `👥 **أنت العضو رقم:** \`${memberCount}\``
    )
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .setColor(0x57f287)
    .setFooter({
      text: guild.name,
      iconURL: guild.iconURL() ?? undefined,
    })
    .setTimestamp();

  await welcomeChannel.send({
    content: `${member}`,
    embeds: [embed],
  });

  try {
    const autoRole = guild.roles.cache.find(
      (r) => r.name === "عضو" || r.name === "Member" || r.name === "أعضاء"
    );
    if (autoRole && !autoRole.managed) {
      await member.roles.add(autoRole, "رتبة تلقائية للأعضاء الجدد");
    }
  } catch (err) {
    logger.error({ err }, "Failed to assign auto role");
  }
}

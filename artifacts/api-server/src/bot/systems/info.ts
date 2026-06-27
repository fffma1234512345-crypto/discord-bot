import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  version as djsVersion,
} from "discord.js";
import { client } from "../index";

export async function handleInfoCommand(interaction: ChatInputCommandInteraction) {
  const cmd = interaction.commandName;

  if (cmd === "ping") {
    const sent = await interaction.reply({ content: "🏓 جاري القياس...", fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);

    const embed = new EmbedBuilder()
      .setTitle("🏓 Pong!")
      .addFields(
        { name: "⏱️ وقت الاستجابة", value: `${latency}ms`, inline: true },
        { name: "💓 API Latency", value: `${apiLatency}ms`, inline: true }
      )
      .setColor(latency < 200 ? 0x57f287 : latency < 500 ? 0xfee75c : 0xed4245)
      .setTimestamp();

    await interaction.editReply({ content: "", embeds: [embed] });

  } else if (cmd === "serverinfo") {
    const guild = interaction.guild!;
    await guild.members.fetch();

    const onlineCount = guild.members.cache.filter(
      (m) => m.presence?.status !== "offline" && m.presence?.status !== undefined
    ).size;

    const embed = new EmbedBuilder()
      .setTitle(`🏠 ${guild.name}`)
      .setThumbnail(guild.iconURL({ size: 256 }) ?? null)
      .setColor(0x5865f2)
      .addFields(
        { name: "🆔 المعرف", value: guild.id, inline: true },
        { name: "👑 المالك", value: `<@${guild.ownerId}>`, inline: true },
        { name: "📅 تاريخ الإنشاء", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
        { name: "👥 الأعضاء", value: `${guild.memberCount}`, inline: true },
        { name: "🟢 أونلاين", value: `${onlineCount}`, inline: true },
        { name: "📢 القنوات", value: `${guild.channels.cache.size}`, inline: true },
        { name: "🎭 الرتب", value: `${guild.roles.cache.size}`, inline: true },
        { name: "😀 الإيموجي", value: `${guild.emojis.cache.size}`, inline: true },
        { name: "🔒 التحقق", value: `${guild.verificationLevel}`, inline: true },
      )
      .setFooter({ text: `طلب بواسطة ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

  } else if (cmd === "userinfo") {
    const targetUser = interaction.options.getUser("user") ?? interaction.user;
    const member = interaction.guild?.members.cache.get(targetUser.id) as GuildMember | undefined;

    const roles = member?.roles.cache
      .filter((r) => r.id !== interaction.guild?.id)
      .sort((a, b) => b.position - a.position)
      .map((r) => `${r}`)
      .slice(0, 5)
      .join(", ") ?? "لا يوجد";

    const embed = new EmbedBuilder()
      .setTitle(`👤 ${targetUser.username}`)
      .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
      .setColor(member?.displayColor ?? 0x5865f2)
      .addFields(
        { name: "🆔 المعرف", value: targetUser.id, inline: true },
        { name: "🤖 بوت؟", value: targetUser.bot ? "نعم" : "لا", inline: true },
        { name: "📅 إنشاء الحساب", value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:D>`, inline: true },
        ...(member
          ? [
              { name: "📥 انضم للسيرفر", value: `<t:${Math.floor((member.joinedTimestamp ?? 0) / 1000)}:D>`, inline: true },
              { name: "🏷️ الاسم في السيرفر", value: member.displayName, inline: true },
              { name: "🎭 الرتب", value: roles },
            ]
          : []),
      )
      .setFooter({ text: `طلب بواسطة ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

  } else if (cmd === "botinfo") {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const embed = new EmbedBuilder()
      .setTitle(`🤖 ${client.user?.username}`)
      .setThumbnail(client.user?.displayAvatarURL({ size: 256 }) ?? null)
      .setColor(0x5865f2)
      .addFields(
        { name: "📡 Ping", value: `${client.ws.ping}ms`, inline: true },
        { name: "⏰ Uptime", value: `${hours}h ${minutes}m ${seconds}s`, inline: true },
        { name: "🏠 السيرفرات", value: `${client.guilds.cache.size}`, inline: true },
        { name: "👥 الأعضاء", value: `${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}`, inline: true },
        { name: "📚 Discord.js", value: `v${djsVersion}`, inline: true },
        { name: "⚙️ Node.js", value: process.version, inline: true },
      )
      .setFooter({ text: "بوت سيرفر متكامل" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}

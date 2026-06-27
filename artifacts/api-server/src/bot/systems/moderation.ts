import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  TextChannel,
} from "discord.js";

const warnings = new Map<string, { reason: string; moderator: string; time: Date }[]>();

export async function handleModCommand(interaction: ChatInputCommandInteraction) {
  const cmd = interaction.commandName;
  const guild = interaction.guild!;
  const moderator = interaction.member as GuildMember;

  if (cmd === "ban") {
    const target = interaction.options.getMember("user") as GuildMember | null;
    if (!target) {
      await interaction.reply({ content: "❌ العضو غير موجود.", flags: 64 });
      return;
    }

    const reason = interaction.options.getString("reason") ?? "لم يُذكر سبب";
    const days = interaction.options.getInteger("days") ?? 0;

    if (!target.bannable) {
      await interaction.reply({ content: "❌ لا أستطيع حظر هذا العضو.", flags: 64 });
      return;
    }

    await target.ban({ reason, deleteMessageSeconds: days * 86400 });

    const embed = new EmbedBuilder()
      .setTitle("🔨 تم حظر عضو")
      .addFields(
        { name: "العضو", value: `${target.user.tag}`, inline: true },
        { name: "المشرف", value: `${moderator.user.tag}`, inline: true },
        { name: "السبب", value: reason }
      )
      .setColor(0xed4245)
      .setThumbnail(target.user.displayAvatarURL())
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

  } else if (cmd === "kick") {
    const target = interaction.options.getMember("user") as GuildMember | null;
    if (!target) {
      await interaction.reply({ content: "❌ العضو غير موجود.", flags: 64 });
      return;
    }

    const reason = interaction.options.getString("reason") ?? "لم يُذكر سبب";

    if (!target.kickable) {
      await interaction.reply({ content: "❌ لا أستطيع طرد هذا العضو.", flags: 64 });
      return;
    }

    await target.kick(reason);

    const embed = new EmbedBuilder()
      .setTitle("👢 تم طرد عضو")
      .addFields(
        { name: "العضو", value: `${target.user.tag}`, inline: true },
        { name: "المشرف", value: `${moderator.user.tag}`, inline: true },
        { name: "السبب", value: reason }
      )
      .setColor(0xfee75c)
      .setThumbnail(target.user.displayAvatarURL())
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

  } else if (cmd === "mute") {
    const target = interaction.options.getMember("user") as GuildMember | null;
    if (!target) {
      await interaction.reply({ content: "❌ العضو غير موجود.", flags: 64 });
      return;
    }

    const duration = interaction.options.getInteger("duration", true);
    const reason = interaction.options.getString("reason") ?? "لم يُذكر سبب";

    await target.timeout(duration * 60 * 1000, reason);

    const embed = new EmbedBuilder()
      .setTitle("🔇 تم كتم عضو")
      .addFields(
        { name: "العضو", value: `${target.user.tag}`, inline: true },
        { name: "المشرف", value: `${moderator.user.tag}`, inline: true },
        { name: "المدة", value: `${duration} دقيقة`, inline: true },
        { name: "السبب", value: reason }
      )
      .setColor(0xeb459e)
      .setThumbnail(target.user.displayAvatarURL())
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

  } else if (cmd === "unmute") {
    const target = interaction.options.getMember("user") as GuildMember | null;
    if (!target) {
      await interaction.reply({ content: "❌ العضو غير موجود.", flags: 64 });
      return;
    }

    await target.timeout(null);

    const embed = new EmbedBuilder()
      .setTitle("🔊 تم رفع الكتم")
      .addFields(
        { name: "العضو", value: `${target.user.tag}`, inline: true },
        { name: "المشرف", value: `${moderator.user.tag}`, inline: true }
      )
      .setColor(0x57f287)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

  } else if (cmd === "warn") {
    const target = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);
    const key = `${guild.id}:${target.id}`;

    if (!warnings.has(key)) warnings.set(key, []);
    warnings.get(key)!.push({ reason, moderator: moderator.user.tag, time: new Date() });

    const count = warnings.get(key)!.length;

    const embed = new EmbedBuilder()
      .setTitle("⚠️ تحذير")
      .addFields(
        { name: "العضو", value: `${target.tag}`, inline: true },
        { name: "المشرف", value: `${moderator.user.tag}`, inline: true },
        { name: "عدد التحذيرات", value: `${count}`, inline: true },
        { name: "السبب", value: reason }
      )
      .setColor(0xffa500)
      .setThumbnail(target.displayAvatarURL())
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    try {
      await target.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`⚠️ تحذير من ${guild.name}`)
            .setDescription(`لقد حصلت على تحذير.\n**السبب:** ${reason}\n**عدد تحذيراتك:** ${count}`)
            .setColor(0xffa500)
            .setTimestamp(),
        ],
      });
    } catch {}

  } else if (cmd === "clear") {
    const amount = interaction.options.getInteger("amount", true);
    const targetUser = interaction.options.getUser("user");
    const channel = interaction.channel as TextChannel;

    await interaction.deferReply({ flags: 64 });

    const messages = await channel.messages.fetch({ limit: amount });
    const toDelete = targetUser
      ? messages.filter((m) => m.author.id === targetUser.id).first(amount)
      : [...messages.values()].slice(0, amount);

    const deleted = await channel.bulkDelete(toDelete, true);

    await interaction.editReply({
      content: `✅ تم حذف **${deleted.size}** رسالة.`,
    });
  }
}

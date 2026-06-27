import {
  Client,
  Guild,
  TextChannel,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  CategoryChannel,
  ChatInputCommandInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
  GuildMember,
} from "discord.js";
import { logger } from "../../lib/logger";

const TICKET_CATEGORY_NAME = "🎫 التذاكر";
const TICKET_LOG_CHANNEL = "سجل-التذاكر";

const ticketCategories = [
  { id: "support", label: "دعم فني", emoji: "🔧", description: "مشاكل تقنية وإستفسارات" },
  { id: "report", label: "بلاغ", emoji: "🚨", description: "الإبلاغ عن مخالفة أو عضو" },
  { id: "complaint", label: "شكوى", emoji: "📝", description: "تقديم شكوى للإدارة" },
  { id: "other", label: "أخرى", emoji: "💬", description: "موضوع آخر" },
];

export async function setupTicketSystem(client: Client, guild: Guild) {
  let category = guild.channels.cache.find(
    (c) => c.name === TICKET_CATEGORY_NAME && c.type === ChannelType.GuildCategory
  ) as CategoryChannel | undefined;

  if (!category) {
    category = await guild.channels.create({
      name: TICKET_CATEGORY_NAME,
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      ],
    });
  }

  let logChannel = guild.channels.cache.find(
    (c) => c.name === TICKET_LOG_CHANNEL
  ) as TextChannel | undefined;

  if (!logChannel) {
    logChannel = await guild.channels.create({
      name: TICKET_LOG_CHANNEL,
      type: ChannelType.GuildText,
      topic: "سجل جميع التذاكر",
      permissionOverwrites: [
        { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      ],
    });
  }
}

export async function sendTicketPanel(channel: TextChannel, guild: Guild) {
  const embed = new EmbedBuilder()
    .setTitle("🎫 نظام التذاكر")
    .setDescription(
      "مرحباً بك في نظام الدعم!\n\n" +
      "لفتح تذكرة جديدة، اضغط على الزر أدناه وحدد نوع طلبك.\n\n" +
      "**📋 تعليمات:**\n" +
      "• كن واضحاً في شرح مشكلتك\n" +
      "• انتظر حتى يرد أحد المشرفين\n" +
      "• لا تفتح أكثر من تذكرة واحدة لنفس المشكلة"
    )
    .setColor(0x5865f2)
    .setThumbnail(guild.iconURL() ?? null)
    .setFooter({ text: guild.name, iconURL: guild.iconURL() ?? undefined })
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_open")
      .setLabel("فتح تذكرة")
      .setEmoji("🎫")
      .setStyle(ButtonStyle.Primary)
  );

  await channel.send({ embeds: [embed], components: [row] });
}

async function openTicketModal(interaction: ButtonInteraction) {
  const select = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("ticket_category")
      .setPlaceholder("اختر نوع التذكرة")
      .addOptions(
        ticketCategories.map((cat) => ({
          label: cat.label,
          value: cat.id,
          description: cat.description,
          emoji: cat.emoji,
        }))
      )
  );

  const embed = new EmbedBuilder()
    .setTitle("🎫 فتح تذكرة")
    .setDescription("اختر نوع مشكلتك من القائمة أدناه:")
    .setColor(0x5865f2);

  await interaction.reply({
    embeds: [embed],
    components: [select],
    flags: 64,
  });
}

async function createTicketChannel(
  interaction: StringSelectMenuInteraction,
  categoryId: string
) {
  const guild = interaction.guild!;
  const member = interaction.member as GuildMember;
  const cat = ticketCategories.find((c) => c.id === categoryId)!;

  const existingTicket = guild.channels.cache.find(
    (c) =>
      c.name === `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, "")}` &&
      c.type === ChannelType.GuildText
  );

  if (existingTicket) {
    await interaction.reply({
      content: `❌ لديك تذكرة مفتوحة بالفعل: <#${existingTicket.id}>`,
      flags: 64,
    });
    return;
  }

  const ticketCategory = guild.channels.cache.find(
    (c) => c.name === TICKET_CATEGORY_NAME && c.type === ChannelType.GuildCategory
  ) as CategoryChannel | undefined;

  const channelName = `${cat.emoji}-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15)}`;

  const ticketChannel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: ticketCategory,
    topic: `تذكرة | ${member.user.tag} | ${cat.label}`,
    permissionOverwrites: [
      { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      {
        id: member.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AttachFiles,
        ],
      },
    ],
  }) as TextChannel;

  const embed = new EmbedBuilder()
    .setTitle(`${cat.emoji} ${cat.label}`)
    .setDescription(
      `مرحباً ${member}!\n\n` +
      `شكراً لتواصلك معنا. سيقوم أحد المشرفين بمساعدتك قريباً.\n\n` +
      `**نوع التذكرة:** ${cat.label}\n` +
      `**الوقت:** <t:${Math.floor(Date.now() / 1000)}:F>`
    )
    .setColor(0x57f287)
    .setFooter({ text: `معرف التذكرة: ${ticketChannel.id}` })
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_claim")
      .setLabel("استلام التذكرة")
      .setEmoji("✋")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("ticket_close")
      .setLabel("إغلاق التذكرة")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Danger)
  );

  await ticketChannel.send({
    content: `${member} | @here`,
    embeds: [embed],
    components: [row],
  });

  await interaction.reply({
    content: `✅ تم فتح تذكرتك: ${ticketChannel}`,
    flags: 64,
  });
}

async function closeTicket(
  interaction: ButtonInteraction | ChatInputCommandInteraction
) {
  const channel = interaction.channel as TextChannel;

  if (!channel.topic?.startsWith("تذكرة |")) {
    await interaction.reply({
      content: "❌ هذه القناة ليست تذكرة!",
      flags: 64,
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle("🔒 إغلاق التذكرة")
    .setDescription("سيتم إغلاق هذه التذكرة خلال 5 ثوانٍ...")
    .setColor(0xed4245)
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });

  setTimeout(async () => {
    try {
      await channel.delete("تم إغلاق التذكرة");
    } catch (err) {
      logger.error({ err }, "Failed to delete ticket channel");
    }
  }, 5000);
}

async function claimTicket(interaction: ButtonInteraction) {
  const channel = interaction.channel as TextChannel;
  const member = interaction.member as GuildMember;

  if (!channel.topic?.startsWith("تذكرة |")) {
    await interaction.reply({ content: "❌ هذه ليست تذكرة!", flags: 64 });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle("✋ تم استلام التذكرة")
    .setDescription(`قام ${member} باستلام هذه التذكرة وسيتولى المساعدة.`)
    .setColor(0xfee75c)
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

export async function handleTicketInteraction(
  interaction:
    | ChatInputCommandInteraction
    | ButtonInteraction
    | StringSelectMenuInteraction
    | ModalSubmitInteraction
) {
  if (interaction.isChatInputCommand()) {
    const sub = interaction.options.getSubcommand();
    if (sub === "setup") {
      const channel = interaction.channel as TextChannel;
      await sendTicketPanel(channel, interaction.guild!);
      await interaction.reply({ content: "✅ تم إعداد نظام التذاكر!", flags: 64 });
    } else if (sub === "close") {
      await closeTicket(interaction);
    } else if (sub === "add") {
      const user = interaction.options.getUser("user", true);
      const channel = interaction.channel as TextChannel;
      await channel.permissionOverwrites.create(user, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });
      await interaction.reply({ content: `✅ تم إضافة ${user} للتذكرة.` });
    } else if (sub === "remove") {
      const user = interaction.options.getUser("user", true);
      const channel = interaction.channel as TextChannel;
      await channel.permissionOverwrites.delete(user);
      await interaction.reply({ content: `✅ تم إزالة ${user} من التذكرة.` });
    }
  } else if (interaction.isButton()) {
    if (interaction.customId === "ticket_open") {
      await openTicketModal(interaction);
    } else if (interaction.customId === "ticket_close") {
      await closeTicket(interaction);
    } else if (interaction.customId === "ticket_claim") {
      await claimTicket(interaction);
    }
  } else if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "ticket_category") {
      await createTicketChannel(interaction, interaction.values[0]);
    }
  }
}

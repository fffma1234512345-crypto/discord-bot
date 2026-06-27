import { Router } from "express";
import { client } from "../bot/index";

const router = Router();

router.get("/dashboard/stats", async (req, res) => {
  try {
    const guilds = client.guilds.cache;
    const totalMembers = guilds.reduce((acc, g) => acc + g.memberCount, 0);

    const stats = {
      status: client.isReady() ? "online" : "offline",
      ping: client.ws.ping,
      guilds: guilds.size,
      totalMembers,
      uptime: process.uptime(),
      username: client.user?.username ?? "غير متصل",
      avatar: client.user?.displayAvatarURL({ size: 128 }) ?? null,
      tag: client.user?.tag ?? null,
    };

    res.json(stats);
  } catch {
    res.json({ status: "offline", ping: -1, guilds: 0, totalMembers: 0, uptime: 0 });
  }
});

router.get("/dashboard/guilds", async (req, res) => {
  try {
    const guilds = client.guilds.cache.map((g) => ({
      id: g.id,
      name: g.name,
      icon: g.iconURL({ size: 64 }) ?? null,
      memberCount: g.memberCount,
      channels: g.channels.cache.size,
      roles: g.roles.cache.size,
    }));

    res.json({ guilds });
  } catch {
    res.json({ guilds: [] });
  }
});

export default router;

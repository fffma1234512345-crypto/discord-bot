import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";

const queryClient = new QueryClient();

interface BotStats {
  status: string;
  ping: number;
  guilds: number;
  totalMembers: number;
  uptime: number;
  username: string;
  avatar: string | null;
  tag: string | null;
}

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  memberCount: number;
  channels: number;
  roles: number;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur p-5 flex items-center gap-4 hover:bg-white/10 transition-all duration-300`}>
      <div className={`text-3xl w-12 h-12 flex items-center justify-center rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<BotStats>({
    queryKey: ["stats"],
    queryFn: () => fetch(`${BASE}/api/dashboard/stats`).then(r => r.json()),
    refetchInterval: 5000,
  });

  const { data: guildsData, isLoading: guildsLoading } = useQuery<{ guilds: Guild[] }>({
    queryKey: ["guilds"],
    queryFn: () => fetch(`${BASE}/api/dashboard/guilds`).then(r => r.json()),
    refetchInterval: 30000,
  });

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const isOnline = stats?.status === "online";
  const uptime = stats ? stats.uptime + tick * 0 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl">🤖</div>
            <div>
              <h1 className="text-lg font-bold text-foreground">لوحة تحكم البوت</h1>
              <p className="text-xs text-muted-foreground">Discord Bot Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
            <span className={`text-sm font-medium ${isOnline ? "text-green-400" : "text-red-400"}`}>
              {isOnline ? "متصل" : "غير متصل"}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Bot Profile */}
        {stats && (
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-primary/20 to-purple-900/20 p-6 flex items-center gap-6">
            {stats.avatar ? (
              <img src={stats.avatar} alt="avatar" className="w-20 h-20 rounded-full border-2 border-primary/50" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/30 flex items-center justify-center text-3xl">🤖</div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-foreground">{stats.username || "البوت"}</h2>
              <p className="text-muted-foreground">{stats.tag ?? "جاري التحميل..."}</p>
              <div className="flex gap-3 mt-2">
                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
                  {isOnline ? "🟢 أونلاين" : "🔴 أوفلاين"}
                </span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  ⏱️ {formatUptime(stats.uptime)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">📊 الإحصائيات</h3>
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-5 h-24 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="السيرفرات" value={stats?.guilds ?? 0} icon="🏠" color="bg-blue-500/20" />
              <StatCard label="الأعضاء" value={stats?.totalMembers ?? 0} icon="👥" color="bg-green-500/20" />
              <StatCard label="Ping" value={`${stats?.ping ?? 0}ms`} icon="📡" color="bg-yellow-500/20" />
              <StatCard label="Uptime" value={formatUptime(stats?.uptime ?? 0)} icon="⏰" color="bg-purple-500/20" />
            </div>
          )}
        </div>

        {/* Commands Reference */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">⚡ الأوامر المتاحة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { cat: "🎫 نظام التذاكر", cmds: ["/ticket setup", "/ticket close", "/ticket add", "/ticket remove"] },
              { cat: "❓ الأسئلة الشائعة", cmds: ["/faq list", "/faq show", "/faq add", "/faq remove"] },
              { cat: "🛡️ الإدارة", cmds: ["/ban", "/kick", "/mute", "/unmute", "/warn", "/clear"] },
              { cat: "ℹ️ المعلومات", cmds: ["/serverinfo", "/userinfo", "/botinfo", "/ping"] },
            ].map((section) => (
              <div key={section.cat} className="rounded-xl border border-white/10 bg-white/5 p-5">
                <h4 className="font-medium text-foreground mb-3">{section.cat}</h4>
                <div className="flex flex-wrap gap-2">
                  {section.cmds.map(cmd => (
                    <span key={cmd} className="text-xs font-mono bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded">
                      {cmd}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Servers List */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">🏠 السيرفرات</h3>
          {guildsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 h-16 animate-pulse" />
              ))}
            </div>
          ) : guildsData?.guilds.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-muted-foreground">
              <p className="text-4xl mb-3">🤖</p>
              <p>البوت غير موجود في أي سيرفر بعد</p>
              <p className="text-sm mt-1">أضف البوت لسيرفرك لتبدأ!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {guildsData?.guilds.map(guild => (
                <div key={guild.id} className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all p-4 flex items-center gap-4">
                  {guild.icon ? (
                    <img src={guild.icon} alt={guild.name} className="w-12 h-12 rounded-full" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl">🏠</div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{guild.name}</p>
                    <p className="text-sm text-muted-foreground">{guild.memberCount} عضو</p>
                  </div>
                  <div className="text-left text-xs text-muted-foreground space-y-0.5">
                    <p>{guild.channels} قناة</p>
                    <p>{guild.roles} رتبة</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pb-6">
          <p>بوت ديسكورد متكامل • يتجدد كل 5 ثواني</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}

export default App;

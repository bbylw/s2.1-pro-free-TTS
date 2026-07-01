import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { AudioWaveform, ShieldCheck, ShieldAlert, Loader2, Waves, Fingerprint } from "lucide-react";
import { useTTSStore } from "@/store/useTTSStore";

function NavItem({ to, icon: Icon, label }: { to: string; icon: typeof Waves; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-[11px] tracking-wide transition ${
          isActive ? "text-cyan" : "text-ink-500 hover:text-ink-200"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="nav-active"
              className="absolute inset-0 rounded-full border border-cyan/30 bg-cyan/10"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <Icon className="relative z-10 h-3.5 w-3.5" />
          <span className="relative z-10">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function TopBar() {
  const health = useTTSStore((s) => s.health);

  const statusColor =
    health.status === "ok"
      ? "text-cyan"
      : health.status === "fail"
        ? "text-magenta"
        : health.status === "checking"
          ? "text-ink-300"
          : "text-ink-500";
  const StatusIcon =
    health.status === "ok"
      ? ShieldCheck
      : health.status === "fail"
        ? ShieldAlert
        : Loader2;

  return (
    <header className="relative z-20 flex items-center justify-between px-8 py-5">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-cyan/30 blur-xl" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-cyan/40 bg-abyss shadow-cyan-glow">
            <AudioWaveform className="h-5 w-5 text-cyan" />
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="font-display text-lg font-600 tracking-[0.18em] text-ink-50">
            SONIC FORGE
          </h1>
          <span className="font-mono text-[10px] tracking-widest text-ink-500">
            S2.1 PRO · NEURAL TTS
          </span>
        </div>
      </motion.div>

      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="glass flex items-center gap-1 rounded-full p-1"
      >
        <NavItem to="/" icon={Waves} label="合成" />
        <NavItem to="/clone" icon={Fingerprint} label="声音克隆" />
      </motion.nav>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex items-center gap-3"
      >
        <div className="glass flex items-center gap-2 rounded-full px-4 py-2">
          <StatusIcon
            className={`h-3.5 w-3.5 ${statusColor} ${health.status === "checking" ? "animate-spin" : ""}`}
          />
          <span className="font-mono text-[11px] tracking-wide text-ink-300">
            {health.status === "ok"
              ? "CONNECTED"
              : health.status === "fail"
                ? "OFFLINE"
                : health.status === "checking"
                  ? "CHECKING…"
                  : "READY"}
          </span>
        </div>
        <span className="font-mono text-[10px] text-ink-700">
          v2.1 / FREE
        </span>
      </motion.div>
    </header>
  );
}

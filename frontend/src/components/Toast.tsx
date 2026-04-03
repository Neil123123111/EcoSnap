import { AnimatePresence, motion } from "framer-motion";

type ToastVariant = "success" | "warning" | "danger" | "info";

export interface ToastItem {
  id: number;
  title: string;
  message: string;
  variant: ToastVariant;
}

interface ToastProps {
  items: ToastItem[];
  onDismiss: (id: number) => void;
}

const styles: Record<ToastVariant, { shell: string; badge: string; icon: string }> = {
  success: {
    shell:
      "border-emerald-200 bg-[linear-gradient(135deg,rgba(236,253,245,0.98),rgba(209,250,229,0.88))] text-emerald-950 dark:border-emerald-800/80 dark:bg-[linear-gradient(135deg,rgba(6,46,31,0.96),rgba(6,78,59,0.82))] dark:text-emerald-100",
    badge: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200",
    icon: "✓",
  },
  warning: {
    shell:
      "border-amber-200 bg-[linear-gradient(135deg,rgba(255,251,235,0.98),rgba(254,243,199,0.9))] text-amber-950 dark:border-amber-800/80 dark:bg-[linear-gradient(135deg,rgba(69,26,3,0.96),rgba(120,53,15,0.82))] dark:text-amber-100",
    badge: "bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200",
    icon: "!",
  },
  danger: {
    shell:
      "border-rose-200 bg-[linear-gradient(135deg,rgba(255,241,242,0.98),rgba(255,228,230,0.9))] text-rose-950 dark:border-rose-800/80 dark:bg-[linear-gradient(135deg,rgba(76,5,25,0.96),rgba(136,19,55,0.82))] dark:text-rose-100",
    badge: "bg-rose-500/15 text-rose-700 dark:bg-rose-400/15 dark:text-rose-200",
    icon: "×",
  },
  info: {
    shell:
      "border-sky-200 bg-[linear-gradient(135deg,rgba(240,249,255,0.98),rgba(224,242,254,0.9))] text-sky-950 dark:border-sky-800/80 dark:bg-[linear-gradient(135deg,rgba(8,47,73,0.96),rgba(3,105,161,0.82))] dark:text-sky-100",
    badge: "bg-sky-500/15 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200",
    icon: "i",
  },
};

export default function Toast({ items, onDismiss }: ToastProps) {
  return (
    <div className="pointer-events-none fixed right-4 top-24 z-[70] flex w-[min(92vw,420px)] flex-col gap-3">
      <AnimatePresence>
        {items.map((item) => {
          const style = styles[item.variant];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 32, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={`pointer-events-auto overflow-hidden rounded-3xl border p-4 shadow-[0_18px_50px_rgba(15,23,42,0.16)] backdrop-blur ${style.shell}`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg font-black ${style.badge}`}>
                  {style.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-black uppercase tracking-[0.18em] opacity-75">{item.title}</div>
                  <div className="mt-1 text-sm leading-6 opacity-90">{item.message}</div>
                </div>
                <button
                  onClick={() => onDismiss(item.id)}
                  className="rounded-full px-2 py-1 text-lg leading-none opacity-60 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
                >
                  ×
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

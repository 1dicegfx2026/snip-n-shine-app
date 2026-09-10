import { useState } from "react";
import { Bell } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useNotifications } from "@/lib/notification-store";
import { useAuth } from "@/lib/auth";

export function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unread, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notificaciones"
        onClick={() => {
          setOpen((v) => !v);
          if (!open && unread > 0) void markAllRead();
        }}
        className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:text-gold"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-gold-foreground">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Cerrar"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
            <p className="border-b border-border px-4 py-3 font-display text-sm font-bold">
              Notificaciones
            </p>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">
                  Todavía no tienes avisos.
                </p>
              ) : (
                notifications.map((n) => {
                  const inner = (
                    <>
                      <p className="text-sm font-semibold">{n.title}</p>
                      {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </>
                  );
                  const cls = `block w-full border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/40 ${
                    n.read ? "" : "bg-gold/5"
                  }`;
                  return n.link ? (
                    <Link key={n.id} to={n.link} className={cls} onClick={() => setOpen(false)}>
                      {inner}
                    </Link>
                  ) : (
                    <div key={n.id} className={cls}>
                      {inner}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

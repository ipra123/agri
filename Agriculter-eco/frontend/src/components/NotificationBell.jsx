import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import api from "../lib/api";

const NotificationBell = () => {
  const queryClient = useQueryClient();
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/notifications")).data,
    refetchInterval: 30000,
  });
  const markAllRead = useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const unread = notifications.filter((notification) => notification.status === "PENDING").length;

  return (
    <div className="relative group">
      <button
        type="button"
        aria-label={`${unread} unread notifications`}
        className="relative grid h-11 w-11 place-items-center rounded-full border border-[color:var(--border-color)] bg-[color:var(--surface-soft)] text-[color:var(--text-main)] transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && <span className="absolute -right-1 -top-1 min-w-5 bg-[color:var(--accent)] px-1 py-0.5 text-center text-[10px] font-black text-black">{unread}</span>}
      </button>
      <div className="invisible absolute right-0 top-14 z-50 w-80 border border-[color:var(--border-color)] bg-[color:var(--bg-card-solid)] p-3 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100">
        <div className="flex items-center justify-between border-b border-[color:var(--border-color)] pb-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--text-main)]">Notifications</p>
          {unread > 0 && <button type="button" onClick={() => markAllRead.mutate()} className="text-[10px] font-bold text-[color:var(--primary)]"><CheckCheck className="mr-1 inline h-3 w-3" />Mark read</button>}
        </div>
        <div className="max-h-72 overflow-auto">
          {notifications.slice(0, 8).map((notification) => (
            <div key={notification.id} className={`border-b border-[color:var(--border-color)] py-3 text-left ${notification.status === "PENDING" ? "bg-[color:var(--surface-soft)]" : ""}`}>
              <p className="text-xs font-semibold text-[color:var(--text-main)]">{notification.message}</p>
              <p className="mt-1 text-[10px] text-[color:var(--text-muted)]">{new Date(notification.createdAt).toLocaleString()}</p>
            </div>
          ))}
          {!notifications.length && <p className="py-8 text-center text-xs text-[color:var(--text-muted)]">No notifications</p>}
        </div>
      </div>
    </div>
  );
};

export default NotificationBell;
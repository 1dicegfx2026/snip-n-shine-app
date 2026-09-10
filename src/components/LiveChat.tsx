import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

interface Msg {
  id: string;
  author: string;
  body: string;
  userId: string;
  createdAt: number;
}

interface Row {
  id: string;
  author_name: string;
  body: string;
  user_id: string;
  created_at: string;
}

export function LiveChat({ streamId, canModerate }: { streamId: string; canModerate?: boolean }) {
  const { user, displayName } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from("live_messages")
      .select("*")
      .eq("stream_id", streamId)
      .order("created_at", { ascending: true })
      .limit(200);
    if (data) {
      setMessages(
        (data as unknown as Row[]).map((r) => ({
          id: r.id,
          author: r.author_name || "Invitado",
          body: r.body,
          userId: r.user_id,
          createdAt: new Date(r.created_at).getTime(),
        })),
      );
    }
  };

  useEffect(() => {
    void load();
    const channel = supabase
      .channel(`live-chat-${streamId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_messages", filter: `stream_id=eq.${streamId}` },
        () => void load(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    if (!user) {
      toast.error("Inicia sesión para escribir en el chat.");
      return;
    }
    setText("");
    const { error } = await supabase.from("live_messages").insert({
      stream_id: streamId,
      user_id: user.id,
      author_name: displayName || "Invitado",
      body,
    });
    if (error) toast.error("No se pudo enviar el mensaje.");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("live_messages").delete().eq("id", id);
    if (error) toast.error("No se pudo borrar el mensaje.");
  };

  return (
    <div className="flex h-[420px] flex-col rounded-2xl border border-border bg-card lg:h-full">
      <p className="border-b border-border px-4 py-3 text-xs font-bold tracking-widest text-gold">
        CHAT EN VIVO
      </p>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">Sé el primero en saludar.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="group text-sm">
            <span className="font-semibold text-gold">{m.author}</span>{" "}
            <span className="text-muted-foreground">{m.body}</span>
            {(canModerate || m.userId === user?.id) && (
              <button
                onClick={() => void remove(m.id)}
                className="ml-2 hidden text-[10px] font-bold text-destructive group-hover:inline"
              >
                borrar
              </button>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2 border-t border-border p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void send();
          }}
          placeholder={user ? "Escribe algo…" : "Inicia sesión para escribir"}
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none"
        />
        <button
          onClick={() => void send()}
          className="rounded-lg bg-primary px-3 text-primary-foreground hover:bg-primary/85"
          aria-label="Enviar mensaje"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

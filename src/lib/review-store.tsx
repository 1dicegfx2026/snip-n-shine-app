import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export interface LiveReview {
  id: string;
  bookingId: string | null;
  barberSlug: string;
  clientId: string;
  authorName: string;
  serviceName: string;
  rating: number;
  comment: string;
  reply: string;
  replyAt: number | null;
  createdAt: number;
}

interface Store {
  reviews: LiveReview[];
  favorites: string[];
  addReview: (r: {
    bookingId: string | null;
    barberSlug: string;
    authorName: string;
    serviceName: string;
    rating: number;
    comment: string;
  }) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  /** El barbero (o staff) responde públicamente a la reseña */
  replyToReview: (id: string, reply: string) => Promise<void>;
  reviewFor: (bookingId: string) => LiveReview | undefined;
  reviewsFor: (barberSlug: string) => LiveReview[];
  isFavorite: (barberSlug: string) => boolean;
  toggleFavorite: (barberSlug: string) => Promise<void>;
}

const Ctx = createContext<Store | null>(null);

interface Row {
  id: string;
  booking_id: string | null;
  barber_slug: string;
  client_id: string;
  author_name: string;
  service_name: string;
  rating: number;
  comment: string;
  reply: string | null;
  reply_at: string | null;
  created_at: string;
}

export function ReviewProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [reviews, setReviews] = useState<LiveReview[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      setReviews(
        (data as unknown as Row[]).map((r) => ({
          id: r.id,
          bookingId: r.booking_id,
          barberSlug: r.barber_slug,
          clientId: r.client_id,
          authorName: r.author_name,
          serviceName: r.service_name,
          rating: r.rating,
          comment: r.comment,
          reply: r.reply ?? "",
          replyAt: r.reply_at ? new Date(r.reply_at).getTime() : null,
          createdAt: new Date(r.created_at).getTime(),
        })),
      );
    }
  };

  const loadFavorites = async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    const { data } = await supabase.from("favorites").select("barber_slug");
    if (data) setFavorites((data as { barber_slug: string }[]).map((r) => r.barber_slug));
  };

  useEffect(() => {
    if (loading) return;
    void load();
    void loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loading]);

  const store: Store = {
    reviews,
    favorites,
    addReview: async (r) => {
      if (!user) throw new Error("Inicia sesión para dejar tu reseña.");
      const { error } = await supabase.from("reviews").insert({
        booking_id: r.bookingId,
        barber_slug: r.barberSlug,
        client_id: user.id,
        author_name: r.authorName,
        service_name: r.serviceName,
        rating: r.rating,
        comment: r.comment,
      });
      if (error) throw new Error(error.message);
      await load();
    },
    replyToReview: async (id, reply) => {
      const replyAt = new Date().toISOString();
      const { error } = await supabase
        .from("reviews")
        .update({ reply, reply_at: replyAt })
        .eq("id", id);
      if (error) throw new Error(error.message);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, reply, replyAt: new Date(replyAt).getTime() } : r)),
      );
    },
    deleteReview: async (id) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw new Error(error.message);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    },
    reviewFor: (bookingId) => reviews.find((r) => r.bookingId === bookingId),
    reviewsFor: (barberSlug) => reviews.filter((r) => r.barberSlug === barberSlug),
    isFavorite: (slug) => favorites.includes(slug),
    toggleFavorite: async (slug) => {
      if (!user) throw new Error("Inicia sesión para guardar favoritos.");
      if (favorites.includes(slug)) {
        setFavorites((prev) => prev.filter((s) => s !== slug));
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("client_id", user.id)
          .eq("barber_slug", slug);
        if (error) {
          await loadFavorites();
          throw new Error(error.message);
        }
      } else {
        setFavorites((prev) => [...prev, slug]);
        const { error } = await supabase
          .from("favorites")
          .insert({ client_id: user.id, barber_slug: slug });
        if (error) {
          await loadFavorites();
          throw new Error(error.message);
        }
      }
    },
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useReviews(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useReviews must be used inside ReviewProvider");
  return ctx;
}

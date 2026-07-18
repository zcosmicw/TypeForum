"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { RankBadge } from "@/components/RankBadge";
import type { UserRank } from "@/lib/types";
import type { DbProfile } from "@/lib/supabase/types";
import { resetChatAction } from "@/lib/actions/admin";

interface ChatMessage {
  id: string;
  profile_id: string;
  body: string;
  created_at: string;
}

interface ChatProfile {
  username: string;
  display_name: string;
  rank: UserRank;
}

interface GlobalChatProps {
  currentUserProfile: DbProfile | null;
}

export function GlobalChat({ currentUserProfile }: GlobalChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [profilesCache, setProfilesCache] = useState<Record<string, ChatProfile>>({});
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const profilesCacheRef = useRef<Record<string, ChatProfile>>({});

  useEffect(() => {
    profilesCacheRef.current = profilesCache;
  }, [profilesCache]);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    async function fetchInitialMessages() {
      const supabase = createClient();
      if (!supabase) return;

      const { data, error } = await supabase
        .from("global_chat_messages")
        .select("id, body, created_at, profile_id, profiles(username, display_name, rank)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        const sorted = [...data].reverse();
        const profileMap: Record<string, ChatProfile> = {};
        const messagesList: ChatMessage[] = [];

        sorted.forEach((item: any) => {
          messagesList.push({
            id: item.id,
            body: item.body,
            created_at: item.created_at,
            profile_id: item.profile_id,
          });

          if (item.profiles) {
            profileMap[item.profile_id] = {
              username: item.profiles.username,
              display_name: item.profiles.display_name,
              rank: item.profiles.rank as UserRank,
            };
          }
        });

        setProfilesCache((prev) => ({ ...prev, ...profileMap }));
        setMessages(messagesList);
      }
    }

    fetchInitialMessages();
  }, []);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel("global_chat_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "global_chat_messages",
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMessage]);

          const cachedProfile = profilesCacheRef.current[newMessage.profile_id];
          if (!cachedProfile) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("username, display_name, rank")
              .eq("id", newMessage.profile_id)
              .single();

            if (profile) {
              setProfilesCache((prev) => ({
                ...prev,
                [newMessage.profile_id]: {
                  username: profile.username,
                  display_name: profile.display_name,
                  rank: profile.rank as UserRank,
                },
              }));
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "global_chat_messages",
        },
        (payload) => {
          const oldMessageId = payload.old.id;
          setMessages((prev) => prev.filter((m) => m.id !== oldMessageId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending || !currentUserProfile) return;

    setIsSending(true);
    const supabase = createClient();
    if (!supabase) {
      setIsSending(false);
      return;
    }

    const { error } = await supabase.from("global_chat_messages").insert({
      profile_id: currentUserProfile.id,
      body: input.trim(),
    });

    if (error) {
      console.error(error);
    } else {
      setInput("");
    }
    setIsSending(false);
  };

  const handleResetChat = async () => {
    if (!window.confirm("Reset the entire chat?")) return;
    setIsResetting(true);
    try {
      await resetChatAction();
      setMessages([]);
    } catch (err: any) {
      alert(err.message || "Failed to reset chat");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="card flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-default px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-sage" />
          </span>
          <h3 className="text-sm font-semibold text-text-primary">Live Chat</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="mono text-[11px] text-text-ghost">Global</span>
          {currentUserProfile?.role === "admin" && (
            <button
              onClick={handleResetChat}
              disabled={isResetting}
              className="btn-danger px-2.5 py-1 text-[11px]"
            >
              {isResetting ? "..." : "Reset"}
            </button>
          )}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]"
      >
        {messages.map((message) => {
          const profile = profilesCache[message.profile_id];
          return (
            <div key={message.id} className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-primary">
                  {profile ? profile.display_name : "..."}
                </span>
                {profile && (
                  <>
                    <span className="text-xs text-text-ghost">@{profile.username}</span>
                    <RankBadge rank={profile.rank} size="sm" />
                  </>
                )}
                <span className="mono text-[11px] text-text-ghost">
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm text-text-secondary break-words leading-relaxed pl-0.5">
                {message.body}
              </p>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-text-ghost">
            No messages yet — start the conversation
          </div>
        )}
      </div>

      <div className="border-t border-border-default p-3 bg-bg-surface shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder={currentUserProfile ? "Type a message..." : "Log in to chat"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={500}
            disabled={isSending || !currentUserProfile}
            className="input-field flex-1"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim() || !currentUserProfile}
            className="btn-primary px-4 py-2 text-sm shrink-0"
          >
            {isSending ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

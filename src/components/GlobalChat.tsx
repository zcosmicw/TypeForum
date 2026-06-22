"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { RankBadge } from "@/components/RankBadge";
import type { UserRank } from "@/lib/types";
import type { DbProfile } from "@/lib/supabase/types";
import { resetChatAction } from "@/lib/actions/admin";

// 1. Define the shape of a Chat Message from our database table
interface ChatMessage {
  id: string;
  profile_id: string;
  body: string;
  created_at: string;
}

// 2. Define the shape of the User Profile info we want to display next to the message
interface ChatProfile {
  username: string;
  display_name: string;
  rank: UserRank;
}

interface GlobalChatProps {
  currentUserProfile: DbProfile | null; // Passed from the server page (null if the visitor is logged out)
}

export function GlobalChat({ currentUserProfile }: GlobalChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // A local cache mapping profile IDs to profile details.
  // This keeps us from querying Supabase for the same profile multiple times!
  const [profilesCache, setProfilesCache] = useState<Record<string, ChatProfile>>({});
  
  // Use React state to hold the user's text input and sending state
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // References used to interact directly with DOM elements
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const profilesCacheRef = useRef<Record<string, ChatProfile>>({});

  // Keep the reference synchronized with the profile cache state.
  // This is a common TypeScript React trick to ensure real-time callbacks always read the fresh cache state.
  useEffect(() => {
    profilesCacheRef.current = profilesCache;
  }, [profilesCache]);

  // Hook to scroll the chat box to the latest message whenever messages change
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

  // Hook 1: Fetch initial messages on page load
  useEffect(() => {
    async function fetchInitialMessages() {
      const supabase = createClient();
      if (!supabase) return;

      // Query the latest 50 messages, joining profile information in one query
      const { data, error } = await supabase
        .from("global_chat_messages")
        .select("id, body, created_at, profile_id, profiles(username, display_name, rank)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching chat messages:", error);
        return;
      }

      if (data) {
        // Since we fetched in descending order (newest first), reverse it to display chronologically (oldest at top)
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

          // If profiles relation exists, store it in our profile map
          if (item.profiles) {
            profileMap[item.profile_id] = {
              username: item.profiles.username,
              display_name: item.profiles.display_name,
              rank: item.profiles.rank as UserRank,
            };
          }
        });

        // Update states
        setProfilesCache((prev) => ({ ...prev, ...profileMap }));
        setMessages(messagesList);
      }
    }

    fetchInitialMessages();
  }, []);

  // Hook 2: Subscribe to real-time additions (postgres_changes)
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

          // Add message to chat list
          setMessages((prev) => [...prev, newMessage]);

          // Fetch the profile for this user if we don't have it cached yet
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
      .subscribe((status, err) => {
        console.log("Realtime subscription status:", status, err);
      });

    // Clean up subscription when the component is destroyed
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Submitting a new message to the database
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
      console.error("Error sending message:", error);
    } else {
      setInput("");
    }
    setIsSending(false);
  };

  const handleResetChat = async () => {
    if (!window.confirm("Are you sure you want to delete ALL messages in the global chat?")) {
      return;
    }
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
    <div className="neon-border overflow-hidden rounded-xl glass-panel">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <h3 className="text-sm font-bold tracking-wide text-white uppercase">Global Chat Room</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">Real-time discussion</span>
          {currentUserProfile?.role === "admin" && (
            <button
              onClick={handleResetChat}
              disabled={isResetting}
              className="rounded bg-red-950/60 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold text-red-400 hover:bg-red-900/40 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isResetting ? "Resetting..." : "Reset Chat"}
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Box */}
      <div 
        ref={scrollContainerRef}
        className="h-64 sm:h-72 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10"
      >
        {messages.map((message) => {
          const profile = profilesCache[message.profile_id];
          return (
            <div key={message.id} className="flex flex-col space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-100">
                  {profile ? profile.display_name : "Loading user..."}
                </span>
                {profile && (
                  <>
                    <span className="text-xs text-slate-500 font-medium">@{profile.username}</span>
                    <RankBadge rank={profile.rank} size="sm" />
                  </>
                )}
                <span className="text-[10px] text-slate-500">
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm text-slate-300 break-words leading-relaxed pl-1">
                {message.body}
              </p>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No messages yet. Start the conversation!
          </div>
        )}
      </div>

      {/* Send message form */}
      <div className="border-t border-white/10 p-3 bg-white/[0.01]">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder={currentUserProfile ? "Type a global message..." : "Log in to chat"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={500}
            disabled={isSending || !currentUserProfile}
            className="flex-1 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple-neon focus:ring-1 focus:ring-brand-purple-neon disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim() || !currentUserProfile}
            className="btn-premium-primary rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shrink-0 min-w-[70px]"
          >
            {isSending ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

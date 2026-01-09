import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Pressable } from "react-native";
import {useRef} from "react";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { supabase } from "@/servers/config/supabase";
import { API_BASE_URL } from "../config/platformconfig";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Conversation = {
  id: string;
  title: string;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  /* ---------------- helpers ---------------- */

  const resetChat = () => {
    setConversationId(null);
    setMessages([]);
    setShowSidebar(false);
  };

  /* ---------------- load conversations ---------------- */

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("id,title")
      .order("last_active", { ascending: false });

    if (error) {
      console.error("Failed to load conversation: ", error.message);
      return;
    }

    setConversations(data ?? []);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  /* ---------------- load messages ---------------- */

  const loadMessages = async (conversationId: string) => {
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;

    const res = await fetch(
      `${API_BASE_URL}/api/conversations/${conversationId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      console.error(await res.text());
      return;
    }

    const data = await res.json();

    setMessages(
      data.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
      }))
    );
  };

  /* ---------------- send message ---------------- */

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: "temp-" + Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_id: conversationId,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();

      
      if (!conversationId && data.conversation_id) {
        setConversationId(data.conversation_id);
        await loadConversations();
      }

      setMessages((prev) => [
        ...prev,
        {
          id: "temp-ai-" + Date.now().toString(),
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(()=>{
    if(messages.length===0)return;
    requestAnimationFrame(()=>{
      flatListRef.current?.scrollToEnd({animated:true});
    })
  },[messages])

  /* ---------------- UI ---------------- */

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-black"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* HEADER */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-zinc-800">
        <TouchableOpacity onPress={() => setShowSidebar(!showSidebar)}>
          <Text className="text-white text-lg">☰</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={resetChat}>
          <Text className="text-blue-500">New</Text>
        </TouchableOpacity>
      </View>

      {/* BLUR OVERLAY */}
      {showSidebar && (
        <Pressable
          onPress={() => setShowSidebar(false)}
          className="absolute inset-0 z-40"
        >
          <BlurView intensity={40} tint="dark" className="absolute inset-0" />
        </Pressable>
      )}
      {/* SIDEBAR */}

      {showSidebar && (
        <View className="absolute left-0 top-[56px] w-[75%] bg-zinc-900 rounded-tr-2xl rounded-br-2xl shadow-lg z-50">
          <View className="p-4">
            <Text className="text-white text-lg mb-3">Conversations</Text>

            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 300 }} // ⬅️ content-based height
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="py-3 border-b border-zinc-800"
                  onPress={async () => {
                    setConversationId(item.id);
                    await loadMessages(item.id);
                    setShowSidebar(false);
                  }}
                >
                  <Text className="text-white">{item.title}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      )}

      {/* CHAT */}
      <FlatList
      ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View
            className={`mb-3 max-w-[80%] rounded-xl px-4 py-2 ${
              item.role === "user"
                ? "bg-blue-600 self-end"
                : "bg-zinc-800 self-start"
            }`}
          >
            <Text className="text-white">{item.content}</Text>
          </View>
        )}
      />

      {/* INPUT */}
      <View className="flex-row items-center p-3 border-t border-zinc-700">
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Message Krimi..."
          placeholderTextColor="#71717a"
          className="flex-1 bg-zinc-900 text-white px-4 py-3 rounded-xl mr-2"
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={loading}
          className="bg-blue-600 px-4 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">
            {loading ? "..." : "Send"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import QuoteCard from "@/components/QuoteCard";
import { useFocusEffect } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";

export default function Index() {
  const profile = useAuthStore((state) => state.profile);
  const name: string = profile?.username ?? "User";
  const greeting: string = "Good Evening";

  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");

  useFocusEffect(
    useCallback(() => {
      const fetchquote = async () => {
        try {
          const response = await fetch("https://zenquotes.io/api/random");
          if (!response.ok) {
            throw new Error("failed to fetch quote");
          }

          const data = await response.json();

          if (Array.isArray(data) && data.length > 0) {
            setQuote(data[0].q);
            setAuthor(data[0].a);
          }
        } catch (err) {
          console.log("error fetching the quote");
        }
      };

      fetchquote();
    }, [])
  );

  return (
    <View className="flex-1 bg-black px-5">
      
      {/* Greeting Section */}
      <View className="mt-3">
        <Text className="text-zinc-400 text-sm">
          {greeting}
        </Text>
        <Text className="text-white text-2xl font-bold tracking-wide">
          {name}
        </Text>
      </View>

      {/* Quote Section */}
      <View className="mt-5 justify-center">
        <QuoteCard quote={quote} author={author} />
      </View>

    </View>
  );
}

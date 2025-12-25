import { View, Text } from "react-native";

interface QuoteCardProps {
  quote: string;
  author: string;
}

export default function QuoteCard({ quote, author }: QuoteCardProps) {
  return (
    <View className="bg-zinc-900 rounded-3xl px-6 py-7 border border-zinc-800 shadow-xl shadow-black/40">
      
      {/* Quote */}
      <Text className="text-white text-lg leading-relaxed font-medium italic">
        “{quote}”
      </Text>

      {/* Divider */}
      <View className="h-[1px] bg-zinc-800 my-4" />

      {/* Author */}
      <Text className="text-zinc-400 text-right text-sm tracking-wide">
        — {author}
      </Text>

    </View>
  );
}

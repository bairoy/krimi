
import { Text, View, Image, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/servers/config/supabase";
import { icons } from "@/constants/icons";
import { months } from "@/constants/months";
import { monthnumber } from "@/constants/months";
import { useEffect } from "react";
import {router} from "expo-router";

export default function Header() {
  const insets = useSafeAreaInsets();
  const date = new Date();
  const day = date.getDate();
  const month_number: monthnumber = date.getMonth() as monthnumber;

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", error.message);
    }
    router.replace("/(auth)/Auth");
  };

  

  return (
    <View
      style={{
        paddingTop: insets.top + 6,
        paddingBottom: 14,
        paddingHorizontal: 20,
        backgroundColor: "black",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderColor: "#2a2a2a",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      {/* Left: Logo */}
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <Image
          source={icons.logo}
          style={{ height: 40, width: 40, resizeMode: "contain" }}
        />
        <Text
          style={{
            fontSize: 26,
            fontWeight: "800",
            color: "#FF6D1F",
            letterSpacing: 1,
          }}
        >
          Krimi
        </Text>
      </View>

      {/* Right: Date + Sign Out */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#FF6D1F",
          }}
        >
          {day} {months[month_number]}
        </Text>

        <TouchableOpacity onPress={handleSignOut} style={{
          backgroundColor:"white",
          borderRadius:5,
          padding:5
        }}>
          <Text style={{ color: "#FF6D1F", fontWeight: "600", }}>
            Sign out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

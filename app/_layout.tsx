import { Stack } from "expo-router";
import { StatusBar, AppState } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import * as Linking from "expo-linking";
import { supabase } from "@/servers/config/supabase";
import { router } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import "./globals.css"

export default function RootLayout() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const setUser = useAuthStore((s)=>s.setUser);
  const setProfile = useAuthStore((s)=>s.setProfile);
  

  // Initial session + auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false); // ✅ critical for Android
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // AppState handling (Android critical)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    return () => sub.remove();
  }, []);

  // Deep linking (email verification)
  useEffect(() => {
    const handleDeepLink = async () => {
      await supabase.auth.getSession();
    };

    const sub = Linking.addEventListener("url", handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink();
    });

    return () => sub.remove();
  }, []);

  // 🔹 Rehydrate Zustand user + profile
  useEffect(() => {
    
    const hydrate = async () => {
      if (session?.user) {
        const user = session.user;
        setUser(user);

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          setProfile(profile);
        }
      }
    };

    hydrate();
  }, [session]);

  useEffect(()=>{
    if(!loading && !session){
      router.replace("/(auth)/Auth");
    }
  },[loading,session]);

  if (loading) return null;

  const isVerified =
    session?.user?.email_confirmed_at ||
    session?.user?.confirmed_at;

  return (
    <SafeAreaProvider>
      <StatusBar hidden />
      <Stack
        key={session && isVerified ? "auth" : "guest"}
        screenOptions={{ headerShown: false }}
      >
        {session && isVerified ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
    </SafeAreaProvider>
  );
}

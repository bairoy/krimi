import React, { useState } from "react";
import { router } from "expo-router";
import {
  Alert,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
} from "react-native";
import { supabase } from "@/servers/config/supabase";
import { useAuthStore } from "@/store/useAuthStore";

type AuthMode = "signin" | "signup";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const setUser = useAuthStore((s) => s.setUser);
  const setProfile = useAuthStore((s) => s.setProfile);

  /* ---------------- SIGN IN ---------------- */
  const signInWithEmail = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      setUser(data.user);
      await ensureProfileExists(data.user);

      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Login failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- ENSURE PROFILE ---------------- */
  const ensureProfileExists = async (user: any) => {
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!existingProfile) {
      const fallbackUsername =
        user.user_metadata?.username ?? user.email.split("@")[0];

      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        username: fallbackUsername,
      });

      if (error) throw error;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;
    setProfile(profile);
  };

  /* ---------------- SIGN UP ---------------- */
  const handleSignup = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: "krimi://auth",
          data: { username },
        },
      });

      if (error) throw error;

      Alert.alert(
        "Verification email sent",
        "Please verify your email, then sign in."
      );
      setMode("signin");
    } catch (err: any) {
      Alert.alert("Signup failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {mode === "signin" ? "Welcome back" : "Create your account"}
      </Text>
      <Text style={styles.subtitle}>
        {mode === "signin"
          ? "Sign in to continue"
          : "Join Krimi and manage tasks better"}
      </Text>

      {/* Username (Signup only) */}
      {mode === "signup" && (
        <>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="your name"
            placeholderTextColor="#888"
            value={username}
            onChangeText={setUsername}
          />
        </>
      )}

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="abc@gmail.com"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Main Action Button */}
      <TouchableOpacity
        style={[styles.button, loading && styles.disabled]}
        disabled={loading}
        onPress={mode === "signin" ? signInWithEmail : handleSignup}
      >
        <Text style={styles.buttonText}>
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </Text>
      </TouchableOpacity>

      {/* Toggle */}
      <TouchableOpacity
        disabled={loading}
        onPress={() =>
          setMode(mode === "signin" ? "signup" : "signin")
        }
      >
        <Text style={styles.toggleText}>
          {mode === "signin"
            ? "Don't have an account? Sign Up"
            : "Already have an account? Sign In"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222222",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#F5E7C6",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#FAF3E1",
    marginBottom: 30,
    opacity: 0.8,
  },
  label: {
    color: "#F5E7C6",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FAF3E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
    color: "#222222",
  },
  button: {
    backgroundColor: "#FF6D1F",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#222222",
    fontSize: 16,
    fontWeight: "600",
  },
  toggleText: {
    marginTop: 14,
    textAlign: "center",
    color: "#FF6D1F",
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.6,
  },
});

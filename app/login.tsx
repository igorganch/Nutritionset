import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

type AuthScreenProps = {
  showLogin: boolean;
  setShowLogin: (value: boolean) => void;
};

const Login: React.FC<AuthScreenProps> = ({ showLogin, setShowLogin }) => {
  const router = useRouter();

  const [mode, setMode] = useState("login"); // "login" or "Sign Up"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = () => {
    console.log({ name, email, password });
    setShowLogin(!showLogin)
    // Defer navigation by 0ms to ensure the stack is fully mounted
    setTimeout(() => {
      router.replace("/(tabs)");
    }, 0);
  };

  return (
    <View style={styles.container}>
      {/* Red bar at the top (height 50) */}
      <View style={styles.redBar} />

      {/* Card container below the red bar */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          {/* Bold, black, centered title in the card */}
          <Text style={styles.title}>
            {mode === "Sign Up" ? "Sign Up" : "Login"}
          </Text>
          <Text style={styles.subtitle}>
            Please {mode === "Sign Up" ? "sign up" : "log in"} to check your food's expiration date
          </Text>

          {mode === "Sign Up" && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
                placeholderTextColor="#9ca3af"
              />
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
            />
          </View>

          <TouchableOpacity onPress={onSubmitHandler} style={styles.button}>
            <Text style={styles.buttonText}>
              {mode === "Sign Up" ? "Create Account" : "Login"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.switchModeText}>
            {mode === "Sign Up"
              ? "Already have an account? "
              : "Don't have an account? "}
            <Text
              style={styles.switchModeLink}
              onPress={() => setMode(mode === "Sign Up" ? "login" : "Sign Up")}
            >
              {mode === "Sign Up" ? "Login here" : "Sign up here"}
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

export default Login;

const styles = StyleSheet.create({
  // Full screen, pink background
  container: {
    flex: 1,
    backgroundColor: "#fff1f2",
  },
  // Red bar at the top
  redBar: {
    width: "100%",
    backgroundColor: "#dc2626",
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 24,
    width: "90%",
    maxWidth: 420,
    borderRadius: 12,
    // Shadows
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 24,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#1f2937",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    width: "100%",
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#fca5a5",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#dc2626",
    borderRadius: 6,
    paddingVertical: 14,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  switchModeText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 24,
    textAlign: "center",
  },
  switchModeLink: {
    color: "#dc2626",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});

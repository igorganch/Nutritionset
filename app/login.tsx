import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthScreenProps = {
  showLogin: boolean;
  setShowLogin: (value: boolean) => void;
};

const Login: React.FC<AuthScreenProps> = ({ showLogin, setShowLogin }) => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [error, setError] = useState("");
  const [errorPass, setErrorPass] = useState("");
  const [apiError, setApiError] = useState("");

  const togglePasswordVisibility = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  const validateEmail = (input: string) => {
    if (!input) {
      setError("Email address is required");
      return false;
    } else if (!emailRegex.test(input)) {
      setError("Invalid email address");
      return false;
    }
    setError("");
    return true;
  };

  const validatePassword = (input: string) => {
    if (!input) {
      setErrorPass("Password is required");
      return false;
    } else if (input.length < 3) { // change back to 9
      setErrorPass("Password must be at least 9 characters");
      return false;
    }
    setErrorPass("");
    return true;
  };

  const onSubmitHandler = async () => {
    console.log("Sign In clicked");
    setApiError("");

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    console.log("Validation - Email:", isEmailValid, "Password:", isPasswordValid);

    if (!isEmailValid || !isPasswordValid) {
      console.log("Validation failed");
      return;
    }

    try {
      console.log("Making API call with:", { email, password });
      const response = await fetch('http://10.0.0.83:8080/api/login', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        if (response.status === 400) {
          setApiError(data.message || "Please provide all required fields");
        } else if (response.status === 401) {
          setApiError(data.message || "Invalid email or password");
        } else if (response.status === 500) {
          setApiError(data.message || "Login failed. Please try again.");
        } else {
          setApiError("An unexpected error occurred. Please try again.");
        }
        return;
      }
     

      const authData = {
        token: data.token,
        userId: data.userid, 
        fullname: data.fullname,
        rank: data.rank || { 
          rank_name: "No Rank",
          rank_badge: "❓",
          max_points: 0,
        },
        points: data.points || 0, 
      };
     

      // Save to AsyncStorage
      await AsyncStorage.setItem('authData', JSON.stringify(authData));
      console.log("Auth data saved to AsyncStorage:", authData);

      console.log("Login successful:", data);
      console.log("signed in!");
      console.log("Navigating to home...");
      router.replace("/(tabs)/home");
      console.log("Navigation triggered...");

    } catch (error) {
      console.error("API call failed:", error);
      setApiError("Network error. Please check your connection and try again.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Sign in your Account</Text>
        <Text style={styles.subtitle}>Welcome back, please enter your details</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            secureTextEntry={secureTextEntry}
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Ionicons
              name={secureTextEntry ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>
        {errorPass ? <Text style={styles.errorPassword}>{errorPass}</Text> : null}

        {apiError ? <Text style={styles.errorMessage}>{apiError}</Text> : null}

        

        <TouchableOpacity onPress={onSubmitHandler} style={styles.button}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/signup")} style={styles.signupText}>
          <Text>
            Don't have an Account? <Text style={styles.signupLink}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;

// Styles remain unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  errorMessage: {
    color: "red",
  },
  errorPassword: {
    color: "red",
  },
  card: {
    backgroundColor: "#fff",
    padding: 24,
    width: "90%",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
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
    textAlign: "center",
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  forgotText: {
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
  },
  resetLink: {
    color: "#1e40af",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#0f3d21",
    borderRadius: 6,
    paddingVertical: 14,
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  signupText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 24,
    textAlign: "center",
  },
  signupLink: {
    color: "#1e40af",
    fontWeight: "600",
  },
});
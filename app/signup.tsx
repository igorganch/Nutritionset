import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const Signup = () => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureTextEntryConfirm, setSecureTextEntryConfirm] = useState(true);
  const [error, setError] = useState('');
  const [errorPass, setErrorPass] = useState('');
  const [errorConfirmPass, setErrorConfirmPass] = useState('');
  const [apiError, setApiError] = useState(''); // New state for API errors

  const togglePasswordVisibility = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const toggleConfirmPasswordVisibility = () => {
    setSecureTextEntryConfirm(!secureTextEntryConfirm);
  };

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  const validateEmail = (input: string) => {
    setEmail(input);

    if (!input) {
      setError('Email address is required');
    } else if (!emailRegex.test(input)) {
      setError('Invalid email address');
    } else {
      setError('');
    }
  };

  const validatePassword = (input: string) => {
    setPassword(input);

    if (!input) {
      setErrorPass('Password is required');
    } else if (input.length < 9) {
      setErrorPass('Password has to be no less than 9 characters');
    } else {
      setErrorPass('');
    }

    if (confirmPassword) {
      validateConfirmPassword(confirmPassword);
    }
  };

  const validateConfirmPassword = (input: string) => {
    setConfirmPassword(input);

    if (!input) {
      setErrorConfirmPass('Please confirm your password');
    } else if (input !== password) {
      setErrorConfirmPass('Passwords do not match');
    } else {
      setErrorConfirmPass('');
    }
  };

  const handleSignup = async () => {
    // Reset API error
    setApiError('');

    // Validate all fields before proceeding
    validateEmail(email);
    validatePassword(password);
    validateConfirmPassword(confirmPassword);

    if (error || errorPass || errorConfirmPass || !email || !password || !confirmPassword || !name) {
      if (!name) {
        setApiError('Full name is required');
      }
      return;
    }

    
    try {
      const response = await fetch('http://10.0.0.83:8080/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          fullname: name, 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          setApiError(data.message || 'Please provide all required fields');
        } else if (response.status === 500) {
          setApiError(data.ErrorMessage || 'Registration failed. Please try again.');
        } else {
          setApiError('An unexpected error occurred. Please try again.');
        }
        return;
      }

     
      console.log('Registration successful:', data);
      router.replace("/login");

    } catch (error) {
      console.error('API call failed:', error);
      setApiError('Network error. Please check your connection and try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Sign up</Text>
        <Text style={styles.subtitle}>Welcome, please enter your details</Text>

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#666" />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Full Name"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={validateEmail}
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
          />
          {error ? <Text style={styles.errorMessage}>{error}</Text> : ""}
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={validatePassword}
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
        {errorPass ? <Text style={styles.errorPassword}>{errorPass}</Text> : ""}

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" />
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={validateConfirmPassword}
            placeholder="Confirm Password"
            placeholderTextColor="#9ca3af"
            secureTextEntry={secureTextEntryConfirm}
          />
          <TouchableOpacity onPress={toggleConfirmPasswordVisibility}>
            <Ionicons
              name={secureTextEntryConfirm ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>
        {errorConfirmPass ? <Text style={styles.errorPassword}>{errorConfirmPass}</Text> : ""}

        {/* API Error Message */}
        {apiError ? <Text style={styles.errorMessage}>{apiError}</Text> : ""}

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Sign In Link */}
        <TouchableOpacity
          style={styles.buttonSignIn}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.buttonSigninText}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  errorMessage: {
    color: 'red',
  },
  errorPassword: {
    color: 'red',
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
  button: {
    backgroundColor: "#0f3d21",
    borderRadius: 6,
    paddingVertical: 14,
    marginTop: 16,
  },
  buttonSignIn: {
    backgroundColor: "white",
    borderRadius: 6,
    borderColor: "#0f3d21",
    borderWidth: 0.8,
    paddingVertical: 14,
    marginTop: 16,
  },
  buttonSigninText: {
    color: "black",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Animated} from "react-native";
import React, { useState } from "react";

export default function SignUpPage() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isFocused, setIsFocused] = useState<{ 
    name: boolean;
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
  }>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [signUpScale] = useState(new Animated.Value(1));

  const handleFocus = (field: "name" | "email" | "password" | "confirmPassword") => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field: "name" | "email" | "password" | "confirmPassword") => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  const animateScale = (scale: Animated.Value, value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        {/* Logo or App Name */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>RecApp</Text>
        </View>

        {/* Sign Up Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          {/* Name Input */}
          <TextInput
            style={[
              styles.input,
              isFocused.name && styles.inputFocused,
            ]}
            placeholder="Full Name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            onFocus={() => handleFocus("name")}
            onBlur={() => handleBlur("name")}
            autoCapitalize="words"
          />

          {/* Email Input */}
          <TextInput
            style={[
              styles.input,
              isFocused.email && styles.inputFocused,
            ]}
            placeholder="Email (@uic.edu)"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            onFocus={() => handleFocus("email")}
            onBlur={() => handleBlur("email")}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Input */}
          <TextInput
            style={[
              styles.input,
              isFocused.password && styles.inputFocused,
            ]}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            onFocus={() => handleFocus("password")}
            onBlur={() => handleBlur("password")}
            secureTextEntry
          />

          {/* Confirm Password Input */}
          <TextInput
            style={[
              styles.input,
              isFocused.confirmPassword && styles.inputFocused,
            ]}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onFocus={() => handleFocus("confirmPassword")}
            onBlur={() => handleBlur("confirmPassword")}
            secureTextEntry
          />

          {/* Sign Up Button */}
          <TouchableOpacity 
            onPressIn={() => animateScale(signUpScale, 0.95)}
            onPressOut={() => animateScale(signUpScale, 1)}
            activeOpacity={1}
          >
            <Animated.View 
              style={[
                styles.signUpButton,
                { transform: [{ scale: signUpScale }] }
              ]}
            >
              <Text style={styles.signUpButtonText}>Create Account</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  formContainer: {
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    marginBottom: 32,
  },
  input: {
    width: "100%",
    height: 56,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#333",
  },
  inputFocused: {
    borderColor: "#0066CC",
  },
  signUpButton: {
    width: "80%",
    height: 45,
    backgroundColor: "#0066CC",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
    alignSelf: "center",
  },
  signUpButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    color: "#999",
  },
  loginLink: {
    color: "#0066CC",
    fontWeight: "bold",
  },
});
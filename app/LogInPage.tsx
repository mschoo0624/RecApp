import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Animated} from "react-native";
import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isFocused, setIsFocused] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  });
  const [loginScale] = useState(new Animated.Value(1));
  const [uicScale] = useState(new Animated.Value(1));

  const handleFocus = (field: "email" | "password") => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field: "email" | "password") => {
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

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

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

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity 
            onPressIn={() => animateScale(loginScale, 0.95)}
            onPressOut={() => animateScale(loginScale, 1)}
            activeOpacity={1}
          >
            <Animated.View 
              style={[
                styles.loginButton,
                { transform: [{ scale: loginScale }] }
              ]}
            >
              <Text style={styles.loginButtonText}>Log In</Text>
            </Animated.View>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* UIC Sign In Button */}
          <TouchableOpacity 
            onPressIn={() => animateScale(uicScale, 0.95)}
            onPressOut={() => animateScale(uicScale, 1)}
            activeOpacity={1}
          >
            <Animated.View 
              style={[
                styles.uicButton,
                { transform: [{ scale: uicScale }] }
              ]}
            >
              <Text style={styles.uicButtonText}>Sign In with UIC</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity>
            <Text style={styles.signUpLink}>Sign Up</Text>
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
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#999",
    fontSize: 14,
  },
  loginButton: {
    width: "80%",
    height: 45,
    backgroundColor: "#0066CC",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    alignSelf: "center",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#333",
  },
  dividerText: {
    color: "#999",
    paddingHorizontal: 12,
    fontSize: 14,
  },
  uicButton: {
    width: "80%",
    height: 45,
    backgroundColor: "#FF0000",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    alignSelf: "center",
  },
  uicButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signUpText: {
    color: "#999",
  },
  signUpLink: {
    color: "#0066CC",
    fontWeight: "bold",
  },
});
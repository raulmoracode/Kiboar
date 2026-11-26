import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Field } from "@/components/Field";
import { Screen } from "@/components/Screen";
import { apiUrl } from "@/lib/config";
import { colors, fonts, spacing } from "@/theme/tokens";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Screen>
      <Text style={styles.eyebrow}>Staff access</Text>
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.body}>Backend: {apiUrl}</Text>

      <Card>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      </Card>

      <Button label="Sign in" onPress={() => {}} disabled />
      <Text style={styles.note}>
        Scaffold: wire this form to `POST /auth/user/emailpass` and store the token in
        expo-secure-store. The button stays disabled until that change.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.faint,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  title: { color: colors.text, fontFamily: fonts.sans, fontSize: 32, fontWeight: "500" },
  body: { color: colors.muted, fontFamily: fonts.sans, fontSize: 13 },
  note: {
    color: colors.faint,
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
});

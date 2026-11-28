import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { Screen } from "@/components/Screen";
import { MedusaAdminClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { apiUrl } from "@/lib/config";
import { colors, spacing, typography } from "@/theme/tokens";

export default function Login() {
  const router = useRouter();
  const { ready, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!email.trim() || !password) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const nextToken = await new MedusaAdminClient(apiUrl).login(email.trim(), password);
      await signIn(nextToken);
      router.replace("/");
    } catch {
      setError("Could not sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <AppBar />

      {!ready ? (
        <Text style={typography.body}>Loading…</Text>
      ) : (
        <View style={styles.form}>
          <Field
            autoCapitalize="none"
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            value={email}
          />
          <Field label="Password" onChangeText={setPassword} secureTextEntry value={password} />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            disabled={submitting || !email.trim() || password.length === 0}
            label={submitting ? "Signing in…" : "Sign in"}
            onPress={() => void submit()}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md, marginTop: spacing.lg },
  error: { color: colors.danger, fontFamily: typography.body.fontFamily, fontSize: 13 },
});

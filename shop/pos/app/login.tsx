import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Field } from "@/components/Field";
import { Screen } from "@/components/Screen";
import { MedusaAdminClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { apiUrl } from "@/lib/config";
import { colors, fonts, spacing } from "@/theme/tokens";

export default function Login() {
  const router = useRouter();
  const { token, ready, signIn, signOut } = useAuth();
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
      router.replace("/orders");
    } catch {
      setError("Could not sign in. Check the email, the password and the backend.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <Screen>
        <Text style={styles.eyebrow}>Staff access</Text>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.body}>Checking the saved session…</Text>
      </Screen>
    );
  }

  if (token) {
    return (
      <Screen>
        <Text style={styles.eyebrow}>Staff access</Text>
        <Text style={styles.title}>Signed in</Text>
        <Text style={styles.body}>The Admin API token is stored on this device.</Text>

        <Button label="Open sales" onPress={() => router.replace("/orders")} />
        <Button
          label="Sign out"
          variant="ghost"
          onPress={() => {
            void signOut();
            setPassword("");
          }}
        />
      </Screen>
    );
  }

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

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        label={submitting ? "Signing in…" : "Sign in"}
        onPress={() => void submit()}
        disabled={submitting || !email.trim() || password.length === 0}
      />
      <Text style={styles.note}>
        The token goes to expo-secure-store (memory in the web preview). Use an admin user created
        with `medusa user`.
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
  error: { color: colors.danger, fontFamily: fonts.sans, fontSize: 13 },
  note: {
    color: colors.faint,
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
});

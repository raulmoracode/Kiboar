import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Field } from "@/components/Field";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { MedusaAdminClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { apiUrl } from "@/lib/config";
import { colors, typography } from "@/theme/tokens";

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
        <AppBar back backTo="/" title="Staff" />
        <PageHeader eyebrow="Staff access" title="Sign in" />
        <Text style={typography.body}>Checking the saved session…</Text>
      </Screen>
    );
  }

  if (token) {
    return (
      <Screen>
        <AppBar back backTo="/" title="Staff" />
        <PageHeader
          eyebrow="Staff access"
          subtitle="The Admin API token is stored on this device."
          title="Signed in"
        />

        <Card>
          <Text style={typography.eyebrow}>Session</Text>
          <Text style={styles.value}>Active</Text>
          <Text style={typography.small}>
            Sign out on a shared till or when the device changes hands.
          </Text>
          <Button label="Open sales" onPress={() => router.replace("/orders")} />
          <Button label="Sign out" variant="ghost" onPress={() => void signOut()} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <AppBar back backTo="/" title="Staff" />
      <PageHeader
        eyebrow="Staff access"
        subtitle="Use the Medusa admin account for the shop."
        title="Sign in"
      />

      <Card>
        <Field
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          value={email}
        />
        <Field label="Password" onChangeText={setPassword} secureTextEntry value={password} />
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        disabled={submitting || !email.trim() || password.length === 0}
        label={submitting ? "Signing in…" : "Sign in"}
        onPress={() => void submit()}
      />

      <Text style={typography.small}>
        Backend: {apiUrl}. The token goes to expo-secure-store on a device and stays in memory in
        the web preview.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  value: { color: colors.text, fontFamily: typography.mono.fontFamily, fontSize: 13 },
  error: { color: colors.danger, fontFamily: typography.body.fontFamily, fontSize: 13 },
});

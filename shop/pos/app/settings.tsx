import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/lib/auth-context";
import { apiUrl, locationId, salesChannelId } from "@/lib/config";
import { colors, fonts, typography } from "@/theme/tokens";

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={typography.eyebrow}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function Settings() {
  const router = useRouter();
  const { token } = useAuth();

  return (
    <Screen>
      <AppBar back backTo="/" title="Settings" />

      <PageHeader
        eyebrow="Settings"
        subtitle="The non-secret configuration this device uses."
        title="Till setup"
      />

      <Card>
        <SettingRow label="Backend" value={apiUrl} />
        <SettingRow label="POS sales channel" value={salesChannelId ?? "not set"} />
        <SettingRow label="Stock location" value={locationId ?? "not set"} />
        <SettingRow label="Session" value={token ? "Signed in" : "Signed out"} />
      </Card>

      <Text style={typography.small}>
        These values come from EXPO_PUBLIC_ variables. Secrets never go in the app; the Admin API
        credentials are entered by staff and stored in expo-secure-store.
      </Text>

      <Button
        label={token ? "Manage staff session" : "Sign in"}
        variant="ghost"
        onPress={() => router.push("/login")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { gap: 4 },
  value: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 12,
    marginBottom: 8,
  },
});

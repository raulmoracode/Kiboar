import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "kiboar-pos-token";

// The web preview has no keychain; keep the session for the tab's lifetime.
let memoryToken: string | null = null;

export async function loadToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return memoryToken;
  }

  try {
    memoryToken = await SecureStore.getItemAsync(TOKEN_KEY);
    return memoryToken;
  } catch {
    return memoryToken;
  }
}

export async function saveToken(token: string): Promise<void> {
  memoryToken = token;

  if (Platform.OS === "web") {
    return;
  }

  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {
    // The session still works in memory for this run; a reload asks for the
    // password again instead of failing the sign-in.
  }
}

export async function clearToken(): Promise<void> {
  memoryToken = null;

  if (Platform.OS === "web") {
    return;
  }

  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // There is nothing else to clear.
  }
}

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { runBuildTrace } from "../lib/api";
import { getAppSession, type AppSessionState } from "../lib/appSession";
import { bootstrapAuthenticatedUser } from "../lib/session-bootstrap";

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<AppSessionState>(getAppSession());

  const [input, setInput] = useState(
    "Built my backend on my phone using Termux. Connected OpenAI and Supabase. Now the mobile app is connected too."
  );
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        await bootstrapAuthenticatedUser();

        if (!mounted) return;

        setSession(getAppSession());
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message ?? "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleRun() {
    try {
      setRunLoading(true);
      setError(null);
      setResult(null);

      const data = await runBuildTrace(input.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.message ?? "Run failed");
    } finally {
      setRunLoading(false);
    }
  }

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          padding: 24,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator />
        <Text style={{ marginTop: 12 }}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 24,
        gap: 12,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "700" }}>
        BuildTrace Dashboard
      </Text>

      <Text>User ID: {session.userId ?? "none"}</Text>
      <Text>Organization ID: {session.organizationId ?? "none"}</Text>
      <Text>Organization Name: {session.organizationName ?? "none"}</Text>
      <Text>Role: {session.role ?? "none"}</Text>

      <View style={{ height: 24 }} />

      <Text style={{ fontSize: 18, fontWeight: "600" }}>Run BuildTrace</Text>

      <TextInput
        multiline
        value={input}
        onChangeText={setInput}
        placeholder="Type what you worked on..."
        style={{
          minHeight: 120,
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 12,
          textAlignVertical: "top",
          backgroundColor: "#fff",
        }}
      />

      <TouchableOpacity
        onPress={handleRun}
        disabled={runLoading || !input.trim()}
        style={{
          backgroundColor: "#111827",
          padding: 14,
          borderRadius: 8,
          alignItems: "center",
          opacity: runLoading || !input.trim() ? 0.6 : 1,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          {runLoading ? "Running..." : "Send to /run"}
        </Text>
      </TouchableOpacity>

      {error ? (
        <View
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 8,
            backgroundColor: "#fee2e2",
          }}
        >
          <Text style={{ color: "#991b1b" }}>Error: {error}</Text>
        </View>
      ) : null}

      {result ? (
        <View
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 8,
            backgroundColor: "#f3f4f6",
          }}
        >
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Response</Text>
          <Text selectable>{JSON.stringify(result, null, 2)}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
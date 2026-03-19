import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { C } from "@/constants/colors";
import { MetallicLine } from "@/components/MetallicLine";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>ホーム</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="live">
        <Icon sf={{ default: "antenna.radiowaves.left.and.right", selected: "antenna.radiowaves.left.and.right" }} />
        <Label>配信</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="dm">
        <Icon sf={{ default: "message", selected: "message.fill" }} />
        <Label>DM</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>マイページ</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.textMuted,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : C.tabBg,
          borderTopWidth: 0,
          elevation: 0,
          ...(isWeb ? { height: 60 } : {}),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: -2,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={StyleSheet.absoluteFill}>
              <View style={[StyleSheet.absoluteFill, { backgroundColor: C.tabBg }]} />
              <MetallicLine thickness={1} style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
            </View>
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "ホーム",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: "配信",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="radio" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dm"
        options={{
          title: "DM",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "マイページ",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}

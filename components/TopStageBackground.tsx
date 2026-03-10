import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { C } from "@/constants/colors";

type Props = {
  /**
   * 下のコンテンツとの間の余白をどれくらい作るか。
   * スクリーン側で paddingTop を合わせる想定。
   */
  height?: number;
};

/**
 * 各画面の上部に入れるネオンステージ背景。
 * 画面幅いっぱいに表示し、下端を暗くグラデーションさせてコンテンツに馴染ませる。
 */
export function TopStageBackground({ height = 180 }: Props) {
  const headerHeight = Platform.OS === "web" ? height : height + 24;

  return (
    <View style={[styles.container, { height: headerHeight }]}>
      <Image
        source={require("@/../assets/image-4bd85440-25cb-4e98-aa14-193a3e75b664.png")}
        style={styles.image}
        contentFit="cover"
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.65)", C.bg]}
        locations={[0.1, 0.6, 1]}
        style={styles.overlay}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#02050A",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...(StyleSheet.absoluteFillObject as any),
  },
});


import React from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";

const ICON_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663449879480/Y3Yn5f8wK9BzVPCXiSHai5/logo-icon-UtffSyBQcbbEmRWixUFkkb.webp";
const TEXT_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663449879480/Y3Yn5f8wK9BzVPCXiSHai5/logo-raw-stock_9e50ecdf.png";

type Props = {
  /** アイコン高さ基準（デフォルト36px） */
  height?: number;
};

export function AppLogo({ height = 36 }: Props) {
  return (
    <View style={styles.wrap}>
      <Image
        source={{ uri: ICON_URL }}
        style={{ width: height, height: height }}
        contentFit="contain"
      />
      <Image
        source={{ uri: TEXT_URL }}
        style={{ height: height * 0.9, width: height * 4.5 }}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});

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
  // テキスト画像の実寸は700x200px → アスペクト比3.5
  // 上下余白が約22%あるので表示高さを0.78倍に調整
  const textH = height * 0.78;
  const textW = textH * 3.5;

  return (
    <View style={styles.wrap}>
      <Image
        source={{ uri: ICON_URL }}
        style={{ width: height, height: height }}
        contentFit="contain"
      />
      <Image
        source={{ uri: TEXT_URL }}
        style={{ height: textH, width: textW }}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});

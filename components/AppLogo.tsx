import React from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";

type Props = {
  /** 横幅。200x70 を基準に縦横比を維持して縮小します。 */
  width?: number;
};

export function AppLogo({ width = 200 }: Props) {
  const height = (70 / 200) * width;

  return (
    <View style={styles.wrap}>
      <Image
        source={require("../logo-200x70-v2.png")}
        style={{ width, height }}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});

const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// src/ は Vite 用の別アプリ。Expo ビルドでは react-router がなくエラーになるため除外
// node_modules 内の src（例: @expo/metro-runtime）は除外しないよう、プロジェクト直下の src のみ対象にする
const projectSrcPath = path.resolve(__dirname, "src");
const projectSrcRegex = new RegExp(
  "^" + projectSrcPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\\\/]"
);
config.resolver.blockList = [
  projectSrcRegex,
  ...(config.resolver.blockList ?? []),
];

module.exports = config;

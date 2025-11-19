import React, { useState, useRef } from "react";
import { View, StyleSheet, Alert, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ScreenOrientation from "expo-screen-orientation";
import {
  WebView,
  WebViewMessageEvent,
  WebViewNavigation,
} from "react-native-webview";

import { parseSRT, fixSRT, SubtitleItem } from "@utils/srtParser";
import YouTubePlayer from "@components/YouTubePlayer";
import SubtitleInputModal from "@components/SubtitleInputModal";
import FloatingButton from "@components/FloatingButton";

import { COLORS } from "@constants/colors";

const HomeScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [srtContent, setSrtContent] = useState("");
  const [subtitles, setSubtitles] = useState<SubtitleItem[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const webViewRef = useRef<WebView>(null);
  const insets = useSafeAreaInsets();

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "currentTime") {
        findSubtitle(data.payload);
      } else if (data.type === "fullscreen_open") {
        onFullScreenOpen();
      } else if (data.type === "fullscreen_close") {
        onFullScreenClose();
      }
    } catch (e) {}
  };

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    const isWatchPage =
      navState.url.includes("/watch") || navState.url.includes("/shorts/");
    setIsVideoPlaying(isWatchPage);
  };

  // Handle Fullscreen
  const onFullScreenOpen = async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );
  };

  const onFullScreenClose = async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    );
  };

  const findSubtitle = (seconds: number) => {
    const sub = subtitles.find(
      (s) => seconds >= s.startTime && seconds <= s.endTime
    );
    const text = sub ? sub.text : "";

    if (text !== currentSubtitle) {
      setCurrentSubtitle(text);
      if (webViewRef.current) {
        webViewRef.current.postMessage(
          JSON.stringify({
            type: "setSubtitle",
            payload: text,
          })
        );
      }
    }
  };

  const handleLoadSubtitles = () => {
    // 1. Auto-fix format and get stats
    const { fixedData, fixCount } = fixSRT(srtContent);

    if (fixCount > 0) {
      Alert.alert(
        "Đã sửa lỗi SRT",
        `Đã tự động khắc phục ${fixCount} lỗi định dạng thời gian để hiển thị đúng.`
      );
    }

    // 2. Parse the fixed content
    const parsed = parseSRT(fixedData);
    setSubtitles(parsed);
    setModalVisible(false);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <YouTubePlayer
        ref={webViewRef}
        onMessage={handleWebViewMessage}
        onNavigationStateChange={handleNavigationStateChange}
      />

      <FloatingButton
        visible={isVideoPlaying}
        onPress={() => setModalVisible(true)}
      />

      <SubtitleInputModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        srtContent={srtContent}
        setSrtContent={setSrtContent}
        onLoadSubtitles={handleLoadSubtitles}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default HomeScreen;

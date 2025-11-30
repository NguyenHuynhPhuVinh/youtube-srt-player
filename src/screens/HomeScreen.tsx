import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Alert, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Appbar } from "react-native-paper";
import * as ScreenOrientation from "expo-screen-orientation";
import {
  WebView,
  WebViewMessageEvent,
  WebViewNavigation,
} from "react-native-webview";

import { parseSRT, fixSRT, SubtitleItem } from "@utils/srtParser";
import { saveSRT, getSRT, removeSRT } from "@utils/storage";
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
  const [currentUrl, setCurrentUrl] = useState("");
  const [canGoBack, setCanGoBack] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const webViewRef = useRef<WebView>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const loadSavedSRT = async () => {
      // Reset subtitles when URL changes
      setSrtContent("");
      setSubtitles([]);
      setCurrentSubtitle("");

      // Clear subtitle on WebView
      if (webViewRef.current) {
        webViewRef.current.postMessage(
          JSON.stringify({
            type: "setSubtitle",
            payload: "",
          })
        );
      }

      if (!currentUrl) return;

      const savedSRT = await getSRT(currentUrl);
      if (savedSRT) {
        setSrtContent(savedSRT);
        // Auto parse saved SRT
        const { fixedData } = fixSRT(savedSRT);
        const parsed = parseSRT(fixedData);
        setSubtitles(parsed);
      }
    };

    loadSavedSRT();
  }, [currentUrl]);

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
    setCanGoBack(navState.canGoBack);
    const isWatchPage =
      navState.url.includes("/watch") || navState.url.includes("/shorts/");
    setIsVideoPlaying(isWatchPage);

    if (isWatchPage) {
      if (navState.url !== currentUrl) {
        setCurrentUrl(navState.url);
      }
    } else {
      // If we are not watching a video, clear the current URL
      if (currentUrl !== "") {
        setCurrentUrl("");
      }
    }
  };

  // Handle Fullscreen
  const onFullScreenOpen = async () => {
    setIsFullscreen(true);
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );
  };

  const onFullScreenClose = async () => {
    setIsFullscreen(false);
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    );
  };

  const handleGoBack = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    }
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

  const handleLoadSubtitles = async () => {
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

    // 3. Save or remove from storage
    if (currentUrl) {
      if (fixedData) {
        await saveSRT(currentUrl, fixedData);
      } else {
        await removeSRT(currentUrl);
      }
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />

      {!isFullscreen && (
        <Appbar.Header
          style={{
            backgroundColor: COLORS.surface,
            elevation: 0,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
          }}
          mode="small"
        >
          {canGoBack ? (
            <Appbar.BackAction onPress={handleGoBack} color={COLORS.textSecondary} />
          ) : (
            <Appbar.Action icon="youtube" color={COLORS.primary} />
          )}
          <Appbar.Content
            title="SubSRT"
            titleStyle={{
              color: COLORS.text,
              fontWeight: "600",
              fontSize: 18,
              letterSpacing: 0.5,
            }}
          />
        </Appbar.Header>
      )}

      <YouTubePlayer
        ref={webViewRef}
        onMessage={handleWebViewMessage}
        onNavigationStateChange={handleNavigationStateChange}
      />

      <FloatingButton
        visible={isVideoPlaying}
        onPress={() => setModalVisible(true)}
        hasSubtitles={subtitles.length > 0}
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

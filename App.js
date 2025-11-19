import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import { parseSRT, fixSRT } from "./src/utils/srtParser";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as ScreenOrientation from "expo-screen-orientation";

const CUSTOM_USER_AGENT =
  "Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36";

const INJECTED_JAVASCRIPT = `
  (function() {
    // 1. Setup Subtitle Layer
    let subtitleLayer = document.getElementById('custom-subtitle-layer');
    if (!subtitleLayer) {
      subtitleLayer = document.createElement('div');
      subtitleLayer.id = 'custom-subtitle-layer';
      // Style: Match Flutter Reference (Layered Outline)
      // - Bottom: ~5-10px
      // - Font: 16px, w600
      // - Stroke: 3px black (using paint-order to keep text readable)
      subtitleLayer.style.cssText = 'position: absolute; bottom: 6px; left: 20px; right: 20px; text-align: center; color: white; font-size: 16px; font-weight: 600; font-family: sans-serif; -webkit-text-stroke: 3px black; paint-order: stroke fill; pointer-events: none; z-index: 2147483647; display: none; line-height: 1.3; letter-spacing: 0.5px;';
      document.body.appendChild(subtitleLayer);
    }

    // 2. Time Polling
    let lastTime = -1;
    setInterval(() => {
      const video = document.querySelector('video');
      if (video && !video.paused) {
        const currentTime = video.currentTime;
        if (Math.abs(currentTime - lastTime) > 0.1) {
          lastTime = currentTime;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'currentTime',
            payload: currentTime
          }));
        }
      }
    }, 100);

    // 3. Listen for Subtitles from RN
    function handleMessage(event) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'setSubtitle') {
          const text = data.payload;
          if (text) {
            subtitleLayer.innerText = text;
            subtitleLayer.style.display = 'block';
          } else {
            subtitleLayer.style.display = 'none';
          }
        }
      } catch (e) {}
    }

    document.addEventListener('message', handleMessage);
    window.addEventListener('message', handleMessage);

    // 4. Handle Fullscreen
    // Move subtitle layer to the fullscreen element so it stays visible
    function handleFullscreenChange() {
      const fsElement = document.fullscreenElement || document.webkitFullscreenElement;
      if (fsElement) {
        fsElement.appendChild(subtitleLayer);
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'fullscreen_open' }));
      } else {
        document.body.appendChild(subtitleLayer);
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'fullscreen_close' }));
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    // Periodic check to ensure subtitle layer is attached to the correct parent
    setInterval(() => {
       const fsElement = document.fullscreenElement || document.webkitFullscreenElement;
       const targetParent = fsElement || document.body;
       if (subtitleLayer.parentElement !== targetParent) {
         targetParent.appendChild(subtitleLayer);
       }
    }, 1000);

  })();
  true;
`;

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const MainApp = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [srtContent, setSrtContent] = useState("");
  const [subtitles, setSubtitles] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const webViewRef = useRef(null);
  const insets = useSafeAreaInsets();

  const handleWebViewMessage = (event) => {
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

  const handleNavigationStateChange = (navState) => {
    const isWatchPage =
      navState.url.includes("/watch") || navState.url.includes("/shorts/");
    setIsVideoPlaying(isWatchPage);
  };

  // Xử lý khi bấm nút Fullscreen trên Player
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

  const findSubtitle = (seconds) => {
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
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={styles.videoContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: "https://m.youtube.com" }}
          style={styles.webview}
          userAgent={CUSTOM_USER_AGENT}
          injectedJavaScript={INJECTED_JAVASCRIPT}
          onMessage={handleWebViewMessage}
          onNavigationStateChange={handleNavigationStateChange}
          // Cấu hình Fullscreen & Xoay màn hình
          allowsFullscreenVideo={true}
          onFullScreenOpen={onFullScreenOpen}
          onFullScreenClose={onFullScreenClose}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />

        {/* SUBTITLE OVERLAY - FFmpeg Style */}
        {/* SUBTITLE OVERLAY - REMOVED (Now handled inside WebView) */}

        {/* FAB BUTTON */}
        {isVideoPlaying && (
          <TouchableOpacity
            style={styles.fabButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.fabIcon}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* BOTTOM SHEET MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardView}
          >
            <View
              style={[
                styles.bottomSheet,
                { paddingBottom: Math.max(insets.bottom, 20) },
              ]}
            >
              <View style={styles.sheetHeader}>
                <View style={styles.dragHandle} />
                <Text style={styles.sheetTitle}>Thêm Phụ Đề (SRT)</Text>
              </View>

              <TextInput
                style={styles.input}
                multiline
                placeholder="Dán nội dung file .srt vào đây..."
                placeholderTextColor="#666"
                value={srtContent}
                onChangeText={setSrtContent}
                autoCapitalize="none"
                autoCorrect={false}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleLoadSubtitles}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonText}>XÁC NHẬN</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  videoContainer: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },
  // FFmpeg Subtitle Style: Chữ trắng, viền đen, không nền
  subtitleOverlay: {
    position: "absolute",
    bottom: 40, // Đẩy xuống thấp hơn chút cho giống phim
    left: 10,
    right: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  subtitleText: {
    color: "#FFFFFF",
    fontSize: 20, // Chữ to rõ
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "transparent", // Bỏ nền

    // Giả lập viền đen (Stroke) bằng Shadow cứng
    textShadowColor: "#000000",
    textShadowOffset: { width: 1.5, height: 1.5 },
    textShadowRadius: 1,

    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  fabButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FF0000",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    elevation: 0,
  },
  fabIcon: {
    fontSize: 32,
    color: "#FFFFFF",
    fontWeight: "300",
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardView: {
    width: "100%",
  },
  bottomSheet: {
    backgroundColor: "#1E1E1E",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    width: "100%",
    height: SCREEN_HEIGHT * 0.5,
  },
  sheetHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#444",
    borderRadius: 2,
    marginBottom: 15,
  },
  sheetTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  input: {
    flex: 1,
    backgroundColor: "#2C2C2C",
    borderRadius: 8,
    padding: 16,
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 20,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  actionButton: {
    backgroundColor: "#3EA6FF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});

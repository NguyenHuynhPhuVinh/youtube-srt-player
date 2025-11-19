import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import * as ScreenOrientation from "expo-screen-orientation";
import { parseSRT } from "./src/utils/srtParser";

// UserAgent giả lập Chrome trên Android để có giao diện YouTube đầy đủ tính năng
const CUSTOM_USER_AGENT =
  "Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36";

// Script tiêm vào WebView để lấy thời gian video
const INJECTED_JAVASCRIPT = `
  (function() {
    let lastTime = -1;
    setInterval(() => {
      const video = document.querySelector('video');
      if (video && !video.paused) {
        const currentTime = video.currentTime;
        // Chỉ gửi tin nhắn nếu thời gian thay đổi đáng kể để giảm tải
        if (Math.abs(currentTime - lastTime) > 0.1) {
          lastTime = currentTime;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'currentTime',
            payload: currentTime
          }));
        }
      }
    }, 100); // Check mỗi 100ms

    // Ẩn một số thành phần không cần thiết để thoáng màn hình hơn (tùy chọn)
    // document.querySelector('header')?.style.display = 'none';
  })();
  true;
`;

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [srtContent, setSrtContent] = useState("");
  const [subtitles, setSubtitles] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  const [isHorizontal, setIsHorizontal] = useState(false);

  const webViewRef = useRef(null);

  // Xử lý tin nhắn từ WebView (nhận thời gian video)
  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "currentTime") {
        const currentTime = data.payload;
        findSubtitle(currentTime);
      }
    } catch (e) {
      // Ignore parse errors
    }
  };

  // Tìm phụ đề khớp với thời gian hiện tại
  const findSubtitle = (seconds) => {
    const sub = subtitles.find(
      (s) => seconds >= s.startTime && seconds <= s.endTime
    );
    setCurrentSubtitle(sub ? sub.text : "");
  };

  // Xử lý khi bấm nút "XEM" (Load sub và xoay ngang)
  const handleLoadSubtitles = async () => {
    const parsed = parseSRT(srtContent);
    setSubtitles(parsed);
    setModalVisible(false);

    // Tự động xoay ngang màn hình
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );
    setIsHorizontal(true);
  };

  // Hàm toggle xoay màn hình thủ công nếu cần
  const toggleOrientation = async () => {
    if (isHorizontal) {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    } else {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    }
    setIsHorizontal(!isHorizontal);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={isHorizontal} />

      <View style={styles.videoContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: "https://m.youtube.com" }}
          style={styles.webview}
          userAgent={CUSTOM_USER_AGENT}
          injectedJavaScript={INJECTED_JAVASCRIPT}
          onMessage={handleWebViewMessage}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />

        {/* LỚP PHỦ PHỤ ĐỀ */}
        {currentSubtitle ? (
          <View style={styles.subtitleOverlay} pointerEvents="none">
            <Text style={styles.subtitleText}>{currentSubtitle}</Text>
          </View>
        ) : null}

        {/* NÚT ĐIỀU KHIỂN (Chỉ hiện khi không xoay ngang hoặc làm mờ) */}
        <View style={styles.controlsOverlay} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.controlButtonText}>CC / SRT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, { marginTop: 10 }]}
            onPress={toggleOrientation}
          >
            <Text style={styles.controlButtonText}>🔄</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MODAL NHẬP SRT */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nhập nội dung file SRT</Text>
            <Text style={styles.modalSubtitle}>
              Copy toàn bộ nội dung file .srt và dán vào đây:
            </Text>

            <TextInput
              style={styles.input}
              multiline
              placeholder="1
00:00:01,000 --> 00:00:04,000
Hello world..."
              placeholderTextColor="#888"
              value={srtContent}
              onChangeText={setSrtContent}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleLoadSubtitles}
              >
                <Text style={styles.buttonText}>XEM NGAY</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  },
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },
  // Style phụ đề chuẩn FFmpeg (Dễ đọc trên mọi nền)
  subtitleOverlay: {
    position: "absolute",
    bottom: 40, // Cách đáy một chút
    left: 20,
    right: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  subtitleText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    // Tạo viền đen giả lập (Outline)
    backgroundColor: "rgba(0,0,0,0.5)", // Nền đen mờ nhẹ để tăng độ tương phản
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  // Nút điều khiển nổi
  controlsOverlay: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 20,
    alignItems: "flex-end",
  },
  controlButton: {
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 40,
    alignItems: "center",
  },
  controlButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "80%",
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  modalSubtitle: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    backgroundColor: "#333",
    color: "#fff",
    borderRadius: 5,
    padding: 10,
    textAlignVertical: "top",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: "#555",
  },
  confirmButton: {
    backgroundColor: "#cc0000", // Youtube Red
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

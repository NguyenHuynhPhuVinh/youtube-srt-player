import React from "react";
import {
  View,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput, Button, Text, useTheme } from "react-native-paper";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface SubtitleInputModalProps {
  visible: boolean;
  onClose: () => void;
  srtContent: string;
  setSrtContent: (text: string) => void;
  onLoadSubtitles: () => void;
}

const SubtitleInputModal: React.FC<SubtitleInputModalProps> = ({
  visible,
  onClose,
  srtContent,
  setSrtContent,
  onLoadSubtitles,
}) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardView}
        >
          <View
            style={[
              styles.bottomSheet,
              {
                paddingBottom: Math.max(insets.bottom, 24),
                backgroundColor: theme.colors.elevation.level1,
              },
            ]}
          >
            <View style={styles.sheetHeader}>
              <View
                style={[
                  styles.dragHandle,
                  { backgroundColor: theme.colors.onSurfaceVariant },
                ]}
              />
              <Text
                variant="titleMedium"
                style={{ color: theme.colors.onSurface }}
              >
                Thêm Phụ Đề (SRT)
              </Text>
            </View>

            <TextInput
              mode="outlined"
              label="Nội dung SRT"
              placeholder="Dán nội dung file .srt vào đây..."
              multiline
              value={srtContent}
              onChangeText={setSrtContent}
              style={styles.input}
              contentStyle={{
                fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Button
              mode="contained"
              onPress={onLoadSubtitles}
              style={styles.actionButton}
              contentStyle={{ paddingVertical: 6 }}
            >
              Xác nhận
            </Button>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    width: "100%",
    height: SCREEN_HEIGHT * 0.6,
  },
  sheetHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  dragHandle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
    opacity: 0.4,
  },
  input: {
    flex: 1,
    marginBottom: 24,
    backgroundColor: "transparent",
  },
  actionButton: {
    borderRadius: 100,
  },
});

export default SubtitleInputModal;

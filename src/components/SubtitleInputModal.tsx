import React from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

import { COLORS } from "@constants/colors";

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
              placeholderTextColor={COLORS.textSecondary}
              value={srtContent}
              onChangeText={setSrtContent}
              autoCapitalize="none"
              autoCorrect={false}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onLoadSubtitles}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>XÁC NHẬN</Text>
            </TouchableOpacity>
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
    backgroundColor: COLORS.overlay,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardView: {
    width: "100%",
  },
  bottomSheet: {
    backgroundColor: COLORS.surface,
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
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: 15,
  },
  sheetTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    padding: 16,
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 20,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});

export default SubtitleInputModal;

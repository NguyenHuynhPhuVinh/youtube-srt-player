import React from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
      <View className="flex-1 justify-end bg-black/50">
        <TouchableOpacity
          className="absolute inset-0"
          activeOpacity={1}
          onPress={onClose}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="w-full"
        >
          <View
            className="bg-[#1E1E1E] rounded-t-2xl p-5 w-full h-[50vh]"
            style={{ paddingBottom: Math.max(insets.bottom, 20) }}
          >
            <View className="items-center mb-5">
              <View className="w-10 h-1 bg-[#444444] rounded-sm mb-[15px]" />
              <Text className="text-white text-base font-bold uppercase">
                Thêm Phụ Đề (SRT)
              </Text>
            </View>

            <TextInput
              className="flex-1 bg-[#2C2C2C] rounded-lg p-4 text-white text-sm mb-5 font-mono"
              multiline
              placeholder="Dán nội dung file .srt vào đây..."
              placeholderTextColor="#666666"
              value={srtContent}
              onChangeText={setSrtContent}
              autoCapitalize="none"
              autoCorrect={false}
              textAlignVertical="top"
            />

            <TouchableOpacity
              className="bg-[#3EA6FF] py-4 rounded-lg items-center"
              onPress={onLoadSubtitles}
              activeOpacity={0.8}
            >
              <Text className="text-black text-sm font-bold tracking-widest">
                XÁC NHẬN
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default SubtitleInputModal;

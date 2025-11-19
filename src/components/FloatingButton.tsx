import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface FloatingButtonProps {
  onPress: () => void;
  visible: boolean;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({
  onPress,
  visible,
}) => {
  if (!visible) return null;

  return (
    <TouchableOpacity
      className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-[#FF0000] justify-center items-center z-20 shadow-none"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text className="text-3xl text-white font-light -mt-0.5">+</Text>
    </TouchableOpacity>
  );
};

export default FloatingButton;

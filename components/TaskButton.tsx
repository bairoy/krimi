import {  Text, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";

interface TaskButtonProps{
  tasklogic:()=>void;
  symbol:string;
  symbolcolor:string;
}

export default function TaskButton({ tasklogic, symbol, symbolcolor }:TaskButtonProps) {
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],

  }));

  const handlePress = () => {
    rotation.value = withTiming(45, { duration: 150 }, (finished) => {
      if (finished) {
        runOnJS(tasklogic)();
        rotation.value = withTiming(0, { duration: 150 });
      }
    });
  };

  return (
  <TouchableOpacity
    onPress={handlePress}
    className="ml-1 w-14 h-14 border border-white rounded-full justify-center items-center bg-secondary"
  >
    <Animated.View style={animatedStyle}>
      <Text className={`text-2xl ${symbolcolor}`}>
        {symbol}
      </Text>
    </Animated.View>
  </TouchableOpacity>
);

}

/* import React from "react";
import { View, Text } from "react-native";

function Social(): React.JSX.Element {
	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<Text>Social!</Text>
		</View>
	);
}

export default Social; */
/* import React from 'react';
import { Text, View, StyleSheet, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import Animated, {
	useAnimatedProps,
	useAnimatedStyle,
	useSharedValue
} from 'react-native-reanimated';

Animated.addWhitelistedNativeProps({ text: true });
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

function Social() {
	const skew = useSharedValue(0);
	const style = useAnimatedStyle(() => ({
		transform: [
			{ skewX: `${skew.value}deg` },
		],
	}));
	const animatedProps = useAnimatedProps(() => {
		const skewStr = Math.round(skew.value).toString();
		console.log("%c Line:35 🍉 skewStr", "color:#3f7cff", skewStr);
		return { text: skewStr + '°', defaultValue: skewStr + '°' };
	});
	return (
		<View style={{
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: '#fafafa',
		}}>
			<Animated.View style={[{
				width: 200,
				height: 200,
				margin: 50,
				backgroundColor: '#78c9af',
				alignItems: 'center',
				justifyContent: 'center',
			}, style]}>
				<Text style={{ fontSize: 45, color: '#001a72' }}>
					SkewX
				</Text>
				<AnimatedTextInput
					style={{ fontSize: 45, color: '#001a72' }}
					defaultValue={skew.value.toString() + '°'}
					value={skew.value.toString() + '°'}
					animatedProps={animatedProps}
				/>
			</Animated.View>
			<Slider
				style={styles.slider}
				minimumValue={-45}
				maximumValue={45}
				value={0}
				onValueChange={(value) => {
					skew.value = value;
				}}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: '#232736',
		padding: 20,
	},
	slider: {
		height: 40,
		width: 300,
	},
});

export default Social; */
import React from 'react';
import { Button, View, StyleSheet } from 'react-native';
import Animated, {
	useSharedValue,
	withSpring,
	useAnimatedStyle,
} from 'react-native-reanimated';

function Social() {
	const translateX = useSharedValue<number>(0);

	const handlePress = () => {
		console.log("%c Line:102 🌶", "color:#3f7cff", Math.PI / 180 * 45);
		translateX.value += 50;
	};

	const animatedStyles = useAnimatedStyle(() => ({
		// transform: [{ skewX: (Math.PI) / 180 + "deg" }],
	}));

	return (
		<>
			<Animated.View style={[styles.box, animatedStyles]} />
			<View style={styles.container}>
				<Button onPress={handlePress} title="Click me" />
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	box: {
		height: 120,
		width: 120,
		backgroundColor: '#b58df1',
		borderRadius: 20,
		marginVertical: 50,
	},
});

export default Social;
declare module "*.svg" {
	import React from "react";
	import { SvgProps } from "react-native-svg";
	const content: React.FC<SvgProps>;
	export default content;
}

declare module "ts-md5"
declare module "react-native-stars"
declare module "react-native-vector-icons"
declare module "react-native-video"
declare module "@react-navigation/native"
import React from "react";
import { Image } from "react-native";

const AutoSizeImage = React.memo(({ style, uri }: any) => {
	// 控件
	// 变量
	// 数据
	const [imagedata, setImageData] = React.useState<any>({
		width: 0,
		height: 0,
	});
	// 参数
	// 状态

	return (
		<Image source={{ uri }}
			onLoad={({ nativeEvent: { source: { width, height } } }: any) => {
				setImageData({ width, height })
			}}
			style={[style, (imagedata.height && imagedata.width) && { aspectRatio: imagedata.width / imagedata.height }]}
		/>
	);
})

export default AutoSizeImage;
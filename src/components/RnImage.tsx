import React from "react";
import { Image } from "react-native";

const RnImage = React.memo(({ source, style, resizeMode }: any) => {
	// 控件
	// 变量
	const [isError, setIsError] = React.useState<boolean>(false);
	// 数据
	// 参数
	// 状态

	return (
		<Image style={style}
			source={isError ? require("../assets/images/perfumer.png") : source}
			resizeMode={resizeMode}
			onError={() => { setIsError(true) }}
		/>
	);
})

export default RnImage;
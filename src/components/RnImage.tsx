import React from "react";

import FastImage from "react-native-fast-image";

const RnImage = React.memo(({ source, errsrc, type, style, resizeMode }: any) => {
	// 控件
	// 变量
	const [isError, setIsError] = React.useState<boolean>(false);
	// 数据
	// 参数
	// 状态

	return (
		<FastImage style={style}
			source={isError ? errsrc : source}
			resizeMode={resizeMode ? resizeMode : (isError && type == "perfumer") ? "contain" : "cover"}
			onError={() => { setIsError(true) }}
		/>
	);
})

export default RnImage;
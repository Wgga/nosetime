import React from "react";
import { Image, InteractionManager } from "react-native";

const AutoSizeImage = React.memo(({ contentWidth, src }: any) => {

	const [imageHeight, setImageHeight] = React.useState(0);

	React.useEffect(() => {
		InteractionManager.runAfterInteractions(() => {
			Image.getSize(src, (width, height) => {
				const tempH = (contentWidth / width) * height;
				setImageHeight(tempH);
			});
		});
	}, []);

	return (
		<Image style={{ width: contentWidth, height: imageHeight }}
			source={{ uri: src }}
			resizeMethod="resize"
		/>
	);
});

export default AutoSizeImage;

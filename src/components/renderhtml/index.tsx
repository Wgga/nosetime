import React, { PureComponent, useRef } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { parseDocument, ElementType } from "htmlparser2";
import FastImage from "react-native-fast-image";
import AutoSizeImage from "./autosizeimage";

interface RenderHtmlProps {
	contentWidth: number;
	html: string;
	tagsStyles?: any;
	ignoreDomNode?: (node: any) => boolean;
	onPress?: any;
}

interface WrapperProps {
	children?: React.ReactNode;
	key?: number;
	style?: any;
}

const RenderHtml = React.memo((props: any) => {

	const textTags: any[] = ["span", "strong", "em"];
	let tagsStyles = React.useRef<any>({
		p: { fontSize: 16, lineHeight: 24 },
		strong: { fontWeight: "bold", fontFamily: "PingFang SC" }
	});
	let document = React.useRef<any>({});

	React.useEffect(() => {
		if (props.tagsStyles) {
			Object.assign(tagsStyles.current, props.tagsStyles);
		}
		document.current = parseDocument(props.html);
	}, [])

	const renderTextNode = (textNode: any, index: number) => {
		return <Text key={index} style={tagsStyles.current[textNode.name]}>{textNode.data}</Text>;
	}

	const renderLink = (node: any, index: number) => {
		let href = node.attribs.href;
		let obj = JSON.parse(href.substr(href.indexOf("?") + 1).replace(/%22/g, '"'));
		return (
			<Pressable key={index} onPress={() => {
				props.onPress(obj.page, obj.id)
			}}>
				{node.children.map((c: any, i: number) => renderNode(c, i))}
			</Pressable>
		)
	}

	const rederImage = (node: any, index: number) => {
		return (
			<AutoSizeImage key={index} contentWidth={props.contentWidth} src={node.attribs.src} />
		)
	}

	const renderElement = (element: any, index: number) => {
		if (typeof props.ignoreDomNode === "function" && props.ignoreDomNode(element)) {
			return null;
		}

		const Wrapper: React.ComponentType<WrapperProps> = textTags.indexOf(element.name) > -1 ? Text : View;

		if (element.name === "img") {
			return (
				rederImage(element, index)
			)
		} else if (element.name === "a") {
			return (
				renderLink(element, index)
			)
		} else {
			return (
				<Wrapper key={index} style={tagsStyles.current[element.name]}>
					{element.children.map((c: any, i: number) => renderNode(c, i))}
				</Wrapper>
			);
		}

	}

	const renderNode = (node: any, index: number) => {
		switch (node.type) {
			case ElementType.Text:
				return <></>
				// renderTextNode(node, index);
			case ElementType.Tag:
				return renderElement(node, index);
		}
		return null;
	}


	return (
		<>
			{document.current && document.current.children.map((c: any, i: number) => {
				const val = renderNode(c, i);
				return val
			})}
		</>
	)
});
export default RenderHtml;

/* export default class RenderHtml extends PureComponent<RenderHtmlProps> {

	constructor(props: any) {
		super(props);
		
	}


	

	

	



	render() {
		
	}
} */
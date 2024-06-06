const fs = require("fs");
const path = require("path");
const data = require("./iconfont.json");

const output = {};

data.glyphs.forEach(glyph => {
	output[glyph.name] = glyph.unicode_decimal;
});
const destinationFolder = "D:/Desktop/nosetime/android/app/src/main/assets/fonts";
fs.writeFile(path.join(__dirname, "./icon.json"), JSON.stringify(output, null, 2), (err) => {
	if (err) throw err;
	console.log("数据已写入当前目录下icon.json文件中");
});
fs.copyFile(path.join(__dirname, "./iconfont.ttf"), path.join(destinationFolder, "./iconfont.ttf"), (err) => {
	if (err) throw err;
	console.log("字体文件已复制到目标文件夹");
})
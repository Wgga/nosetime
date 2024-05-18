const fs = require('fs');
const data = require('./iconfont.json');

const output = {};

data.glyphs.forEach(glyph => {
	output[glyph.name] = glyph.unicode_decimal;
});

fs.writeFile('icon.json', JSON.stringify(output, null, 2), (err) => {
	if (err) throw err;
	console.log('数据已写入icon.json文件');
});
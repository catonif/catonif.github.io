const fs = require('fs');

const data = JSON.parse(fs.readFileSync('books.json', 'utf-8'));

const map = {};

for (let i = 1555; i < 1945; i += 5) {
	map[i] = {};
}

let scripts = [];

function recursive(nodes, parent) {
	if (!nodes) return;
	nodes.forEach(node => {
		node.year = node.year ?? parent?.year;
		node.script = node.script ?? parent?.script;
		if (node.pages && node.year && node.script) {
			const id = Math.floor(node.year / 5) * 5;
			if (scripts.indexOf(node.script) == -1) scripts.push(node.script);
			if (map[id][node.script]) map[id][node.script] += node.pages;
			else map[id][node.script] = node.pages;
		}
		recursive(node.volumes, node);
		recursive(node.editions, node);
	});
}

recursive(data, null)

let ret = "year\t" + scripts.join('\t') + "\n"

for (let year = 1555; year < 1945; year += 5) {
	ret += year + "\t"
	scripts.forEach(script => {
		ret += (map[year][script] ?? "") + "\t"
	})
	ret += "\n"
}

fs.writeFileSync('output.csv', ret, 'utf-8');
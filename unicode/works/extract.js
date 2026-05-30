const fs = require('fs');

const data = JSON.parse(fs.readFileSync('books.json', 'utf-8'));

const map_pages = {};
const map_books = {};

for (let i = 1555; i < 1945; i += 5) {
	map_pages[i] = {};
	map_books[i] = {};
}

let scripts = [];

function increase_node(id, script, pages) {
	if ((typeof script) == 'object') {
		script.forEach(sc => increase_node(id, sc, pages));
	} else {
		if (scripts.indexOf(script) == -1) scripts.push(script);
		if (map_pages[id][script]) {
			map_pages[id][script] += pages;
			map_books[id][script]++;
		} else {
			map_pages[id][script] = pages;
			map_books[id][script] = 1;
		}
	}
}

function recursive(nodes, parent) {
	if (!nodes) return;
	nodes.forEach(node => {
		node.year = node.year ?? parent?.year;
		node.script = node.script ?? parent?.script;
		if (node.pages && node.year && node.script) {
			const id = Math.floor(node.year / 5) * 5;
			increase_node(id, node.script, node.pages);
		}
		recursive(node.volumes, node);
		recursive(node.editions, node);
	});
}

recursive(data, null)

const script_aliases = require("./app.js").data

function write_map(map, filename) {

	let ret = "year\t"

	scripts.forEach(script => {
		ret += script_aliases[script] + "\t";
	});

	ret += "\n"

	for (let year = 1555; year < 1945; year += 5) {
		ret += year + "\t"
		scripts.forEach(script => {
			ret += (map[year][script] ?? "") + "\t"
		})
		ret += "\n"
	}

	fs.writeFileSync(filename, ret, 'utf-8');

}

write_map(map_pages, 'output_pages.csv');

write_map(map_books, 'output_books.csv');
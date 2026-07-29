const ChordSheetJS = require('chordsheetjs');

const chordPro = `
{sot}
A|--0--2--3--
E|--1--------
{eot}
`;

const parser = new ChordSheetJS.ChordProParser();
const song = parser.parse(chordPro);

song.lines.forEach(line => {
  console.log("Line type:", typeof line, line.constructor.name, "isEmpty:", line.isEmpty());
  line.items.forEach(item => {
    console.log("  Item:", item.constructor.name, "string:", item.string);
  });
});

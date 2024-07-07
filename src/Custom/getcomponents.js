// import * as unicodeEmoji from 'unicode-emoji';
// import * as fs from 'fs';

// const emojicomponents = unicodeEmoji.getComponents();
// const result = unicodeEmoji.getEmojis();
// console.log(result[0]);
// console.log(result[0].emoji.codePointAt(0).toString(16));

// var map  = new Object();
// result.forEach(value =>{
//   const emojiunicode = value.emoji.codePointAt(0).toString(16);
//   if (map[emojiunicode] == undefined){
//     map[emojiunicode] = value;
//     // console.log(map.get(emojiunicode) != undefined ? ("works for " + emojiunicode) : ("does not work for " + emojiunicode));
//   }
// });

// // const json = JSON.stringify(map,null, "\t");
// const json = JSON.stringify(emojicomponents,null, "\t");

// fs.writeFile('src/Custom/rawemojicomponents.json', json, function (err) {
//   if (err) throw err;
//   console.log('Saved!');
// });


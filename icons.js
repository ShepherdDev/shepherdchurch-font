var fs = require('fs');
var path = require('path');
var webfontsGenerator = require('webfonts-generator');

var SRC = path.join(__dirname, 'icons');
var DEST = path.join(__dirname, 'dist');

var icons = fs.readdirSync(SRC).map(function(file) { return file.replace('.svg', ''); });
var map = {};

if (!fs.existsSync(DEST)) {
  fs.mkdirSync(DEST);
}

if (fs.existsSync('map.json')) {
  map = JSON.parse(fs.readFileSync('map.json', 'utf8'));
  Object.keys(map).forEach(function (icon) {
    map[icon] = parseInt(map[icon]);
  });
}

icons.forEach(function (icon) {
  if (!map[icon]) {
    var values = Object.values(map).sort().reverse();
    if (values.length > 0) {
      map[icon] = values[0] + 1;
    }
    else {
      map[icon] = 0xe900;
    }
  }
});

var options = {
  dest: DEST,
  files: Object.keys(map).map(function (file) { return path.join(SRC, file + ".svg") }),
  codepoints: map,
  types: ['ttf', 'woff', 'woff2', 'eot', 'svg'],
  fontName: 'shepherdchurch',
  html: true,
  cssFontsUrl: '../Assets/Fonts/ShepherdChurch/',
  cssTemplate: 'templates/css.hbs',
  htmlTemplate: 'templates/html.hbs',
  templateOptions: {
    classPrefix: 'sc'
  }
};

/*
 * Generate the font files.
 */
webfontsGenerator(options, function(err) {
  /*
   * Check for error.
   */
  if (err) {
    console.log(err);
    return;
  }

  /*
   * Convert the map dictionary back to hex notation and save.
   */
  Object.keys(map).forEach(function (icon) {
    map[icon] = '0x' + map[icon].toString(16);
  });
  fs.writeFileSync('map.json', JSON.stringify(map, null, 2));

  console.log('Generated font files.');
});

var fs = require('fs');
var path = require('path');
var webfontsGenerator = require('@vusion/webfonts-generator');

var SRC = path.join(__dirname, 'icons');
var DEST = path.join(__dirname, 'dist');

/*
 * Read all icon files in the SRC directory and initialize
 * the map.
 */
var icons = fs.readdirSync(SRC).map(function(file) { return file.replace('.svg', ''); });
var map = {};

/*
 * Make sure the destination directory exists.
 */
if (!fs.existsSync(DEST)) {
  fs.mkdirSync(DEST);
}

/*
 * If an existing unicode map file is found, load it up.
 */
if (fs.existsSync('map.json')) {
  map = JSON.parse(fs.readFileSync('map.json', 'utf8'));
  Object.keys(map).forEach(function (icon) {
    map[icon] = parseInt(map[icon]);
  });
}

/*
 * Ensure each icon in the directory has a unicode value and
 * assign one if it does not.
 */
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

/*
 * Set options to use when generating the font files.
 */
var options = {
  dest: DEST,
  files: Object.keys(map).map(function (file) { return path.join(SRC, file + ".svg") }),
  codepoints: map,
  types: ['ttf', 'woff', 'woff2', 'eot', 'svg'],
  fontName: 'shepherdchurch',
  cssFontsUrl: '../Assets/Fonts/ShepherdChurch/',
  cssTemplate: 'templates/css.hbs',
  html: true,
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

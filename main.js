#!/usr/bin/env node

var opentype = require(__dirname + '/opentype.min'),
    pjson = require(__dirname + '/package.json');

if (process.argv[2]){
    switch (process.argv[2]) {
    case "-h":
    case "--help":
        notice();
        break;
    case "-v":
    case "--version":
        process.stdout.write(version() + "\n");
        break;
    default:
        opentype.load(process.argv[2], function (err, font) {
            if (err) {
                process.stderr.write('Font could not be loaded: ' + err);
            } else {
                convert(font);
            }
        });
        break;
    }
} else {
    process.stderr.write("ERROR: No file supplied\n");
    notice();
}


function convert(font) {
    var scale = (1000 * 100) / ( (font.unitsPerEm || 2048) *72);
    var result = {};
    result.glyphs = {};

    font.glyphs.forEach(function(glyph){
        if (glyph.unicode !== undefined) {

            var token = {};
            token.ha = Math.round(glyph.advanceWidth * scale);
            token.x_min = Math.round(glyph.xMin * scale);
            token.x_max = Math.round(glyph.xMax * scale);
            token.o = ""
            glyph.path.commands.forEach(function(command,i){
                if (command.type.toLowerCase() === "c") {command.type = "b";}
                token.o += command.type.toLowerCase();
                token.o += " "
                if (command.x !== undefined && command.y !== undefined){
                    token.o += Math.round(command.x * scale);
                    token.o += " "
                    token.o += Math.round(command.y * scale);
                    token.o += " "
                }
                if (command.x1 !== undefined && command.y1 !== undefined){
                    token.o += Math.round(command.x1 * scale);
                    token.o += " "
                    token.o += Math.round(command.y1 * scale);
                    token.o += " "
                }
                if (command.x2 !== undefined && command.y2 !== undefined){
                    token.o += Math.round(command.x2 * scale);
                    token.o += " "
                    token.o += Math.round(command.y2 * scale);
                    token.o += " "
                }
            });
            result.glyphs[String.fromCharCode(glyph.unicode)] = token;
        };
    });
    result.familyName = font.familyName;
    result.ascender = Math.round(font.ascender * scale);
    result.descender = Math.round(font.descender * scale);
    result.underlinePosition = font.tables.post.underlinePosition;
    result.underlineThickness = font.tables.post.underlineThickness;
    result.boundingBox = {
        "yMin": font.tables.head.yMin,
        "xMin": font.tables.head.xMin,
        "yMax": font.tables.head.yMax,
        "xMax": font.tables.head.xMax
    };
    result.resolution = 1000;
    result.original_font_information = font.tables.name;
    if (font.styleName.toLowerCase().indexOf("bold") > -1){
        result.cssFontWeight = "bold";
    } else {
        result.cssFontWeight = "normal";
    };

    if (font.styleName.toLowerCase().indexOf("italic") > -1){
        result.cssFontStyle = "italic";
    } else {
        result.cssFontStyle = "normal";
    };

    process.stdout.write(JSON.stringify(result));
};

function notice() {
    process.stdout.write(version() + "\n");
    process.stdout.write(pjson.description + "\n");
    process.stdout.write("\nUsage: f43 [font file source]\n\n");
    process.stdout.write("The output by default is stdout, use with command line redirection > to export in file\n");
    process.stdout.write("f43 [font file source] > [font file destination].js\n\n");
    process.stdout.write("Now you are ready to use your font with THREE.TextGeometry\n");
    process.stdout.write("See more informations about TextGeometry (http://threejs.org/docs/#Reference/Extras.Geometries/TextGeometry)\n");
}

function version() {
    return pjson.name + " - Version: " + pjson.version + " - " + pjson.homepage;
}

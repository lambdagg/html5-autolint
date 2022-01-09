/* eslint-env node */

const fs = require('fs');
const path = require('path');
const html5lint = require('html5-lint');

if (!process.argv[2]) {
    console.log('• Looks like no path has been specified.');
    console.log('  Syntax: html5-autolint <dir>');
    console.log();
    process.exit(1);
}

let dir;
try {
    dir = fs.realpathSync(process.argv[2]);
} catch (e) {
    console.log('• Looks like the specified path was wrong.');
    console.log('  Syntax: html5-autolint <dir>');
    console.log();
    console.log(e);
    process.exit(1);
}

console.log(`Running HTML5Lint on every .html file in ${dir}.`);
console.log();
console.log('-----');

fs.readdir(dir, (err, files) => {
    if (err) {
        console.log(err);
        process.exit(2);
    }
    files = files.filter((file) => file.endsWith('.html'));
    const pending = files.length;
    if (!pending) {
        console.log('• Looks like the specified path had no .html file in it.');
        process.exit(2);
    }
    files.forEach((file) => {
        fs.lstat(path.resolve(dir, file), (err1, stat) => {
            if (err1) {
                console.log(`! An error occurred while resolving ${path.join(dir, file)} :`);
                console.log(err);
                console.log();
                console.log('-----');
                return console.log();
            }
            if (!stat.isFile()) {
                console.log(`Looks like the object at path ${path.join(dir, file)} is not a file nor a symbolic link. Skipping.`);
            } else {
                fs.readFile(path.resolve(dir, file), (err2, html) => {
                    if (err2) {
                        console.log(`! An error occurred while reading ${path.join(dir, file)} :`);
                        console.log(err);
                        console.log();
                        console.log('-----');
                        return console.log();
                    }
                    html5lint(html, (err3, results) => {
                        console.log(`• Running HTML5Lint on ${path.join(dir, file)}`);
                        if (err3) {
                            console.log(`An error occurred while running HTML5Lint on ${path.join(dir, file)} :`);
                            return console.log(err);
                        }
                        const typeObject = {};
                        results.messages.forEach((msg) => {
                            if (!typeObject[msg.type]) typeObject[msg.type] = 1;
                            else typeObject[msg.type]++;
                            console.log('  [%s]: %s', msg.type, msg.message);
                        });
                        console.log();
                        console.log(`• HTML5Lint finished running on ${path.join(dir, file)}.`);
                        const keys = Object.keys(typeObject);
                        if (keys.length !== 0) {
                            console.log();
                            console.log('• Summary:');
                            keys.forEach((key) => {
                                console.log(`  ${typeObject[key]} messages with type '${key}'`);
                            });
                        }
                        console.log();
                        console.log('-----');
                        console.log();
                    });
                });
            }
        });
    });
});

'use strict'
// const path = 
var chalk = require('chalk');
const info = chalk.green;
const infoW = chalk.white;
const co = require('co');
var series = require('co-series');

const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');

const mame2json = require('mame2json');

const DEST_DIR = path.resolve(process.cwd(), 'dist');

function writeMainIndex(games) {

    const fileName = `index.json`;

    return new Promise(( resolve, reject) => {

        fse.ensureDirSync(path.join(DEST_DIR));

        fs.writeFile(path.join(DEST_DIR, fileName), JSON.stringify(games, null, 4), err => {
            if (err) {
                console.log( chalk.red('Error write main index file'));
                reject(err);
            } else {
                console.log( chalk.gray('  write Main Index data: ') + fileName);
                console.log('');
                resolve(games)
            }  

    });

    });

}

function createGameFolder(game) {

    const gameFolder = game.substr(0, 1) + '/' + game.substr(1, 3);

    return gameFolder

}

function writeGamesFile(gamesName) {

    return gamesName.map(series(fetchGameInfos));

}

function writeGameFile(game, gameInfos) {
    return new Promise((resolve, reject) => {

        const gameDir = createGameFolder(game);

        const filePath = path.join(gameDir, `${game}.json`);

        fse.ensureDirSync(path.join(DEST_DIR, gameDir));

        fs.writeFile(path.join(DEST_DIR, filePath), JSON.stringify(gameInfos[game], null, 4), err => {
            if (err) {
                console.log( chalk.red('Error write file data for ') + filePath);
                reject(err);
            } else {
                console.log( chalk.gray('  write file data in ') + filePath);
                console.log('');
                resolve(gameInfos)
            }            
        });

    });

}

var fetchGameInfos = function (game) {

    console.log( infoW('  Fetch infos for ') + info(game) + infoW(' game'));

    return mame2json.listXml(game)
                            .then(writeGameFile.bind(null, game));
}


module.exports = function (filter) {

    mame2json.binary('mame64');

    return mame2json.listFull()
        .then(games => {    
            
            let ll = co.wrap(function* (games) {
                let gameKeys = Object.keys(games)
                    .filter(game => filter ? game.startsWith(filter): true)

                console.log('# ' + info('Total games ') + infoW(gameKeys.length) + "\n");

                var mainIndex = yield writeMainIndex(games);

                let gameFilesCreated = yield writeGamesFile(gameKeys);    

                return {
                    gameKeys,
                    gameFilesCreated,
                };

            });

            return ll(games)
                .then((result) => {
                    console.log('  # ' + info(`Created ${infoW(result.gameFilesCreated.length)} games of ${infoW(result.gameKeys.length)}`));

                    return result;
                });

        })
        .catch(e => {
            console.error(e);
        });


};

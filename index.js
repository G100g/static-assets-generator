'use strict'
var chalk = require('chalk');
const info = chalk.green;
const infoW = chalk.white;
var series = require('co-series');

const mame2json = require('mame2json');

mame2json.binary('mame64');

mame2json.listFull()
    .then(games => {

        var fetchGameInfos = function (game) {

            console.log( infoW('  Fetch infos for ') + info(game) + infoW(' game'));

            return mame2json.listXml(game)
                .then( infos => {
                    console.log(infos);
                    return infos;
                });
        }

        let gameKeys = Object.keys(games)
            .filter(game => game.startsWith('wboy')) // limit for debug

        console.log('# ' + info('Total games ') + infoW(gameKeys.length));

        //let result = runner.next();

        // console.log(result);
        // runner.next();
        Promise.all(gameKeys.map(series(fetchGameInfos))).then(r => {
                //console.log(r);
            },
            e => {
                console.error(e);
            });


        // for (let i=0;i<gameKeys.length;i++) {
        //     let game = gameKeys[i];
        //     runner.next(game)
        // //games.map(game => {
        //     //console.log(i);
        // } 
        // while(!result.done) {
        //     console.log(result.value);
        //     // runner.next()
        // }

        // Object.keys(games)
        //         .filter( game => game.startsWith('wboy')) // limit for debug
        //         .forEach( game => mame2json.listXml(game) )



        //console.log(Object.keys(games))
        //         .map(

    })
    .catch(e => {
        console.error(e);
    });
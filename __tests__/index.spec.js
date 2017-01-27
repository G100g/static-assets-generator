'use strict';

const mockery = require('mockery');
const assert = require('assert');

var build;

const mockListFullResponse = {
    "wboy": "Wonder Boy (set 1, 315-5177)",
    "mario": "mario runner",
};

const mockGameDetails = {
    'wboy': {
        "description": "Wonder Boy (set 1, 315-5177)",
        "year": "1986",
        "manufacturer": "Escape (Sega license)",
        "driver": {
            "status": "good",
            "emulation": "good"
        }
    }
};

const mame2jsonMock = {
            binary() { },
            listXml(game) {
                return Promise.resolve(mockGameDetails);
            },
            listFull() {
                return Promise.resolve(mockListFullResponse)
            }    
        };

const fsExtraMock = {
            ensureDirSync(path) {
            }
        };        

describe('Must build assets files', () => {

    beforeEach(function() {
        mockery.enable({ 
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        }
        ); 

        mockery.registerMock('mame2json', mame2jsonMock);     
        mockery.registerMock('fs-extra', fsExtraMock);  
    });

    afterEach(function () {
        mockery.deregisterAll();
        mockery.resetCache();
        mockery.disable();
    });

    it('create main index and game file', () => {

        let fsMockCall = 0;
        const fsMock = {
            writeFile(filePath, content, cb) {
                filePath = filePath.replace(process.cwd() + '/', '');
                switch(fsMockCall) {
                    case 0:                        
                        assert.equal(filePath, 'dist/index.json');
                        assert.deepEqual(JSON.parse(content), mockListFullResponse);
                        break;
                    case 1:                    
                        assert.equal(filePath, 'dist/w/boy/wboy.json');
                        assert.deepEqual(JSON.parse(content), mockGameDetails.wboy);
                        break;
                }

                fsMockCall++;

                cb(false);
            }
        };

        mockery.registerMock('fs', fsMock);

        build = require('../');

        return build().then(result => {
          assert.equal(typeof result, 'object');
        });

    });

    it.only('should filter games', () => {

        const fsMock = {
            writeFile(filePath, content, cb) {
                cb(false);
            }
        };

        mockery.registerMock('fs', fsMock);

        build = require('../');

        return build('w').then(result => {          
          assert.ok(result.gameFilesCreated[0].hasOwnProperty('wboy'));
          assert.equal(result.gameFilesCreated.lenght, 1);
        });

    });

});
/*
 * stripColors.js: Simple example for using the `stripColors` option with nexpect.
 *
 * (C) 2011, Elijah Insua, Marak Squires, Charlie Robbins.
 *
 */

var path = require('path'),
    nexpect = require('../lib/nexpect');

nexpect.spawn(path.join(__dirname, '..', 'test', 'fixtures', 'log-colors'), { stripColors: true })
       .wait('second has colors')
       .expect('third has colors')
       .run(function (err) {
         if (!err) {
           console.log('colors were ignore, then waited and expected');
         }
       });

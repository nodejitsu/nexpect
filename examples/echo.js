/*
 * echo.js: Simple example for using the `echo` command with nexpect.
 *
 * (C) 2011, Elijah Insua, Marak Squires, Charlie Robbins.
 *
 */

var nexpect = require('../lib/nexpect');

nexpect.spawn("echo", ["hello"])
       .expect("hello")
       .run(function (err) {
          if (!err) {
            console.log("hello was echoed");
          }
       });

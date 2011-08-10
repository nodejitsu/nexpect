/*
 * nexpect-test.js: Tests for the `nexpect` module.
 *
 * (C) 2011, Elijah Insua, Marak Squires, Charlie Robbins.
 *
 */
 
var assert = require('assert'),
    vows = require('vows'),
    spawn = require('child_process').spawn,
    nexpect = require('../lib/nexpect');

function assertSpawn (expect) {
  return {
    topic: function () {
      expect.run(this.callback)
    },
    "should respond with no error": function (err) {
      assert.isTrue(!err);
    }
  }
}

vows.describe('nexpect').addBatch({
  "When using the nexpect module": {
    "spawning": {
      "`echo hello`": assertSpawn(
        nexpect.spawn("echo", ["hello"])
               .expect("hello")
      ),
      "`ls -al /tmp/undefined`": assertSpawn(
        nexpect.spawn("ls -la /tmp/undefined")
               .expect("No such file or directory")
      ),
      "and using the sendline() method": assertSpawn(
        nexpect.spawn("node")
              .expect(">")
              .sendline("console.log('testing')")
              .expect("testing")
              .sendline("process.exit()")
      )
    }
  }
}).export(module);
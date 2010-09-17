var spawn = require("child_process").spawn,
    chain = function(ctx) {
      return {
        expect : function(str) {
          ctx.queue.push(function(data) {
            if (data.indexOf(str) > -1) {
              return true
            }
          });
          return chain(ctx);
        },
        sendline : function(str) {
          ctx.queue.push(function() {
            ctx.process.stdin.write(str + "\n");
          });
          return chain(ctx);
        },
        run : function(fn) {
          var err = null,
          out = function(data) {
            data = data.toString();
            var expect = ctx.queue[0];

            if (typeof expect !== "function" || expect(data) !== true) {
              err = data + " was not expected..";
            } else {
              ctx.queue.shift();
              var sendline = ctx.queue.shift();
              if (typeof sendline === "function") {
                sendline();
              }
            }
          };

          ctx.process = spawn(ctx.app, ctx.args);
          ctx.process.stdout.on("data", out);
          ctx.process.stdout.on("end", function() {
            fn(err);
          });
        }
      };
    };

var nspawn = exports.nspawn = {
  spawn : function(cmd) {
    var args     = cmd.split(" "),
        app      = args.shift();

    var context = {
      app: app,
      args : args,
      queue : [],
    };
    return chain(context);
  }
};

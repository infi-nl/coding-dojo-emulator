var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var reload      = browserSync.reload;
var exec        = require('child_process').exec;

gulp.task("compile-chip8peg", function() {
	exec("pegjs --format globals --export-var chip8peg chip8peg.pegjs");
});

// Watch scss AND html files, doing different things with each.
gulp.task('watch', function () {
    // Serve files from the root of this project
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    gulp.watch("chip8peg.pegjs", function() {
        // TODO: "gulp.run() has been deprecated. Use task dependencies or gulp.watch task triggering instead."
        gulp.run("compile-chip8peg");
    });

    gulp.watch(["*.html", "*.js"]).on("change", reload);
});

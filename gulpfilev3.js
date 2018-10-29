// the v3 version 

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    concat = require('gulp-concat'),
    replace = require('gulp-regex-replace'),
    gutil = require('gulp-util'),
    stripComments = require('gulp-strip-comments'),
    // gulp-bumper errors
    stripJsonComments = require('gulp-strip-json-comments'),
    source = require('vinyl-source-stream')
// include = require('gulp-include')

const path = require('path'),
    fs = require('fs'),
    Readable = require('stream').Readable

// gulp default task can be run with just gulp no name is needed to be provided
// gulp.task('default', function() {

// });

// here a watch task
gulp.task('watch', function () {
    // here we tell what we want to watch (we can watch multiple files and even directories you can see /**/*.js (wildcards)  ==> all the folders including . which is current folders, and to watch all the .js files whatever the name)
    watch('./app/js/minimizableControllBar/modules/**/*.json', function () {
        gulp.start('minimizableControllBar_jsonPreset')
    })
    watch('./app/js/minimizableControllBar/modules/**/*.css', function () {
        gulp.start('minimizableControllBar_css')
    })

    //json comments 
    var base = path.join(__dirname, 'app/tempGulp/json/')
    watch('./app/tempGulp/json/**/*.json', function (evt) {
        // console.log('hi there ');
        jsonCommentWatchEvt = evt
        gulp.start('jsonComment')
    })
})


var jsonCommentWatchEvt = null

//json comments


gulp.task('jsonComment', function () {
    jsonComment_Task(jsonCommentWatchEvt)
})

function jsonComment_Task(evt) {
    // var dest = path.join(__dirname, 'app/json/', getRelevantPath_usingBase(base, evt.path))
    gulp.src(evt.path, {
        base: './app/tempGulp/json/'
    }).
    pipe(stripJsonComments({
        whitespace: false
    })).on('error', console.log).
    on('data', function (file) { // here we want to manipulate the resulting stream

        var str = file.contents.toString()

        var stream = source(path.basename(file.path))
        stream.end(str.replace(/\n\s*\n/g, '\n\n'))
        stream.
        pipe(gulp.dest('./app/json/')).on('error', console.log)
    })
}


function trimReturns(str) {
    return str.replace(/(\r\n|\r|\n)+/, '\n')
}


function getRelevantPath_usingBase(basePath, completePath) {
    return completePath.replace(basePath, '')
}

// minimizableControllBar

gulp.task('minimizableControllBar_css', function () {
    return gulp.src('./app/js/minimizableControllBar/modules/**/*.css')
        .pipe(concat('presetsAll.css')).on('error', console.log)
        .pipe(gulp.dest('./app/js/minimizableControllBar/'))
})

gulp.task('minimizableControllBar_jsonPreset', function () {
    return gulp.src('./app/js/minimizableControllBar/modules/**/*.json')
        .pipe(gutil.buffer(function (err, files) {
            let presetAllJsonStr = '{\n'
            let i = 0
            for (i = 0; i < files.length - 1; i++) {
                let file = files[i]
                // let presetName = path.parse(file.path).name

                let presetReadyStr = changePresetJson(file.contents.toString())

                presetAllJsonStr += presetReadyStr + ',\n\n'
            }

            if (!files[i].contents.toString()) {
                presetAllJsonStr = presetAllJsonStr.substr(0, presetAllJsonStr.length - 3)
            } else {
                // let presetName = path.parse(files[i].path).name

                presetAllJsonStr += changePresetJson(files[i].contents.toString())
            }
            presetAllJsonStr += '\n}'

            try {
                var prettyFiedPresetAllJsonStr = JSON.stringify(JSON.parse(presetAllJsonStr), null, '    ')
            } catch (err) {
                console.log(err);
            }

            fs.writeFile('./app/js/minimizableControllBar/presetsAll.json', prettyFiedPresetAllJsonStr, console.log)
        }))

})






// gulp.task('addAllToReadme', function () {
//     return gulp.src('./temp/README.md')
//     .pipe(include()).on('error', console.log)
//     .pipe(gulp.dest('./'))
// })


var changePresetJson = function (presetJsonStr) {
    // return '"' + presetName + '": ' + presetJsonStr
    return presetJsonStr.replace(/{\s*/, '').replace(/}$\s*/, '');
}


var readable_stream = function (str) {
    var s = new Readable()
    s._read = function noop() {}
    s.write(str)
    s.write(null) // to tell the stream writing ended and to close the stream
}
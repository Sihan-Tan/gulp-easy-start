const gulp = require("gulp");
const path = require("path");
const browserSync = require("browser-sync").create();
const reload = browserSync.reload;
const babel = require("gulp-babel");
const changed = require("gulp-changed");
const gulpIF = require("gulp-if");
const chokidar = require("chokidar");
const del = require("del");
const cache = require("gulp-cache");
const fs = require("fs");
const ts = require('gulp-typescript');

// 压缩
const htmlmin = require("gulp-htmlmin");
const less = require("gulp-less");
const sass = require("gulp-sass")
const cleanCSS = require("gulp-clean-css");
const postcss = require("gulp-postcss");
const base64 = require("gulp-base64");
const uglify = require("gulp-uglify");
const sourcemaps = require("gulp-sourcemaps");
const imagemin = require("gulp-imagemin");
const mozjpeg = require("imagemin-mozjpeg");
const pngquant = require("imagemin-pngquant");

const swig = require("gulp-swig");
const plumber = require("gulp-plumber");
const proxyMiddleware = require("http-proxy-middleware");
const config = require("./config");

config.srcPath = config.srcPath || "src";
config.tmpPath = config.tmpPath || "__tmp__";
config.distPath = config.distPath || "dist";

// dev task arr
let devTasks = ["dev_del_tmp"]
    .concat(config.swig ? ["dev_swig"] : [])
    .concat(config.less ? ["dev_less"] : [])
    .concat(config.scss ? ["dev_scss"] : [])
    .concat(config.babel ? ["dev_babel"] : [])
    .concat(["dev_hot_css", "dev_move_vendor", "dev_move_pics"]);

// 删除临时文件
gulp.task("dev_del_tmp", function () {
    del.sync(path.resolve(__dirname, config.tmpPath));
});

const middleware = config.proxyTable && Object.prototype.toString.call(config.proxyTable) === "[object Object]" ?
    Object.keys(config.proxyTable).map(key => proxyMiddleware(key, typeof config.proxyTable[key] === "string" ? {
            target: config.proxyTable[key]
        } :
        config.proxyTable[key])) : [];

// 编译模板文件
gulp.task("dev_swig", function () {
    return gulp.src([`${config.srcPath}/**/*.html`, `${config.srcPath}/*.html`, `!${config.srcPath}/_widget/*.html`])
        .pipe(plumber())
        .pipe(swig({
			defaults: {
				cache: false
			}
		}))
        .pipe(htmlmin())
        .pipe(gulp.dest(config.tmpPath))
});

// 编译less 
gulp.task("dev_less", function () {
    return gulp.src([`${config.srcPath}/**/*.less`, `!${config.srcPath}/_vendor/**/*.*`])
        .pipe(plumber())
        .pipe(less())
        .pipe(postcss())
        .pipe(gulp.dest(config.tmpPath));
});

// 编译scss 
gulp.task("dev_scss", function () {
    return gulp.src([`${config.srcPath}/**/*.{sass,scss}`, `!${config.srcPath}/_vendor/**/*.*`])
        .pipe(plumber())
        .pipe(sass({
            outputStyle: "expanded"
        }).on("error", sass.logError))
        .pipe(gulp.dest(config.tmpPath))
});

// css 热更新
gulp.task("dev_hot_css", function () {
    return gulp.src([`${config.tmpPath}/**/*.css`, `!${config.srcPath}/_vendor/**/*.*`])
        .pipe(plumber())
        .pipe(reload({
            stream: true
        }));
});

// 编译 ts
gulp.task("dev_ts", function () {
    return gulp.src([`${config.srcPath}/**/*.{ts,tsx}`, `!${config.srcPath}/_vendor/**/*.*`])
        .pipe(plumber())
        .pipe(changed(config.tmpPath, {
            extension: ".js"
        }))
        .pipe(ts())
        .pipe(gulp.dest(config.tmpPath));
})

// babel js
gulp.task("dev_babel", [].concat([ config.ts ? 'dev_ts' : '']), function () {
    return gulp.src([`${config.srcPath}/**/*.{es6,js}`, `!${config.srcPath}/_vendor/**/*.*`])
        .pipe(plumber())
        .pipe(changed(config.tmpPath, {
            extension: ".js"
        }))
        .pipe(babel())
        .pipe(gulp.dest(config.tmpPath));
});

// move vendor
gulp.task("dev_move_vendor", function () {
    return gulp.src([`${config.srcPath}/_vendor/**/*.*`])
        .pipe(gulp.dest(config.tmpPath + '/_vendor'));
});

// move static pic
gulp.task("dev_move_pics", function () {
    return gulp.src([`${config.srcPath}/**/*.{jpg,jpeg,png,gif}`, `!${config.srcPath}/_vendor/**/*.*`])
        .pipe(gulp.dest(config.tmpPath))
})

// dev 开发模式
gulp.task("dev", devTasks, function () {
    browserSync.init({
        server: {
            baseDir: [config.tmpPath],
            index: "index.html"
        },
        middleware,
        port: 8888,
        online: true
    });
    // 监听缓存文件夹
    chokidar.watch([config.tmpPath, `${config.srcPath}/**/*.html`, `${config.srcPath}/**/*.{less,sass,scss}`, `!${config.srcPath}/_vendor/**/*.*`], {
            ignoreInitial: true,
            ignorePermissionErrors: true
        })
        .on("all", function (event, filePath) {
            console.log("[dev]: ", event, filePath);
            if (/\.css$/.test(filePath)) {
                gulp.start("dev_hot_css");
                return false;
            }
            reload();
        });

    chokidar.watch(config.srcPath, {
            ignoreInitial: true,
            ignorePermissionErrors: true
        })
        .on("all", function (event, filePath) {
            let task, deleteFilePath;
            try {
                console.log("[dev]: ", event, path.resolve(__dirname, filePath));
                // 当文件为改变或者新增时, 进行相应的任务判断
                if (event === "change" || event === "add") {
                    if (/(\.es6|\.js)$/.test(filePath)) {
                        if (!config.babel) {
                            reload();
                            return false;
                        }
                        task = "dev_babel";
                    } else if (config.less && /\.less$/.test(filePath)) {
                        task = "dev_less";
                    } else if (config.scss && /(\.sass|\.scss)$/.test(filePath)) {
                        task = "dev_scss";
                    } else if (config.swig && /\.html/.test(filePath)) {
                        task = "dev_swig";
                    }
                    console.info(task);
                    if (!task) {
                        return false;
                    }
                    if (event === "change") {
                        console.log("[dev]: start " + task);
                        gulp.start(task);
                    } else {
                        setTimeout(() => {
                            gulp.start(task);
                        }, 100);
                    }
                } else if (event === "unlink" || event === "unlinkDir") {
                    // 当删除文件或者文件夹时
                    if (event === "unlink") {
                        // 要删除的dev目录下的文件的后缀替换
                        deleteFilePath = filePath.replace(/\.less$/, ".css");
                        deleteFilePath = filePath.replace(/(\.sass|\.scss)$/, ".css");
                    } else {
                        deleteFilePath = filePath;
                    }
                    // 同步删除文件
                    deleteFilePath = path.resolve(__dirname, deleteFilePath.replace(config.srcPath, config.tmpPath));
                    console.log("deleteFilePath: ", deleteFilePath);
                    del.sync(deleteFilePath);
                }
                reload();
            } catch (error) {
                console.error("chokidar error: ", error);
            }
        })

});

// ------------------------ build -------------------------
// 删除dist文件夹
gulp.task("build_del_dist", function () {
    del.sync("dist");
});
// 移动三方库
gulp.task("build_move_vendor", function () {
    gulp.src(`${config.srcPath}/_vendor/**/*.*`)
        .pipe(gulp.dest(`${config.distPath}/_vendor`));
});
// 移动资源字体库
gulp.task("build_copy", function () {
    gulp.src([`${config.srcPath}/**/*.{.ico,svg,gif,woff2,eot,ttf,oft,mp4,webm,ogg,mp3,wav,flac,aac}`])
        .pipe(gulp.dest(config.distPath));
});
// 压缩html
const htmlminConfig = {
    removeComments: true, // 清除HTML注释
    collapseWhitespace: true, // 压缩HTML
    minifyCSS: true, // 压缩页面css
    minifyJS: true, // 压缩页面js
    removeEmptyAttributes: false, // 删除所有空格作属性值 id=" " => 
    removeScriptTypeAttributes: false, // 删除所有 javascript 标签
    removeStyleLinkTypeAttributes: false // 删除所有style标签
};
const revReplace = require("gulp-rev-replace");
const rev = require("gulp-rev");
const prefix = require("gulp-prefix");
gulp.task("build_html", function () {
    let manifestJs, manifestCSS;
    if (config.build.versionHash) {
        manifestJs = gulp.src("rev-manifest-js.json");
        manifestCSS = gulp.src("rev-manifest-css.json");
    }
    return gulp.src([`${config.srcPath}/**/*.html`, `!${config.srcPath}/_widget/*.html`])
        .pipe(gulpIF(config.swig, swig()))
        .pipe(gulpIF(!!config.build.cdn, prefix(config.build.cdn, config.build.tags, config.build.ignore && config.build.ignore)))
        .pipe(gulpIF(config.build.htmlmin, htmlmin(htmlminConfig)))
        .pipe(gulpIF(config.build.versionHash, revReplace({
            manifest: manifestJs,
            // modifyReved: (filename) => {
            //     return filename.replace(/^pages\/.*\/index/, "./index");
            // }
        })))
        .pipe(gulpIF(config.build.versionHash, revReplace({
            manifest: manifestCSS,
            // modifyReved: (filename) => {
            //     return filename.replace(/^pages\/.*\/index/, "./index");
            // }
        })))
        .pipe(gulp.dest(config.distPath));
});
// 处理 css
gulp.task("build_css", function () {
    return gulp.src([`${config.srcPath}/**/*.{less,sass,scss}`, `!${config.srcPath}/_vendor/**/*.*`])
        // return gulp.src([`${config.tmpPath}/**/*.{css}`, `!${config.srcPath}/_vendor/**/*.*`]) //如果出错可以使用css文件直接处理
        .pipe(gulpIF(config.build.cssSourceMap, sourcemaps.init()))
        .pipe(gulpIF(config.less, less()))
        .pipe(gulpIF((config.scss || config.sass), sass({
            outputStyle: "expanded"
        }).on("error", sass.logError)))
        .pipe(gulpIF(!!config.build.base64, base64({
            maxImageSize: config.build.base64
        })))
        .pipe(postcss())
        .pipe(gulpIF(config.build.cssmin, cleanCSS({
            rebase: false
        })))
        .pipe(gulpIF(config.build.versionHash, rev()))
        .pipe(gulpIF(config.build.cssSourceMap, sourcemaps.write()))
        .pipe(gulp.dest(config.distPath))
        .pipe(gulpIF(config.build.versionHash, rev.manifest("rev-manifest-css.json")))
        .pipe(gulpIF(config.build.versionHash, gulp.dest("")))
});
// 编译 ts
gulp.task("build_ts", function () {
    return gulp.src([`${config.srcPath}/**/*.{ts,tsx}`, `!${config.srcPath}/_vendor/**/*.*`])
        .pipe(plumber())
        .pipe(changed(config.srcPath, {
            extension: ".js"
        }))
        .pipe(ts())
        .pipe(gulp.dest(config.srcPath));
})
// 处理 js
gulp.task("build_js", [].concat([ config.ts ? 'build_ts' : '']), function () {
    return gulp.src([`${config.srcPath}/**/*.{es6,js}`, `!${config.srcPath}/_vendor/**/*.*`])
        .pipe(gulpIF(config.build.jsSourceMap, sourcemaps.init()))
        .pipe(gulpIF(config.babel, babel()))
        .pipe(gulpIF(config.build.jsMin, uglify({
            mangle: {
                reserved: ["require"]
            }
        })))
        .pipe(gulpIF(config.build.versionHash, rev()))
        .pipe(gulpIF(config.build.jsSourceMap, sourcemaps.write()))
        .pipe(gulp.dest(config.distPath))
        .pipe(gulpIF(config.build.versionHash, rev.manifest("rev-manifest-js.json")))
        .pipe(gulpIF(config.build.versionHash, gulp.dest("")))
});
// 图片压缩
gulp.task("build_imagemin", function () {
    gulp.src([`${config.srcPath}/**/*.{jpg,jpeg,png}`, `!${config.srcPath}/_vendor/**/*.*`, `!${config.srcPath}/sprites/*.{jpg,jpeg,png}`])
        .pipe(cache(imagemin([mozjpeg({
            quality: 70
        }), pngquant({
            floyd: 0.7
        })])))
        .pipe(gulp.dest(config.distPath))
});
// build
gulp.task("build", ["build_del_dist", "build_move_vendor", "build_copy", "build_css", "build_js", "build_imagemin"], function () {
    gulp.start("build_html");
});
// start 模拟线上
gulp.task("start", ["build"], function () {
    browserSync.init({
        server: {
            baseDir: [config.distPath],
            index: "index.html"
        },
        middleware,
        port: 9999,
        online: false,
        snippetOptions: {
            ignorePaths: ["/", "/**/*.html"]
        }
    })
});

// 雪碧图
const spritesmith = require('gulp.spritesmith');
gulp.task('sprites', function () {
    var spritesData = gulp.src(`${config.srcPath}/sprites/*.{jpg,png,jpeg}`)
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: 'sprite.css',
            padding: 10
        }))
    return spritesData.pipe(gulp.dest(`${config.distPath}/sprites/`))
})

// 兼容 webp
gulp.task('webp', ['generateWebp', 'webpcss', 'webphtml']);
const generateWebp = require('gulp-webp');
gulp.task('generateWebp', function () {
    gulp.src(`${config.distPath}/**/*.{png,jpg,jpeg}`)
        .pipe(generateWebp())
        .pipe(gulp.dest(config.distPath))
});

const webpcss = require('gulp-webpcss')
const cssname = require('gulp-cssnano')
gulp.task('webpcss', function () {
    gulp.src(`${config.distPath}/**/*.css`)
        .pipe(webpcss({
            webpClass: '.__webp__',
            replace_from: /\.(png|jpg|jpeg)/,
            replace_to: '.webp'
        }))
        .pipe(cssname())
        .pipe(gulp.dest(config.distPath))
})

const cheerio = require('gulp-cheerio')
gulp.task('webphtml', function () {
    return gulp.src(`${config.distPath}/**/*.html`)
        .pipe(cheerio(function ($, file) {
            // 插入 webp.js
            var webpJs = fs.readFileSync(`${config.srcPath}/_vendor/__webp__.js`, 'utf-8')
            $('head').append(`<script id="__webp__">${webpJs}</script>`)
            $('img[src]:not(.not-webp)').each(function () {
                var imgEl = $(this)
                var src = imgEl.attr('src')
                if (/^http|\.(gif|svg)$/.test(src)) {
                    return false;
                }
                imgEl.css('visibility', 'hidden')
                imgEl.removeAttr('src')
                imgEl.attr('data-src', src)
            })
            if ($('#__webp__').length > 0) {
                return;
            }
        }))
        .pipe(gulp.dest(config.distPath))
})

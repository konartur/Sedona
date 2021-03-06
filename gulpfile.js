var gulp = require("gulp");
var sass = require("gulp-sass");
var sourcemaps = require("gulp-sourcemaps");
var rename = require("gulp-rename");
const browserSync = require("browser-sync").create();
const autoprefixer = require("autoprefixer");
var cssnano = require("cssnano");
var postcss = require("gulp-postcss");
var htmlmin = require("gulp-htmlmin");
var del = require("del");
var plumber = require("gulp-plumber");
var wait = require("gulp-wait");
var ghpages = require("gh-pages");
var gulpIf = require("gulp-if");
const imagemin = require("gulp-imagemin");

var isDevelopment =
  !process.env.NODE_ENV || process.env.NODE_ENV == "development";
var dist = "public";

sass.compiler = require("node-sass");

gulp.task("styles", function () {
  return gulp
    .src("src/styles/index.scss")
    .pipe(wait(500))
    .pipe(plumber())
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest(dist))
    .pipe(browserSync.stream());
});

gulp.task("watch", function () {
  browserSync.init({
    server: {
      baseDir: "public",
    },
  });
  gulp.watch("src/styles/**/*.scss", gulp.series("styles"));
  gulp
    .watch("src/index.html", gulp.series("html"))
    .on("change", browserSync.reload);
});

gulp.task("html", function () {
  return gulp
    .src("src/index.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(dist));
});

gulp.task("git-publish", function (cb) {
  ghpages.publish(dist);
  cb();
});

gulp.task("clean", function () {
  return del(dist);
});

gulp.task("img", function () {
  return gulp
    .src("src/images/*")
    .pipe(imagemin())
    .pipe(gulp.dest(dist + "/images"));
});

gulp.task(
  "build",
  gulp.series("clean", gulp.parallel("html", "styles", "img"))
);

gulp.task("deploy", gulp.series("build", "git-publish"));

gulp.task("default", gulp.series("build", "watch"));

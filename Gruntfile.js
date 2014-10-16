/*global module */
module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),

		jshint: {
			all: [
				"Gruntfile.js",
				"*.js", // this will get things in dapp directory
				"controllers/**/*.js",
				"utils/**/*.js",
				"modules/**/*.js",
				"widgets/**/*.js",
				"tests/**/*.js",
				"!tests/intern.js",
				"!tests/intern.local.js"
			],
			options: {
				jshintrc: ".jshintrc"
			}
		},

		// Before generating any new files, remove any previously-created files.
		clean: {
			tests: ["tmp"]
		},

		jsbeautifier: {
			files: ["Gruntfile.js",
				"*.js", // this will get things in dapp directory
				"controllers/**/*.js",
				"utils/**/*.js",
				"modules/**/*.js",
				"widgets/**/*.js",
				"tests/**/*.js",
				"!tests/intern.js",
				"!tests/intern.local.js"
			],
			options: {
				config: ".jshintrc",
				js: {
					jslintHappy: true,
					indentWithTabs: true
				}
			}
		},

		// Copied from grunt web site but not tested
		uglify: {
			options: {
				banner: "/*! <%= pkg.name %> <%= grunt.template.today('yyyy-mm-dd') %> */\n"
			},
			build: {
				src: "src/<%= pkg.name %>.js",
				dest: "build/<%= pkg.name %>.min.js"
			}
		},

		intern: {
			local: {
				options: {
					runType: "runner",
					config: "tests/intern.local",
					reporters: ["runner"]
				}
			},
			remote: {
				options: {
					runType: "runner",
					config: "tests/intern",
					reporters: ["runner"]
				}
			}
		},

		"jsdoc-amddcl": {
			docs: {
				files: [{
					src: [
						".",
						"./controllers/delite",
						"./README.md",
						"./package.json"
					],
					//	imports: [
					//		"../delite/out"
					//	],
					paths: {
						"decor": "../../../../decor/docs/api/0.3.0/decor",
						"delite": "../../../../delite/docs/api/0.3.0/delite",
						"deliteful": "../../../../delite/docs/api/0.3.0/deliteful"
					},
					packagePathFormat: "${name}/docs/api/${version}"
				}]
			},
			export: {
				files: [{
					args: [
						"-X"
					],
					src: [
						".",
						"./list",
						"./README.md",
						"./package.json"
					],
					dest: "./out/doclets.json" //,
						//	imports: [
						//		"../delite/out"
						//	]
				}]
			}
		}
	});

	// Load plugins
	grunt.loadNpmTasks("intern");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-jsbeautifier");
	grunt.loadNpmTasks("jsdoc-amddcl");
	grunt.loadNpmTasks("grunt-contrib-uglify");

	// Aliases
	grunt.registerTask("jsdoc", "jsdoc-amddcl");

	// By default, lint and run all tests.
	grunt.registerTask("default", ["jsbeautifier", "jshint"]);
	// always specify the target e.g. grunt test:remote, grunt test:remote
	// then add on any other flags afterwards e.g. console, lcovhtml
	var testTaskDescription = "Run this task instead of the intern task directly! \n" +
		"Always specify the test target e.g. \n" +
		"grunt test:local\n" +
		"grunt test:remote\n\n" +
		"Add any optional reporters via a flag e.g. \n" +
		"grunt test:local:console\n" +
		"grunt test:local:lcovhtml\n" +
		"grunt test:local:console:lcovhtml";
	grunt.registerTask("test", testTaskDescription, function (target) {
		function addReporter(reporter) {
			var property = "intern." + target + ".options.reporters",
				value = grunt.config.get(property);
			if (value.indexOf(reporter) !== -1) {
				return;
			}
			value.push(reporter);
			grunt.config.set(property, value);
		}
		if (this.flags.lcovhtml) {
			addReporter("lcovhtml");
		}
		// the lcov option will generate the lcov.info file which may be able to be used with genhtml for coverage info.
		if (this.flags.lcov) {
			addReporter("lcov");
		}

		if (this.flags.console) {
			addReporter("console");
		}
		grunt.task.run("intern:" + target);
	});

};

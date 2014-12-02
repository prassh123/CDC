module.exports = function (grunt) {

  console.log('Current directory: ' + process.cwd());
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    shell: {
      startserver: {
        command: 'node server/app.js',
        options: {
          async: true
        }
      }
    },

    // JSHINTING
    jshint: {
      files: ['*.js', 'server/**/*.js', 'client/**/*.js'],
      options: {
        globals: {
          jQuery: true,
          console: true,
          module: true
        },
        jshintrc: true,
        ignores: ['Gruntfile.js']
      }
    },
    watch: {
      files: ['<%= jshint.files %>', 'client/css/**/*.scss'],
      tasks: ['jshint', 'sass', 'restart'],
      options: {
        spawn: false
      }
    },
    sass: {
      dist: {
        files: [{
          expand: true,
          cwd: 'client/css',
          src: ['*.scss'],
          dest: 'client/css',
          ext: '.css'
        }]
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          quiet: false,
          bail: true
        },
        src: ['test/**/*.js']
      }
    }
  });

  // Load the plugins that provides the tasks.
  grunt.loadNpmTasks('grunt-execute');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell-spawn');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'mochaTest']);
  grunt.registerTask('precheck', ['jshint']);
  grunt.registerTask('server', ['jshint', 'sass', 'mochaTest', 'shell:startserver', 'watch']);
  grunt.registerTask('restart', ['shell:startserver:kill', 'shell:startserver']);

};

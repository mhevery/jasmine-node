module.exports = (grunt) ->
    grunt.initConfig
        _watch_:
            options:
                nocase: true
                spawn: false

            core_coffee:
                files: [
                    'src/**/*.coffee'
                ]
                tasks: ['coffee', 'exec:test']
            test_files:
                files: [
                    'spec/**/*'
                ]
                tasks: ['exec:test']
        coffee:
            main:
                expand: true
                flatten: false
                cwd: 'src'
                src: ['**/*.coffee']
                dest: 'lib/jasmine-node/'
                ext: '.js'
        exec:
            test:
                cmd: "node bin/jasmine-node --coffee --noColor --captureExceptions spec/"


    grunt.loadNpmTasks 'grunt-contrib-watch'
    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-exec'

    grunt.registerTask 'default', ['coffee', 'exec:test']
    grunt.renameTask 'watch', '_watch_'
    grunt.registerTask 'watch', ['default', '_watch_']

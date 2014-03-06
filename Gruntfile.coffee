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
                tasks: ['coffee']
        coffee:
            main:
                expand: true
                flatten: false
                cwd: 'src'
                src: ['**/*.coffee']
                dest: 'lib/jasmine-node/'
                ext: '.js'

    grunt.loadNpmTasks 'grunt-contrib-watch'
    grunt.loadNpmTasks 'grunt-contrib-coffee'

    grunt.registerTask 'default', ['coffee']
    grunt.renameTask 'watch', '_watch_'
    grunt.registerTask 'watch', ['default', '_watch_']

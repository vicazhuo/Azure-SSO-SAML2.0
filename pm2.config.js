module.exports = {
    apps: [{
        script: './bin/www',
        name: 'azure-saml-platform',
        watch: false,
        exec_mode: 'fork',
        ignore_watch: ['node_modules', 'database', 'run', 'logs', 'typings', '.git'],
        env: {
            SERVICE: 'web',
        },
    }]
}

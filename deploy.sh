#!/bin/bash
DOKKU_HOST=ung.utt.fr
DOKKU_PROD=api.c-bieres.uttnetgroup.fr

if [[ -n $key ]] ; then
    # Set up ssh key
    openssl aes-256-cbc -K $key -iv $iv -in deploy_key.enc -out deploy_key -d
    chmod 600 deploy_key
    mv deploy_key ~/.ssh/id_rsa
    eval $(ssh-agent)
    ssh-add ~/.ssh/id_rsa
    # SSH config
    echo -e "Host *\n\tStrictHostKeyChecking no\n\n" > ~/.ssh/config
    # Add dokku to known hosts
    ssh-keyscan -H $DOKKU_HOST >> ~/.ssh/known_hosts
    # Deploy
    git remote add dokku dokku@$DOKKU_HOST:$DOKKU_PROD
    git push dokku master -f
fi

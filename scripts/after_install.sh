#!/bin/bash -xe
exec > >(tee /var/log/after-install.log|logger -t after-install -s 2>/dev/console) 2>&1

cd /home/ec2-user/chatty-backend
sudo rm -rf env-file.zip
sudo rm -rf .env
sudo rm .env.develop
aws s3 sync s3://chatapptutorial-env-files/develop .
unzip env-file.zip
sudo cp .env.develop .env
sudo pm2 delete all
sudo npm install

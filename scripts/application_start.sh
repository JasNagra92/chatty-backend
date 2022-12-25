#!/bin/bash -xe
exec > >(tee /var/log/app-start.log|logger -t app-start -s 2>/dev/console) 2>&1

cd /home/ec2-user/chatty-backend
sudo npm run build
sudo npm start

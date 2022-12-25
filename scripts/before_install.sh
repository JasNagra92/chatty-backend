#!/bin/bash -xe
exec > >(tee /var/log/before-install.log|logger -t before-install -s 2>/dev/console) 2>&1

DIT="/home/ec2-user/chatty-backend"
if [ -d "$DIR" ]; then
  cd /home/ec2-user
  sudo rm -rf chatty-backend
else
  echo "Directory does not exist"
fi

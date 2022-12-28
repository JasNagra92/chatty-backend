#!/bin/bash

DIR="/home/ec2-user/chatty-backend"
if [ -d "$DIR" ]; then
  sudo pm2 delete all
  cd /home/ec2-user
  sudo rm -rf chatty-backend
else
  echo "Directory does not exist"
fi

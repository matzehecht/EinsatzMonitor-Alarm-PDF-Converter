#!/bin/bash
  
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

systemctl stop emapc-service.service
systemctl disable emapc-service.service
rm -f /etc/systemd/system/emapc-service.service
rm -f /etc/systemd/system/emapc-service.service # and symlinks that might be related
rm -f /usr/lib/systemd/system/emapc-service.service 
rm -f /usr/lib/systemd/system/emapc-service.service # and symlinks that might be related
systemctl daemon-reload
systemctl reset-failed

pushd /

rm -rf /usr/local/emapc

popd

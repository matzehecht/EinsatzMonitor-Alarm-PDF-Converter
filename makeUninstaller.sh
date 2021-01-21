#!/bin/bash

declare -A linux0=(
  [name]="linux32"
)
declare -A linux1=(
  [name]="linux64"
)

declare -n linux

declare -A mac0=(
  [name]="mac64"
  [lib]="mac/pdftotext64"
)

declare -n mac

echo "make linux uninstallers"
for linux in ${!linux@}; do
  echo "make ${linux[name]} uninstaller"
  echo "#!/bin/bash
  
if [[ \$EUID -ne 0 ]]; then
   echo \"This script must be run as root\" 
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

popd" > lib/uninstaller/uninstall-${linux[name]}.sh

  chmod +x lib/uninstaller/uninstall-${linux[name]}.sh
done

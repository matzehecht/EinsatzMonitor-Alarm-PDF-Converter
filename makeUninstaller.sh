#!/bin/bash

declare -A linux0=(
  [name]="linux32"
)
declare -A linux1=(
  [name]="linux64"
)

declare -n linux

declare -A win0=(
  [name]="win32"
  [nssm]="nssm32.exe"
)
declare -A win1=(
  [name]="win64"
  [nssm]="nssm64.exe"
)

declare -n win

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

cd \$HOME

rm -rf /usr/local/emapc" > lib/uninstaller/uninstall-${linux[name]}.sh

  chmod +x lib/uninstaller/uninstall-${linux[name]}.sh
done

echo "make win uninstallers"
for win in ${!win@}; do
  echo "make ${win[name]} uninstaller"
  echo "#Requires -RunAsAdministrator

if ((Test-Path \"c:\\emapc\\${win[nssm]}\") -And (Test-Path \"c:\\emapc\\emapc-runner.exe\")) { 
  & \"c:\\emapc\\${win[nssm]}\" stop EMAPC-Service
  & \"c:\\emapc\\${win[nssm]}\" remove EMAPC-Service confirm
}

Set-Location -Path \"c:\\\"

Remove-Item \"c:\\emapc\" -Recurse -Force
" > lib/uninstaller/uninstall-${win[name]}.ps1

  chmod +x lib/uninstaller/uninstall-${win[name]}.ps1
done

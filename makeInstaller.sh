#!/bin/bash

gitHash=$1
gitTag=$2

declare -A linux0=(
  [name]="linuxx86"
  [cliBin]="emapc-cli-linux-x86"
  [serviceBin]="emapc-srv-linux-x86"
  [lib]="pdftotext32"
  [uninstaller]="uninstall-linuxx86.sh"
)
declare -A linux1=(
  [name]="linuxx64"
  [cliBin]="emapc-cli-linux-x64"
  [serviceBin]="emapc-srv-linux-x64"
  [lib]="pdftotext64"
  [uninstaller]="uninstall-linuxx64.sh"
)

declare -n linux

declare -A mac0=(
  [name]="macx64"
  [cliBin]="emapc-cli-macos-x64"
  [serviceBin]="emapc-srv-mac-x64"
  [lib]="mac/pdftotext64"
)

declare -n mac

echo "make linux installers"
for linux in ${!linux@}; do
  echo "make ${linux[name]} installer"
  echo "#!/bin/bash

if [[ \"\$1\" != \"cli\" && \"\$1\" != \"srv\" ]]; then
  echo \"USAGE: install-${linux[name]} <cli or srv>\"
  exit 0
fi
  
if [[ \$EUID -ne 0 ]]; then
   echo \"This script must be run as root\" 
   exit 1
fi

mkdir -p /usr/local/emapc/input
mkdir -p /usr/local/emapc/output
mkdir -p /usr/local/emapc/archive
mkdir -p /usr/local/emapc/lib/pdftotext/linux

rm -rf /usr/local/emapc/${linux[uninstaller]}
curl -L https://raw.githubusercontent.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/$gitHash/lib/uninstaller/${linux[uninstaller]} -o /usr/local/emapc/${linux[uninstaller]}

rm -rf /usr/local/emapc/lib/pdftotext/linux/${linux[lib]}
curl -L https://raw.githubusercontent.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/$gitHash/lib/pdftotext/linux/${linux[lib]} -o /usr/local/emapc/lib/pdftotext/linux/${linux[lib]}

if [[ \"\$1\" == \"cli\" ]]; then
  rm -rf /usr/local/emapc/emapc-cli
  curl -L https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/releases/download/$gitTag/${linux[cliBin]} -o /usr/local/emapc/emapc-cli
  chmod +x /usr/local/emapc/emapc-cli
  ln -s /usr/local/emapc/emapc-cli /usr/local/bin/
fi

if [[ \"\$1\" == \"srv\" ]]; then
  rm -rf /usr/local/emapc/emapc-service
  curl -L https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/releases/download/$gitTag/${linux[serviceBin]} -o /usr/local/emapc/emapc-service

  curl -L https://raw.githubusercontent.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/$gitHash/example.conf.yml -o /usr/local/emapc/example.conf.yml
  if [ ! -f /usr/local/emapc/emapc.conf.yml ]; then cp /usr/local/emapc/example.conf.yml /usr/local/emapc/emapc.conf.yml; fi

  echo \"[Unit]
Description=This is a service for running the emapc.

[Service]
User=root
WorkingDirectory=/usr/local/emapc/
ExecStart=emapc-service
Restart=always

[Install]
WantedBy=multi-user.target\" > /etc/systemd/system/emapc-service.service
  
  sudo systemctl daemon-reload
  sudo systemctl start emapc-service.service
fi
" > install-${linux[name]}.sh

  chmod +x install-${linux[name]}.sh
done

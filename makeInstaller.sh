#!/bin/bash

gitHash=$1
gitTag=$2

declare -A linux0=(
  [name]="linux32"
  [cliBin]="emapc-cli-linux-x32"
  [runnerBin]="emapc-srv-linux-x32"
  [lib]="pdftotext32"
)
declare -A linux1=(
  [name]="linux64"
  [cliBin]="emapc-cli-linux-x64"
  [runnerBin]="emapc-srv-linux-x64"
  [lib]="pdftotext64"
)

declare -n linux

declare -A win0=(
  [name]="win32"
  [cliBin]="emapc-cli-win-x32.exe"
  [runnerBin]="emapc-srv-win-x32.exe"
  [lib]="pdftotext32.exe"
  [nssm]="nssm32.exe"
)
declare -A win1=(
  [name]="win64"
  [cliBin]="emapc-cli-win-x64.exe"
  [runnerBin]="emapc-srv-win-x64.exe"
  [lib]="pdftotext64.exe"
  [nssm]="nssm64.exe"
)

declare -n win

declare -A mac0=(
  [name]="mac64"
  [cliBin]="emapc-cli-macos-x64"
  [runnerBin]="emapc-srv-mac-x64"
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

mkdir /usr/local/emapc
mkdir /usr/local/emapc/lib
mkdir /usr/local/emapc/lib/pdftotext
mkdir /usr/local/emapc/lib/pdftotext/linux

rm -rf /usr/local/emapc/lib/pdftotext/linux/${linux[lib]}
curl -L https://raw.githubusercontent.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/$gitHash/lib/pdftotext/linux/${linux[lib]} -o /usr/local/emapc/lib/pdftotext/linux/${linux[lib]}

if [[ \"\$1\" == \"cli\" ]]; then
  rm -rf /usr/local/emapc/emapc-cli
  curl -L https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/releases/download/$gitTag/${linux[cliBin]} -o /usr/local/emapc/emapc-cli
  chmod +x /usr/local/emapc/emapc-cli
  ln -s /usr/local/emapc/emapc-cli /usr/local/bin/
fi

if [[ \"\$1\" == \"srv\" ]]; then
  rm -rf /usr/local/emapc/emapc-runner
  curl -L https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/releases/download/$gitTag/${linux[runnerBin]} -o /usr/local/emapc/emapc-runner

  curl -L https://raw.githubusercontent.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/$gitHash/emapc.conf.yml -o /usr/local/emapc/emapc.conf.yml

  echo \"[Unit]
Description=This is a service for running the emapc.

[Service]
User=root
WorkingDirectory=/usr/local/emapc/
ExecStart=emapc-runner
Restart=always

[Install]
WantedBy=multi-user.target\" > /etc/systemd/system/emapc-service.service
  
  sudo systemctl daemon-reload
  sudo systemctl start emapc-service.service
fi

" > install-${linux[name]}.sh

  chmod +x install-${linux[name]}.sh
done

echo "make win installers"
for win in ${!win@}; do
  echo "make ${win[name]} installer"
  echo "If (!(\$args[0] -eq 'cli' -Or \$args[0] -eq 'srv')) {
  Write-Host \"USAGE: install-${win[name]}.ps1 <cli or srv>\"
  exit 0
}

New-Item -Path \"c:\\\" -Name \"emapc\" -ItemType \"directory\"
New-Item -Path \"c:\\emapc\" -Name \"lib\" -ItemType \"directory\"
New-Item -Path \"c:\\emapc\\lib\" -Name \"pdftotext\" -ItemType \"directory\"
New-Item -Path \"c:\\emapc\\lib\\pdftotext\" -Name \"win\" -ItemType \"directory\"

Remove-Item -Force \"c:\\emapc\\lib\\pdftotext\\win\\${win[lib]}\"
Invoke-WebRequest -Uri https://raw.githubusercontent.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/$gitHash/lib/pdftotext/win/${win[lib]} -OutFile \"c:\\emapc\\lib\\pdftotext\\win\\${win[lib]}\"

If (\$args[0] -eq 'cli') {
  Remove-Item -Force \"c:\\emapc\\emapc-cli.exe\"
  Invoke-WebRequest -Uri https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/releases/download/$gitTag/${win[cliBin]} -OutFile \"c:\\emapc\\emapc-cli.exe\"
}

If (\$args[0] -eq 'srv') {
  Remove-Item -Force \"c:\\emapc\\emapc-runner.exe\"
  Invoke-WebRequest -Uri https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/releases/download/$gitTag/${win[runnerBin]} -OutFile \"c:\\emapc\\emapc-runner.exe\"

  Remove-Item -Force \"c:\\emapc\\nssm\\${win[nssm]}\"
  Invoke-WebRequest -Uri https://raw.githubusercontent.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/$gitHash/lib/nssm/${win[nssm]} -OutFile \"c:\\emapc\\${win[nssm]}\"
  
  Invoke-WebRequest -Uri https://raw.githubusercontent.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/$gitHash/emapc.conf.yml -OutFile \"c:\\emapc\\emapc.conf.yml\"

  & \"c:\\emapc\\${win[nssm]}\" install EMAPC-Service \"c:\\emapc\\emapc-runner.exe\"

  \$powershell = (Get-Command powershell).Source
  \$arguments = '-ExecutionPolicy Bypass -NoProfile \"{0}\"' -f \"c:\\emapc\\emapc-runner.exe\"

  & \"c:\\emapc\\${win[nssm]}\" stop EMAPC-Service
  & \"c:\\emapc\\${win[nssm]}\" remove EMAPC-Service confirm

  & \"c:\\emapc\\${win[nssm]}\" install EMAPC-Service \$powershell \$arguments
  & \"c:\\emapc\\${win[nssm]}\" set EMAPC-Service AppDirectory \"c:\\emapc\"
  & \"c:\\emapc\\${win[nssm]}\" set EMAPC-Service AppStdout \"c:\\emapc\\service.log\"
  & \"c:\\emapc\\${win[nssm]}\" set EMAPC-Service AppStderr \"c:\\emapc\\service-error.log\"
  & \"c:\\emapc\\${win[nssm]}\" start EMAPC-Service
}

" > install-${win[name]}.ps1

  chmod +x install-${win[name]}.ps1
done

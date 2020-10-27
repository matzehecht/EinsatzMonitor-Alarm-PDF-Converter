#Requires -RunAsAdministrator

if ((Test-Path "c:\emapc\nssm32.exe") -And (Test-Path "c:\emapc\emapc-runner.exe")) { 
  & "c:\emapc\nssm32.exe" stop EMAPC-Service
  & "c:\emapc\nssm32.exe" remove EMAPC-Service confirm
}

Set-Location -Path "c:\"

Remove-Item "c:\emapc" -Recurse -Force


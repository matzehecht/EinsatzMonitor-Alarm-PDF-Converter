#Requires -RunAsAdministrator

if ((Test-Path "c:\emapc\nssm64.exe") -And (Test-Path "c:\emapc\emapc-runner.exe")) { 
  & "c:\emapc\nssm64.exe" stop EMAPC-Service
  & "c:\emapc\nssm64.exe" remove EMAPC-Service confirm
}

Set-Location -Path "c:\"

Remove-Item "c:\emapc" -Recurse -Force


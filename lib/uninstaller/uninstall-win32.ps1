#Requires -RunAsAdministrator

if (Test-Path "c:\emapc\nssm32.exe") { 
  & "c:\emapc\nssm32.exe" stop EMAPC-Service
  & "c:\emapc\nssm32.exe" remove EMAPC-Service confirm
}

Push-Location "c:\"

Remove-Item "c:\emapc" -Recurse -Force

Pop-Location


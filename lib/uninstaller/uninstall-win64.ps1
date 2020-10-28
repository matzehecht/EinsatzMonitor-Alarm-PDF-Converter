#Requires -RunAsAdministrator

if (Test-Path "c:\emapc\nssm64.exe") { 
  & "c:\emapc\nssm64.exe" stop EMAPC-Service
  & "c:\emapc\nssm64.exe" remove EMAPC-Service confirm
}

Push-Location "c:\"

Remove-Item "c:\emapc" -Recurse -Force

Pop-Location


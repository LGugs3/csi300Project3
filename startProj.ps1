Get-Job | Remove-Job -Force
try{
    $jobs = @(
        Start-Job -ScriptBlock {
            param($rootFolder)
            cd "$rootFolder\backend"
            node server.js
        } -Name 'backsqlJob' -ArgumentList $PSScriptRoot
        Start-Job -ScriptBlock {
            param($rootFolder)
            cd "$rootFolder\frontend"
            npm start
        } -Name 'frontsqlJob' -ArgumentList $PSScriptRoot
    )
    Get-Job
    $jobs | Receive-Job -Wait -AutoRemoveJob
}
finally{
    $jobs | Remove-Job  -Force
    Write-Warning "Terminating all jobs, exception found"
    Get-Job
}

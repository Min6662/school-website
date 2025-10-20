# Update CSS Links Script
# This PowerShell script updates all HTML files to use the new modular CSS structure

$htmlFiles = @(
    "students.html",
    "teachers.html", 
    "classes.html",
    "results.html"
)

foreach ($file in $htmlFiles) {
    if (Test-Path $file) {
        Write-Host "Updating $file..."
        
        # Read the file content
        $content = Get-Content $file -Raw
        
        # Replace the old CSS link with the new modular one
        $updatedContent = $content -replace 'href="styles\.css"', 'href="css/main.css"'
        
        # Write the updated content back to the file
        Set-Content $file -Value $updatedContent
        
        Write-Host "✓ $file updated successfully"
    } else {
        Write-Host "✗ $file not found"
    }
}

Write-Host "`nAll HTML files have been updated to use the new modular CSS structure!"
Write-Host "The new CSS structure includes:"
Write-Host "- css/base.css (reset and base styles)"
Write-Host "- css/sidebar.css (navigation styles)"  
Write-Host "- css/header.css (header styles)"
Write-Host "- css/buttons.css (button components)"
Write-Host "- css/forms.css (form styling)"
Write-Host "- css/tables.css (table components)"
Write-Host "- css/modal.css (modal dialogs)"
Write-Host "- css/components.css (notifications, alerts, etc.)"
Write-Host "- css/dashboard.css (dashboard-specific styles)"
Write-Host "- css/main.css (main import file)"
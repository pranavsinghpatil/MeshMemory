# PowerShell script to remove redundant Layout components
$pageFiles = Get-ChildItem -Path "D:\winds\MeshMemory\src\pages" -Filter "*.tsx" -Recurse

foreach ($file in $pageFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Remove import Layout line
    $content = $content -replace "import Layout from '../components/Layout';\r?\n", ""
    
    # Remove Layout wrappers
    $content = $content -replace "<Layout>(\r?\n)", ""
    $content = $content -replace "(\r?\n)\s*</Layout>", ""
    $content = $content -replace "<Layout>\s*", ""
    $content = $content -replace "\s*</Layout>", ""
    
    # Write the updated content back to the file
    Set-Content -Path $file.FullName -Value $content
    
    Write-Host "Updated $($file.Name)"
}

Write-Host "All page files updated successfully!"

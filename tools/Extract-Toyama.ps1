# Extract Toyama city rows from R2 age 2-7 sheet
$base = 'C:\Users\Evo\AppData\Local\Temp\opencode\R2age27\xl'
$ssPath = Join-Path $base 'sharedStrings.xml'
$sheetPath = Join-Path $base 'worksheets\sheet1.xml'
$outPath = 'C:\Users\Evo\AppData\Local\Temp\opencode\R2age27_toyama.txt'

[xml]$ss = Get-Content $ssPath -Encoding UTF8
$idx16201 = -1
$idxToyama = -1
for ($i = 0; $i -lt $ss.sst.si.Count; $i++) {
  $t = ($ss.sst.si[$i].t -join '')
  if ($t -eq '16201') { $idx16201 = $i }
  if ($t -eq '富山市') { $idxToyama = $i }
}
"idx16201=$idx16201 idxToyama=$idxToyama" | Out-File $outPath -Encoding utf8

$settings = New-Object System.Xml.XmlReaderSettings
$settings.IgnoreWhitespace = $true
$reader = [System.Xml.XmlReader]::Create($sheetPath, $settings)
$rowXml = ''
$inRow = $false
$hit = 0
while ($reader.Read()) {
  if ($reader.NodeType -eq [System.Xml.XmlNodeType]::Element -and $reader.Name -eq 'row') {
    $rowXml = $reader.ReadOuterXml()
    if ($rowXml.Contains("<v>$idx16201</v>") -or ($idxToyama -ge 0 -and $rowXml.Contains("<v>$idxToyama</v>"))) {
      $hit++
      "---HIT $hit---" | Out-File $outPath -Append -Encoding utf8
      $rowXml | Out-File $outPath -Append -Encoding utf8
      if ($hit -ge 30) { break }
    }
  }
}
$reader.Close()
"done hits=$hit" | Out-File $outPath -Append -Encoding utf8

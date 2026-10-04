# Lightweight static server for Tampermonkey install
$port = 8765
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "QuizAssist Server live at: http://localhost:$port/quizassist.user.js"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($path) -or $path -eq "quizassist.user.js") {
            $filePath = Join-Path $PSScriptRoot "quizassist.user.js"
            $contentType = "application/javascript; charset=utf-8"
        } elseif ($path -eq "test" -or $path -eq "test_quiz.html") {
            $filePath = Join-Path $PSScriptRoot "test_quiz.html"
            $contentType = "text/html; charset=utf-8"
        } else {
            $filePath = Join-Path $PSScriptRoot $path
            $contentType = "text/plain; charset=utf-8"
        }

        if (Test-Path $filePath) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("File Not Found")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
}

const authCodeMailTemplate = (code: string) => {
  const template = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>인증 코드 메일</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background-color: #4CAF50;
            color: #ffffff;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .code {
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0;
            padding: 10px;
            background-color: #f9f9f9;
            border: 1px dashed #ccc;
        }
        .footer {
            background-color: #f1f1f1;
            color: #888888;
            padding: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>인증 코드</h1>
        </div>
        <div class="content">
            <p>안녕하세요,</p>
            <p>아래의 인증 코드를 사용하여 이메일 인증을 완료해주세요:</p>
            <div class="code">${code}</div>
            <p>감사합니다!</p>
        </div>
        <div class="footer">
            <p>이 메일은 자동으로 생성된 메일입니다. 회신하지 말아주세요.</p>
        </div>
    </div>
</body>
</html>`

  return template
}

export default authCodeMailTemplate

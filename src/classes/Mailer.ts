import 'dotenv/config'
import nodemailer from 'nodemailer'
import { Logger } from '../utils/Logger'

const MailTemplate = (code: string) => {
  return `<!DOCTYPE html>
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
}
export default {
  MailRegex: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  Transporter: nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 587,
    secure: Number(process.env.MAIL_PORT) === 465,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  }),
  async sendCode (target: string, code: string) {
    if (!this.MailRegex.test(target)) {
      return { fail: true, message: '메일주소 형식이 바르지 않습니다', mail: null }
    }
    try {
      const mail = await this.Transporter.sendMail({
        from: '쿠택시 <info@yoru.icu>',
        to: target,
        subject: '[쿠택시] 이메일 인증 코드',
        html: MailTemplate(code)
      })
      return { fail: false, message: '성공', mail }
    } catch (error: any) {
      Logger.error('Mailer').put(error.stack).out()
      return { fail: true, message: '실패', mail: null }
    }
  },

  async send (target: string, title: string, body: string) {
    if (!this.MailRegex.test(target)) {
      return { fail: true, message: '메일주소 형식이 바르지 않습니다', mail: null }
    }
    try {
      const mail = await this.Transporter.sendMail({
        from: '쿠택시 <info@yoru.icu>',
        to: target,
        subject: title,
        html: body
      })
      return { fail: false, message: '성공', mail }
    } catch (error: any) {
      Logger.error('Mailer').put(error.stack).out()
      return { fail: true, message: '실패', mail: null }
    }
  }
}

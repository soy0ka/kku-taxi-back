import 'dotenv/config'
import nodemailer from 'nodemailer'
import { Logger } from '../utils/Logger'

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

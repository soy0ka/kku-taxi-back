import 'dotenv/config'

import { Logger } from '@/utils/logging/logger'
import nodemailer from 'nodemailer'
import authCodeMailTemplate from './mailTemplates/authcode'

const MailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
const Transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: Number(process.env.MAIL_PORT) === 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
})

const sendAuthCode = async (target: string, code: string) => {
  if (!MailRegex.test(target)) return { success: false, message: '메일주소 형식이 바르지 않습니다', mail: null }
  try {
    const mail = await Transporter.sendMail({
      from: '쿠택시 <' + process.env.MAIL_USER + '>',
      to: target,
      subject: '[쿠택시] 이메일 인증 코드',
      html: authCodeMailTemplate(code)
    })
    return { success: true, mail }
  } catch (error: any) {
    Logger.error('Mailer').put(error).out()
    return { success: false, message: '실패', mail: null }
  }
}

export default { MailRegex, Transporter, sendAuthCode }

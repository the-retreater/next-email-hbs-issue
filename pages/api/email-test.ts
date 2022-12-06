import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import nodemailer from 'nodemailer';

// https://github.com/vercel/next.js/discussions/32236#discussioncomment-1959180
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const mainFolder = fs.readdirSync(process.cwd());
    const files = fs.readdirSync(path.join(process.cwd(), 'email-templates'));
    const emailsDirectory = path.resolve(process.cwd(), 'email-templates');

    const emailFile = fs.readFileSync(path.join(emailsDirectory, '/forgot.hbs'), 'utf8');
    const headerFile = fs.readFileSync(path.join(emailsDirectory, '/_header.hbs'), 'utf8');
    const footerFile = fs.readFileSync(path.join(emailsDirectory, '/_footer.hbs'), 'utf8');

    console.log(mainFolder);
    console.log(files);
    console.log(emailFile);

    handlebars.registerPartial('header', headerFile);
    handlebars.registerPartial('footer', footerFile);

    const template = handlebars.compile(emailFile);
    const htmlToSend = template([]);
    // const sendAddress = email.toLowerCase().trim();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO || 'test@localhost',
      subject: 'TEST',
      html: htmlToSend,
    };

    const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : undefined;

    const auth =
      process.env.NODE_ENV === 'development'
        ? undefined
        : {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          };

    const host = process.env.EMAIL_HOST;

    const mail = nodemailer.createTransport({
      port,
      host,
      auth,
      secure: false, // Only for 487
    });

    await mail.sendMail(mailOptions);

    return res.status(200).send(1);
  } catch (err) {
    console.log(err);
    return res.status(400).send(0);
  }
};

export default handler;

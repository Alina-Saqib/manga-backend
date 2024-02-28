import nodemailer from 'nodemailer';
// user: 'verify.pruuf@gmail.com',
// pass: 'nmatvrxsyqoklkdv',


// EMAIL=fictionteller.se@gmail.com
// APP_PASSWORD=ishpsakdvepoxmbg

const sendEmail = async (email: string, subject: string, text: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      service: 'Gmail',
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: subject,
      text: text,
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.log("Email not sent");
    console.error(error);
  }
};

export default sendEmail;

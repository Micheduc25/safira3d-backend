const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const config = require("config");

let transporter = nodemailer.createTransport({
  service: config.get("mailProvider"),
  host:config.get("mailHost"),
  //   secure: true,
  auth: {
    user: config.get("email"),
    pass: config.get("mailPassword"),
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

let MailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Nodemailer",
    link: config.get("main_url"),
  },
});

async function sendMail(receiver, subject, response) {
  const mail = MailGenerator.generate(response);
  let message = {
    from: `"Safira3d" <${config.get("email")}>`,
    to: receiver,
    subject: subject,
    html: mail,
  };

  try {
    await transporter.sendMail(message);

    return `${receiver}`;
  } catch (err) {
    throw { code: 500, error: err };
  }
}

exports.sendMail = sendMail;

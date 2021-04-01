var API_KEY = 'key-414b065823760eabf0b4eb07ba6f7c52';
var DOMAIN = 'email.asylumconnectcatalog.org';
var mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN});

import {User} from '../mongoose';

export const generatePasswordResetMail = async (req, res) => {
	try {
		const generateRandomString = () => {
			var randomString = Math.random().toString(25).substr(2, 8);
			return randomString;
		};
		const newPassword = generateRandomString();

		const sendPasswordReset = () => {
			const data = {
				from: 'AsylumConnect Support <catalog@asylumconnect.org>',
				to: req.body.email,
				subject: `Password reset for ${req.body.email}`,
				html: `
      <p>Hello, Bonjour, Hola!</p>
      <p>This notification is on behalf of AsylumConnect to let you know that your account password has been
      successfully reset to <strong>${newPassword}</strong>. Please use this password to log back into the
      <a href="https://catalog.asylumconnect.org/" target="_blank">AsylumConnect Catalog</a> where you can create a new password for your account.
      <p>If you did not reset your account password, please contact AsylumConnect immediately at <a href="mailto:catalog@asylumconnect.org?subject=Problem%20with%20password%20reset">catalog@asylumconnect.org</a>.</p>
      <p>Thank you, Merci, Gracias!</p>
      <p>The AsylumConnect Team</p>
      `
			};

			mailgun.messages().send(data, (error, body) => {
				res.status(200).send(body);
			});
		};
		const user = await User.findOne({email: req.body.email});
		if (!user) {
			res.status(400).send('That email does not exist!');
			return;
		}
		user.setPassword(newPassword);
		await user.save();
		await sendPasswordReset();
	} catch (error) {
		res.status(500).send(error);
	}
};

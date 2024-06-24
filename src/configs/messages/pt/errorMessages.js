const authControllerErrorsPT = {
	notLoggedIn: 'Por favor, conecte-se para performar essa ação.',
	userNotFound: 'Usuário não encontrado',
	invalidOTP: 'Email ou Código de segurança inválido.',
	nameAndCountryRequired: 'Ambos nome e país são obrigatórios.',
	requiredPassword: 'Ambas senha e confirmação de senha são obrigatórias.',
	emailAndPasswordsRequired: 'Ambas senha e email são obrigatórios.',
	incorrectCredentials: 'Email ou senha incorretos.',
	invalidEmail: 'Por favor forneça um email válido',
	emailTaken: 'Desculpe, Este email já esta em uso.',
	noUserWithGivenEmail: 'Não possuimos um usuário  com este email',
	samePassword: 'Ambas senha e confirmação de senhas precisam ser iguais.',
	invalidPasswordToken: 'Código de recuperação de senha invalido ou expirado.',
	changedPassword:
		'Você alterou recentemente sua senha! Por favor, conecte-se novamente.',
	emailSendingError:
		'Desculpe... Um erro ocorreu enquanto enviamos o email. Por favor, tente novamente.',
	forgotPassword:
		'Desculpe... Um erro ocorreu enquanto resetavamos sua senha. Por favor, tente novamente.',
	login:
		'Desculpe... Um erro ocorreu enquanto logavamos-o. Por favor, tente novamente.',
	logOut:
		'Desculpe... Um erro ocorreu enquanto desconectavamos-o. Por favor, tente novamente.',
	protect:
		'Desculpe... Um erro ocorreu enquanto verificamvamos o acesso do usuário. Por favor, tente novamente.',
	register:
		'Desculpe... Um erro ocorreu enquanto registravamos-o. Por favor, tente novamente.',
	resetPassword:
		'Desculpe... Um erro ocorreu enquanto resetavamos sua senha. Por favor, tente novamente.',
	sendOTP:
		'Desculpe... Um erro ocorreu enquanto enviavamos seu código de segurança. Por favor, tente novamente.',
	verifyOTP:
		'Desculpe... Um erro ocorreu enquanto confirmavamos seu código de segurança. Por favor, tente novamente.',
	verifyUser:
		'Desculpe... Um erro ocorreu enquanto verificamvamos o usuário. Por favor, tente novamente.',
};
const donationControllerErrorsPT = {
	createDonation:
		'Desculpe... Um erro ocorreu enquanto criavamos a doação. Por favor, tente novamente.',
};
const ngoControllerErrorsPT = {
	invalidNgo: 'Por favor forneça uma ONG válida.',
	invalidSecret: 'Por favor forneça uma senha válida.',
	noImage: 'Por favor forneça uma imagem.',
	noName: 'Por favor forneça uma nome.',
	noLocation: 'Por favor forneça uma localização.',
	nameTaken: 'Desculpe... Esse nome já esta em uso.',
	createNgo:
		'Desculpe... Um erro ocorreu enquanto criavamos esta ONG. Por favor, tente novamente.',
	deleteNgo:
		'Desculpe... Um erro ocorreu enquanto deletavamos esta ONG. Por favor, tente novamente.',
	getAllNgos:
		'Desculpe... Um erro ocorreu enquanto buscavamos todas ONG. Por favor, tente novamente.',
	verifyNgo:
		'Desculpe... Um erro ocorreu enquanto verficavamos esta ONG. Por favor, tente novamente.',
};

const paymentControllerErrorsPT = {
	captureOrder:
		'Desculpe... Um erro ocorreu enquanto capturavamos seu pedido. Por favor, tente novamente.',
	createOrder:
		'Desculpe... Um erro ocorreu enquanto criavamos seu pedido. Por favor, tente novamente.',
};

const phoneNumberControllerErrorsPT = {
	invalidPhoneNumber: 'Por favor forneça um número de celular válido.',
	savePhoneNumber:
		'Desculpe... Um erro ocorreu enquanto salvavamos seu número. Por favor, tente novamente.',
};

const userControllerErrorsPT = {
	like: 'Desculpe... Um erro ocorreu enquanto processavamos seu like. Por favor, tente novamente.',
	noImage: 'Por favor forneça uma imagem válida.',
	noNgo: 'Por favor forneça uma lista de ONGS válida.',
	updateAvatar:
		'Desculpe... Um erro ocorreu enquanto atualizavamos seu avatar. Por favor, tente novamente.',
	updateMe:
		'Desculpe... Um erro ocorreu enquanto atualizavamos seu perfil. Por favor, tente novamente.',
};
module.exports = {
	authControllerErrorsPT,
	donationControllerErrorsPT,
	ngoControllerErrorsPT,
	paymentControllerErrorsPT,
	phoneNumberControllerErrorsPT,
	userControllerErrorsPT,
};

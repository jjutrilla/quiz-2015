var models = require('../models/models.js');

// Autoload - factoriza el codigo si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.findById(quizId).then(
		function(quiz) {
			if (quiz) {
				req.quiz = quiz;
				next();
			} else {
				next (new Error('No existe quizId=' + quizId));
			}
		}
	).catch(
		function(error) {
			next(error);
		}
	);
};

// GET /quizes
exports.index = function(req, res) {
	var filtro = req.query.search;
	var condicion = ('%' + filtro + '%').replace(/ /g,'%').toLowerCase();

	if(filtro){
		models.Quiz.findAll(
			{
				where:	["lower(pregunta) like ?", condicion],
				order:	'pregunta ASC' 
			}
		).then(
			function(quizes) {
				res.render('quizes/index',
					{
						quizes: quizes
					}
				);
			}
		).catch(
			function(error) {
				next(error);
			}
		)
	} else {
		models.Quiz.findAll().then(
			function(quizes) {
				res.render('quizes/index', {quizes: quizes});
			}
		).catch(
			function(error) {
				next(error);
			}
		)
	}
};

// GET /quizId/:id
exports.show = function(req, res) {
	res.render('quizes/show', {quiz: req.quiz});
};

// GET /quizId/:id/answer
exports.answer = function(req, res) {
	var resultado = 'Incorrecto';
	
	if(req.query.respuesta === req.quiz.respuesta) {
		resultado = 'Correcto';
	}
	
	res.render('quizes/answer',
		{
			quiz:		req.quiz, 
			respuesta:	resultado
		}
	);
};
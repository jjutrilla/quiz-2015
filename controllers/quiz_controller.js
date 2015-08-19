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
						quizes: quizes,
						errors:	[] 
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
				res.render('quizes/index', {quizes: quizes, errors: []});
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
	res.render('quizes/show', {quiz: req.quiz, errors: []});
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
			respuesta:	resultado,
			errors:		[]
		}
	);
};

// GET /quizes/new
exports.new = function(req, res) {
	var quiz = models.Quiz.build(	// crea objeto quiz
		{
			pregunta:	"Pregunta",
			respuesta:	"Respuesta",
			tematica:	"Tematica"
		}
	);
	
	res.render('quizes/new',
		{
			quiz:	quiz,
			errors:	[]
		}
	);
};

// POST /quizes/create
exports.create = function(req, res) {
	var quiz = models.Quiz.build( req.body.quiz );
	
	quiz
	.validate()
	.then(
		function(err) {
			if (err) {
				res.render('quizes/new',
				{
					quiz:	quiz,
					errors:	err.errors  
				});
			} else {
				// guarda en BD los campos pregunta y respuesta de quiz
				quiz
				.save(
					{
						fields: ["pregunta", "respuesta", "tematica"]
					})
				.then(
					function()
					{
						res.redirect('/quizes')
					}
				)	// Redirección HTTP (URL relativo) lista de preguntas
			}
		}
	);
};

// GET /quizId/:id/edit
exports.edit = function(req, res) {
	var quiz = req.quiz;	// Autoload de instancia de quiz
	
	res.render('quizes/edit',
		{
			quiz:		quiz,
			errors:		[]
		}
	);
};

// PUT /quizes/:id
exports.update = function(req, res) {
	req.quiz.pregunta	= req.body.quiz.pregunta;
	req.quiz.respuesta	= req.body.quiz.respuesta;
	req.quiz.tematica	= req.body.quiz.tematica;

	req.quiz
	.validate()
	.then(
		function(err)
		{
			if (err) {
				res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
			} else {
				req.quiz     // save: guarda campos pregunta y respuesta en DB
				.save( {fields: ["pregunta", "respuesta", "tematica"]})
				.then( function(){ res.redirect('/quizes');});
			}     // Redirección HTTP a lista de preguntas (URL relativo)
    	}
  	)
  	.catch(
  		function(error)
  		{
  			next(error)
  		}
  	);
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
	req.quiz.destroy()
	.then(
		function()
		{
			res.redirect('/quizes');
		}
	)
	.catch(
		function(error)
		{
			next(error);
		}
	);
};
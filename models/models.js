var path = require('path');

// Pstgres DATABASE_URL = postgres://user:password@host:port/database
// SQLite  DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name	 = (url[6]||null);
var user	 = (url[2]||null);
var pwd		 = (url[3]||null);
var protocol = (url[1]||null);	
var dialect	 = (url[1]||null);
var port 	 = (url[5]||null);
var host	 = (url[4]||null);
var storage	 = process.env.DATABASE_STORAGE;

// Cargar modelo ORM
var Sequelize = require('sequelize');

// Usar BBDD SQLite o Postgres
var sequelize = new Sequelize(DB_name, user, pwd,
	{
		dialect:	protocol,
		protocol:	protocol,
		port:		port, 
		host:		host,
		storage:	storage,	// solo SQLite (.env)
		omitNull:	true		// solo Postgres
	}
);

// Importar la definicion de la tabla Quiz en quiz.js
var Quiz = sequelize.import(path.join(__dirname,'quiz'));
// Importar la definicion de la tabla Comment en quiz.js
var Comment = sequelize.import(path.join(__dirname,'comment'));

Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

exports.Quiz = Quiz; // exportar la definicion de la tabla Quiz
exports.Comment = Comment; // exportar la definicion de la tabla Comment

// sequelize.sync() crea en inicializa tabla de preguntas en DB
sequelize.sync().then(function(){
	// then(..) ejecuta el manejador una vez creada la tabla
	Quiz.count().then(function(count){
		if(count === 0) { // la tabla se inicializa solo si esta vacia
			Quiz.create({
				pregunta:	'Capital de Italia',
				respuesta:	'Roma',
				tematica:	'otro' 
			});
			Quiz.create({
				pregunta:	'Capital de Portugal',
				respuesta:	'Lisboa',
				tematica:	'ocio' 
			})
			.then(function(){console.log('Base de datos inicializada.')});
		};
	});
});
const indexController = {
    autor: 'LUCAS MARTÍN GUILLÉN',
    puesto: 'FULL STACK DEVELOPER',
    titulo: 'INGENIERÍA EN SISTEMAS DE INFORMACIÓN',

    getIndex: (req, res) => {
        res.render('index',  { 
            name: indexController.autor,
            puesto:  indexController.puesto,
            titulo: indexController.titulo
        });
    }
};

module.exports = indexController;
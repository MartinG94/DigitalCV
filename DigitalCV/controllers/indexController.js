const indexController = {
    autor: 'Martin Guillen',

    getIndex: (req, res) => {
        res.render('index',  { name: indexController.autor });
    }
};

module.exports = indexController;
const indexController = {
    autor: 'Lucas Martín Guillén',

    getIndex: (req, res) => {
        res.render('index',  { name: indexController.autor });
    }
};

module.exports = indexController;
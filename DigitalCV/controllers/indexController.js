const indexController = {
    getIndex: (req, res) => {
        let nombre = 'Lucas Martín Guillén'

        res.render('index',  { name: nombre });
    }
};

module.exports = indexController;
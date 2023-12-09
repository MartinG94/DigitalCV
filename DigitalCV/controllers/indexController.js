const indexController = {
    getIndex: (req, res) => {
        res.render('index',  { title: 'Mi página Web' });
    }
};

module.exports = indexController;
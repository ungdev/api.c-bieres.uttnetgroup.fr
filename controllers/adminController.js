const mongoose = require('mongoose');
const Admin = mongoose.model('Admin');

exports.get = function(req, res) {
    Admin.find({}, (err, admins) => {
        if (err)
            res.status(500).json(err);
        res.json(admins);
    });
};

exports.create = function(req, res) {
    const newAdmin = new Admin(req.body);
    newAdmin.save((err, admin) => {
        if (err)
            res.status(500).json(err);
        res.json(admin);
    });
};

exports.delete = function(req, res) {
    Admin.remove({_id: req.params.id}, (err, admin) => {
        if (err)
            res.status(500).json(err);
        res.json({ message: "Admin supprimé" });
    });
};

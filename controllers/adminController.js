const mongoose = require('mongoose')
const Admin = mongoose.model('Admin')

exports.get = (req, res) => {
  Admin.find()
    .then(admins => res.json(admins))
    .catch(err => res.status(500).json(err))
}

exports.create = (req, res) => {
  new Admin(req.body).save()
    .then(admin => res.status(201).json(admin))
    .catch(err => res.status(err.name === "ValidationError" ? 400 : 500).json(err))
}

exports.delete = (req, res) => {
  Admin.findByIdAndRemove(req.params.id)
    .then(admin => {
      if (!admin)
        return res.status(404).send()
      res.status(204).send()
    })
    .catch(err => res.status(500).json(err))
}

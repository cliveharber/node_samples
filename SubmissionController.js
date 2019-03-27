'use strict';

const service = require('../services/submissionService');

const controller = {
  index: (req, res) => {
    const clientName = req.session.client.name;
    service.find(clientName).then(
      result => res.send(200, result)
    ).catch(
      err => res.send(422, err)
    );
  },
  show: (req, res) => {
    const clientName = req.session.client.name,
      { appName, journeyName } = req.params;

    service.findOne(clientName, appName, journeyName).then(
      result => res.send(200, result)
    ).catch(
      err => res.send(422, err)
    );
  },
  create: (req, res) => {
    const clientName = req.session.client.name,
      data = req.body.data || {};

    service.insert(clientName, data).then(
      result => res.send(200, result)
    ).catch(
      err => res.send(422, err)
    );
  },
  update: (req, res) => {
    const clientName = req.session.client.name,
      { appName, journeyName } = req.params,
      data = req.body;

    service.update(clientName, appName, journeyName, data).then(
      result => res.send(200, result)
    ).catch(
      err => res.send(422, err)
    );
  },
  remove: (req, res) => {
    const clientName = req.session.client.name,
      id = req.params.id;

    service.remove(clientName, id).then(
      result => res.send(200, result)
    );
  }
};

module.exports = {
  index: controller.index,
  create: controller.create,
  show: controller.show,
  update: controller.update,
  remove: controller.remove,
  _config: {
    actions: false,
    shortcuts: false,
    rest: false
  }
};


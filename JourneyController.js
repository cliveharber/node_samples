'use strict';

const { curry } = require('lodash'),
  rabbitUrl = process.env.AMQP_URL || sails && sails.config.amqp.url,
  amqp = require('amqp-rpc').factory({url: rabbitUrl}),
  processData = require('../services/processingService').processData,
  rpcClient = require('../services/rpcService').makeCall,
  rpc = curry(rpcClient, 3)({rpc: amqp}),
  processorConfig = {
    serviceEndpoint: sails.config.rpc.serviceEndpoint,
    journeyDefaults: sails.config.defaultJourneyMetaData
  },
  processor = curry(processData, 3)(processorConfig)(rpc),
  validationSchema = sails.config.validationSchema,
  validationService = require('../services/validationService').validateInput,
  validator = curry(validationService, 2)(validationSchema),
  invalidDataResponse = () => {
    sails.log.warn('JourneyController: Sending invalid data response');
    return new Promise( (resolve) => {
      resolve({status: 405, data: "The data is invalid"});
    });
  },
  controller = {
    getStatus: (req, res) => res.status(200).send({"status": "ACTIVE"}),
    acceptRequest: (req, res) => {
      sails.log.verbose(`JourneyController: received request - ${req}`);
      const {valid, input} = validator(req.body), // json will be present or sails will complain bitterly
        response = (valid) ? processor(input) : invalidDataResponse();

      response.then( (resp) => { return res.status(resp.status).send(resp.data); } );
    }
  };

module.exports = {
  getStatus: controller.getStatus,
  acceptRequest: controller.acceptRequest,
  _config: {
    actions: false,
    shortcuts: false,
    rest: false
  }
};
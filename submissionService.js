'use strict';

/**
 *
 * Items required to create a submission to this are:
 *   clientToken, clientApplicationName, clientJourneyReference
 *
 * To find stuff:
 *   find(): clientName
 *   findOne(): clientName, clientApplicationName, clientJourneyReference (optional)
 *
 * To update:
 *   clientToken, clientApplicationName, clientJourneyReference
 *
 * To remove()
 *   clientToken, clientApplicationName, clientJourneyReference
 *
 */

const { isEmpty, has, cloneDeep, merge, omit, isEqual } = require('lodash'),
  createDataObject = (name, data) => {
    return {
      name: name,
      appName: (data.meta && data.meta.journey.clientApplicationName) || "",
      journeyName: (data.meta && data.meta.journey.clientJourneyReference) || "",
      data: {
        journey: (data.body && data.body.journey) || [],
        vars: (data.body && data.body.vars) || {},
        functions: (data.body && data.body.functions) || {}
      }
    };
  },
  service = {
    find: (name) => {
      return new Promise( (resolve, reject) => {
        ClientDataStore.find( { name } ).exec( (err, results) => {
          if (err || isEmpty(results)) {
            return reject(err);
          }

          return resolve(results);
        });
      });
    },
    findOne: (name, appName, journeyName) => {
      return new Promise( (resolve, reject) => {
        ClientDataStore.findOne( {name, appName, journeyName} ).exec( (err, result) => {
          if (err || isEmpty(result)) {
            return reject(err);
          }

          return resolve(result);
        });
      })
    },
    insert: (clientName, data) => {
      return new Promise ( (resolve, reject) => {
        ClientDataStore.create( createDataObject(clientName, data) ).exec( (err, result) => {
          if (err || isEmpty(result)) {
            return reject(err);
          }

          return resolve(result);
        });
      });
    },
    update: (name, appName, journeyName, data) => {
      /**
       * data is an object of {add: {key: value}, update: {key: value}, remove: [key, ]} || {data: {}}
       * if {data: {}}, then replace all data, otherwise do a partial based on info
       * will need a validator here
       *
       * I miss changesets - if you dont know what they are look it up
       * (http://www.phoenixframework.org/docs/ecto-models#section-changesets-and-validations)
       */
      return new Promise( (resolve, reject) => {
        service.findOne(name, appName, journeyName).then(
          result => {
            let item = cloneDeep(result.data);

            item = (has(data, 'data'))? data.data : item;
            item = (has(data, 'add'))? merge(item, data.add) : item;
            item = (has(data, 'update'))? merge(item, data.update) : item;
            item = (has(data, 'remove'))? omit(item, data.remove) : item;

            if (isEqual(item, result.data)) {
              return reject("No update to be made");
            }

            ClientDataStore.update( { name, appName, journeyName }, {data: item} ).exec( (err, result) => {
              if (err || isEmpty(result)) {
                return reject(err);
              }
              return resolve(result);
            });
          },
          err => reject('Unable to find requested item')
        );
      });
    },
    remove: (name, id) => {
      return new Promise( resolve => ClientDataStore.destroy( { id, name } ).exec( err => resolve() ) );
    }
  };

module.exports = {
  find: service.find,
  findOne: service.findOne,
  insert: service.insert,
  update: service.update,
  remove: service.remove
};
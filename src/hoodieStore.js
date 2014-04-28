// TODO: factory would be also okay
hoodieModule.service('hoodieStore',
function($rootScope, $q, hoodie) {
  // TODO: haha, you want to use fatory? :)
  var service = this;

  angular.forEach(hoodie.store, function(propertyValue, propertyName) {
    if(angular.isFunction(propertyValue)){
      service[propertyName] = hoodiePromiseFnWrap(hoodie.store, propertyName, $q, $rootScope);
    }
    else{
      // TODO: Problem by value (copied, ref gets lost)
      service[propertyName] = hoodie.store[propertyName];
    }
  });

  // TODO: Add Comment -> What happens here??
  // If I'll create an store named findAll this will crash, ya??
  service.findAll()
  .then(function (data) {
    data.forEach(function (item) {
      var type = item.type;
      service[type] = service[type] || [];
      service[type].push(item);
    });
  });

  // write custom wrapper here, it's more complicated
  // Events
  hoodie.store.on('change', function (event, changedObject) {
    $rootScope.$evalAsync(function() {
      var type = changedObject.type;
      var id = changedObject.id;

      $rootScope.$emit(event, changedObject);
      $rootScope.$emit('change', event, changedObject);
      $rootScope.$emit(event + ':' + type, changedObject);
      $rootScope.$emit('change' + ':' + type, event, changedObject);
      $rootScope.$emit(event + ':' + type + ':' + id, changedObject);
      $rootScope.$emit('change' + ':' + type + ':' + id, event, changedObject);

      // TODO: Add Comment -> What happens here??
      service.findAll(type)
      .then(function (data) {
        service[type] = data;
      });
    });
  });

});

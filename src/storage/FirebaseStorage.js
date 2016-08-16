(function() {
  "use strict";

  function FirebaseStorage() {

    return function FirebaseStorage(storageRef) {
      _assertStorageRef(storageRef);
      return {
        $put: function $put(file) {
          return _$put(storageRef, file);
        },
        $getDownloadURL: function $getDownloadURL() {
          return _$getDownloadURL(storageRef);
        }
      };
    };
  }

  function unwrapStorageSnapshot(storageSnapshot) {
    return {
      bytesTransferred: storageSnapshot.bytesTransferred,
      downloadURL: storageSnapshot.downloadURL,
      metadata: storageSnapshot.metadata,
      ref: storageSnapshot.ref,
      state: storageSnapshot.state,
      task: storageSnapshot.task,
      totalBytes: storageSnapshot.totalBytes
    };
  }

  function _$put(storageRef, file) {
    var task = storageRef.put(file);

    return {
      $progress: function $progress(callback) {
        task.on('state_changed', function (storageSnap) {
          return callback(unwrapStorageSnapshot(storageSnap));
        }, function () {}, function () {});
      },
      $error: function $error(callback) {
        task.on('state_changed', function () {}, function (err) {
          return callback(err);
        }, function () {});
      },
      $complete: function $complete(callback) {
        task.on('state_changed', function () {}, function () {}, function () {
          return callback(unwrapStorageSnapshot(task.snapshot));
        });
      }
    };
  }

  function _$getDownloadURL(storageRef) {
    return storageRef.getDownloadURL();
  }

  function isStorageRef(value) {
    value = value || {};
    return typeof value.put === 'function';
  }

  function _assertStorageRef(storageRef) {
    if (!isStorageRef(storageRef)) {
      throw new Error('$firebaseStorage expects a storage reference from firebase.storage().ref()');
    }
  }

  FirebaseStorage._ = {
    _unwrapStorageSnapshot: unwrapStorageSnapshot,
    _$put: _$put,
    _$getDownloadURL: _$getDownloadURL,
    _isStorageRef: isStorageRef,
    _assertStorageRef: _assertStorageRef
  };  

  angular.module('firebase.storage')
    .factory('$firebaseStorage', FirebaseStorage);

})();